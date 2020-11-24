import logger from '@lib/logger';
import { nanoid } from 'nanoid';

const browser = require('webextension-polyfill');

inject('BPassword Shit>>>>>>>>>>>>>>>>>>>>>>>>>');

// const fs = require('fs')
// const path = require('path')

// const inpageContent = fs.readFileSync(
//   path.join(__dirname,'')
// )

function inject(content) {
  console.log(content);
  const targetPassword = document.querySelector('input[type="password"]');
  if (targetPassword) {
    console.log('NNNNNNNN>>>>>', targetPassword);
  }
  if (window.self === window.top) {
    logger.debug('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', nanoid());
  }

  // browser.runtime.connect({ name:'msg-injet-top'})
}
