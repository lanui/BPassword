import { Mutex } from 'await-semaphore';
import EventEmitter from 'events';
import endOfStream from 'end-of-stream';
import PortStream from 'extension-port-stream';
import { nanoid } from 'nanoid';
import ObservableStore from 'obs-store';

import ComposableObservableStore from '../observestore/composable-obs-store.js';

import logger from '../logger/index.js';
import { buildExtVersion, buildExtAppName } from '../code-settings';
import ProfileController from './profile-controller';
import AccountController from './account-controller';

import WebsiteController from './website-controller';
import MobileController from './mobile-controller';
import { setupMultiplex } from '../helpers/pipe-helper.js';

import {
  API_RT_INIT_STATE,
  API_JET_INIT_STATE,
  API_RT_FILL_FEILDS,
  API_RT_FIELDS_VALT_CHANGED,
  API_RT_FIELDS_MATCHED_STATE,
} from '../msgapi/api-types';

/*********************************************************************
 * AircraftClass ::
 *     @Description: MainController entry
 *     @Description: sub controller> getState is changed state struct
 *        for memStore, so when your define state key attention.
 *        So as not to be overwritten repeatedly
 * WARNINGS:
 *      don't use store getFlatState ,it maybe cover by after append controller
 *      used same name keys
 * HISTORY:
 *     @Author: lanbery@gmail.com
 *     @Created:  2020-10-31
 **********************************************************************/
class BackMainController extends EventEmitter {
  constructor(opts = {}) {
    super();

    this.defaultMaxListeners = 20;

    this.opts = opts;

    const initState = opts.initState || {};
    this.recordFirstTimeInfo(initState);

    /** management connections: */
    //
    this.activeControllerConnections = 0;
    this.connections = {};

    /** Injet connections holder */
    this.topInjetConnections = {};

    /** Injet feilds connections by origin */
    this.injetOriginConnections = {};
    this.injetHostTabs = {};

    /** Leech */
    this.leechTabConnections = {};

    this.on('controllerConnectionChanged', (activeControllerConnections) => {});

    /** store:load form local storage */
    this.store = new ComposableObservableStore(initState);

    //initState ==> will persistence locale storage
    this.profileController = new ProfileController({
      initState: initState.ProfileController,
      // network:'',
    });

    /**
     * load state : {meta,data} => initState[xxController]
     *
     */
    this.websiteController = new WebsiteController({
      initState: initState.WebsiteController,
      notifyInjet: this.notifiedAllInjetConnection.bind(this),
      getActivedMuxStream: this.getLeechConnection.bind(this),
      getActivedTopMuxStream: this.getActiveTopInjetConnection.bind(this),
    });

    this.mobileController = new MobileController({
      initState: initState.MobileController,
    });

    this.accountController = new AccountController({
      initState: initState.AccountController,
      unlockWebsiteCypher: this.websiteController.unlock.bind(this.websiteController),
      lockedWebsitePlain: this.websiteController.locked.bind(this.websiteController),
      unlockMobileCypher: this.mobileController.unlock.bind(this.mobileController),
      lockedMobilePlain: this.mobileController.locked.bind(this.mobileController),
    });

    /** binding store state changed subscribe to update store value */
    // when key
    this.store.updateStructure({
      AccountController: this.accountController.store,
      WebsiteController: this.websiteController.store,
      MobileController: this.mobileController.store,
    });

    /**
     * memStore
     * getFlatState : only use get Public state
     *
     */
    this.memStore = new ComposableObservableStore(null, {
      AccountController: this.accountController.memStore,
      WebsiteController: this.websiteController.memStore,
      MobileController: this.mobileController.memStore,
    });
    //sub
    this.memStore.subscribe(this.memStoreWatch.bind(this));

    // notified the browser opened login pages

    //管理
    this.activeLoginStore = new ObservableStore({ operType: 'init', password: '', username: '' });
  }

  async lockMemStoreHandle() {
    this.passbokController.lock();
  }

  memStoreWatch(state) {
    logger.debug('BackMainController:memStoreWatch>>>>', state, this);
  }

