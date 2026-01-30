import { CheckCircle } from 'lucide-react';
import { ANT, AOProcess, mARIOToken } from '@ar.io/sdk/web';
import Tooltip from '@src/components/Tooltips/Tooltip';
import { Accordion } from '@src/components/data-display';
import { useLatestANTVersion } from '@src/hooks/useANTVersions';
import { useArNSIntentPrice } from '@src/hooks/useArNSIntentPrice';
import { useCostDetails } from '@src/hooks/useCostDetails';
import { ValidationError } from '@src/utils/errors';
import emojiRegex from 'emoji-regex';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useIsFocused, useRegistrationStatus } from '../../../hooks';
import { ArweaveTransactionID } from '../../../services/arweave/ArweaveTransactionID';
import { useGlobalState } from '../../../state/contexts/GlobalState';
import { useRegistrationState } from '../../../state/contexts/RegistrationState';
import { useTransactionState } from '../../../state/contexts/TransactionState';
import { useWalletState } from '../../../state/contexts/WalletState';
import {
  ARNS_INTERACTION_TYPES,
  BuyRecordPayload,
  TRANSACTION_TYPES,
  VALIDATION_INPUT_TYPES,
} from '../../../types';
import {
  decodeDomainToASCII,
  encodeDomainToASCII,
  formatARIO,
  formatARIOWithCommas,
  formatDate,
  isArweaveTransactionID,
} from '../../../utils';
import {
  MAX_LEASE_DURATION,
  MIN_LEASE_DURATION,
} from '../../../utils/constants';
import eventEmitter from '../../../utils/events';
import Counter from '../../inputs/Counter/Counter';
import WorkflowButtons from '../../inputs/buttons/WorkflowButtons/WorkflowButtons';
import NameTokenSelector from '../../inputs/text/NameTokenSelector/NameTokenSelector';
import ValidationInput from '../../inputs/text/ValidationInput/ValidationInput';
import Loader from '../../layout/Loader/Loader';
import { StepProgressBar } from '../../layout/progress';
import PageLoader from '../../layout/progress/PageLoader/PageLoader';
import './styles.css';

