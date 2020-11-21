import { memoize } from 'lodash';

import extension from '../extensionizer';

import {
  ENV_TYPE_FULLSCREEN,
  ENV_TYPE_NOTIFICATION,
  ENV_TYPE_BACKGROUND,
  ENV_TYPE_POPUP,
} from '../enums';

import { NOTIFY_PAGER, POPUP_PAGER, APP_PAGER } from '../pager-cnst';

export const checkForError = () => {
  const lastError = extension.runtime.lastError;

  if (!lastError) return;

  if (lastError.stack && lastError.message) {
    return lastError;
  }

  // chromiun 77
  return new Error(lastError.message);
};

/**
 *
 */
export const getEnvironmentTypeMemo = memoize((url) => {
  const parseUrl = new URL(url);

  if (parseUrl.pathname === POPUP_PAGER) {
    return ENV_TYPE_POPUP;
  } else if ([APP_PAGER].includes(parseUrl.pathname)) {
    return ENV_TYPE_FULLSCREEN;
  } else if (parseUrl.pathname === NOTIFY_PAGER) {
    return ENV_TYPE_NOTIFICATION;
  } else {
    return ENV_TYPE_BACKGROUND;
  }
});

export const getEnvironmentType = (url = window.location.href) => getEnvironmentTypeMemo(url);

export default {
  checkForError,
};