  /**
   *
   * @param {*} remotePort
   */
  setupTrustedCommunication(remotePort) {
    const portStream = new PortStream(remotePort);
    endOfStream(portStream, (err) => {
      logger.debug(
        'BackMainController:setupTrustedCommunication disconnect. >>>>',
        err,
        portStream
      );
    });
    this.sendInitStateToTrustedUI(portStream, remotePort.sender);
  }

  /**
   * send initState to UI remotePort
   * @param {*} connectionStream
   * @param {*} sender
   */
  sendInitStateToTrustedUI(connectionStream, sender) {
    const mux = setupMultiplex(connectionStream);
    const stream = mux.createStream(API_RT_INIT_STATE);
    const data = this.getState();
    stream.write(data);
  }

  /** =============================== Top injet communication code start ====================================== */
  async setupInjetTopCommunication(port) {
    const sender = port.sender;
    logger.debug(
      'BackMainController:setupInjetTopCommunication- listen connected>>>>',
      sender,
      port
    );

    if (!sender || !sender.tab) return;

    const { tab, origin, id } = sender;
    const tabId = tab.id;

    const portStream = new PortStream(port);

    /**
     * 处理异常断开
     */
    endOfStream(portStream, (err, result) => {
      logger.debug(
        'BackMainController:setupInjetTopCommunication disconnect.',
        tabId,
        origin,
        result
      );
      this.detleteTopInjetConnections(tabId);
    });

    const mux = setupMultiplex(portStream);
    const muxId = `BPTop-${nanoid()}`;
    const muxStream = mux.createStream(muxId);
    this.addTopInjetConnections(tabId, muxId, muxStream);

    port.onMessage.addListener(async (message) => {
      logger.debug(
        'BackMainController:setupInjetTopCommunication--Received Message',
        message,
        tabId
      );
      if (message && message.hostname) {
        this.setTopInjetConnectionHostname(tabId, message.hostname);
        const respData = await this.getSendZombieState(message.hostname);

        //send
        muxStream.write({ apiType: API_JET_INIT_STATE, respData });
      }
    });
  }

  /**
   *
   * @param {*} tabId
   * @param {*} muxId
   * @param {*} muxStream
   */
  addTopInjetConnections(tabId, muxId, muxStream) {
    if (tabId === undefined || !muxStream) return;
    if (!this.topInjetConnections) {
      this.topInjetConnections = {};
    }
    this.topInjetConnections[tabId] = {
      muxId,
      muxStream,
    };
  }

  setTopInjetConnectionHostname(tabId, hostname) {
    if (tabId === undefined || !hostname || !this.topInjetConnections) return;

    if (this.topInjetConnections[tabId]) {
      this.topInjetConnections[tabId]['hostname'] = hostname;
    }
  }

