import { mARIOToken } from '@ar.io/sdk';
import { Loader } from '@src/components/layout';
import ArweaveID, {
  ArweaveIdTypes,
} from '@src/components/layout/ArweaveID/ArweaveID';
import { useCostDetails } from '@src/hooks/useCostDetails';
import useDomainInfo from '@src/hooks/useDomainInfo';
import { usePrimaryName } from '@src/hooks/usePrimaryName';
import { SolanaSignature } from '@src/services/solana/SolanaSignature';
import {
  useArNSState,
  useGlobalState,
  useTransactionState,
  useWalletState,
} from '@src/state';
import { dispatchANTUpdate } from '@src/state/actions/dispatchANTUpdate';
import dispatchArIOInteraction from '@src/state/actions/dispatchArIOInteraction';
import {
  ARNS_INTERACTION_TYPES,
  ContractInteraction,
  PrimaryNameRequestPayload,
  RemovePrimaryNamesPayload,
} from '@src/types';
import {
  decodePrimaryName,
  encodePrimaryName,
  formatARIOWithCommas,
} from '@src/utils';
import eventEmitter from '@src/utils/events';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowDown } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import DialogModal from '../DialogModal/DialogModal';

enum PRIMARY_NAME_WORKFLOWS {
  REQUEST = 'Set Primary Name',
  CHANGE = 'Change Primary Name',
}

function isPrimaryNameRequest(
  payload: any,
): payload is PrimaryNameRequestPayload {
  return typeof payload?.name === 'string';
}

function isRemovePrimaryNamesPayload(
  payload: any,
): payload is RemovePrimaryNamesPayload {
  return (
    typeof payload?.names === 'object' &&
    Array.isArray(payload.names) &&
    payload.names.every((s: unknown) => typeof s === 'string') &&
    typeof payload?.arioProcessId === 'string'
  );
}

