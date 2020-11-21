export const getUUID = () =>
  (window || globalThis).crypto.getRandomValues(new Uint32Array(1))[0].toString(36);

export const getExtensionUrl = (part) => chrome.runtime.getURL(part);

/**
 * @see apiType '/src/libs/msgapi/'
 * @param {string} apiType
 * @param {*} data
 */
export const comboMessage = (apiType, data) => {
  if (typeof apiType !== 'string') throw 'incorrect apiType.';
  const message = {
    apiType: apiType,
    data,
  };

  return message;
};

/**
 * V2.0 add
 * @param {*} extid
 * @param {*} path
 */
export function getLeechSrc(extid, path) {
  if (!extid) return '';

  return path
    ? `chrome-extension://${extid}/p2/leech.html#/${path}`
    : `chrome-extension://${extid}/p2/leech.html`;
}

export function getLeechFFSrc(extid, path) {
  if (!extid) return '';

  return path
    ? `chrome-extension://${extid}/p2/leech.html#/${path}`
    : `chrome-extension://${extid}/p2/leech.html`;
}
