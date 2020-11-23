import debounce from 'debounce-stream';
import endOfStream from 'end-of-stream';
import storeTransform from 'obs-store/lib/transform';
import asStream from 'obs-store/lib/asStream';
import PortStream from 'extension-port-stream';
import pump from 'pump';

import logger from './libs/logger';
import extension from './libs/extensionizer';
import LocalStore from './libs/storage/local-store';
import BackgroundController from './libs/controllers/backmain-controller';
import createStreamSink from './libs/helpers/create-stream-sink';

import { buildExtVersion, buildExtAppName, LOG_LEVEL } from './libs/code-settings';
import {
  EXTENSION_INTERNAL_PROCESS,
  EXTENSION_CC_PROCESS,
  ENV_TYPE_FULLSCREEN,
  ENV_TYPE_POPUP,
  ENV_TYPE_INJET,
  ENV_TYPE_INJET_TOP,
  ENV_TYPE_LEECH,
} from './libs/enums';

import BPError from './libs/biz-error';
import WhispererListener from './libs/messages/chrome/whisperer-listener';
import FoxWhispererListener from './libs/messages/fox/whisperer-listener';
import { stopPasswordSaving } from './libs/platforms/utils';

import { isFox } from './libs/platforms/utils';

global.BPError = BPError;

// global.browser = require('webextension-polyfill');

let localStore = new LocalStore();
logger.debug('>>>>>>>>>>', localStore);
global.$local = localStore;

/**
 * top constants
 */
let latestVersionData;

let popupIsOpen = false;
let notificationIsOpen = false;

// holders
const openBpassTabsIds = {};
const leechTabs = {};

/** assert has BP client page opened */
const isClientOpenStatus = () => {
  return popupIsOpen || Boolean(Object.keys(openBpassTabsIds).length) || notificationIsOpen;
};

//startup
initialize().catch((error) => {
  logger.error('initialize backend error./n', error);
});

async function initialize() {
  const initState = await localStateFromPersistence();
  logger.debug(`Background initState>>>>`, initState);
  setupController(initState || {});
}

