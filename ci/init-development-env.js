#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');

const LOCALES_ENV = ['.dev.env.js', '.prod.env.js'];

initEnvFile();

function initEnvFile() {
  LOCALES_ENV.forEach(async (fname) => {
    const _fp = path.join(__dirname, '../config', fname);

    const exist = await fs.pathExists(_fp);

    if (!exist) {
      fs.outputFile(_fp, localeEnvTemplate(), { encoding: 'utf8' }, (err) => {
        if (err) console.warn(`write file ${fname} failed.`, err);
      });
    }
  });
}

function localeEnvTemplate() {
  const jsonContent = JSON.stringify(
    {
      APP_NAME: '',
      INFURA_PROJECTID: '',
      INFURA_SECRET: '',
    },
    null,
    2
  );

  return `module.exports = ${jsonContent}`;
}
