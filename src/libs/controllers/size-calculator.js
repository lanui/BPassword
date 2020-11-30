import logger from '@lib/logger';

/*********************************************************************
 * AircraftClass ::
 *    @description: 1. matchedNum=0
 *                      username && password --> show add
 *                  2. username && password && find (exactMatched =1)
 *                      --> erase
 *                  2. matchedNum>0 && username &&  !password
 *                      filter > 0  -->show list
 *                  3. !username && matchedNum>0
 *                      --> show list
 *                  4. (!username || !password || matchedNum =0)
 *                      --> erase
 *
 *    @description:isUnlocked
 *                 username && password --> show
 *                 (username || !password) -->erase
 *    @description: add ifrHeight property
 * WARNINGS:
 *
 * HISTORY:
 *    @author: lanbery@gmail.com
 *    @created:  2020-11-18
 *    @comments:
 **********************************************************************/
export const IFR_CONF = {
  maxWidth: 300,
  minWidth: 220,
  defaultWidth: 300,
  lockedHeight: 100,
  baseHeight: 44,
  rowHeight: 40,
  maxRows: 6,
  addBtnHeight: 80,
  adjustment: 4,
  addorHeight: 275,
};

/**
 * 当值变化是调用
 * @param {*} isUnlocked
 * @param {*} options
 */
export function ifrSizeCalcWhenValtChanged(options = {}, isChanged = false) {
  // logger.debug('ifrSizeCalcWhenValtChanged>>',options,isChanged)
  const { isUnlocked = false } = options;

  if (!isUnlocked) {
    return lockedSizeState(options);
  } else {
    if (isChanged) {
      return unlockedSizeStateWithValtChanged(options);
    } else {
      return unlockedSizeState(options);
    }
  }
}

/**
 * focusin or focuout
 * @param {*} options
 */
function unlockedSizeState(options = {}) {
  const {
    items = [],
    isUnlocked = false,
    hostname = '',
    activedField = '',
    username = '',
    password = '',
  } = options;

  let hostMatchesNum = items.length,
    sizeItems = items,
    rows = items.length;

  const sizeState = {
    isUnlocked,
    items: sizeItems,
    rows: rows,
    ifrHeight: 0,
    elemType: '',
    tag: 'unhandle sizeState.',
  };

  /**
   * focusin username
   *  show->
   *  username
   */
  if (activedField === 'username') {
    if (hostMatchesNum > 0 && username && !password) {
      // matches
      sizeItems = items.filter((it) => it.username.startsWith(username));
      rows = sizeItems.length;
      if (rows > 0) {
        return {
          isUnlocked,
          items: sizeItems,
          rows,
          ifrHeight: calcRowHeight(rows),
          elemType: 'drawing',
          tag: 'Focusin Username show filter items.',
        };
      }
    }

    if (hostMatchesNum > 0 && !username) {
      rows = items.length;
      if (rows > 0) {
        return {
          isUnlocked,
          items: items,
          rows,
          ifrHeight: calcRowHeight(rows),
          elemType: 'drawing',
          tag: 'Focusin Username show matches items.',
        };
      }
    }

    if (hostMatchesNum === 0 && username && password) {
      rows = 0;
      return {
        isUnlocked,
        items: items,
        rows,
        ifrHeight: 0,
        elemType: 'erase',
        tag: 'Focusin Username input completed need hidden pop.',
      };
    }
  } else if (activedField === 'password') {
    if (hostMatchesNum > 0 && username && password) {
      const exactItem = items.find((it) => it.username === username && it.password !== password);
      if (exactItem) {
        rows = 2;
        const updateItem = JSON.parse(JSON.stringify(exactItem));
        updateItem.password = password;
        return {
          isUnlocked,
          items: [exactItem, updateItem],
          rows,
          ifrHeight: calcRowHeight(rows),
          elemType: 'drawing',
          tag: 'Focusin Password show update item password.',
        };
      }
    }

    if (hostMatchesNum > 0 && username && !password) {
      sizeItems = items.filter((it) => it.username.startsWith(username));
      rows = sizeItems.length;

      if (rows > 0) {
        return {
          isUnlocked,
          items: sizeItems,
          rows,
          ifrHeight: calcRowHeight(rows),
          elemType: 'drawing',
          tag: 'Focusin Password show filter items.',
        };
      }
    }

    if (hostMatchesNum > 0 && !username) {
      rows = items.length;
      return {
        isUnlocked,
        items: items,
        rows,
        ifrHeight: calcRowHeight(rows),
        elemType: 'drawing',
        tag: 'Focusin Password show hostMatches items.',
      };
    }

    if (hostMatchesNum === 0 && username && password) {
      //add tips
      rows = 1;
      const item = {
        hostname,
        title: hostname,
        username: username.toString(),
        password: password.toString(),
      };
      return {
        isUnlocked,
        items: [item],
        rows,
        ifrHeight: IFR_CONF.addBtnHeight,
        elemType: 'drawing',
        tag: 'Focusin Password show add item pop.',
      };
    }

    if (hostMatchesNum === 0 && (!username || !password)) {
      rows = hostMatchesNum;
      return {
        isUnlocked,
        items: items,
        rows: 0,
        ifrHeight: 0,
        elemType: 'erase',
        tag: 'Focusin Password no matches and no compeleted valt hidden pop.',
      };
    }
  }
  return sizeState;
}

/**
 * input field valtChanged
 * @param {*} options
 */