async function setupController(initState) {
  const controller = new BackgroundController({
    initState,
    openPopup,
    getLeechTabs: () => {
      return leechTabs;
    },
  });

  global.ctx = controller;

  /** pipe save state to local */
  pump(
    asStream(controller.store),
    debounce(1000),
    storeTransform(versionfyData),
    createStreamSink(persistStore),
    (error) => {
      logger.error(`${buildExtAppName} - Persistence pipeline failed.`, error);
    }
  );

  extension.runtime.onConnect.addListener(connectRemote);

  if (isFox()) {
    global.whisperer = new FoxWhispererListener({ controller });
  } else {
    global.whisperer = new WhispererListener({ controller });
  }

  devAutoLogin('1234');
  /** ======== setupController:internal functions begain =============== */
  // Connetion functions

  let injet = 0;
  /**
   *
   * @param {port} remotePort
   */
  function connectRemote(remotePort) {
    const proccessName = remotePort.name;
    const isBPassInternalProcess = EXTENSION_INTERNAL_PROCESS[proccessName];
    const isBPassCorpseChaserProcess = EXTENSION_CC_PROCESS[proccessName];
    const isFromTabs = remotePort && remotePort.sender.tab;

    /**
     * browser page tabs
     *
     */
    if (isBPassInternalProcess) {
      logger.debug(
        `Backend Root listened internal connection: [${proccessName}],isFormTabs:[${isFromTabs}] >>>`,
        remotePort
      );
      controller.setupTrustedCommunication(remotePort);
    }

    if (isFromTabs && isBPassCorpseChaserProcess) {
      logger.debug(
        `Backend Root listened CorpseChaser connection: [${proccessName}] >>>`,
        remotePort
      );
      switch (proccessName) {
        case ENV_TYPE_INJET:
          controller.setupInjetCommunication(remotePort);
          break;
        case ENV_TYPE_INJET_TOP:
          controller.setupInjetTopCommunication(remotePort);
          break;
        case ENV_TYPE_LEECH:
          controller.setupLeechCommunication(remotePort);
          break;
        default:
          break;
      }
    }

    if (!isBPassInternalProcess && !isBPassCorpseChaserProcess) {
      logger.debug(
        `Backend Root listened unregisted  ${proccessName} connection. >>>`,
        remotePort.sender
      );
    }

    // if (isBPassInternalProcess) {
    //   const portStream = new PortStream(remotePort);

    //   if (proccessName === ENV_TYPE_POPUP) {
    //     controller.setupTrustedCommunication(portStream, remotePort.sender);
    //     //popup
    //     // popupIsOpen = true;
    //     // controller.hasClientsOpened = true;
    //     //移到自己的controller 里处理
    //     // endOfStream(portStream, (err) => {
    //     //   logger.debug(`remote disconnected fail: ${proccessName}>>>`, err);
    //     //   popupIsOpen = false;
    //     //   controller.hasClientsOpened = isClientOpenStatus();
    //     // });
    //   }

    //   if (proccessName === ENV_TYPE_LEECH) {
    //     //open tabs app page or options page
    //     //Tabs sendMessage
    //     const tabId = remotePort.sender.tab.id;
    //     logger.debug(`remote connected: ${proccessName}>>>`, remotePort.sender);
    //     openBpassTabsIds[tabId] = true; //maybe save remotePort

    //     //移到自己的controller 里处理
    //     endOfStream(portStream, () => {
    //       delete openBpassTabsIds[tabId];
    //       logger.debug(`remote disconnected: ${proccessName}>>>`, openBpassTabsIds);
    //       controller.hasClientsOpened = isClientOpenStatus();
    //     });
    //   }

    //   if (proccessName === ENV_TYPE_INJET_TOP) {
    //     controller.setupInjetTopCommunication(portStream, remotePort.sender)
    //   }

    //   if (proccessName === ENV_TYPE_INJET) {
    //     injet++
    //     logger.debug(`remote ENV_TYPE_INJET: ${proccessName}>>>>>>>>>>`, remotePort,injet);
    //     controller.setupInjetCommunication(portStream, remotePort.sender)
    //   }

    //   //resp
    //   // const sendState = controller.getState();
    // } else {
    //   //TODO external connections injet
    //   logger.debug(
    //     `Backend Root listen external connected: ${proccessName} >>>`,
    //     remotePort.sender
    //   );
    // }
  }

  /** handle latest version data store */
  function versionfyData(state) {
    latestVersionData.data = state;
    return latestVersionData;
  }

  /** Save store to local */
  async function persistStore(state) {
    if (!state) {
      throw new Error(`${buildExtAppName} - update state is missing.`);
    }
    if (!state.data) {
      throw new Error(`${buildExtAppName} - update state does not contians data`);
    }

    if (localStore.isSupported) {
      try {
        await localStore.set(state);
        logger.debug(`${buildExtAppName} - save persistence state success.`);
      } catch (err) {
        logger.error(`${buildExtAppName} - persist store in local store:`, err);
      }
    }
  }

  function devAutoLogin(pass) {
    // return;
    const { env3 } = controller.accountController.store.getState();

    if (env3 && LOG_LEVEL === 'DEBUG') {
      setTimeout(async () => {
        try {
          await controller.accountController.unlock(pass);
        } catch (error) {
          logger.debug('auto login failed.>>>>>', error);
        }
      }, 1000);
    }
  }
  /** ======== setupController:internal functions end =============== */
}

/**
 * popup
 */
async function openPopup() {}

async function localStateFromPersistence() {
  latestVersionData = (await localStore.get()) || { meta: { version: buildExtVersion } };
  return latestVersionData.data;
}

/**
 *
 */
extension.runtime.onInstalled.addListener(({ reason }) => {
  logger.debug(`${extension.runtime.id} install`, reason);
  stopPasswordSaving();
});
