import { Link } from 'react-router-dom';

import { useGlobalState } from '../../../state/contexts/GlobalState';
import { ANTContractJSON, ArweaveTransactionID } from '../../../types';
import {
  STUB_ARWEAVE_TXID,
  WARP_CONTRACT_BASE_URL,
} from '../../../utils/constants';
import { AntCard } from '../../cards';
import { ArrowUpRight } from '../../icons';

export enum transaction_types {
  TRANSFER_ANT = 'Transfer ANT Token',
  EDIT_ANT = 'Edit ANT Token',
  CREATE_UNDERNAME = 'Create Undername',
  CREATE_ANT = 'Create ANT Token',
  TRANSFER_IO = 'Transfer IO Token',
  BUY_ARNS_NAME = 'Buy ArNS Name',
}

function TransactionComplete({
  transactionId = new ArweaveTransactionID(STUB_ARWEAVE_TXID),
  state,
  antId,
}: {
  transactionId?: ArweaveTransactionID;
  state?: ANTContractJSON; // for create ant cases
  antId?: ArweaveTransactionID;
}) {
  const [{}, dispatchGlobalState] = useGlobalState(); // eslint-disable-line

  return (
    <>
      <div className="flex-column center" style={{ gap: '3em' }}>
        <div className="flex-column center" style={{ gap: '2em' }}>
          {/* TODO: configure error or fail states */}
          <AntCard
            domain={''}
            showTier={false}
            id={antId}
            compact={false}
            enableActions={false}
            state={state}
          />
          <div
            className="flex flex-row center"
            style={{ gap: '1em', maxWidth: '782px' }}
          >
            <Link
              to="/"
              className="link"
              style={{ textDecoration: 'none' }}
              onClick={() =>
                dispatchGlobalState({
                  type: 'setShowCreateAnt',
                  payload: false,
                })
              }
            >
              <div
                className="flex flex-column center card"
                style={{
                  minWidth: '175px',
                  minHeight: '100px',
                  flex: 1,
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
            </Link>

            <Link
              rel="noreferrer"
              target={'_blank'}
              to={`${WARP_CONTRACT_BASE_URL}${transactionId.toString()}`}
              className="link"
              style={{ textDecoration: 'none' }}
            >
              <div
                className="flex flex-column center card"
                style={{
                  minWidth: '175px',
                  minHeight: '100px',
                  flex: 1,
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
            </Link>

            <Link
              to="/manage"
              className="link"
              style={{ textDecoration: 'none' }}
              onClick={() =>
                dispatchGlobalState({
                  type: 'setShowCreateAnt',
                  payload: false,
                })
              }
            >
              <div
                className="flex flex-column center card"
                style={{
                  minWidth: '175px',
                  minHeight: '100px',
                  flex: 1,
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
            </Link>

            <Link
              to="/manage"
              className="link"
              style={{ textDecoration: 'none' }}
              onClick={() =>
                dispatchGlobalState({
                  type: 'setShowCreateAnt',
                  payload: false,
                })
              }
            >
              <div
                className="flex flex-column center card"
                style={{
                  minWidth: '175px',
                  minHeight: '100px',
                  flex: 1,
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
                  Add Undernames
                </span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default TransactionComplete;
