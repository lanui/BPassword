#!/usr/bin/env node

const fs = require('fs-extra');
const archiver = require('archiver');

process.env.EXT_TARGET = 'firefox';
const { R, dist, distzip, targetPath } = require('./paths');
const WrapperEnv = require('../config/wrapper.env');

const ManifestJson = require(R(dist, 'manifest.json'));

let VER_SUFFIX = '';

// if (WrapperEnv.LOG_LEVEL === 'DEBUG') {
//   VER_SUFFIX = '_pre';
// }

const extractExtensionData = () => {
  return {
    name: WrapperEnv.APP_NAME,
    version: ManifestJson ? ManifestJson.version : WrapperEnv.APP_VERSION,
  };
};

const makeDestZipDirIfNotExists = () => {
  if (!fs.existsSync(distzip)) {
    fs.mkdirSync(distzip, { recursive: true });
  }
};

const buildZip = (src, dest, zipFilename) => {
  console.info(`Building ${zipFilename}...`);

  const archive = archiver('zip', { zlib: { level: 9 } });
  const stream = fs.createWriteStream(R(dest, zipFilename));

  return new Promise((resolve, reject) => {
    archive
      .directory(src, false)
      .on('error', (err) => reject(err))
      .pipe(stream);

    stream.on('close', () => resolve());
    archive.finalize();
  });
};

const main = () => {
  const { name, version } = extractExtensionData();
  const zipFilename = `${name}-v${version}.zip`;

  makeDestZipDirIfNotExists();

  buildZip(dist, R(distzip, targetPath), zipFilename)
    .then(() => console.info('OK', R(distzip, targetPath, zipFilename)))
    .catch(console.err);
};

main();
