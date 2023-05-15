import { Tooltip } from 'antd';
import { useEffect, useRef, useState } from 'react';

import { useArweaveCompositeProvider } from '../../../hooks';
import { PDNTContract } from '../../../services/arweave/PDNTContract';
import { useGlobalState } from '../../../state/contexts/GlobalState';
import { useRegistrationState } from '../../../state/contexts/RegistrationState';
import {
  ArweaveTransactionID,
  PDNTContractJSON,
  TRANSACTION_TYPES,
} from '../../../types';
import { calculatePDNSNamePrice } from '../../../utils';
import {
  MAX_LEASE_DURATION,
  MIN_LEASE_DURATION,
  NAME_PRICE_INFO,
  SMARTWEAVE_TAG_SIZE,
  permabuyInfo,
} from '../../../utils/constants';
import { InfoIcon } from '../../icons';
import YearsCounter from '../../inputs/Counter/Counter';
import NameTokenSelector from '../../inputs/text/NameTokenSelector/NameTokenSelector';
import ArPrice from '../ArPrice/ArPrice';
import Loader from '../Loader/Loader';
import { StepProgressBar } from '../progress';

function RegisterNameForm() {
  const [{ domain, pdntID, fee, leaseDuration, tier }, dispatchRegisterState] =
    useRegistrationState();
  const [{ gateway, pdnsSourceContract, walletAddress }] = useGlobalState();
  const arweaveDataProvider = useArweaveCompositeProvider();

  const [transactionType, setTransactionType] = useState(
    TRANSACTION_TYPES.LEASE,
  ); // lease or buy

  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const fees = pdnsSourceContract.fees;
    if (domain) {
      const newFee = calculatePDNSNamePrice({
        domain,
        selectedTier: tier,
        years: leaseDuration,
        fees,
      });
      dispatchRegisterState({
        type: 'setFee',
        payload: { ar: fee.ar, io: newFee },
      });
    }
  }, [leaseDuration, tier, domain, pdnsSourceContract]);

  useEffect(() => {
    if (!pdntID) {
      reset();
      return;
    }
    if (inputRef.current) {
      inputRef.current.focus();
      handlePDNTId(pdntID.toString());
    }
  }, []);

  function reset() {
    dispatchRegisterState({
      type: 'setPDNTID',
      payload: undefined,
    });
    dispatchRegisterState({
      type: 'setTTL',
      payload: 100,
    });
  }

  async function handlePDNTId(id?: string) {
    if (!id || !id.length) {
      reset();
      return;
    }

    try {
      const txId = new ArweaveTransactionID(id);
      dispatchRegisterState({
        type: 'setPDNTID',
        payload: txId,
      });

      const state =
        await arweaveDataProvider.getContractState<PDNTContractJSON>(txId);
      if (state == undefined) {
        throw Error('PDNT contract state is undefined');
      }

      const pdnt = new PDNTContract(state);
      dispatchRegisterState({
        type: 'setControllers',
        payload: [
          pdnt.controller
            ? new ArweaveTransactionID(pdnt.controller)
            : new ArweaveTransactionID(pdnt.owner),
        ],
      });
      // update to use PDNTContract
      dispatchRegisterState({
        type: 'setNickname',
        payload: pdnt.name,
      });
      dispatchRegisterState({
        type: 'setOwner',
        payload: new ArweaveTransactionID(pdnt.owner),
      });
      dispatchRegisterState({
        type: 'setTicker',
        payload: pdnt.ticker,
      });
      // legacy targetID condition

      dispatchRegisterState({
        type: 'setTargetID',
        payload: new ArweaveTransactionID(pdnt.getRecord('@').transactionId),
      });
    } catch (error: any) {
      dispatchRegisterState({
        type: 'setPDNTID',
        payload: undefined,
      });
      // don't emit here, since we have the validation
    }
  }

  if (!walletAddress) {
    return <Loader size={80} />;
  }

  return (
    <>
      <div
        className="flex flex-column flex-center"
        style={{ maxWidth: '900px', padding: 0, margin: '50px', marginTop: 0 }}
      >
        <span className="text-large white center bold">
          {domain}.{gateway} is available!
        </span>
        <StepProgressBar
          stages={{
            1: { title: 'Pick Name', status: 'success' },
            2: { title: 'Purchase Type', status: 'pending' },
            3: { title: 'Confirm Bid', status: '' },
          }}
          stage={2}
        />
        <div className="flex flex-column flex-center">
          <div
            className="flex flex-column flex-center"
            style={{
              width: '100%',
              height: 'fit-content',
              gap: 0,
            }}
          >
            <div
              className="flex flex-row flex-space-between"
              style={{ gap: '5px' }}
            >
              <button
                className="flex flex-row center text-medium bold pointer"
                onClick={() => setTransactionType(TRANSACTION_TYPES.LEASE)}
                style={{
                  background:
                    transactionType === TRANSACTION_TYPES.LEASE
                      ? 'var(--text-white)'
                      : 'var(--card-bg)',
                  color:
                    transactionType === TRANSACTION_TYPES.LEASE
                      ? 'var(--text-black)'
                      : 'var(--text-white)',
                  border: 'solid 1px var(--text-white)',
                  borderRadius: 0,
                  borderTopLeftRadius: 3,
                  borderTopRightRadius: 3,
                  padding: '5px',
                  borderBottomWidth: '0.5px',
                }}
              >
                {TRANSACTION_TYPES.LEASE}
              </button>
              <button
                className="flex flex-row center text-medium bold pointer"
                style={{
                  background:
                    transactionType === TRANSACTION_TYPES.BUY
                      ? 'var(--text-white)'
                      : 'var(--card-bg)',
                  color:
                    transactionType === TRANSACTION_TYPES.BUY
                      ? 'var(--text-black)'
                      : 'var(--text-white)',
                  border: 'solid 1px var(--text-white)',
                  borderRadius: 0,
                  borderTopLeftRadius: 3,
                  borderTopRightRadius: 3,
                  padding: '5px',
                  borderBottomWidth: '0.5px',
                }}
                onClick={() => setTransactionType(TRANSACTION_TYPES.BUY)}
              >
                {TRANSACTION_TYPES.BUY}
              </button>
            </div>

            <div
              className="flex flex-column flex-center card"
              style={{
                width: '100%',
                height: '300px',
                maxWidth: 'unset',
                padding: '2em',
                boxSizing: 'border-box',
                border: 'solid 1px var(--text-white)',
                borderTopWidth: '0.2px',
                borderTopLeftRadius: 0,
                borderTopRightRadius: 0,
                borderRadius: '3px',
                justifyContent: 'flex-start',
              }}
            >
              {transactionType === TRANSACTION_TYPES.LEASE ? (
                <YearsCounter
                  period="years"
                  minValue={MIN_LEASE_DURATION}
                  maxValue={MAX_LEASE_DURATION}
                />
              ) : transactionType === TRANSACTION_TYPES.BUY ? (
                <div
                  className="flex flex-column flex-center"
                  style={{ gap: '1.5em' }}
                >
                  <span className="text-medium white bold center">
                    Registration Period (years)
                  </span>
                  <span className="text-medium faded bold center">
                    Indefinite
                  </span>
                  <span
                    className="flex flex-column white flex-center"
                    style={{ width: '75%', fontSize: '16px', gap: '1em' }}
                  >
                    {permabuyInfo(fee.io, 10, 2)}
                    <br />
                    <a
                      href="https://ar.io/arns/"
                      rel="noreferrer"
                      target="_blank"
                      className="flex link underline flex-center"
                      style={{ margin: 'auto' }}
                    >
                      Learn more about how this works.
                    </a>
                  </span>
                </div>
              ) : (
                <></>
              )}
            </div>
          </div>
          <div className="flex flex-column" style={{ gap: '75px' }}>
            <NameTokenSelector
              walletAddress={walletAddress}
              selectedTokenCallback={(id) => handlePDNTId(id?.toString())}
            />
            <div className="flex flex-column center" style={{ gap: '0.2em' }}>
              <Tooltip
                placement="right"
                autoAdjustOverflow={true}
                arrow={true}
                trigger={'hover'}
                overlayInnerStyle={{
                  width: '190px',
                  color: 'var(--text-black)',
                  textAlign: 'center',
                  fontFamily: 'Rubik-Bold',
                  fontSize: '14px',
                  backgroundColor: 'var(--text-white)',
                  padding: '15px',
                }}
                title={
                  <span className="flex flex-column" style={{ gap: '15px' }}>
                    {NAME_PRICE_INFO}
                    <a
                      href="https://ar.io/arns/"
                      rel="noreferrer"
                      target="_blank"
                      className="link center faded underline bold"
                      style={{ fontSize: '12px' }}
                    >
                      Need help choosing a tier?
                    </a>
                  </span>
                }
              >
                <span
                  className="flex flex-row text-large white bold"
                  style={{ gap: '5px', width: 'fit-content' }}
                >
                  {fee.io?.toLocaleString()}&nbsp;IO&nbsp;+&nbsp;
                  <ArPrice dataSize={SMARTWEAVE_TAG_SIZE} />
                  <InfoIcon width={'15px'} height={'15px'} fill="white" />
                </span>
              </Tooltip>
              <span className="text faded">Estimated Price</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default RegisterNameForm;
