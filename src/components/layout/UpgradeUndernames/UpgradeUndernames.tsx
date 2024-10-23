import { ANT, AoArNSNameData, mIOToken } from '@ar.io/sdk/web';
import WarningCard from '@src/components/cards/WarningCard/WarningCard';
import { getTransactionDescription } from '@src/components/pages/Transaction/transaction-descriptions';
import { useIncreaseUndernameCost } from '@src/hooks/useIncreaseUndernameCost';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useIsMobile } from '../../../hooks';
import { ArweaveTransactionID } from '../../../services/arweave/ArweaveTransactionID';
import { useGlobalState } from '../../../state/contexts/GlobalState';
import { useTransactionState } from '../../../state/contexts/TransactionState';
import {
  ARNS_INTERACTION_TYPES,
  IncreaseUndernamesPayload,
} from '../../../types';
import { isARNSDomainNameValid, lowerCaseDomain } from '../../../utils';
import { MAX_UNDERNAME_COUNT } from '../../../utils/constants';
import eventEmitter from '../../../utils/events';
import { InfoIcon } from '../../icons';
import Counter from '../../inputs/Counter/Counter';
import WorkflowButtons from '../../inputs/buttons/WorkflowButtons/WorkflowButtons';
import Loader from '../Loader/Loader';
import TransactionCost from '../TransactionCost/TransactionCost';

function UpgradeUndernames() {
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();
  const [{ arweaveDataProvider, ioTicker, ioProcessId }] = useGlobalState();
  const name = location.pathname.split('/').at(-2);
  const [, dispatchTransactionState] = useTransactionState();
  const [record, setRecord] = useState<AoArNSNameData>();
  const [antContract, setAntContract] = useState<ANT>();
  const [undernameCount, setUndernameCount] = useState<number>(0);
  // min count of 1 ~ contract rule
  const [newUndernameCount, setNewUndernameCount] = useState<number>(0);

  const { data: fee } = useIncreaseUndernameCost({
    name: lowerCaseDomain(name ?? ''),
    quantity: newUndernameCount,
  });
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    onLoad();
  }, [name]);

  async function onLoad() {
    try {
      setLoading(true);
      if (name && isARNSDomainNameValid({ name: lowerCaseDomain(name) })) {
        const record = await arweaveDataProvider.getRecord({
          domain: lowerCaseDomain(name),
        });
        if (!record) {
          throw new Error(`Unable to get record for ${name}`);
        }
        setRecord(record);
        const processId = new ArweaveTransactionID(record?.processId);
        const contract = ANT.init({
          processId: processId.toString(),
        });
        const existingUndernameCount = await contract.getRecords().then((r) => {
          return Object.keys(r).filter((k) => k !== '@').length; // exclude @ record
        });
        setUndernameCount(existingUndernameCount);
        setAntContract(contract);
      }
    } catch (error) {
      eventEmitter.emit('error', error);
      navigate(`/manage/names`);
    } finally {
      setLoading(false);
    }
  }

  if (loading || !record || !antContract || !name) {
    return (
      <div className="page center">
        <Loader size={80} message="Loading domain record" />
      </div>
    );
  }

  return (
    <div className="page center">
      <div className="flex flex-column" style={{ maxWidth: '1000px' }}>
        <h1 className="flex white text-[2rem]">Increase Undernames</h1>
        <div
          className="flex center"
          style={{
            justifyContent: 'space-between',
            border: '1px solid var(--text-faded)',
            padding: '35px 40px',
            borderRadius: 'var(--corner-radius)',
            flexDirection: isMobile ? 'column' : 'row',
            gap: '30px',
          }}
        >
          <div
            className="flex flex-column"
            style={{ fontSize: '16px', width: 'fit-content', gap: '5px' }}
          >
            <span
              className="flex grey center"
              style={{ gap: '8px', whiteSpace: 'nowrap' }}
            >
              Total Undernames:{' '}
              <span className="white">{record.undernameLimit}</span>
              <span className="flex add-box center" style={{}}>
                +{newUndernameCount}
              </span>
            </span>
            <span className="flex grey">
              Used:&nbsp;
              <span className="white"> {undernameCount}</span>
            </span>
          </div>
          <Counter
            maxValue={MAX_UNDERNAME_COUNT - record.undernameLimit}
            minValue={0}
            value={newUndernameCount}
            setValue={setNewUndernameCount}
            containerStyle={{
              width: 'fit-content',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            valueStyle={{
              background: 'var(--card-bg)',
              width: '50px',
              height: '40px',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--text-faded)',
              borderRadius: 'var(--corner-radius)',
              margin: '0px 10px',
              fontSize: '14px',
            }}
            editable={true}
          />
        </div>
        <TransactionCost
          feeWrapperStyle={{
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
          }}
          ioRequired={true}
          fee={{
            [ioTicker]:
              newUndernameCount === 0
                ? 0
                : fee
                ? new mIOToken(fee).toIO().valueOf()
                : undefined,
            ar: 0,
          }}
          info={
            <div>
              <WarningCard
                wrapperStyle={{
                  padding: '10px',
                  fontSize: '14px',
                  alignItems: 'center',
                }}
                customIcon={<InfoIcon width={'20px'} fill={'var(--accent)'} />}
                text={
                  getTransactionDescription({
                    workflowName: ARNS_INTERACTION_TYPES.INCREASE_UNDERNAMES,
                    ioTicker,
                  }) || ''
                }
              />
            </div>
          }
        />
        <WorkflowButtons
          backText="Cancel"
          nextText="Confirm"
          onBack={() => navigate(`/manage/names/${lowerCaseDomain(name)}`)}
          onNext={
            !fee || fee < 0
              ? undefined
              : () => {
                  const increaseUndernamePayload: IncreaseUndernamesPayload = {
                    name: lowerCaseDomain(name),
                    qty: newUndernameCount,
                    oldQty: record.undernameLimit,
                    processId: record.processId,
                  };
                  dispatchTransactionState({
                    type: 'setTransactionData',
                    payload: {
                      assetId: ioProcessId,
                      functionName: 'increaseundernameLimit',
                      ...increaseUndernamePayload,
                      interactionPrice: fee,
                    },
                  });
                  dispatchTransactionState({
                    type: 'setInteractionType',
                    payload: ARNS_INTERACTION_TYPES.INCREASE_UNDERNAMES,
                  });
                  dispatchTransactionState({
                    type: 'setWorkflowName',
                    payload: ARNS_INTERACTION_TYPES.INCREASE_UNDERNAMES,
                  });
                  // navigate to the transaction page, which will load the updated state of the transaction context
                  navigate('/transaction/review', {
                    state: `/manage/names/${lowerCaseDomain(
                      name,
                    )}/upgrade-undernames`,
                  });
                }
          }
          customBackStyle={{
            minWidth: '100px',
            padding: ' 12px 16px',
          }}
          customNextStyle={{
            minWidth: '100px',
            padding: ' 12px 16px',
          }}
        />
      </div>
    </div>
  );
}

export default UpgradeUndernames;
