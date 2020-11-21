import extension from '../extensionizer';
import { BROWSER_FIREFOX } from '../enums';
import { extTarget } from '../code-settings';
export const getExtensionUrl = (part) => extension.runtime.getURL(part);
export const getExtId = () => extension.runtime.id;

export const getExtName = () => {
  return process.env.APP_NAME || 'BP';
};

/**
 *
 */
export const stopPasswordSaving = () => {
  if (extension && extension.privacy) {
    extension.privacy.services.passwordSavingEnabled.set({ scope: 'regular', value: false });
  }
};

export const isFox = () => BROWSER_FIREFOX === extTarget;
