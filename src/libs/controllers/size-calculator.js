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
export function ifrSizeCalcWhenValtChanged(options = {}) {
  const {
    items = [],
    isUnlocked = false,
    username = '',
    password = '',
    hostname = '',
    activeField = '',
  } = options;

  let rows = 0,
    matchedNum = items.length;

  if (!isUnlocked) {
    if ((username && password) || matchedNum) {
      if (activeField === 'password') {
        return {
          isUnlocked,
          rows: matchedNum,
          items,
          iHeight: IFR_CONF.lockedHeight,
          elemType: 'drawing',
          tag: 'show locked page',
        };
      } else {
        return {
          isUnlocked,
          rows: matchedNum,
          items,
          iHeight: IFR_CONF.lockedHeight,
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
          elemType: 'erase',
          tag: 'hidden page,exactMatched',
        };
      } else if (activeField === 'password') {
        const nameMatched = items.find((it) => it.username === username);
        if (nameMatched) {
          return {
            isUnlocked,
            rows: 2,
            items: [nameMatched],
            iHeight: calcRowHeight(2), // 增加一行修改密码
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
            elemType: 'drawing',
            tag: 'show page,no matched name and password',
          };
        }
      } else if (activeField === 'username') {
        //聚焦username
        const _actUnameFilters = items.filter((it) => it.username.startsWith(username));
        if (_actUnameFilters.length > 0) {
          return {
            isUnlocked,
            rows: _actUnameFilters.length,
            items: [..._actUnameFilters],
            iHeight: calcRowHeight(_actUnameFilters.length), // 增加一行修改密码
            elemType: 'drawing',
            tag: 'show selector filter list page,active username field',
          };
        } else {
          return {
            isUnlocked,
            exactMatched: false,
            rows: 0,
            items: [],
            iHeight: IFR_CONF.addBtnHeight,
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
          iHeight: IFR_CONF.addBtnHeight,
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
          iHeight: calcRowHeight(matchedNum), //预存
          elemType: 'erase',
          tag: 'hidden page,no match filter',
        };
      } else {
        return {
          isUnlocked,
          exactMatched: false,
          rows,
          items: [..._filters],
          iHeight: calcRowHeight(rows), //预存
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
        iHeight: calcRowHeight(matchedNum), //预存
        elemType: 'drawing',
        tag: 'show host matched page',
      };
    } else {
      return {
        isUnlocked,
        exactMatched: false,
        rows: matchedNum,
        items,
        iHeight: calcRowHeight(matchedNum), //预存
        elemType: 'erase',
        tag: 'hidden no items',
      };
    }
  }
}

/**
 * rows > 0 must
 * @param {*} rows
 */
function calcRowHeight(rows) {
  if (rows == 0) return IFR_CONF.addBtnHeight;
  let _showRows = rows > IFR_CONF.maxRows ? IFR_CONF.maxRows : rows;

  return IFR_CONF.baseHeight + _showRows * IFR_CONF.rowHeight;
}
