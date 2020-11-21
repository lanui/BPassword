import logger from '../logger';
import LocalStore from './local-store';

/**
 *
 */
export async function isInitialized() {
  try {
    const local = new LocalStore();
    const state = await local.get();

    if (
      !state ||
      !state.data ||
      !state.data.AccountController ||
      !state.data.AccountController.env3
    ) {
      return false;
    } else {
      return true;
    }
  } catch (err) {
    return false;
  }
}

/**
 *
 */
export async function fetchEnv3() {
  try {
    const local = new LocalStore();
    const state = await local.get();
    if (!state || !state.data || !state.data.AccountController) return null;
    return state.data.AccountController.env3 || null;
  } catch (err) {
    logger.warn('fetch locale data failed.', err);
    return null;
  }
}
