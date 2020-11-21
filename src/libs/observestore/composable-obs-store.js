import ObserveableStore from 'obs-store';

/*********************************************************************
 * AircraftClass ::
 *     @Description:
 *     @Description:
 * WARNINGS:
 *
 * HISTORY:
 *     @Author: lanbery@gmail.com
 *     @Created:  2020-11-01
 **********************************************************************/
class ComposableObservableStore extends ObserveableStore {
  /**
   *
   * @param {object} initState
   * @param {object} config
   */
  constructor(initState, config) {
    super(initState);
    this.updateStructure(config);
  }

  /**
   *
   * @param {object} config - Map of internal state keys to child store
   */
  updateStructure(config) {
    this.config = config;
    this.removeAllListeners();

    for (const key in config) {
      config[key].subscribe((state) => {
        this.updateState({ [key]: state });
      });
    }
  }

  /**
   * unflod state
   * controller getState expansion in state
   * @returns {object}
   */
  getFlatState() {
    let flatState = {};
    for (const k in this.config) {
      const controller = this.config[k];
      const state = controller.getState ? controller.getState() : controller.state;
      flatState = { ...flatState, ...state };
    }

    return flatState;
  }

  /**
   *
   */
  getComboState() {
    let comboState = {};
    for (const k in this.config) {
      const controller = this.config[k];
      const inState = controller.getState ? controller.getState() : controller.state;

      const state = { [k]: { ...inState } };

      comboState = { ...comboState, ...state };
    }

    return comboState;
  }
}

export default ComposableObservableStore;
