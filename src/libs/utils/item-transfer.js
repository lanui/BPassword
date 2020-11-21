export const TITLE_DELIMITER = ';';
export const UI_ITEM_PROPS = ['title', 'username', 'password'];
export const UI_PASSBOOK_PROPS = [...UI_ITEM_PROPS, 'hostname'];

export const transferPlain = (Plain, isWebsite = false) => {};

export const getDiff = (Plain) => {
  if (!Plain || !Plain.ChainData || !Array.isArray(Plain.ChainData) || !Array.isArray(Plain.View)) {
    return '';
  }

  const diffNumber = Plain.View.length - Plain.ChainData.length;
  if (diffNumber === 0) return '';
  return diffNumber > 0 ? '+' + diffNumber : '' + diffNumber;
};

/**
 *
 * @param {*} Plain
 * @param {*} isWebsite
 */
export const transferTerms = (Plain, isWebsite = false) => {
  if (!Plain) return [];
  const plainState = typeof Plain.unwrap === 'function' ? Plain.unwrap() : Plain;
  const { View, ChainData } = plainState;
  if (!Array.isArray(View)) return [];

  if (!Array.isArray(ChainData)) ChainData = [];

  const items = View.map((v) => {
    const title = v.title || '';
    const onchain = ChainData.find((c) => c.title == title);

    const i = {
      title: title,
      isblocker: Boolean(onchain),
      username: v.name || null,
      password: v.password || null,
    };

    const rets = SplitTitle(title);
    if (isWebsite && rets.length) {
      i.hostname = rets[0];
    }
    return i;
  }).filter((it) => it.tips !== null && it.username !== null && it.password !== null);

  return items;
};

function SplitTitle(title) {
  if (typeof title !== 'string') {
    return [];
  }
  const rets = title.split(new RegExp(TITLE_DELIMITER, 'g'));
  return rets;
}

/**
 *
 * @param {object} data
 */
export const trimItemPorps = (data) => {
  if (typeof data !== 'object') return data;

  return {
    title: data['title'] ? data['title'].trim() : '',
    username: data['username'] ? data['username'].trim() : '',
    password: data['password'].trim() ? data['password'].trim() : '',
    suffix: data['suffix'] ? data['suffix'].trim() : '',
    hostname: data['hostname'] ? data['hostname'].trim() : '',
  };
};
