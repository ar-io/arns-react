/**
 * Copyright (C) 2022-2024 Permanent Data Solutions, Inc. All Rights Reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import fs from 'fs';
import path from 'path';

import {
  WALLET_FUND_AMOUNT,
  arlocal,
  arweave,
  createLocalWallet,
  deployARNSContract,
  warp,
} from './common/utils/helper';

module.exports = async function () {
  // start arlocal
  await arlocal.start();
  // create a wallet
  const { wallet, address: owner } = await createLocalWallet(arweave);

  // write it to disc
  if (!fs.existsSync(path.join(__dirname, './wallets'))) {
    fs.mkdirSync(path.join(__dirname, './wallets'));
  }
  fs.writeFileSync(
    path.join(__dirname, './wallets/0.json'),
    JSON.stringify(wallet),
  );

  // deploy an ant with our source code
  const { contractTxId } = await deployARNSContract({
    warp,
    owner,
    wallet,
    balances: {
      [owner]: WALLET_FUND_AMOUNT,
    },
  });
  process.env.ANT_CONTRACT_TX_ID = contractTxId;
};
