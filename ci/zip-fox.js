#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const { R } = require('./paths');

const WrapperEnv = require('../config/wrapper.env');

const DEST_DIR = path.resolve(__dirname, '../dist', 'firefox');
const DEST_ZIP_DIR = path.resolve(__dirname, '../dist-zip', 'firefox');

const ManifestJson = require(R(DEST_DIR, 'manifest.json'));

let VER_SUFFIX = '';

if (WrapperEnv.LOG_LEVEL === 'DEBUG') {
  VER_SUFFIX = '_pre';
}

const extractExtensionData = () => {
  return {
    name: WrapperEnv.APP_NAME,
    version: ManifestJson ? ManifestJson.version : WrapperEnv.APP_VERSION,
  };
};

const makeDestZipDirIfNotExists = () => {
  if (!fs.existsSync(DEST_ZIP_DIR)) {
    fs.mkdirSync(DEST_ZIP_DIR, { recursive: true });
  }
};

const buildZip = (src, dist, zipFilename) => {
  console.info(`Building ${zipFilename}...`);

  const archive = archiver('zip', { zlib: { level: 9 } });
  const stream = fs.createWriteStream(path.join(dist, zipFilename));

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
  const zipFilename = `${name}-v${version}${VER_SUFFIX}.zip`;

  makeDestZipDirIfNotExists();

  buildZip(DEST_DIR, DEST_ZIP_DIR, zipFilename)
    .then(() => console.info('OK'))
    .catch(console.err);
};

main();
