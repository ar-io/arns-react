import { CheckCircleFilled } from '@ant-design/icons';
import { Tooltip } from 'antd';
import { useEffect, useState } from 'react';

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
} from '../../../utils/constants';
import YearsCounter from '../../inputs/Counter/Counter';
import NameTokenSelector from '../../inputs/text/NameTokenSelector/NameTokenSelector';
import ArPrice from '../ArPrice/ArPrice';
import Loader from '../Loader/Loader';
import StepProgressBar from '../progress/Steps/Steps';
import './styles.css';

function RegisterNameForm() {
  const [{ domain, fee, leaseDuration, tier }, dispatchRegisterState] =
    useRegistrationState();
  const [{ pdnsSourceContract, walletAddress }] = useGlobalState();
  const arweaveDataProvider = useArweaveCompositeProvider();

  const [transactionType, setTransactionType] = useState(
    TRANSACTION_TYPES.LEASE,
  ); // lease or buy

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

  async function handlePDNTId(id?: string) {
    if (!id || !id.length) {
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

      if (!pdnt.isValid()) {
        throw Error('PDNT contract state does not match required schema.');
      }
    } catch (error: any) {
      dispatchRegisterState({
        type: 'setPDNTID',
        payload: undefined,
      });
    }
  }

  if (!walletAddress) {
    return <Loader size={80} />;
  }

  return (
    <>
      <div
        className="flex flex-column flex-center"
        style={{
          maxWidth: '900px',
          minWidth: 750,
          width: '100%',
          padding: 0,
          margin: '50px',
          marginTop: 0,
          gap: 60,
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
          style={{ fontWeight: 500, fontSize: 23 }}
        >
          <span style={{ color: 'var(--success-green)' }}>{domain}</span>
          &nbsp;is available!&nbsp;
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
                onClick={() => setTransactionType(TRANSACTION_TYPES.LEASE)}
                style={{
                  position: 'relative',
                  background:
                    transactionType === TRANSACTION_TYPES.LEASE
                      ? 'var(--text-white)'
                      : '',
                  color:
                    transactionType === TRANSACTION_TYPES.LEASE
                      ? 'var(--text-black)'
                      : 'var(--text-white)',
                  border: 'solid 1px var(--text-white)',
                  borderRadius: 'var(--corner-radius)',
                  height: '56px',
                  borderBottomWidth: '0.5px',
                }}
              >
                {TRANSACTION_TYPES.LEASE}
                {transactionType === TRANSACTION_TYPES.LEASE ? (
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
                style={{
                  position: 'relative',
                  background:
                    transactionType === TRANSACTION_TYPES.BUY
                      ? 'var(--text-white)'
                      : '',
                  color:
                    transactionType === TRANSACTION_TYPES.BUY
                      ? 'var(--text-black)'
                      : 'var(--text-white)',
                  border: 'solid 1px var(--text-white)',
                  borderRadius: 'var(--corner-radius)',
                  height: '56px',
                  borderBottomWidth: '0.5px',
                }}
                onClick={() => setTransactionType(TRANSACTION_TYPES.BUY)}
              >
                {TRANSACTION_TYPES.BUY}
                {transactionType === TRANSACTION_TYPES.BUY ? (
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
              {transactionType === TRANSACTION_TYPES.LEASE ? (
                <YearsCounter
                  period="years"
                  minValue={MIN_LEASE_DURATION}
                  maxValue={MAX_LEASE_DURATION}
                />
              ) : transactionType === TRANSACTION_TYPES.BUY ? (
                <div
                  className="flex flex-column flex-center"
                  style={{ gap: '1em' }}
                >
                  <span className="text-medium faded center">
                    Registration Period
                  </span>
                  <span className="text-medium white center">Permanent</span>
                </div>
              ) : (
                <></>
              )}
            </div>
          </div>

          <div className="flex flex-column" style={{ gap: '75px' }}>
            <NameTokenSelector
              selectedTokenCallback={(id) => handlePDNTId(id?.toString())}
            />
            <div
              className="flex flex-row"
              style={{
                borderBottom: 'solid 1px var(--text-faded)',
                padding: '20px 0px',
                justifyContent: 'flex-end',
                alignItems: 'flex-start',
              }}
            >
              <span className="text white">Cost:</span>
              <div
                className="flex flex-column"
                style={{
                  gap: '0.2em',
                  alignItems: 'flex-end',
                  width: 'fit-content',
                }}
              >
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
                    className="flex flex-row text white flex-right"
                    style={{ gap: '5px', width: 'fit-content' }}
                  >
                    {fee.io?.toLocaleString()}&nbsp;IO&nbsp;+&nbsp;
                    <ArPrice dataSize={SMARTWEAVE_TAG_SIZE} />
                  </span>
                </Tooltip>
                <span className="text faded">(Approximately 0 USD)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default RegisterNameForm;