function unlockedSizeStateWithValtChanged(options = {}) {
  logger.debug('entry ifrSizeCalcWhenValtChanged-->>>>', options);
  const {
    items = [],
    isUnlocked = false,
    hostname = '',
    activedField = '',
    username = '',
    password = '',
  } = options;

  let sizeItems = items,
    hostMatchesNum = items.length,
    rows = items.length;

  const sizeState = {
    isUnlocked,
    items: sizeItems,
    rows: rows,
    ifrHeight: 0,
    elemType: '',
    tag: 'Changed Event unhandle sizeState.',
  };

  if (activedField === 'username') {
    if (username && !password && hostMatchesNum > 0) {
      sizeItems = items.filter((it) => it.username.startsWith(username));

      rows = sizeItems.length;
      if (rows > 0) {
        return {
          isUnlocked,
          items: sizeItems,
          rows,
          ifrHeight: calcRowHeight(rows),
          elemType: 'drawing',
          tag: 'Changed Event Username show filter items.',
        };
      }
    }

    if (username && password) {
      return {
        isUnlocked,
        items: sizeItems,
        rows,
        ifrHeight: 0,
        elemType: 'erase',
        tag: 'Changed Event Username,input fields valt completed hidden pop.',
      };
    }

    if (hostMatchesNum > 0 && !username) {
      rows = hostMatchesNum;
      return {
        isUnlocked,
        items: items,
        rows,
        ifrHeight: calcRowHeight(rows),
        elemType: 'drawing',
        tag: 'Changed Event Username show host matches items.',
      };
    }

    if (hostMatchesNum > 0 && username && !password) {
      sizeItems = items.filter((it) => it.username.startsWith(username));
      rows = sizeItems.length;

      if (rows > 0) {
        return {
          isUnlocked,
          items: sizeItems,
          rows,
          ifrHeight: calcRowHeight(rows),
          elemType: 'drawing',
          tag: 'Changed Event Username,show filter items pop.',
        };
      } else {
        return {
          isUnlocked,
          items: [],
          rows: 0,
          ifrHeight: 0,
          elemType: 'erase',
          tag: 'Changed Event Username no filter matches hidden pop.',
        };
      }
    }

    if (hostMatchesNum === 0) {
      return {
        isUnlocked,
        items: [],
        rows: 0,
        ifrHeight: 0,
        elemType: 'erase',
        tag: 'Changed Event Username no host matches hidden pop.',
      };
    }

    sizeState.tag = 'Changed Events username, unhandle pop';
    return sizeState;
  } else if (activedField === 'password') {
    if (hostMatchesNum > 0 && username && password) {
      const exactItem = items.find((it) => it.username === username);
      logger.debug('entry ifrSizeCalcWhenValtChanged-->>>>', exactItem, options);
      if (exactItem && exactItem.password !== password) {
        const updateItem = JSON.parse(JSON.stringify(exactItem));
        updateItem.password = password;

        rows = 2;
        return {
          isUnlocked,
          items: [exactItem, updateItem],
          rows,
          ifrHeight: calcRowHeight(rows),
          elemType: 'drawing',
          tag: 'Changed Event Password show update password pop.',
        };
      }

      if (!exactItem) {
        const addItem = {
          hostname,
          title: hostname,
          username,
          password,
          suffix: '',
        };
        return {
          isUnlocked,
          items: [addItem],
          rows: 1,
          ifrHeight: IFR_CONF.addBtnHeight,
          elemType: 'drawing',
          tag: 'Changed Event Password show add item pop.',
        };
      }
    }

    if (hostMatchesNum > 0 && username && !password) {
      sizeItems = items.filter((it) => it.username.startsWith(username));
      rows = sizeItems.length;

      if (rows > 0) {
        return {
          isUnlocked,
          items: sizeItems,
          rows,
          ifrHeight: calcRowHeight(rows),
          elemType: 'drawing',
          tag: 'Changed Event Password show select from filter pop.',
        };
      }
    }

    if (hostMatchesNum === 0 && username && password) {
      const addItem = {
        hostname,
        title: hostname,
        username,
        password,
        suffix: '',
      };
      return {
        isUnlocked,
        items: [addItem],
        rows: 1,
        ifrHeight: IFR_CONF.addBtnHeight,
        elemType: 'drawing',
        tag: 'Changed Event Password show add item pop.',
      };
    }

    if (!username || !password) {
      return {
        isUnlocked,
        items: [],
        rows: 0,
        ifrHeight: 0,
        elemType: 'erase',
        tag: 'Changed Event Password miss completed fields valt,hidden pop.',
      };
    }

    sizeState.tag = 'Changed Events password, unhandle pop';
    return sizeState;
  } else {
    return sizeState;
  }
}

/**
 * Locked state calc sizeState
 * @param {*} options
 */
function lockedSizeState(options = {}) {
  const { items = [], activedField = '', username = '', password = '' } = options;
  const hostMatchesNum = items.length;
  if (hostMatchesNum > 0 || (username && password && activedField === 'password')) {
    return {
      isUnlocked: false,
      exactMatched: false,
      rows: hostMatchesNum,
      items: items,
      ifrHeight: IFR_CONF.lockedHeight,
      elemType: 'drawing',
      tag: 'locked state,matches or need add tips.',
    };
  } else {
    return {
      isUnlocked: false,
      exactMatched: false,
      rows: hostMatchesNum,
      items: items,
      ifrHeight: IFR_CONF.lockedHeight,
      elemType: 'erase',
      tag: 'locked state,no matches and unneed add tips.',
    };
  }
}

/**
 * rows > 0 must
 * @param {*} rows
 */
function calcRowHeight(rows) {
  if (rows == 0) return IFR_CONF.addBtnHeight;
  let _showRows = rows > IFR_CONF.maxRows ? IFR_CONF.maxRows : rows;

  const diff = rows === 1 ? 2 : 0;
  let ifrHeight = IFR_CONF.baseHeight + _showRows * IFR_CONF.rowHeight + diff;

  return ifrHeight;
}
