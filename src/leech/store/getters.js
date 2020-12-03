export const currentMatched = (state) => {
  const name = state.feildVolume.username;

  if (!name) return null;

  const items = state.items || [];

  const findItem = items.find((item) => item.username === name.toString().trim());

  return findItem || null;
};

export const items = (state) => {
  let items = state.items || [];
  return items;
};

/**
 *
 * @param {*} state
 */
export const filterItems = (state) => {
  const items = state.items || [];

  const valtState = state.valtState || {};

  const { username = '', password = '' } = valtState;

  let retItems = items,
    exactMatchItem;
  //exactMatched
  if (username && password && items.length) {
    exactMatchItem = items.find((it) => it.username === username);
    if (exactMatchItem && exactMatchItem.password !== password) {
      return [exactMatchItem, { ...exactMatchItem, password, ctype: 'update' }];
    } else if (!exactMatchItem) {
      return []; // add items
    }
  }

  if (!username || !password) {
    if (!username) return items;
    retItems = items.filter((it) => it.username.startsWith(username.trim()));
  }

  return retItems;
};

/**
 *
 * @param {*} state
 */
export const matchedPassChanged = (state) => {
  const { username, password } = state.feildVolume;
  if (!username || state.items.length == 0) return false;
  let item = state.items.find((it) => it.username === username);
  if (item && item.password !== password) return true;
  return false;
};

//40 * 8 = 320 + 50 +(10+4)

export const listHeight = (state) => {
  const fItems = filterItems(state);
  const max = state.settings.maxRows || 6;
  let itemHeight = state.settings.itemHeight || 40,
    len = fItems ? fItems.length : 0;
  let rows = len < 1 ? 1 : len > max ? max : len;

  let height = rows * itemHeight;

  return height;
};
