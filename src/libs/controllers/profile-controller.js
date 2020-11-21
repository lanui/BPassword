import ObservableStore from 'obs-store';

/*********************************************************************
 * AircraftClass ::
 *     @Description: Management User's preferences settings
 *     @Description:
 * WARNINGS:
 *
 * HISTORY:
 *     @Author: lanbery@gmail.com
 *     @Created:  2020-11-02
 **********************************************************************/
export default class ProfileController {
  /**
   *
   * @param {object} opts
   * @property {object} store
   */
  constructor(opts = {}) {
    const initState = Object.assign(
      {
        tokens: [],
        favicons: [],
      },
      opts.initState
    );

    this.network = opts.network;
    this.store = new ObservableStore(initState);

    this.store.setMaxListeners(12);
  }
}
