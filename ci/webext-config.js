const fs = require('fs');
const path = require('path');

const webextConfig = require('../config/.foxsign.env.js');

const R = (...p) => path.resolve(__dirname, '../', ...p);
const sourceDir = R('dist', 'firefox');

const artifactDir = () => {
  const tmpArtifact = R('tmp', 'firefox');
  if (!fs.existsSync(tmpArtifact)) {
    fs.mkdirSync(tmpArtifact, { recursive: true });
  }
  return tmpArtifact;
};

module.exports = {
  verbose: true,
  sourceDir: sourceDir,
  artifactsDir: artifactDir(),
  build: {
    overwriteDest: true,
  },
  sign: {
    id: webextConfig.extid,
    apiUrlPrefix: 'https://addons.mozilla.org/api/v3',
    apiKey: webextConfig.JWT_ID,
    apiSecret: webextConfig.JWT_SECRET,
  },
};
