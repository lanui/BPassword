#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');

const LOCALES_ENV = ['.dev.env.js', '.prod.env.js', '.foxsign.env.js'];

initEnvFile();

function initEnvFile() {
  LOCALES_ENV.forEach(async (fname) => {
    const _fp = path.join(__dirname, '../config', fname);

    const exist = await fs.pathExists(_fp);

    if (!exist) {
      fs.outputFile(_fp, localeEnvTemplate(fname), { encoding: 'utf8' }, (err) => {
        if (err) console.warn(`write file ${fname} failed.`, err);
      });
    }
  });
}

function localeEnvTemplate(fname) {
  let jsonContent;

  if (fname === '.foxsign.env.js') {
    jsonContent = JSON.stringify(
      {
        extid: '',
        FOX_BIN: '‪',
        JWT_ID: '',
        JWT_SECRET: '',
      },
      null,
      2
    );
  } else {
    jsonContent = JSON.stringify(
      {
        APP_NAME: 'BPassword',
        INFURA_PROJECTID: '',
        INFURA_SECRET: '',
        FOX_KEY: '',
        FOX_ID: '',
      },
      null,
      2
    );
  }

  return `module.exports = ${jsonContent}`;
}
