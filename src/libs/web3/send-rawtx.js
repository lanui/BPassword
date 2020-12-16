import Web3 from 'web3';

import Common from '@ethereumjs/common';
import { Transaction } from '@ethereumjs/tx';
import BizError from '../biz-error';
import { PARAMS_ILLEGAL } from '../biz-error/error-codes';
import logger from '../logger';

import { DEFAULT_GAS_LIMIT } from './cnst';

/*********************************************************************
 * AircraftClass ::
 *    @description:
 *    @description:
 * WARNINGS:
 *
 * HISTORY:
 *    @author: lanbery@gmail.com
 *    @created:  2020-12-15
 *    @comments:
 **********************************************************************/

/**
 *
 * @param {object} web3js
 * @param {object} txParams
 * @property {number} gasLimit
 * @property {number} gasPrice
 * @property {string} from required
 */
export const signedDataTransaction = async (txParams, signOpts) => {
  const { dev3, chain } = signOpts;
  let txData = validTxParams(txParams);
  logger.debug('Translate txParams => txData', txData);

  const common = new Common({ chain: chain });
  const tx = Transaction.fromTxData(txData, { common });

  const signedTx = tx.sign(dev3.MainPriKey);
  const txRawData = signedTx.serialize();
  console.log(txRawData.toString('hex'));
  return '0x' + txRawData.toString('hex');
};

/**
 *
 * @param {object} web3js
 * @param {object} dev3
 * @param {object} txParams
 * @param {methodABI} data
 * @param {object} opts
 */
export const signedRawTxData4Method = async (web3js, dev3, txParams, data, opts) => {
  if (!web3js || !dev3 || !data || !opts || !opts.selectedAddress) {
    throw new BizError('web3js and data required.', PARAMS_ILLEGAL);
  }

  let { selectedAddress, chain } = opts;

  if (!chain) {
    chain = await web3js.eth.net.getNetworkType();
  }

  let txData = validTxParams(txParams);
  const nonce = await web3js.eth.getTransactionCount(selectedAddress);
  txData.nonce = nonce;
  txData.data = data;

  const common = new Common({ chain: chain });
  const tx = Transaction.fromTxData(txData, { common });

  const signedTx = tx.sign(dev3.MainPriKey);
  const txRawData = signedTx.serialize();

  logger.debug(`${selectedAddress} signed rawData`, txData, txRawData.toString('hex'));

  return `0x${txRawData.toString('hex')}`;
};

/**
 *
 * @param {Object} txParams required [gasPrice,to]
 */
function validTxParams(txParams) {
  const toHex = Web3.utils.toHex;
  if (typeof txParams !== 'object' || !Object.keys(txParams).length) {
    throw new BizError('txParams illegal.', PARAMS_ILLEGAL);
  }

  const { gasPrice, gasLimit = DEFAULT_GAS_LIMIT, to, value = 0 } = txParams;

  if (!to) {
    throw new BizError('txParams to required.', PARAMS_ILLEGAL);
  }

  if (!gasPrice) {
    throw new BizError('txParams gasPrice required.', PARAMS_ILLEGAL);
  }

  const txData = {
    gasLimit: toHex(gasLimit),
    gasPrice: toHex(gasPrice),
    value: toHex(value),
    to: to,
  };

  return txData;
}
