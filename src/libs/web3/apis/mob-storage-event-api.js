import { BPT_STORAGE_EVENT } from '../contracts/enums';
import { validWeb3Addr, validChainAddress } from './validators';
import BTInterface from '../contracts/abis/bptStorageByEvent.json';
import logger from '../../logger';

/*********************************************************************
 * AircraftClass ::
 *    @description:
 *    @description:
 * WARNINGS:
 *
 * HISTORY:
 *    @author: lanbery@gmail.com
 *    @created:  2020-12-22
 *    @comments:
 **********************************************************************/

export const getMobStorageEventInst = (web3js, chainId, address) => {
  validWeb3Addr(web3js, address);

  const contractAddress = validChainAddress(chainId, BPT_STORAGE_EVENT);
  const inst = new web3js.eth.Contract(BTInterface.abi, contractAddress, { from: address });

  return inst;
};

export const getMobStorageEventContractAddress = (chainId) => {
  return validChainAddress(chainId, BPT_STORAGE_EVENT);
};

export const fetchEventLogsFromChain = async (web3js, chainId, selectedAddress, fromBlock) => {
  const inst = getMobStorageEventInst(web3js, chainId, selectedAddress);

  logger.debug('Mobile fetchEventLogsFromChain>>>', inst._address);
  let ret = {
    chainId,
    logs: [],
  };

  const eventLogs = await inst.getPastEvents('Commit', {
    fromBlock: fromBlock || 0,
    toBlock: 'latest',
    filter: { sender: [selectedAddress] },
  });

  if (eventLogs && eventLogs.length > 0) {
    let lastEvent = eventLogs[eventLogs.length - 1];

    ret.blockNumber = lastEvent.blockNumber;
    ret.lastTxHash = lastEvent.transactionHash;

    const logs = eventLogs.map((el) => web3js.utils.hexToBytes(el.returnValues[1]));
    ret.logs = logs;
    ret.evtLogs = eventLogs;
  }

  return ret;
};
