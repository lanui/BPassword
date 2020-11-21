import EventEmitter from 'events';
import { getUUID } from './comm-utils';

class BaseController extends EventEmitter {
  constructor({ type = 'comm_', items = [] }) {
    super();
    this._type = type;
    this._href = window.location.href;
    this._uuid = type + getUUID();
    this.items = items;
  }

  getId() {
    return this._uuid;
  }

  getItems() {
    return Array.isArray(this.items) ? this.items : [];
  }
  setItems(items) {
    this.items = items;
  }

  getHref() {
    return this._href;
  }

  logString() {
    return `${this._uuid}:${this._href}`;
  }

  getHost() {
    return this._href ? new URL(this._href).hostname : '';
  }
}

export default BaseController;