function PrimaryNameModal({
  visible,
  setVisible,
}: {
  visible: boolean;
  setVisible: (visible: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const [{ arioContract, arioTicker }] = useGlobalState();
  const [{ wallet, walletAddress }] = useWalletState();
  const { data: primaryNameData, isLoading: isLoadingPrimaryNameData } =
    usePrimaryName();

  const [{ transactionData }, dispatchTransactionState] = useTransactionState();
  const [, dispatchArNSState] = useArNSState();

  const transactionPayload =
    isRemovePrimaryNamesPayload(transactionData) ||
    isPrimaryNameRequest(transactionData)
      ? transactionData
      : undefined;

  const targetName = isRemovePrimaryNamesPayload(transactionData)
    ? transactionData.names[0]
    : isPrimaryNameRequest(transactionData)
      ? transactionData.name
      : undefined;

  const baseName = targetName?.includes('_')
    ? targetName.split('_').pop()
    : targetName;

  const { data: domainData, isLoading: loadingDomain } = useDomainInfo({
    domain: baseName,
  });

  const isLoading = loadingDomain || isLoadingPrimaryNameData;

  const costDetailsParams = useMemo(
    () => ({
      intent: 'Primary-Name-Request' as const,
      name: targetName ?? '',
      fromAddress: walletAddress?.toString(),
      fundFrom: 'balance' as const,
    }),
    [targetName, walletAddress],
  );

  const { data: costDetail, isLoading: isLoadingCostDetail } =
    useCostDetails(costDetailsParams);

  const totalCost = costDetail
    ? new mARIOToken(costDetail.tokenCost).toARIO().valueOf()
    : 0;

  const discount = costDetail
    ? new mARIOToken(
        costDetail.discounts?.reduce((acc, d) => acc + d.discountTotal, 0) ?? 0,
      )
        .toARIO()
        .valueOf()
    : 0;

  const [workflow, setWorkflow] = useState<
    PRIMARY_NAME_WORKFLOWS | undefined
  >();

  useEffect(() => {
    if (
      isPrimaryNameRequest(transactionData) &&
      primaryNameData === undefined
    ) {
      setWorkflow(PRIMARY_NAME_WORKFLOWS.REQUEST);
    } else if (
      isPrimaryNameRequest(transactionData) &&
      primaryNameData !== undefined
    ) {
      setWorkflow(PRIMARY_NAME_WORKFLOWS.CHANGE);
    } else {
      setWorkflow(undefined);
    }
  }, [transactionData]);

  function closeModal() {
    dispatchTransactionState({ type: 'reset' });
    setVisible(false);
  }

  async function confirm() {
    try {
      if (isLoadingPrimaryNameData === true)
        throw new Error(
          'Wait for primary name data to load before using primary name workflow',
        );
      if (!wallet?.solanaSigner || !walletAddress)
        throw new Error('Connect to perform Primary Name operations');

      if (!transactionPayload || !targetName)
        throw new Error('Unable to read transaction payload');

      if (!domainData?.processId) {
        throw new Error('Unable to locate ANT associated with primary name');
      }

      if (domainData.owner && domainData.owner !== walletAddress.toString()) {
        throw new Error(
          'Unable to set primary name as user is not owner of the name',
        );
      }
      let result: ContractInteraction;

      switch (workflow) {
        case PRIMARY_NAME_WORKFLOWS.CHANGE:
        case PRIMARY_NAME_WORKFLOWS.REQUEST: {
          result = await dispatchArIOInteraction({
            workflowName: ARNS_INTERACTION_TYPES.PRIMARY_NAME_REQUEST,
            wallet,
            payload: {
              ...transactionPayload,
              name: encodePrimaryName(targetName),
              antProcessId: domainData.processId,
            },
            owner: walletAddress,
            arioContract: arioContract as any,
            processId: domainData.processId,
            fundFrom: 'balance',
            dispatch: dispatchTransactionState,
          });

          break;
        }
        default:
          throw new Error('Unable to identify primary name workflow');
      }
      if (result) {
        eventEmitter.emit('success', {
          message: (
            <div>
              <span>
                {workflow} completed with transaction ID:{' '}
                <ArweaveID
                  characterCount={8}
                  shouldLink={true}
                  type={ArweaveIdTypes.INTERACTION}
                  id={new SolanaSignature(result.id)}
                />
              </span>
            </div>
          ),
          name: workflow,
        });
      }
      queryClient.resetQueries({
        queryKey: ['primary-name'],
        exact: false,
      });

      dispatchANTUpdate({
        processId: domainData.processId,
        dispatch: dispatchArNSState,
        wallet,
        walletAddress,
        queryClient,
      });

      closeModal();
    } catch (error) {
      eventEmitter.emit('error', error);
    }
  }

  if (!visible) return <></>;

  return (
    <div className="modal-container">
      <DialogModal
        title={
          <h2 className="white text-xl">
            {isRemovePrimaryNamesPayload(transactionData)
              ? 'Remove'
              : isPrimaryNameRequest(transactionData) && primaryNameData?.name
                ? 'Change'
                : 'Set'}{' '}
            Primary Name
          </h2>
        }
        body={
          isLoading ? (
            <div className="min-w-[350px] flex justify-center">
              <Loader message={'Loading Primary Name info, please wait'} />
            </div>
          ) : (
            <div className="flex flex-col white justify-center items-center w-full min-w-[350px]">
              <div className="flex flex-col w-full justify-center items-center gap-3">
                {isPrimaryNameRequest(transactionData) &&
                  primaryNameData?.name && (
                    <>
                      {' '}
                      <div className="flex flex-col gap-2 w-full">
                        <span className=" text-xl w-full text-center">
                          Current
                        </span>
                        <div
                          className={`border-dark-grey text-grey bg-background flex justify-center items-center border rounded p-3 px-8`}
                        >
                          {decodePrimaryName(primaryNameData.name)}
                        </div>
                      </div>
                      <ArrowDown className="w-[30px]" />
                    </>
                  )}
                <div className="flex flex-col gap-2 w-full">
                  <span className=" text-xl w-full text-center">
                    {isRemovePrimaryNamesPayload(transactionData)
                      ? 'Current'
                      : 'New'}
                  </span>
                  <div
                    className={
                      (isRemovePrimaryNamesPayload(transactionData)
                        ? 'border-error  text-error bg-error-thin'
                        : 'border-success  text-success bg-success-thin') +
                      ` flex justify-center items-center border rounded p-3 px-8`
                    }
                  >
                    {targetName && decodePrimaryName(targetName)}
                  </div>
                </div>
              </div>

              <div className="flex flex-col w-full pt-6 gap-2">
                <div className="flex flex-row justify-between items-center w-full border-t border-dark-grey pt-4">
                  <span className="text-grey">Payment</span>
                  <span className="text-white">Liquid Balance</span>
                </div>
                {discount > 0 && (
                  <div className="flex flex-row justify-between items-center w-full">
                    <span className="text-grey">Operator discount</span>
                    <span className="text-error">
                      -{formatARIOWithCommas(discount)}&nbsp;{arioTicker}
                    </span>
                  </div>
                )}
                <div className="flex flex-row justify-between items-center w-full">
                  <span className="text-grey">Total Cost</span>
                  {isLoadingCostDetail ? (
                    <span className="text-grey animate-pulse">Loading...</span>
                  ) : totalCost > 0 ? (
                    <span className="text-white font-semibold">
                      {formatARIOWithCommas(totalCost)}&nbsp;{arioTicker}
                    </span>
                  ) : (
                    <span className="text-grey">--</span>
                  )}
                </div>
              </div>
            </div>
          )
        }
        onCancel={closeModal}
        onClose={closeModal}
        onNext={
          !isLoading && !isLoadingCostDetail && costDetail ? confirm : undefined
        }
        nextText="Confirm"
        cancelText="Cancel"
        footerClass="border-t-0"
      />
    </div>
  );
}

export default PrimaryNameModal;
