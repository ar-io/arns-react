import { mARIOToken } from '@ar.io/sdk/web';
import { useArNSIntentPrice } from '@src/hooks/useArNSIntentPrice';
import { useCostDetails } from '@src/hooks/useCostDetails';
import useDomainInfo from '@src/hooks/useDomainInfo';
import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useIsMobile } from '../../../hooks';
import { useGlobalState } from '../../../state/contexts/GlobalState';
import { useTransactionState } from '../../../state/contexts/TransactionState';
import {
  ARNS_INTERACTION_TYPES,
  IncreaseUndernamesPayload,
} from '../../../types';
import {
  formatARIO,
  formatARIOWithCommas,
  lowerCaseDomain,
} from '../../../utils';
import Counter from '../../inputs/Counter/Counter';
import WorkflowButtons from '../../inputs/buttons/WorkflowButtons/WorkflowButtons';
import Loader from '../Loader/Loader';

function UpgradeUndernames() {
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();
  const [{ arioTicker, arioProcessId }] = useGlobalState();
  const name = location.pathname.split('/').at(-2);
  const [, dispatchTransactionState] = useTransactionState();
  const [newUndernameCount, setNewUndernameCount] = useState<number>(0);
  const { data: domainData } = useDomainInfo({ domain: name });

  const { data: costDetails, isLoading: loadingCostDetails } = useCostDetails({
    intent: 'Increase-Undername-Limit',
    quantity: newUndernameCount,
    name: name as string,
  });
  const { data: fiatFee, isLoading: loadingFiatFee } = useArNSIntentPrice({
    intent: 'Increase-Undername-Limit',
    name: name as string,
    increaseQty: newUndernameCount,
  });
  const arioFee = costDetails?.tokenCost
    ? new mARIOToken(costDetails.tokenCost).toARIO().valueOf()
    : undefined;

  const feeString = useMemo(() => {
    if (newUndernameCount === 0) {
      return `$0 USD ( 0 ${arioTicker} )`;
    }
    if (loadingCostDetails || loadingFiatFee) {
      return `Calculating price...`;
    }
    if (arioFee && fiatFee) {
      return `$${formatARIOWithCommas(
        fiatFee.fiatEstimate.paymentAmount / 100,
      )} USD ( ${formatARIO(arioFee)} ${arioTicker} )`;
    }
    return `Unable to calculate price`;
  }, [arioFee, fiatFee, loadingCostDetails, loadingFiatFee, newUndernameCount]);

  const {
    arnsRecord,
    antProcess: antContract,
    undernameCount,
  } = domainData ?? {};
  if (!arnsRecord || !antContract || !name) {
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
              <span className="white">{arnsRecord.undernameLimit}</span>
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
            maxValue={Number.MAX_SAFE_INTEGER - 1 - arnsRecord.undernameLimit}
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
        <span className="flex text-white border-b border-dark-grey items-end pb-4 w-full justify-end">
          {feeString}
        </span>
        <WorkflowButtons
          backText="Cancel"
          nextText="Confirm"
          onBack={() => navigate(`/manage/names/${lowerCaseDomain(name)}`)}
          onNext={
            !arioFee || arioFee < 0
              ? undefined
              : () => {
                  const increaseUndernamePayload: IncreaseUndernamesPayload = {
                    name: lowerCaseDomain(name),
                    qty: newUndernameCount,
                    oldQty: arnsRecord.undernameLimit,
                    processId: arnsRecord.processId,
                  };
                  dispatchTransactionState({
                    type: 'setTransactionData',
                    payload: {
                      assetId: arioProcessId,
                      functionName: 'increaseundernameLimit',
                      ...increaseUndernamePayload,
                      interactionPrice: arioFee,
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
                  navigate(`/checkout`, {
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
