import fs from 'fs';
import path from 'path';

import { arlocal } from './common/utils/helper';

module.exports = async function () {
  await arlocal.stop();

  // clean up our temp wallets
  if (fs.existsSync(path.join(__dirname, './wallets'))) {
    fs.rmSync(path.join(__dirname, './wallets'), { recursive: true });
  }
};
