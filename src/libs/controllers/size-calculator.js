import { size } from 'lodash';

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
  const {
    items = [],
    isUnlocked = false,
    username = '',
    password = '',
    hostname = '',
    activedField = '',
  } = options;

  let rows = 0,
    matchedNum = items.length;

  if (!isUnlocked) {
    return lockedSizeState(options);
  } else {
  }

  if (!isUnlocked) {
    if ((username && password) || matchedNum) {
      if (activedField === 'password') {
        return {
          isUnlocked,
          rows: matchedNum,
          items,
          iHeight: IFR_CONF.lockedHeight, // will remove at version 2.1.x
          ifrHeight: IFR_CONF.lockedHeight,
          elemType: 'drawing',
          tag: 'show locked page',
        };
      } else {
        return {
          isUnlocked,
          rows: matchedNum,
          items,
          iHeight: IFR_CONF.lockedHeight,
          ifrHeight: IFR_CONF.lockedHeight,
          elemType: 'erase',
          tag: 'hidden locked page',
        };
      }
    } else {
      return {
        isUnlocked,
        rows: matchedNum,
        items,
        iHeight: IFR_CONF.lockedHeight,
        ifrHeight: IFR_CONF.lockedHeight,
        elemType: 'erase',
        tag: 'hidden page',
      };
    }
  } else {
    if (username && password) {
      const matchItem = items.find((it) => it.username === username && it.password === password);
      if (matchItem) {
        return {
          isUnlocked,
          exactMatched: true,
          rows: 1,
          items: [matchItem],
          iHeight: IFR_CONF.addBtnHeight,
          ifrHeight: IFR_CONF.addBtnHeight,
          elemType: 'erase',
          tag: 'hidden page,exactMatched',
        };
      } else if (activedField === 'password') {
        const nameMatched = items.find((it) => it.username === username);
        if (nameMatched) {
          return {
            isUnlocked,
            rows: 2,
            items: [nameMatched],
            iHeight: calcRowHeight(2), // 增加一行修改密码
            ifrHeight: calcRowHeight(2),
            elemType: 'drawing',
            tag: 'show update button page,active password field',
          };
        } else {
          return {
            isUnlocked,
            exactMatched: false,
            rows: 0,
            items: [],
            iHeight: IFR_CONF.addBtnHeight,
            ifrHeight: IFR_CONF.addBtnHeight,
            elemType: 'drawing',
            tag: 'show page,no matched name and password',
          };
        }
      } else if (activedField === 'username') {
        //聚焦username
        const _actUnameFilters = items.filter((it) => it.username.startsWith(username));
        if (_actUnameFilters.length > 0) {
          return {
            isUnlocked,
            rows: _actUnameFilters.length,
            items: [..._actUnameFilters],
            ifrHeight: calcRowHeight(_actUnameFilters.length),
            elemType: 'drawing',
            tag: 'show selector filter list page,active username field',
          };
        } else {
          return {
            isUnlocked,
            exactMatched: false,
            rows: 0,
            items: [],
            ifrHeight: IFR_CONF.addBtnHeight,
            elemType: 'erase',
            tag: 'hidden page,no matched name and password',
          };
        }
      } else {
        return {
          isUnlocked,
          exactMatched: false,
          rows: 0,
          items: [],
          ifrHeight: IFR_CONF.addBtnHeight,
          elemType: 'erase',
          tag: 'hidden page,active username field',
        };
      }
    }

    if (username) {
      const _filters = items.filter((it) => it.username.startsWith(username));
      rows = _filters.length;

      if (rows == 0) {
        return {
          isUnlocked,
          exactMatched: false,
          rows: 0,
          items: [],
          ifrHeight: calcRowHeight(matchedNum), //预存
          elemType: 'erase',
          tag: 'hidden page,no match filter',
        };
      } else {
        return {
          isUnlocked,
          exactMatched: false,
          rows,
          items: [..._filters],
          ifrHeight: calcRowHeight(rows), //预存
          elemType: 'drawing',
          tag: 'show filter page',
        };
      }
    }

    if (matchedNum > 0) {
      return {
        isUnlocked,
        exactMatched: false,
        rows: matchedNum,
        items,
        ifrHeight: calcRowHeight(matchedNum), //预存
        elemType: 'drawing',
        tag: 'show host matched page',
      };
    } else {
      return {
        isUnlocked,
        exactMatched: false,
        rows: matchedNum,
        items,
        ifrHeight: calcRowHeight(matchedNum), //预存
        elemType: 'erase',
        tag: 'hidden no items',
      };
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
      sizeItems = items.filter((it) => it.name.startsWith(username));
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
  } else if (activedField === 'password') {
    if (hostMatchesNum > 0 && username && password) {
      const extactItem = items.find((it) => it.name === username && it.password !== password);
      const updateItem = JSON.parse(JSON.stringify(exactItem));
      updateItem.password = password;

      rows = 2;
      return {
        isUnlocked,
        items: [extactItem, updateItem],
        rows,
        ifrHeight: calcRowHeight(rows),
        elemType: 'drawing',
        tag: 'Changed Event Password show update password pop.',
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
          tag: 'Changed Event Password show select from filter pop.',
        };
      }
    }

    if (hostMatchesNum === 0 && !username && !password) {
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

    if (hostMatchesNum === 0 && (!username || !password)) {
      return {
        isUnlocked,
        items: [],
        rows: 0,
        ifrHeight: 0,
        elemType: 'erase',
        tag: 'Changed Event Password miss completed fields valt,hidden pop.',
      };
    }
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
