import { ArweaveCompositeDataProvider } from '@src/services/arweave/ArweaveCompositeDataProvider';
import { SimpleArweaveDataProvider } from '@src/services/arweave/SimpleArweaveDataProvider';
import ArLocal from 'arlocal';
import Arweave from 'arweave';
import { JWKInterface } from 'arweave/node/lib/wallet';
import * as fs from 'fs';
import path from 'path';
import { LoggerFactory, SourceType, Warp, WarpFactory } from 'warp-contracts';

export const WALLET_FUND_AMOUNT = 1000000000000;

LoggerFactory.INST.logLevel('none');

export const arweave = Arweave.init({
  host: 'localhost',
  port: 1984,
  protocol: 'http',
});
export const warp = WarpFactory.forLocal(1984, arweave);
export const arlocal = new ArLocal(1984, false);

export const simpleArweaveProvider = new SimpleArweaveDataProvider(arweave);

// ~~ Write function responsible for mining block on the Arweave testnet ~~
export async function mineBlock(arweave: Arweave): Promise<boolean> {
  await arweave.api.get('mine');
  return true;
}

export async function getCurrentBlock(arweave: Arweave): Promise<number> {
  return (await arweave.blocks.getCurrent()).height;
}

export async function addFunds(
  arweave: Arweave,
  wallet: JWKInterface,
  amount: number = WALLET_FUND_AMOUNT,
): Promise<boolean> {
  const walletAddress = await arweave.wallets.getAddress(wallet);
  await arweave.api.get(`/mint/${walletAddress}/${amount}`);
  return true;
}

export async function createLocalWallet(
  arweave: Arweave,
): Promise<{ wallet: JWKInterface; address: string }> {
  // ~~ Generate wallet and add funds ~~
  const wallet = await arweave.wallets.generate();
  const address = await arweave.wallets.jwkToAddress(wallet);
  await addFunds(arweave, wallet);
  return {
    wallet,
    address,
  };
}

export async function deployARNSContract({
  provider,
  owner,
  wallet,
  balances,
}: {
  owner: string;
  provider: ArweaveCompositeDataProvider;
  wallet: JWKInterface;
  balances: Record<string, number>;
}): Promise<{
  contractTxId: string;
  srcTxId: string;
}> {
  const sourceCode = fs.readFileSync(
    path.join(__dirname, '../fixtures/arns/source.js'),
    'utf8',
  );
  const initState = fs.readFileSync(
    path.join(__dirname, '../fixtures/arns/state.json'),
    'utf8',
  );
  const ownerState = {
    ...JSON.parse(initState),
    owner,
    balances,
  };

  const srcTx = arweave.createTransaction(
    {
      data: sourceCode,
    },
    wallet,
  );
  const contractTxId = await provider.deployContract({
    src: sourceCode,
    initState: JSON.stringify(ownerState),
    wallet,
  });
  return {
    contractTxId,
  };
}