function RegisterNameForm() {
  const [
    {
      arweaveDataProvider,
      arioTicker,
      arioProcessId,
      antAoClient,
      antRegistryProcessId,
      hyperbeamUrl,
    },
  ] = useGlobalState();
  const [
    { domain, leaseDuration, registrationType, antID, targetId },
    dispatchRegisterState,
  ] = useRegistrationState();
  const { data: costDetails } = useCostDetails({
    intent: 'Buy-Name',
    name: domain,
    type: registrationType,
    years: leaseDuration,
  });
  const { data: fiatPrice } = useArNSIntentPrice({
    intent: 'Buy-Name',
    name: domain,
    type: registrationType,
    years: leaseDuration,
  });
  const formatedPriceString = useMemo(() => {
    if (!fiatPrice || !costDetails) return 'Calculating prices...';
    return `Cost: $${formatARIOWithCommas(
      fiatPrice.fiatEstimate.paymentAmount / 100,
    )} USD ( ${formatARIO(
      new mARIOToken(costDetails.tokenCost).toARIO().valueOf(),
    )} ${arioTicker} )`;
  }, [fiatPrice, costDetails]);

  const [{ walletAddress }] = useWalletState();
  const [, dispatchTransactionState] = useTransactionState();
  const { name } = useParams();
  const { isLoading: isValidatingRegistration } = useRegistrationStatus(
    name ?? domain,
  );
  const [newTargetId, setNewTargetId] = useState<string>();
  const targetIdFocused = useIsFocused('target-id-input');
  const navigate = useNavigate();
  const [hasValidationErrors, setHasValidationErrors] =
    useState<boolean>(false);
  const [validatingNext, setValidatingNext] = useState<boolean>(false);
  const {
    data: antVersion,
    isRefetching: isRefetchingAntVersion,
    isLoading: isLoadingAntVersion,
    refetch: refetchAntVersion,
  } = useLatestANTVersion();
  const antModuleId = useMemo(() => antVersion?.moduleId, [antVersion]);

  useEffect(() => {
    if (name && domain !== name) {
      dispatchRegisterState({
        type: 'setDomainName',
        payload: name,
      });
    }
  }, [name, domain]);

  async function handleANTId(id?: ArweaveTransactionID) {
    if (!id) {
      dispatchRegisterState({
        type: 'setANTID',
        payload: undefined,
      });
      return;
    }
    dispatchRegisterState({
      type: 'setANTID',
      payload: id,
    });

    const contract = ANT.init({
      hyperbeamUrl,
      process: new AOProcess({
        processId: id.toString(),
        ao: antAoClient,
      }),
    });
    if (!contract) throw new Error('Contract not found');
  }

  if (!registrationType) {
    return <Loader size={80} />;
  }

  async function handleNext() {
    try {
      // validate transaction cost, return if insufficient balance and emit validation message
      if (!walletAddress) {
        navigate('/connect', {
          state: {
            to: `/register/${domain}`,
            from: `/register/${domain}`,
          },
        });
        return;
      }

      if (!antModuleId) {
        await refetchAntVersion();
        if (!antModuleId) {
          throw new Error('No ANT Module available, try again later');
        }
      }

      setValidatingNext(true);

      if (hasValidationErrors) {
        throw new ValidationError(
          'Please fix the errors above before continuing.',
        );
      }
    } catch (error: any) {
      eventEmitter.emit('error', error);
      setValidatingNext(false);
      return;
    } finally {
      setValidatingNext(false);
    }

    const name =
      domain && emojiRegex().test(domain)
        ? encodeDomainToASCII(domain)
        : domain;
    const buyRecordPayload: BuyRecordPayload = {
      name,
      processId: antID?.toString(),
      // TODO: move this to a helper function
      years:
        registrationType === TRANSACTION_TYPES.LEASE
          ? leaseDuration
          : undefined,
      type: registrationType,
      targetId,
      antModuleId,
      antRegistryId: antRegistryProcessId,
    };

    dispatchTransactionState({
      type: 'setTransactionData',
      payload: {
        assetId: arioProcessId,
        functionName: 'buyRecord',
        ...buyRecordPayload,
        interactionPrice: costDetails?.tokenCost,
      },
    });
    dispatchTransactionState({
      type: 'setInteractionType',
      payload: ARNS_INTERACTION_TYPES.BUY_RECORD,
    });
    dispatchTransactionState({
      type: 'setWorkflowName',
      payload: ARNS_INTERACTION_TYPES.BUY_RECORD,
    });
    // navigate to the transaction page, which will load the updated state of the transaction context
    navigate(`/checkout`, {
      state: `/register/${domain}`,
    });
  }

  return (
    <div className="page">
      <PageLoader
        message={'Loading Domain info, please wait.'}
        loading={
          isValidatingRegistration ||
          isRefetchingAntVersion ||
          isLoadingAntVersion
        }
      />
      <div className="flex flex-col gap-12 justify-center items-center w-full max-w-[900px]">
        <div className="flex w-full pb-5 border-b border-dark-grey">
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

        <span className="flex items-center gap-2 text-xl font-medium text-foreground">
          <span className="text-success">{decodeDomainToASCII(domain)}</span>
          <span>is available!</span>
          <CheckCircle className="text-success" size={20} />
        </span>
        <div className="flex flex-col gap-6 justify-center items-center w-full">
          <div className="flex flex-col gap-4 justify-center items-center w-full">
            <div className="flex flex-row w-full gap-4">
              <button
                className={`relative flex-1 flex items-center justify-center h-14 text-lg font-bold rounded border-2 cursor-pointer transition-colors ${
                  registrationType === TRANSACTION_TYPES.LEASE
                    ? 'bg-foreground text-background border-foreground'
                    : 'bg-transparent text-foreground border-dark-grey'
                }`}
                onClick={() =>
                  dispatchRegisterState({
                    type: 'setRegistrationType',
                    payload: TRANSACTION_TYPES.LEASE,
                  })
                }
              >
                Lease
                {registrationType === TRANSACTION_TYPES.LEASE && (
                  <div className="absolute -bottom-1.5 left-1/2 w-3 h-3 bg-foreground rotate-45" />
                )}
              </button>
              <button
                className={`relative flex-1 flex items-center justify-center h-14 text-lg font-bold rounded border-2 cursor-pointer transition-colors ${
                  registrationType === TRANSACTION_TYPES.BUY
                    ? 'bg-foreground text-background border-foreground'
                    : 'bg-transparent text-foreground border-dark-grey'
                }`}
                onClick={() =>
                  dispatchRegisterState({
                    type: 'setRegistrationType',
                    payload: TRANSACTION_TYPES.BUY,
                  })
                }
              >
                Buy
                {registrationType === TRANSACTION_TYPES.BUY && (
                  <div className="absolute -bottom-1.5 left-1/2 w-3 h-3 bg-foreground rotate-45" />
                )}
              </button>
            </div>

            <div className="flex flex-col items-center w-full p-6 bg-surface border border-dark-grey rounded">
              {registrationType === TRANSACTION_TYPES.LEASE ? (
                <Counter
                  value={leaseDuration}
                  setValue={(v: number) => {
                    dispatchRegisterState({
                      type: 'setLeaseDuration',
                      payload: v,
                    });
                  }}
                  // TODO: move this to a helper function
                  minValue={MIN_LEASE_DURATION}
                  maxValue={MAX_LEASE_DURATION}
                  valueStyle={{ padding: '20px 40px' }}
                  valueName={leaseDuration > 1 ? 'years' : 'year'}
                  detail={`Until ${formatDate(
                    Date.now() + leaseDuration * 365 * 24 * 60 * 60 * 1000,
                  )}`}
                  title={
                    <span className="text-foreground font-medium px-2 pb-2">
                      {`Registration period (between ${MIN_LEASE_DURATION}-${MAX_LEASE_DURATION} years)`}
                    </span>
                  }
                />
              ) : registrationType === TRANSACTION_TYPES.BUY ? (
                <div className="flex flex-col gap-4 justify-center items-center">
                  <span className="text-lg text-muted text-center">
                    Registration Period
                  </span>
                  <span className="text-lg text-foreground text-center">Permanent</span>
                </div>
              ) : (
                <></>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-4 w-full">
            <Accordion
              title={<span className="text-lg">Advanced Options</span>}
              key="1"
            >
              <div className="flex flex-col gap-4">
                <div
                  className="name-token-input-wrapper"
                  style={{
                    border:
                      targetIdFocused || newTargetId
                        ? 'solid 1px var(--text-white)'
                        : 'solid 1px var(--text-faded)',
                    position: 'relative',
                  }}
                >
                  <ValidationInput
                    inputId={'target-id-input'}
                    value={newTargetId ?? ''}
                    setValue={(v: string) => {
                      setNewTargetId(v.trim());
                      if (isArweaveTransactionID(v.trim())) {
                        dispatchRegisterState({
                          type: 'setTargetId',
                          payload: new ArweaveTransactionID(v.trim()),
                        });
                      }
                      if (v.trim().length === 0) {
                        setHasValidationErrors(false);
                      }
                    }}
                    wrapperCustomStyle={{
                      width: '100%',
                      hieght: '45px',
                      borderRadius: '0px',
                      backgroundColor: 'var(--card-bg)',
                      boxSizing: 'border-box',
                    }}
                    inputClassName={`white name-token-input`}
                    inputCustomStyle={{
                      paddingLeft: '10px',
                      background: 'transparent',
                    }}
                    maxCharLength={43}
                    placeholder={'Arweave Transaction ID (Target ID)'}
                    validationPredicates={{
                      [VALIDATION_INPUT_TYPES.ARWEAVE_ID]: {
                        fn: (id: string) =>
                          arweaveDataProvider.validateArweaveId(id),
                      },
                    }}
                    showValidationChecklist={false}
                    showValidationIcon={true}
                    validityCallback={(validity: boolean) => {
                      setHasValidationErrors(!validity);
                    }}
                  />

                  <span className="flex items-center text-muted">
                    <Tooltip message="The Target ID is the Arweave Transaction ID that will be resolved at the root of this ArNS name" />
                  </span>
                </div>
                <NameTokenSelector
                  selectedTokenCallback={(id) => handleANTId(id)}
                />
              </div>
            </Accordion>

            <div className="text-white flex w-full items-center justify-end pb-4 border-b border-dark-grey whitespace-nowrap">
              {formatedPriceString}
            </div>
            <div className="flex w-full justify-end">
              <WorkflowButtons
                nextText="Next"
                backText="Back"
                onNext={validatingNext ? undefined : handleNext}
                onBack={() => {
                  // reset the state when going back to the home page
                  dispatchRegisterState({
                    type: 'reset',
                  });
                  navigate('/', { state: `/register/${domain}` });
                }}
                customBackStyle={{ fontSize: '.875rem', padding: '.625rem 1.5rem' }}
                customNextStyle={{
                  width: '100px',
                  fontSize: '.875rem',
                  padding: '.625rem',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterNameForm;
