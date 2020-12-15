import BizError from '@lib/biz-error';
import { INTERNAL_ERROR } from '@lib/biz-error/error-codes';
import { SmartAddressesTranslate } from '../contracts';

/*********************************************************************
 * AircraftClass ::
 *    @description:
 *    @description:
 * WARNINGS:
 *
 * HISTORY:
 *    @author: lanbery@gmail.com
 *    @created:  2020-12-14
 *    @comments:
 **********************************************************************/
const NUMBER_REGEX = /^[0-9]*$/;
export const validWeb3Addr = (web3js, address) => {
  if (!web3js) {
    throw new BizError('web3 instance undefined.', INTERNAL_ERROR);
  }
  if (!address) {
    throw new BizError(`Params Address illegal.[${address}]`, INTERNAL_ERROR);
  }
};

/**
 *
 * @param {number} chainId
 * @param {string} contractName
 * @return {string} contractAddress
 */
export const validChainAddress = (chainId, contractName) => {
  if (!NUMBER_REGEX.test(chainId) || typeof contractName !== 'string') {
    throw new BizError('chainId or contractName illegal.', INTERNAL_ERROR);
  }
  const smarts = SmartAddressesTranslate();
  if (!smarts || !smarts[parseInt(chainId)] || smarts[parseInt(chainId)].length === 0) {
    throw new BizError('chainId unsupported :' + chainId, INTERNAL_ERROR);
  }

  const btInfo = smarts[parseInt(chainId)].find((smart) => smart.contractName === contractName);
  if (!btInfo || !btInfo.address) {
    throw new BizError(
      `Lookup smart [${contractName}] at chain [${chainId}] unset.`,
      INTERNAL_ERROR
    );
  }

  return btInfo.address;
};

export const validParams = (params) => {
  if (!params) throw new BizError('Params undefined', INTERNAL_ERROR);

  if (typeof params === 'object') {
    const keys = Object.keys(params);
    if (keys.length === 0) {
      throw new BizError('Params is null object.', INTERNAL_ERROR);
    }

    for (let i in keys) {
      let key = keys[i];
      if (params[key] == undefined) {
        throw new BizError(`Params ${key} undefined.`, INTERNAL_ERROR);
      }
    }
  }
};
