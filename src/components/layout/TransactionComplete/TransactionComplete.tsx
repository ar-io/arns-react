import { Link, useNavigate } from 'react-router-dom';

import {
  ArweaveTransactionID,
  INTERACTION_TYPES,
  TransactionData,
  ValidInteractionType,
} from '../../../types';
import {
  WARP_CONTRACT_BASE_URL,
  WARP_INTERACTION_BASE_URL,
} from '../../../utils/constants';
import eventEmitter from '../../../utils/events';
import {
  getLinkId,
  getPDNSMappingByInteractionType,
} from '../../../utils/transactionUtils/transactionUtils';
import { PDNTCard } from '../../cards';
import { ArrowUpRight } from '../../icons';

function TransactionComplete({
  transactionId,
  interactionType,
  transactionData,
}: {
  transactionId?: ArweaveTransactionID;
  interactionType: ValidInteractionType;
  transactionData: TransactionData;
}) {
  const navigate = useNavigate();
  const pdntProps = getPDNSMappingByInteractionType({
    interactionType,
    transactionData,
  });

  if (!pdntProps) {
    eventEmitter.emit('error', new Error('Unable to set PDNT properties.'));
    navigate(-1);
    return <></>;
  }

  return (
    <>
      <div className="flex-column center" style={{ gap: '3em' }}>
        <div className="flex-column center" style={{ gap: '2em' }}>
          {/* TODO: configure error or fail states */}
          <PDNTCard {...pdntProps} />
          <div
            className="flex flex-row center"
            style={{ gap: '1em', maxWidth: '782px' }}
          >
            <Link to="/" className="link" style={{ textDecoration: 'none' }}>
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
              to={`${
                interactionType === INTERACTION_TYPES.CREATE
                  ? WARP_CONTRACT_BASE_URL
                  : WARP_INTERACTION_BASE_URL
              }
                ${transactionId?.toString()}`.trim()}
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
              to={`/manage/pdnts/${getLinkId(interactionType, {
                ...transactionData,
                deployedTransactionId: transactionId,
              })}`}
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
                <span className="flex text-small faded center">
                  Manage PDNT
                </span>
              </div>
            </Link>

            <Link
              // TODO: update to route to undernames
              to={`/manage/pdnts/${getLinkId(interactionType, {
                ...transactionData,
                deployedTransactionId: transactionId,
              })}`}
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
