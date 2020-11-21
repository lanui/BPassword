const OPTIONS_WRAP_TAG = 'bp-selector-options';

export const IFRAME_TAG = 'iframe';

export const OPTIONS_IFRAME_MIN_HEIGHT = 376;
export const OPTIONS_IFRAME_DEF_WIDTH = 276;

export const BPID_BTN_ICON = 'btn-btext-icon';
export const BPID_SELECTOR_IFRAME = 'ifr-leech';

const ICON_SIZES = {
  large: 22,
  medium: 18,
  small: 16,
};

/**
 * create Selector wrapper
 * @param {String} wrapid
 */
export const createOptionWrapNode = (wrapid) => {
  // console.log('>>>>>>>>>>>>>',window.location.href)
  // let wrapNode = window.document.querySelector(OPTIONS_WRAP_TAG)
  // if (wrapNode) return;
  const optionsWrap = window.document.createElement(OPTIONS_WRAP_TAG);
  if (wrapid) {
    optionsWrap.setAttribute('id', wrapid);
  }

  // const div = window.document.createElement('div')
  // div.textContent = 'Hellow BPassword.'
  // optionsWrap.appendChild(div)
  window.document.body.appendChild(optionsWrap);

  return optionsWrap;
};

/**
 *
 */
export const getOptionsWrapNode = () => {
  let wrapNode = window.document.querySelector(OPTIONS_WRAP_TAG);
  if (wrapNode) return wrapNode;

  createOptionWrapNode();
  return window.document.querySelector(OPTIONS_WRAP_TAG);
};

export const createIframe = (src, { id, position }) => {
  const wrap = window.document.querySelector(OPTIONS_WRAP_TAG);

  if (!wrap) {
    log.warn(`unfound tag ${OPTIONS_WRAP_TAG} in body.`);
    return;
  }

  const clean = wrap.querySelector(IFRAME_TAG) && wrap.querySelector(IFRAME_TAG).remove();

  const { left, top, width, height } = position;

  wrap.style.top = top;
  wrap.style.left = left;

  const iframe = document.createElement(IFRAME_TAG);
  iframe.setAttribute('id', id);
  iframe.setAttribute('src', src);
  iframe.setAttribute('frameorder', 'no');
  iframe.setAttribute('scrolling', 'no');
  iframe.style.cssText =
    +`all:initail;float:left;left:${left}px;top:${top}px;` +
    `width:${width}px;min-height:${height}px;` +
    'box-shadow:none;' +
    'overflow-y:hidden;';

  wrap.appendChild(iframe);

  // wrap.style.cssText = `position:abslution;float:left;`
};

export const clacLeechPosition = (feildPosition, ifrPosition = {}) => {
  if (!feildPosition) throw 'feildPosition args error.';
  const width = ifrPosition.width
    ? Math.min(ifrPosition.width, OPTIONS_IFRAME_DEF_WIDTH)
    : OPTIONS_IFRAME_DEF_WIDTH;

  const position = {
    width,
    height: OPTIONS_IFRAME_MIN_HEIGHT,
    top: (ifrPosition.top || 0) + feildPosition.top + feildPosition.height + 2,
    left: (ifrPosition.left || 0) + feildPosition.left,
  };

  return position;
};
