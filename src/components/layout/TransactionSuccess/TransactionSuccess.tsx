import { Link } from 'react-router-dom';

import { ANTContractJSON, ArweaveTransactionID } from '../../../types';
import { AntCard } from '../../cards';
import { ArrowUpRight } from '../../icons';

export enum transaction_types {
  TRANSFER_ANT = 'Transfer ANT Token',
  EDIT_ANT = 'Edit ANT Token',
  CREATE_UNDERNAME = 'Create Under_Name',
  CREATE_ANT = 'Create ANT Token',
  TRANSFER_IO = 'Transfer IO Token',
  BUY_ARNS_NAME = 'Buy ArNS Name',
}

function TransactionSuccess({
  transactionId = new ArweaveTransactionID(
    '-------default-arweave-transaction-id------',
  ),
  state,
}: {
  transactionId?: ArweaveTransactionID;
  state: ANTContractJSON;
}) {
  return (
    <>
      <div className="flex-column center" style={{ gap: '3em' }}>
        <div className="flex-column center" style={{ gap: '2em' }}>
          <AntCard
            domain={''}
            id={transactionId}
            state={state}
            compact={true}
            enableActions={false}
            overrides={{
              tier: 1,
              ttlSeconds: state.records['@'].ttlSeconds,
              maxSubdomains: state.records['@'].maxSubdomains,
              leaseDuration: `N/A`,
            }}
          />
          <div className="flex flex-row center" style={{ gap: '1em' }}>
            <div
              className="flex flex-column center card"
              style={{
                minWidth: '175px',
                minHeight: '100px',
                width: '100%',
                padding: '0px',
                gap: '.5em',
                textDecoration: 'none',
              }}
            >
              <ArrowUpRight
                width={'30px'}
                height={'30px'}
                fill={'var(--text-white)'}
              />
              <span className="flex text-small faded center">
                Register a Name
              </span>
            </div>

            <a
              href={`https://sonar.warp.cc/#/app/contract/${transactionId.toString()}`}
              rel="noreferrer"
              target={'_blank'}
            >
              <div
                className="flex flex-column center card"
                style={{
                  minWidth: '175px',
                  minHeight: '100px',
                  width: '100%',
                  padding: '0px',
                  gap: '.5em',
                  textDecoration: 'none',
                }}
              >
                <ArrowUpRight
                  width={'30px'}
                  height={'30px'}
                  fill={'var(--text-white)'}
                />
                <span
                  className="flex text-small faded center"
                  style={{ textDecorationLine: 'none' }}
                >
                  View on Sonar
                </span>
              </div>
            </a>

            <div
              className="flex flex-column center card"
              style={{
                minWidth: '175px',
                minHeight: '100px',
                width: '100%',
                padding: '0px',
                gap: '.5em',
                textDecoration: 'none',
              }}
            >
              <ArrowUpRight
                width={'30px'}
                height={'30px'}
                fill={'var(--text-white)'}
              />
              <span className="flex text-small faded center">Manage ANT</span>
            </div>

            <div
              className="flex flex-column center card"
              style={{
                width: '175px',
                height: '100px',
                minHeight: '50px',
                minWidth: '50px',
                padding: '0px',
                gap: '.5em',
              }}
            >
              <ArrowUpRight
                width={'30px'}
                height={'30px'}
                fill={'var(--text-white)'}
              />
              <span className="flex text-small faded center">
                Add Undernames
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default TransactionSuccess;
