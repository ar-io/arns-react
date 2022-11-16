import Arweave from 'arweave';

export const arweave = Arweave.init({
  host: 'arweave.dev',
  port: 443,
  protocol: 'http',
});
