#!/usr/bin/env node

const fse = require('fs-extra');
const webExt = require('web-ext');
const chalk = require('chalk');
const signParams = require('../config/.foxsign.env.js');

if (!signParams.JWT_ID || !signParams.JWT_SECRET) {
  console.log(chalk.red('Miss sign Parameters.'));
  return;
} else {
  console.log(
    chalk.blueBright('Signing with Parameters:'),
    chalk.cyan('JWT_ID[') + chalk.greenBright(signParams.JWT_ID) + chalk.cyan(']'),
    chalk.cyan('JWT_SECRET[') + chalk.greenBright(signParams.JWT_SECRET) + chalk.cyan(']')
  );
  process.env.$WEB_EXT_API_KEY = signParams.JWT_ID;
  process.env.$WEB_EXT_API_SECRET = signParams.JWT_SECRET;
  process.env.$WEB_EXT_CHANNEL = 'unlisted';
  process.env.$WEB_EXT_TIMEOUT = 20 * 60 * 1000;
  //$WEB_EXT_ID
}

const { R, dist } = require('./paths');
const envVersion = process.env.EXT_VERSION || '';

if (envVersion) {
  const manifestPath = R(dist, 'manifest.json');
  const manifest = fse.readJsonSync(manifestPath);
  if (manifest) {
    manifest.version = envVersion;
    fse.writeJSONSync(manifestPath, manifest, { spaces: 2 });
  }
}

const artifactDir = () => {
  const tmpArtifact = R('tmp', 'firefox');
  if (!fse.existsSync(tmpArtifact)) {
    fse.mkdirSync(tmpArtifact, { recursive: true });
  }
  return tmpArtifact;
};

const webextConfig = {
  verbose: true,
  sourceDir: dist,
  artifactsDir: artifactDir(),
  build: {
    overwriteDest: true,
  },
  sign: {
    apiUrlPrefix: 'https://addons.mozilla.org/api/v3',
    channel: 'unlisted',
  },
  apiKey: signParams.JWT_ID,
  apiSecret: signParams.JWT_SECRET,
};

const task = process.env.TASK_COMMAND;

if (task === 'build') {
  const ret = webExt.cmd.build(webextConfig);
  console.log(task, ret);
} else if (task === 'sign') {
  const ret = webExt.cmd.sign(webextConfig);
  console.log(task, ret);
} else {
  console.log(chalk.red('Task Command must build or sign'));
}
