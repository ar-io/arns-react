import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useArweaveCompositeProvider, useIsMobile } from '../../../hooks';
import { PDNTContract } from '../../../services/arweave/PDNTContract';
import { useGlobalState } from '../../../state/contexts/GlobalState';
import { useTransactionState } from '../../../state/contexts/TransactionState';
import {
  ArweaveTransactionID,
  INTERACTION_TYPES,
  IncreaseUndernamesPayload,
  PDNSRecordEntry,
  PDNTContractJSON,
} from '../../../types';
import { isPDNSDomainNameValid, lowerCaseDomain, sleep } from '../../../utils';
import {
  MAX_UNDERNAME_COUNT,
  PDNS_REGISTRY_ADDRESS,
} from '../../../utils/constants';
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
  const arweaveDataProvider = useArweaveCompositeProvider();
  const name = location.pathname.split('/').at(-2);
  const [{ pdnsSourceContract }] = useGlobalState();
  const [, dispatchTransactionState] = useTransactionState();
  const [record, setRecord] = useState<PDNSRecordEntry>();
  const [antContract, setAntContract] = useState<PDNTContract>();
  // min count of 1 ~ contract rule
  const [newUndernameCount, setNewUndernameCount] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    onLoad();
  }, [name]);

  async function onLoad() {
    try {
      setLoading(true);
      if (name && isPDNSDomainNameValid({ name: lowerCaseDomain(name) })) {
        const record = pdnsSourceContract?.records[lowerCaseDomain(name)];
        if (!record) {
          throw new Error(`Unable to get record for ${name}`);
        }
        setRecord(record);
        const state =
          await arweaveDataProvider.getContractState<PDNTContractJSON>(
            new ArweaveTransactionID(record?.contractTxId),
          );
        if (!state) {
          throw new Error(`Unable to get contract state for ${name}`);
        }
        const contract = new PDNTContract(state);
        setAntContract(contract);
      }
    } catch (error) {
      eventEmitter.emit('error', error);
      await sleep(2000);
      navigate(-1);
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
        <h1 className="flex white">Increase Undernames</h1>
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
              <span className="white">{record.undernames}</span>
              <span className="flex add-box center" style={{}}>
                +{newUndernameCount}
              </span>
            </span>
            <span className="flex grey">
              Used:&nbsp;
              <span className="white">
                {Object.keys(antContract.records).length - 1}
              </span>
            </span>
          </div>
          <Counter
            maxValue={MAX_UNDERNAME_COUNT}
            minValue={1}
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
          />
        </div>
        <TransactionCost
          fee={{
            io: newUndernameCount,
            ar: 0,
          }}
          info={
            <div
              className="flex flex-row flex-left"
              style={{
                gap: '10px',
                maxWidth: '50%',
                justifyContent: 'flex-start',
                alignItems: 'flex-start',
              }}
            >
              <InfoIcon
                width={'20px'}
                height={'20px'}
                fill="var(--text-grey)"
              />
              <span
                className="flex flex-column flex-left grey text"
                style={{ textAlign: 'left', lineHeight: '1.5em' }}
              >
                Increasing your undernames is paid in IO tokens, and an Arweave
                network fee paid in AR tokens.
              </span>
            </div>
          }
        />
        <WorkflowButtons
          backText="Cancel"
          nextText="Confirm"
          onBack={() => navigate(`/manage/names/${name}`)}
          onNext={() => {
            const increaseUndernamePayload: IncreaseUndernamesPayload = {
              name: lowerCaseDomain(name),
              qty: newUndernameCount,
              oldQty: record.undernames,
              contractTxId: record.contractTxId,
            };
            dispatchTransactionState({
              type: 'setTransactionData',
              payload: {
                assetId: PDNS_REGISTRY_ADDRESS,
                functionName: 'increaseUndernameCount',
                ...increaseUndernamePayload,
              },
            });
            dispatchTransactionState({
              type: 'setInteractionType',
              payload: INTERACTION_TYPES.INCREASE_UNDERNAMES,
            });
            // navigate to the transaction page, which will load the updated state of the transaction context
            navigate('/transaction', {
              state: `/manage/names/${name}/undernames`,
            });
          }}
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