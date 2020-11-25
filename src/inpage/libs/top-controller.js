import ObservableStore from 'obs-store';
import logger from '@lib/logger';

import BaseController from './base-controller';

/*********************************************************************
 * AircraftClass ::
 *    @description: Page Top Iframe controller,management the leech box
 *    @description:
 * WARNINGS:
 *
 * HISTORY:
 *    @author: lanbery@gmail.com
 *    @created:  2020-10-27
 *    @comments: 2020-11-25 firefox refactor
 *      bacause firefox content script can't get extension id,
 *      so all dependencies extid resources need fetch back used message
 *      at instance lifetime
 **********************************************************************/
class TopController extends BaseController {
  constructor(opts = {}) {
    super();

    this.backendStore = new ObservableStore({
      isUnlocked: false,
      items: [],
      matchedNum: 0,
      exactMatched: false,
    });

    logger.debug('>>>TopController>>>>>>>>>>>>>>>>>>', this.getId());
  }
}

export default TopController;
