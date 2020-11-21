/*********************************************************************
 * AircraftClass :: UI input feild validate Rules
 *     @Description:
 *     @Description:
 * WARNINGS:
 *
 * HISTORY:
 *     @Author: lanbery@gmail.com
 *     @Created:  2020-10-27
 **********************************************************************/
import { TITLE_DELIMITER } from '@/libs/utils/item-transfer';

export const passwordRules = [
  (value) => !!value || 'Password Required.',
  (v) => (v && v.length >= 3) || 'Min 3 characters',
  (v) => (v && v.length <= 30) || 'Max 30 characters',
];

export const itemPassRules = [(v) => (v && v.length > 0) || 'Password required'];

export const titleSuffixRules = [
  (v) =>
    !new RegExp(TITLE_DELIMITER, 'g').test(v) ||
    `Tips are not allowed to contain \'${TITLE_DELIMITER}\'.`,
];

export const hostnameRules = [
  (v) => (!!v && v.trim().length > 0) || 'Domain is required. like passport.jd.com',
  (v) =>
    /^(?=^.{3,255}$)[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+$/.test(v) ||
    'Website Domain incorrect.',
];

const keystoreJsonValid = (v) => {
  if (typeof v !== 'string') return 'Please entry correct keystore';
  try {
    const keystore = JSON.parse(v);
    if (typeof keystore !== 'object' || keystore === null) {
      return 'keystore json incorrect.';
    }

    if (
      !keystore.mainAddress ||
      !keystore.crypto ||
      !keystore.subAddress ||
      !keystore.subCipher ||
      !keystore.version
    ) {
      return 'keystore json incorrect.';
    }

    return true;
  } catch (e) {
    return 'keystore json incorrect.';
  }
};

export const keystoreRules = [
  (key) =>
    (!!key && typeof key === 'string' && key.trim().length > 0) || 'Please entry correct keystore',
  keystoreJsonValid,
];
