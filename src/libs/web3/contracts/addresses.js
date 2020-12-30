/*********************************************************************
 * AircraftClass ::
 *    @description: mainnet
 *
 *    @description: ropsten app
 *      0x4458F6813Cd8d7dc56A7c5729Bd5B0b2F7b7720d - BT
 *      0x734B9833b0B57e249C1DD338aEaD86a45674d9d1 - bptMember
 *      0xB574E1611dBC27Ae4123cCfa1C1954AA86F4676E - bptStorageByEvent
 *      0x9b9688211D4f74D706a6250F89d1214846Da0291 - bptStorageByEvent-new
 *
 *    @description: Ropsten lan
 *      0xa492CcF60d4fB5380d14BC7fFeef08f1b26059d1 - BT
 *      0x1f2dfec2aafd7e668910c34b86dd31eb6ede4737 - bptMember
 *      0x8a92eb3de19bd9d9265e725eaf6744fa131f3985 - bptStorageByEvent
 *
 * WARNINGS:
 *
 * HISTORY:
 *    @author: lanbery@gmail.com
 *    @created:  2020-12-18
 *    @comments:
 **********************************************************************/
const smarts = {
  3: [
    {
      contractName: 'BT',
      address: '0x4458F6813Cd8d7dc56A7c5729Bd5B0b2F7b7720d',
    },
    {
      contractName: 'Admin',
      address: '0x4f6fa3aab92155fcb731e7af8f45ec202e20b097',
    },
    {
      contractName: 'bptMember',
      address: '0x734B9833b0B57e249C1DD338aEaD86a45674d9d1',
    },
    {
      contractName: 'bptStorage',
      address: '0xb9e0eee9e78945aad5a58aa4d48d1606c795ae77',
    },
    {
      contractName: 'bptStorageByEvent',
      address: '0xB574E1611dBC27Ae4123cCfa1C1954AA86F4676E',
    },
    {
      contractName: 'bptStorageByEventSite',
      address: '0x9b9688211D4f74D706a6250F89d1214846Da0291',
    },
  ],
  1: [
    {
      contractName: 'BT',
      address: '0xBC52a198619553fc1A0F925bB5B2E6EfaA9e45F1',
    },
    {
      contractName: 'Admin',
      address: '',
    },
    {
      contractName: 'bptMember',
      address: '0xa691571A54eE924855753e0eeA07db78840a81B7',
    },
    {
      contractName: 'bptStorage',
      address: '0xa691571A54eE924855753e0eeA07db78840a81B7',
    },
    {
      contractName: 'bptStorageByEvent',
      address: '0x8A91F4b3A1249Cb29ee0b80B2CDF57EbfbD53b07',
    },
    {
      contractName: 'bptStorageByEventSite',
      address: '',
    },
  ],
};

export default smarts;
