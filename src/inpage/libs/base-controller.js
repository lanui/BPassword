import EventEmitter from 'events';
import { nanoid } from 'nanoid';

/*********************************************************************
 * AircraftClass ::
 *    @description: BaseController Features :
 *    @description:
 * WARNINGS:
 *
 * HISTORY:
 *    @author: lanbery@gmail.com
 *    @created:  2020-11-25
 *    @comments:
 **********************************************************************/

export const DEF_MAX_LISTENERS = 10;
class BaseController extends EventEmitter {
  constructor({ type = 'comm_', hostname }) {
    super();
    this.setMaxListeners(DEF_MAX_LISTENERS);
    this._uuid = `${type}${nanoid()}`;
    this._hostname = new URL(window.location.href).hostname;
  }

  getId() {
    return this._uuid;
  }

  getHost() {
    return this._hostname;
  }
}

export default BaseController;
