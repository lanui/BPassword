import { MAINNET, ROPSTEN, RINKEBY } from './enums';
import { infuraId } from '@lib/code-settings';

/*********************************************************************
 * AircraftClass ::
 *    @description: help build RpcUrl
 *    @description:
 * WARNINGS:
 *    Infura project used default has RPC call times limmit
 *    so high-level customer can set owner infura id
 * HISTORY:
 *    @author: lanbery@gmail.com
 *    @created:  2020-12-09
 *    @comments:
 **********************************************************************/
//https://mainnet.infura.io/v3/YOUR-PROJECT-ID
const INFURA_DOMAIN = 'infura.io';
const INFURA_VERSION = 'v3';

/**
 *
 * @param {Object} opts
 * @property {string} network must
 * @property {string} projectId optional,unset will used default
 */
export function buildRpcUrl({ network, projectId }) {
  projectId = projectId || infuraId;
  const nw = validNetwork(network);

  return `http://${nw}.${INFURA_DOMAIN}/${INFURA_VERSION}/${projectId}`;
}

/**
 *
 * @param {Object} options
 * @property {string} network must
 * @property {string} projectId optional when secretKey set this must set
 * @property {string} secretKey optional customer set
 */
export function buildTSLRpcURL({ network, projectId, secretKey }) {
  if (secretKey && !projectId) throw new Error('infura custom set secretKey but miss project id.');
  const nw = validNetwork(network);
  !secretKey && (projectId = projectId || infuraId);
  return secretKey
    ? `https://${secretKey}@${nw}.${INFURA_DOMAIN}/${INFURA_VERSION}/${projectId}`
    : `https://${nw}.${INFURA_DOMAIN}/${INFURA_VERSION}/${projectId}`;
}

function validNetwork(network) {
  if (typeof network !== 'string' || !network) {
    throw new Error('network error.');
  }

  switch (network) {
    case MAINNET:
      return MAINNET;
    case ROPSTEN:
      return ROPSTEN;
    default:
      throw Error('Unspport network:' + network);
  }
}
