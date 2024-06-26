import { AoArNSNameData, isLeasedArNSRecord } from '@ar.io/sdk/web';
import TransactionSuccessCard from '@src/components/cards/TransactionSuccessCard/TransactionSuccessCard';
import DomainSettings from '@src/components/forms/DomainSettings/DomainSettings';
import useDomainInfo from '@src/hooks/useDomainInfo';
import { useTransactionState } from '@src/state/contexts/TransactionState';
import { Tooltip } from 'antd';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { useWalletState } from '../../../state/contexts/WalletState';
import {
  decodeDomainToASCII,
  getLeaseDurationFromEndTimestamp,
  lowerCaseDomain,
} from '../../../utils';
import {
  MAX_LEASE_DURATION,
  MAX_UNDERNAME_COUNT,
} from '../../../utils/constants';
import eventEmitter from '../../../utils/events';
import { HamburgerOutlineIcon } from '../../icons';
import './styles.css';

function ManageDomain() {
  const { name } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [{ walletAddress }] = useWalletState();
  const [isMaxLeaseDuration, setIsMaxLeaseDuration] = useState<boolean>(false);
  const [isMaxUndernameCount, setisMaxUndernameCount] =
    useState<boolean>(false);
  const [undernameLimit, setundernameLimit] = useState<number>();
  const [loading, setLoading] = useState<boolean>(true);

  const { data, isLoading: isLoadingDomainDetails } = useDomainInfo({
    domain: name,
  });
  const [{ workflowName, interactionResult }, dispatchTransactionState] =
    useTransactionState();

  useEffect(() => {
    return () => {
      dispatchTransactionState({ type: 'reset' });
    };
  }, []);

  useEffect(() => {
    if (!name || !walletAddress) {
      navigate('/manage/names');
      return;
    }

    fetchDomainDetails({ arnsRecord: data?.arnsRecord });
  }, [data, interactionResult, isLoadingDomainDetails]);

  // TODO: [PE-4630] tech debt, refactor this into smaller pure functions
  async function fetchDomainDetails({
    arnsRecord,
  }: {
    arnsRecord?: AoArNSNameData;
  }) {
    if (isLoadingDomainDetails || !arnsRecord) {
      return;
    }
    try {
      setLoading(true);
      const txId = arnsRecord?.processId;
      if (!txId) {
        throw Error('This name is not registered');
      }

      const duration = isLeasedArNSRecord(arnsRecord)
        ? getLeaseDurationFromEndTimestamp(
            arnsRecord.startTimestamp,
            arnsRecord.endTimestamp,
          )
        : 'Indefinite';

      setIsMaxLeaseDuration(
        (duration &&
          typeof duration === 'number' &&
          duration >= MAX_LEASE_DURATION) ||
          duration === 'Indefinite',
      );
      setundernameLimit(arnsRecord.undernameLimit);
      setisMaxUndernameCount(
        !!undernameLimit && arnsRecord.undernameLimit >= MAX_UNDERNAME_COUNT,
      );

      setLoading(false);
    } catch (error) {
      eventEmitter.emit('error', error);
      navigate('/manage/names', { state: location.pathname });
    }
  }

  return (
    <>
      <div className="page" style={{ gap: '30px' }}>
        {interactionResult ? (
          <TransactionSuccessCard
            txId={interactionResult.id}
            title={`${workflowName} completed`}
            close={() => {
              dispatchTransactionState({
                type: 'reset',
              });
            }}
          />
        ) : (
          <></>
        )}
        <div
          className="flex flex-row"
          style={{ justifyContent: 'space-between', width: '100%' }}
        >
          <h2 className="flex white center" style={{ gap: '16px' }}>
            <HamburgerOutlineIcon
              width={'20px'}
              height={'20px'}
              fill="var(--text-white)"
            />
            {decodeDomainToASCII(name!)}
          </h2>
          <div
            className="flex flex-row"
            style={{ gap: '20px', width: 'fit-content' }}
          >
            <Tooltip
              trigger={['hover']}
              title={
                isMaxUndernameCount
                  ? 'Max undername support reached'
                  : 'Increase undername support'
              }
              color="#222224"
              placement="top"
              rootClassName="notification-tooltip"
            >
              <button
                disabled={loading || isMaxUndernameCount}
                className={`button-secondary ${
                  loading || isMaxUndernameCount ? 'disabled-button' : 'hover'
                }`}
                style={{
                  padding: loading || isMaxUndernameCount ? '0px' : '9px',
                  gap: '8px',
                  fontSize: '14px',
                  color: 'var(--accent)',
                  fontFamily: 'Rubik',
                }}
                onClick={() =>
                  navigate(
                    `/manage/names/${lowerCaseDomain(
                      name!,
                    )}/upgrade-undernames`,
                  )
                }
              >
                Increase Undernames
              </button>
            </Tooltip>
            <Tooltip
              trigger={['hover']}
              title={
                isMaxLeaseDuration
                  ? 'Max lease duration reached'
                  : 'Extend lease'
              }
              color="#222224"
              placement="top"
              rootClassName="notification-tooltip"
            >
              <button
                disabled={loading || isMaxLeaseDuration}
                className={`button-primary ${
                  loading || isMaxLeaseDuration ? 'disabled-button' : 'hover'
                }`}
                style={{
                  padding: loading || isMaxLeaseDuration ? '0px' : '9px',
                  gap: '8px',
                  fontSize: '14px',
                  color: 'var(--text-black)',
                  fontFamily: 'Rubik',
                }}
                onClick={() =>
                  navigate(`/manage/names/${lowerCaseDomain(name!)}/extend`)
                }
              >
                Extend Lease
              </button>
            </Tooltip>
          </div>
        </div>
        <div style={{ width: '100%' }}>
          <DomainSettings domain={name} />
        </div>
      </div>
    </>
  );
}

export default ManageDomain;
