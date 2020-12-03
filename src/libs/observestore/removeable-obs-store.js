import ObservableStore from 'obs-store';

/*********************************************************************
 * AircraftClass ::
 *    @description:
 *    @description:
 * WARNINGS:
 *
 * HISTORY:
 *    @author: lanbery@gmail.com
 *    @created:  2020-12-03
 *    @comments: Remove key enabled
 **********************************************************************/
class RemoveableObserverStore extends ObservableStore {
  constructor(initState = {}) {
    super(initState);
  }

  removeKeyState(key) {
    if (typeof key !== 'string' && typeof key !== 'number') {
      throw new Error(`key illegal.${key}`);
    }
    let _currState = this._getState();
    if (_currState) {
      delete _currState[key];
      this._putState(Object.assign({}, _currState));
      return true;
    } else {
      return false;
    }
  }
}

export default RemoveableObserverStore;
