import { Link, useNavigate } from 'react-router-dom';

import {
  ArweaveTransactionID,
  TransactionData,
  ValidInteractionType,
} from '../../../types';
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
    transactionData: {
      ...transactionData,
      deployedTransactionId: transactionId,
    },
  });

  if (!pdntProps) {
    eventEmitter.emit('error', new Error('Unable to set ANT properties.'));
    navigate(-1);
    return <></>;
  }

  return (
    <>
      <div
        className="flex-column center"
        style={{ gap: '3em', width: '700px' }}
      >
        <div className="flex-column center" style={{ gap: '2em' }}>
          {/* TODO: configure error or fail states */}
          <PDNTCard {...pdntProps} />
          <div
            className="flex flex-row center"
            style={{
              maxWidth: '75%',
              justifyContent: 'space-evenly',
              boxSizing: 'border-box',
            }}
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
                <span className="flex text-medium faded center">
                  Register a Name
                </span>
              </div>
            </Link>

            <Link
              to={`/manage/ants/${getLinkId(interactionType, {
                ...transactionData,
                deployedTransactionId: transactionId,
              }).trim()}`}
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
                <span className="flex text-medium faded center">
                  Manage ANT
                </span>
              </div>
            </Link>

            <Link
              // TODO: update to route to undernames
              to={`/manage/ants/${getLinkId(interactionType, {
                ...transactionData,
                deployedTransactionId: transactionId,
              }).trim()}/undernames`}
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
                <span className="flex text-medium faded center">
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