  getActiveTopInjetConnection(tabId) {
    if (tabId !== undefined && this.topInjetConnections) {
      if (this.topInjetConnections[tabId] && this.topInjetConnections[tabId]['muxStream']) {
        return this.topInjetConnections[tabId]['muxStream'];
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  getTopInjetHostConnections(hostname) {
    if (!hostname || !this.topInjetConnections) return [];
    const hostConnections = [];

    Object.keys(this.topInjetConnections).forEach((k) => {
      const tabConnection = this.topInjetConnections[k];
      if (tabConnection.hostname.endsWith(hostname)) {
        hostConnections.push(tabConnection.muxStream);
      }
    });

    return hostConnections;
  }

  detleteTopInjetConnections(tabId) {
    if (tabId === undefined || !this.topInjetConnections || !this.topInjetConnections[tabId]) {
      return;
    }

    delete this.topInjetConnections[tabId];
  }

  /** =============================== Top injet communication code end ====================================== */

  async setupInjetCommunication(port) {
    const sender = port.sender;
    logger.debug('BackMainController:setupInjetSubCommunication>origin>>>', sender);

    //fixed firefox has url ,chrome has origin
    const { tab, origin, url, id } = sender;
    let hostname = '';
    let hostUrl = origin || url;
    if (!hostUrl) {
      logger.warn('BackMainController:setupInjetSubCommunication: no url or origin in Sender.');
      return;
    }
    try {
      hostname = new URL(hostUrl).hostname;
    } catch (ex) {
      logger.debug(`get hostname err [${hostUrl}]:`, ex);
    }
    if (!sender || !hostname || !tab) {
      return;
    }

    const portStream = new PortStream(port);

    const tabId = tab.id;
    const mux = setupMultiplex(portStream);
    const muxId = `BPinjet-${nanoid()}`;
    const muxStream = mux.createStream(muxId);

    logger.debug('BackMainController:setupInjetSubCommunication connected.', muxId);

    port.onMessage.addListener(async (message) => {
      logger.debug('setupInjetCommunication >>>>>>>>>>>>>>>', message);

      if (message && message.apiType) {
        switch (message.apiType) {
          case API_RT_FIELDS_VALT_CHANGED:
            this.websiteController.updateActieTabValtState(tabId, message.data);
            break;

            //send

            break;
          default:
            break;
        }
      }
    });

    /**
     * 处理异常断开
     */
    endOfStream(portStream, (err) => {
      logger.debug('BackMainController:setupInjetSubCommunication disconnect.', err, muxId, tabId);
      this.deleteInjetOriginConnections(tabId);

      // this.websiteController.resetActiveTabValtState(tabId)
    });

    this.addInjetOriginConnections({ tabId, hostname, muxId, muxStream });
    const respData = await this.getSendZombieState(hostname);
    logger.debug('BackMainController:setupInjetSubCommunication Send first init state.', respData);
    muxStream.write({ apiType: API_JET_INIT_STATE, respData });

    // add origin/tabId
  }

  /**
   * Warning : this method will change store structor
   */
  getState() {
    const { env3 } = this.accountController.store.getState();
    const { isUnlocked } = this.accountController.memStore.getState();
    return {
      isUnlocked: Boolean(isUnlocked),
      isInitialized: Boolean(env3),
      ...this.memStore.getState(),
    };
  }

  recordFirstTimeInfo(initState) {
    if (!('firstTimeInfo' in initState)) {
      initState.firstTimeInfo = {
        version: buildExtVersion,
        date: Date.now(),
      };
    }
  }

  /** ++++++++++++++++++++++++++++++++++++ Leech Begin +++++++++++++++++++++++++++++++++++++++++++++  */
  async setupLeechCommunication(port) {
    const sender = port.sender;
    if (!sender) return;
    const { tab, origin } = sender;
    const tabId = tab.id;
    let hostname = this.getTabLoginHostname(tabId);
    const portStream = new PortStream(port);

    const mux = setupMultiplex(portStream);
    const muxId = `BPLeech-${nanoid()}`;
    const muxStream = mux.createStream(muxId);
    /**
     * 处理异常断开
     */
    endOfStream(portStream, () => {
      logger.debug('BackMainController:LeechCommunication disconnect.', muxId, tabId);
      if (this.leechTabConnections && this.leechTabConnections[tabId]) {
        delete this.leechTabConnections[tabId];
      }
    });

    this.addLeechConnections(tabId, muxStream);

    const data = await this.getLeechSendState(tabId);
    muxStream.write(data);
  }

  addLeechConnections(tabId, muxStream) {
    if (!this.leechTabConnections) {
      this.leechTabConnections = {};
    }
    this.leechTabConnections[tabId] = muxStream;
  }

  getLeechConnection(tabId) {
    return this.leechTabConnections ? this.leechTabConnections[tabId] : false;
  }

  /**
   *
   * @param {*} tabId
   * @param {*} item
   */
  filledLoginFeilds(tabId, item) {
    // logger.debug('BackMainController:filledLoginFeilds >>>>>', tabId, item);
    // logger.debug(`BackMainController:WhisperListener Received Data>filledFieldValt>>`, tabId, item);
    const muxStream = this.getInjetOriginConnectionByTab(tabId);

    muxStream.write({ apiType: API_RT_FILL_FEILDS, respData: item });
    return true;
  }

  /** ++++++++++++++++++++++++++++++++++++ Leech End +++++++++++++++++++++++++++++++++++++++++++++  */

  /**
   *
   * @param {object} param0
   */
  addInjetOriginConnections({ tabId, hostname, muxId, muxStream }) {
    if (!hostname || !muxId || !muxStream || tabId === undefined) return;

    if (!this.injetOriginConnections) {
      this.injetOriginConnections = {};
    }

    /** injetOriginConnections : feature update struct tabId> hostname > {muxId,muxStream}*/
    if (!this.injetOriginConnections[tabId]) {
      this.injetOriginConnections[tabId] = {
        hostname: hostname,
        muxId: muxId,
        muxStream: muxStream,
      };
    } else {
      this.injetOriginConnections[tabId] = {
        hostname: hostname,
        muxId: muxId,
        muxStream,
      };
    }
  }

  /**
   *
   * @param {string} hostname
   */
  getInjetOriginConnections(hostname) {
    if (
      !hostname ||
      !this.injetOriginConnections ||
      Object.keys(this.injetOriginConnections).length === 0
    )
      return [];
    let connections = [];

    for (let tabId in this.injetOriginConnections) {
      let connObj = this.injetOriginConnections[tabId];
      if (connObj.hostname === hostname && connObj.muxStream) {
        connections.push(connObj.muxStream);
      }
    }
    return connections;
  }

  getInjetOriginConnectionByTab(tabId) {
    let connection = null;
    if (tabId === undefined || !this.injetOriginConnections || !this.injetOriginConnections[tabId])
      return connection;

    return this.injetOriginConnections[tabId].muxStream;
  }

  deleteInjetOriginConnections(tabId) {
    if (!this.injetOriginConnections || !this.injetOriginConnections[tabId]) return;
    delete this.injetOriginConnections[tabId];
  }

  /**
   * find tabId => hostname
   * @param {number} tabId
   */
  getTabLoginHostname(tabId) {
    if (tabId === undefined) return false;
    return this.topInjetConnections && this.topInjetConnections[tabId]
      ? this.topInjetConnections[tabId].hostname
      : false;
  }

  /**
   * website item changed notify
   * topPage and feildsPage
   * @param {string} hostname
   */
  async notifiedAllInjetConnection(hostname) {
    if (!hostname) return;

    const respData = await this.getSendZombieState(hostname);

    // TOP page
    const connections = this.getTopInjetHostConnections(hostname);
    if (connections.length > 0) {
      connections.forEach((muxStream) => {
        try {
          logger.warn('Inject connection send state .....', hostname, respData);

          muxStream.write({ apiType: API_JET_INIT_STATE, respData });
        } catch (err) {
          logger.warn('Inject connection send state to TopPage failed.', err);
        }
      });
    }

    const feildConnections = this.getInjetOriginConnections(hostname);
    if (feildConnections.length > 0) {
      feildConnections.forEach((muxStream) => {
        try {
          muxStream.write({ apiType: API_JET_INIT_STATE, respData });
        } catch (err) {
          logger.warn('Inject connection send state to FeildsPage failed.', err);
        }
      });
    }
  }

  async getSendZombieState(hostname) {
    const { isUnlocked } = await this.accountController.memStore.getState();
    const zombieState = await this.websiteController.getZombieState(hostname);

    return {
      isUnlocked: Boolean(isUnlocked),
      ...zombieState,
    };
  }

  /**
   *
   * @param {*} tabId
   * @param {*} feildValues
   */
  async getLeechSendState(tabId, feildValues = {}) {
    const hostname = this.getTabLoginHostname(tabId);
    const valtState = this.websiteController.getActiveTabState(tabId, hostname);
    const { isUnlocked } = this.accountController.memStore.getState();
    let { items = [] } = await this.websiteController.memStore.getState();

    if (items.length > 0 && hostname) {
      items = items.filter((it) => hostname.endsWith(it.hostname));
    } else {
      items = []; //
    }

    return {
      isUnlocked,
      hostname,
      items,
      feildValues,
      valtState,
    };
  }
}

export default BackMainController;
