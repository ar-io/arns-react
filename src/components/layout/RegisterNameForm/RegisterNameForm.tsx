import { CheckCircleFilled } from '@ant-design/icons';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';

import { useArweaveCompositeProvider } from '../../../hooks';
import useAuctionInfo from '../../../hooks/useAuctionInfo/useAuctionInfo';
import { PDNTContract } from '../../../services/arweave/PDNTContract';
import { useGlobalState } from '../../../state/contexts/GlobalState';
import { useRegistrationState } from '../../../state/contexts/RegistrationState';
import {
  ArweaveTransactionID,
  PDNTContractJSON,
  TRANSACTION_TYPES,
} from '../../../types';
import { calculatePDNSNamePrice, isDomainAuctionable } from '../../../utils';
import {
  MAX_LEASE_DURATION,
  MIN_LEASE_DURATION,
} from '../../../utils/constants';
import YearsCounter from '../../inputs/Counter/Counter';
import NameTokenSelector from '../../inputs/text/NameTokenSelector/NameTokenSelector';
import Loader from '../Loader/Loader';
import TransactionCost from '../TransactionCost/TransactionCost';
import StepProgressBar from '../progress/Steps/Steps';
import './styles.css';

function RegisterNameForm() {
  const [
    { domain, fee, leaseDuration, registrationType },
    dispatchRegisterState,
  ] = useRegistrationState();
  const [{ pdnsSourceContract, walletAddress, blockHieght }] = useGlobalState();
  const arweaveDataProvider = useArweaveCompositeProvider();
  const { minimumAuctionBid, auction, isLiveAuction } = useAuctionInfo(
    domain!,
    registrationType,
    leaseDuration,
  );

  if (registrationType !== auction?.type && auction?.type && isLiveAuction) {
    dispatchRegisterState({
      type: 'setRegistrationType',
      payload: auction?.type,
    });
  } else {
    console.debug('registrationType is undefined');
  }

  useEffect(() => {
    if (
      // if auctionable, use auction prices
      isDomainAuctionable({
        domain: domain!,
        registrationType: registrationType,
        reservedList: Object.keys(pdnsSourceContract?.reserved),
      }) ||
      isLiveAuction
    ) {
      if (
        domain &&
        pdnsSourceContract.settings.auctions &&
        blockHieght &&
        auction
      ) {
        const newFee = isLiveAuction ? minimumAuctionBid : auction?.floorPrice;

        if (!newFee) {
          return;
        }
        dispatchRegisterState({
          type: 'setFee',
          payload: { ar: fee.ar, io: newFee },
        });
      }
    }
    // if not auctionable, use instant buy prices
    if (
      pdnsSourceContract.tiers &&
      pdnsSourceContract.fees &&
      domain &&
      blockHieght &&
      !isLiveAuction
    ) {
      const newFee = calculatePDNSNamePrice({
        domain: domain!,
        type: registrationType,
        years: leaseDuration,
        tier: pdnsSourceContract.tiers.current[0],
        tiers: pdnsSourceContract.tiers.history,
        fees: pdnsSourceContract.fees,
        currentBlockHeight: blockHieght,
      });
      dispatchRegisterState({
        type: 'setFee',
        payload: { ar: fee.ar, io: newFee },
      });
      console.log({
        newFee,
        auctionFloor: auction?.floorPrice,
        auctionStart: auction?.startPrice,
      });
    }
  }, [
    leaseDuration,
    domain,
    pdnsSourceContract,
    minimumAuctionBid,
    auction,
    registrationType,
  ]);

  async function handlePDNTId(id: string) {
    try {
      const txId = new ArweaveTransactionID(id.toString());
      dispatchRegisterState({
        type: 'setPDNTID',
        payload: txId,
      });

      const state =
        await arweaveDataProvider.getContractState<PDNTContractJSON>(txId);
      if (state == undefined) {
        throw Error('ANT contract state is undefined');
      }
      const pdnt = new PDNTContract(state, txId);

      if (!pdnt.isValid()) {
        throw Error('ANT contract state does not match required schema.');
      }
    } catch (error: any) {
      console.error(error);
    }
  }

  if (!walletAddress) {
    return <Loader size={80} />;
  }

  return (
    <div
      className="flex flex-column flex-center"
      style={{
        maxWidth: '900px',
        minWidth: '750px',
        width: '100%',
        padding: 0,
        margin: '50px',
        marginTop: 0,
        gap: 80,
        boxSizing: 'border-box',
      }}
    >
      <div
        className="flex flex-row flex-center"
        style={{
          paddingBottom: 40,
          borderBottom: 'solid 1px var(--text-faded)',
        }}
      >
        <StepProgressBar
          stages={[
            { title: 'Choose', description: 'Pick a name', status: 'finish' },
            {
              title: 'Configure',
              description: 'Registration Period',
              status: 'process',
            },
            {
              title: 'Confirm',
              description: 'Review transaction',
              status: 'wait',
            },
          ]}
          stage={1}
        />
      </div>

      <span
        className="text-medium white center"
        style={{ fontWeight: 500, fontSize: 23, gap: '15px' }}
      >
        <span style={{ color: 'var(--success-green)' }}>
          {domain} <span className={'white'}>is available!</span>
        </span>{' '}
        <CheckCircleFilled
          style={{ fontSize: 20, color: 'var(--success-green)' }}
        />
      </span>
      <div className="flex flex-column flex-center">
        <div
          className="flex flex-column flex-center"
          style={{
            width: '100%',
            height: 'fit-content',
            gap: '25px',
          }}
        >
          <div
            className="flex flex-row flex-space-between"
            style={{ gap: '25px' }}
          >
            <button
              className="flex flex-row center text-medium bold pointer"
              disabled={isLiveAuction}
              onClick={() =>
                dispatchRegisterState({
                  type: 'setRegistrationType',
                  payload: TRANSACTION_TYPES.LEASE,
                })
              }
              style={{
                position: 'relative',
                background:
                  registrationType === TRANSACTION_TYPES.LEASE
                    ? 'var(--text-white)'
                    : '',
                color:
                  registrationType === TRANSACTION_TYPES.LEASE
                    ? 'var(--text-black)'
                    : 'var(--text-white)',
                border: 'solid 2px var(--text-faded)',
                borderRadius: 'var(--corner-radius)',
                height: '56px',
                borderBottomWidth: '0.5px',
              }}
            >
              Lease
              {registrationType === TRANSACTION_TYPES.LEASE ? (
                <div
                  style={{
                    position: 'absolute',
                    bottom: -6,
                    left: '50%',
                    transform: 'rotate(45deg)',
                    width: 11,
                    height: 11,
                    background: 'var(--text-white)',
                  }}
                ></div>
              ) : (
                <></>
              )}
            </button>
            <button
              className="flex flex-row center text-medium bold pointer"
              disabled={isLiveAuction}
              style={{
                position: 'relative',
                background:
                  registrationType === TRANSACTION_TYPES.BUY
                    ? 'var(--text-white)'
                    : '',
                color:
                  registrationType === TRANSACTION_TYPES.BUY
                    ? 'var(--text-black)'
                    : 'var(--text-white)',
                border: 'solid 2px var(--text-faded)',
                borderRadius: 'var(--corner-radius)',
                height: '56px',
                borderBottomWidth: '0.5px',
              }}
              onClick={() =>
                dispatchRegisterState({
                  type: 'setRegistrationType',
                  payload: TRANSACTION_TYPES.BUY,
                })
              }
            >
              Buy
              {registrationType === TRANSACTION_TYPES.BUY ? (
                <div
                  style={{
                    position: 'absolute',
                    bottom: -6,
                    left: '50%',
                    transform: 'rotate(45deg)',
                    width: 11,
                    height: 11,
                    background: 'var(--text-white)',
                  }}
                ></div>
              ) : (
                <></>
              )}
            </button>
          </div>

          <div
            className="flex flex-column flex-center card"
            style={{
              width: '100%',
              minHeight: 0,
              height: 'fit-content',
              maxWidth: 'unset',
              padding: '35px',
              boxSizing: 'border-box',
              borderTopWidth: '0.2px',
              borderRadius: 'var(--corner-radius)',
              justifyContent: 'flex-start',
            }}
          >
            {registrationType === TRANSACTION_TYPES.LEASE ? (
              <YearsCounter
                period="years"
                minValue={MIN_LEASE_DURATION}
                maxValue={MAX_LEASE_DURATION}
              />
            ) : registrationType === TRANSACTION_TYPES.BUY ? (
              <div
                className="flex flex-column flex-center"
                style={{ gap: '1em' }}
              >
                <span className="text-medium grey center">
                  Registration Period
                </span>
                <span className="text-medium white center">Permanent</span>
              </div>
            ) : (
              <></>
            )}
          </div>
        </div>

        <div className="flex flex-column" style={{ gap: '2em' }}>
          <NameTokenSelector
            selectedTokenCallback={(id) =>
              id
                ? handlePDNTId(id.toString())
                : dispatchRegisterState({
                    type: 'setPDNTID',
                    payload: undefined,
                  })
            }
          />

          <TransactionCost fee={fee} />
          {domain &&
          pdnsSourceContract.settings.auctions &&
          !isLiveAuction &&
          isDomainAuctionable({
            domain: domain,
            registrationType: registrationType,
            reservedList: Object.keys(pdnsSourceContract.reserved),
          }) ? (
            <div
              className="flex flex-row warning-container"
              style={{
                gap: '1em',
                justifyContent: 'flex-start',
                alignItems: 'flex-start',
                boxSizing: 'border-box',
                position: 'relative',
              }}
            >
              <span
                className="flex flex-column"
                style={{ textAlign: 'left', fontSize: '13px' }}
              >
                Choosing to {registrationType} this reserved name will initiate
                a public dutch auction. You will be submitting a bid at the
                floor price of {fee.io.toLocaleString()} IO. Over a 2 week
                period, the price of this name will start at 10 times your floor
                bid, and gradually reduce to your initial bid, at which point
                you will win the name. At any time during the auction period you
                can instantly lease it for that price, and if another person
                does you will lose the auction and have your initial bid
                returned.
                <Link
                  to="http://ar.io/arns"
                  className="link"
                  style={{ textDecoration: 'underline', color: 'inherit' }}
                >
                  Learn more about how auctions work.
                </Link>
              </span>
            </div>
          ) : (
            <></>
          )}
        </div>
      </div>
    </div>
  );
}

export default RegisterNameForm;
