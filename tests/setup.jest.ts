import fs from 'fs';
import path from 'path';

import {
  WALLET_FUND_AMOUNT,
  addFunds,
  arlocal,
  arweave,
  createLocalWallet,
  deployANTSource,
} from './common/utils/helper';

module.exports = async () => {
  console.dir('setting up jest');
  // start arlocal
  await arlocal.start();
  // create a wallet
  const { wallet } = await createLocalWallet(arweave);
  await addFunds(arweave, wallet, WALLET_FUND_AMOUNT);

  // write it to disc
  if (!fs.existsSync(path.join(__dirname, './wallets'))) {
    fs.mkdirSync(path.join(__dirname, './wallets'));
  }
  fs.writeFileSync(
    path.join(__dirname, './wallets/0.json'),
    JSON.stringify(wallet),
  );

  // deploy an ant with our source code
  const srcTx = await deployANTSource({ wallet, arweave });
  process.env.ANT_CONTRACT_SRC_ID = srcTx.toString();
};
