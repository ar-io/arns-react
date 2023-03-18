import { useEffect, useRef, useState } from 'react';

import { useIsMobile, useWalletAddress } from '../../../hooks';
import { ANTContract } from '../../../services/arweave/AntContract';
import { useGlobalState } from '../../../state/contexts/GlobalState';
import { useRegistrationState } from '../../../state/contexts/RegistrationState';
import { ArweaveTransactionID, VALIDATION_INPUT_TYPES } from '../../../types';
import Dropdown from '../../inputs/Dropdown/Dropdown';
import ValidationInput from '../../inputs/text/ValidationInput/ValidationInput';
import UpgradeTier from '../UpgradeTier/UpgradeTier';
import './styles.css';

function RegisterNameForm() {
  const isMobile = useIsMobile();
  const [{ domain, antID, antContract }, dispatchRegisterState] =
    useRegistrationState();
  const [{ arnsSourceContract, arweaveDataProvider }] = useGlobalState();
  const { walletAddress } = useWalletAddress();

  const [isValidAnt, setIsValidAnt] = useState<boolean | undefined>(undefined);
  enum REGISTRATION_TYPES {
    CREATE = 'Create an Arweave Name Token (ANT) for me',
    USE_EXISTING = 'Use existing Arweave Name Token (ANT)',
  }
  const registrationOptions = {
    create: [REGISTRATION_TYPES.CREATE],
    'use-existing': [REGISTRATION_TYPES.USE_EXISTING],
  };
  const [registrationType, setRegistrationType] = useState(
    REGISTRATION_TYPES.USE_EXISTING,
  );
  const [antTxID, setAntTXId] = useState<string | undefined>(antID?.toString());
  const [ant, setAnt] = useState<ANTContract>(new ANTContract());
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!antID) {
      reset();
      return;
    }
    if (inputRef.current) {
      inputRef.current.focus();
      handleAntId(antTxID?.toString());
    }
  }, []);
  useEffect(() => {
    if (walletAddress && registrationType === REGISTRATION_TYPES.CREATE) {
      if (!ant.owner) {
        ant.owner = walletAddress.toString();
      }
      if (!ant.controller) {
        ant.controller = walletAddress.toString();
      }
    }
  }, [walletAddress, ant]);

  function reset() {
    setIsValidAnt(undefined);
    setAntTXId('');
    setAnt(new ANTContract());
    dispatchRegisterState({
      type: 'setAntID',
      payload: undefined,
    });
    dispatchRegisterState({
      type: 'setAntContract',
      payload: new ANTContract(),
    });
  }

  async function handleAntId(id?: string) {
    if (!id || !id.length) {
      reset();
      return;
    }
    if (id && id.length < 44) {
      setAntTXId(id);
      setAnt(new ANTContract());
    }

    try {
      if (registrationType === REGISTRATION_TYPES.CREATE) {
        throw new Error('Wrong registration type');
      }
      const txId = new ArweaveTransactionID(id);
      dispatchRegisterState({
        type: 'setAntID',
        payload: txId,
      });

      const state = await arweaveDataProvider.getContractState(txId);
      if (state == undefined) {
        throw Error('ANT contract state is undefined');
      }
      setAnt(new ANTContract(state));
      dispatchRegisterState({
        type: 'setAntContract',
        payload: new ANTContract(state),
      });

      setIsValidAnt(true);
    } catch (error: any) {
      dispatchRegisterState({
        type: 'setAntID',
        payload: undefined,
      });
      console.error(error);
    }
  }

  function handleStateChange({ value, key }: { value: string; key: string }) {
    try {
      if (!ant) {
        throw new Error('ANT Contract is undefined');
      }

      switch (key) {
        case 'name':
          ant.name = value.toString() ?? '';
          break;
        case 'ticker':
          ant.ticker = value.toString();
          break;
        case 'owner':
          ant.owner = value.toString();
          break;
        case 'controller':
          ant.controller = value.toString();
          break;
        case 'targetID':
          ant.records = {
            '@': {
              transactionId: value.toString(),
            },
          };
          break;
        case 'ttlSeconds':
          ant.records = {
            '@': {
              ttlSeconds: +value,
            },
          };
          break;
        default:
          throw new Error('Editing field not supported');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setAnt(new ANTContract(ant.state));
    }
  }

  return (
    <>
      <div className="register-name-modal">
        <span className="text-large white center">
          {domain}.arweave.net is available!
        </span>
        <div className="section-header">Register Domain</div>
        <div className="register-inputs center" style={{ gap: '5px' }}>
          <div className="input-group center column" style={{ padding: '0px' }}>
            <Dropdown
              showSelected={true}
              showChevron={true}
              options={registrationOptions}
              selected={registrationType}
              setSelected={(selection) => setRegistrationType(selection)}
            />

            <ValidationInput
              value={antTxID ?? ''}
              setValue={(e: string) => handleAntId(e)}
              validityCallback={(isValid: boolean) => setIsValidAnt(isValid)}
              wrapperClassName={'flex flex-column center'}
              wrapperCustomStyle={{ gap: '0.5em', boxSizing: 'border-box' }}
              showValidationIcon={true}
              inputClassName={'data-input center'}
              inputCustomStyle={
                isValidAnt && antTxID
                  ? { border: 'solid 2px var(--success-green)', width: '100%' }
                  : !isValidAnt && antTxID
                  ? { border: 'solid 2px var(--error-red)', width: '100%' }
                  : {}
              }
              placeholder={
                registrationType == REGISTRATION_TYPES.USE_EXISTING
                  ? 'Enter a Contract ID, nickname, or ticker'
                  : 'Enter a Target ID'
              }
              showValidationChecklist={true}
              validationPredicates={
                registrationType == REGISTRATION_TYPES.USE_EXISTING
                  ? {
                      [VALIDATION_INPUT_TYPES.ARWEAVE_ID]: (id: string) =>
                        arweaveDataProvider.validateArweaveId(id),
                      [VALIDATION_INPUT_TYPES.ANT_CONTRACT_ID]: (id: string) =>
                        arweaveDataProvider.validateTransactionTags({
                          id,
                          requiredTags: {
                            'Contract-Src':
                              arnsSourceContract.approvedANTSourceCodeTxs,
                          },
                        }),
                      [VALIDATION_INPUT_TYPES.TRANSACTION_CONFIRMATIONS]: (
                        id: string,
                      ) => arweaveDataProvider.validateConfirmations(id),
                    }
                  : {
                      [VALIDATION_INPUT_TYPES.ARWEAVE_ID]: (id: string) =>
                        arweaveDataProvider.validateArweaveId(id),
                    }
              }
              maxLength={43}
            />
            <ValidationInput
              disabled={registrationType !== REGISTRATION_TYPES.CREATE}
              showValidationChecklist={true}
              validationListStyle={{
                gap: isMobile ? '0.5em' : '1em',
                position: !isMobile ? 'absolute' : 'unset',
                left: !isMobile ? '103%' : 'unset',
                paddingTop: !isMobile ? '7%' : 'unset',
              }}
              value={ant!.controller}
              setValue={(e: string) =>
                handleStateChange({ value: e, key: 'controller' })
              }
              setIsValid={(isValid: boolean) => setIsValidAnt(isValid)}
              wrapperClassName={'flex flex-column center'}
              wrapperCustomStyle={{ gap: '0.5em', position: 'relative' }}
              inputClassName={'data-input center'}
              inputCustomStyle={{
                background:
                  registrationType == REGISTRATION_TYPES.CREATE
                    ? 'white'
                    : 'transparent',
                color:
                  registrationType == REGISTRATION_TYPES.CREATE
                    ? 'black'
                    : 'white',
              }}
              placeholder={'Controller'}
              validationPredicates={{
                [VALIDATION_INPUT_TYPES.ARWEAVE_ID]: (id: string) =>
                  arweaveDataProvider.validateArweaveId(id),
              }}
              maxLength={43}
            />
          </div>

          <div className="input-group center">
            <ValidationInput
              disabled={registrationType !== REGISTRATION_TYPES.CREATE}
              value={ant!.name}
              setValue={(e: string) =>
                handleStateChange({ value: e, key: 'name' })
              }
              setIsValid={(isValid: boolean) => setIsValidAnt(isValid)}
              wrapperClassName={'flex flex-column center'}
              wrapperCustomStyle={{ gap: '0.5em', position: 'relative' }}
              inputClassName={'data-input center'}
              inputCustomStyle={{
                background:
                  registrationType == REGISTRATION_TYPES.CREATE
                    ? 'white'
                    : 'transparent',
                color:
                  registrationType == REGISTRATION_TYPES.CREATE
                    ? 'black'
                    : 'white',
              }}
              placeholder={'Nickname'}
              validationPredicates={{}}
            />
            <ValidationInput
              value={ant!.ticker}
              disabled={registrationType !== REGISTRATION_TYPES.CREATE}
              setValue={(e: string) =>
                handleStateChange({ value: e, key: 'ticker' })
              }
              setIsValid={(isValid: boolean) => setIsValidAnt(isValid)}
              wrapperClassName={'flex flex-column center'}
              wrapperCustomStyle={{ gap: '0.5em', position: 'relative' }}
              inputClassName={'data-input center'}
              inputCustomStyle={{
                background:
                  registrationType == REGISTRATION_TYPES.CREATE
                    ? 'white'
                    : 'transparent',
                color:
                  registrationType == REGISTRATION_TYPES.CREATE
                    ? 'black'
                    : 'white',
              }}
              placeholder={'Ticker'}
              validationPredicates={{}}
            />

            <Dropdown
              showSelected={true}
              showChevron={true}
              selected={`${antContract?.records['@'].ttlSeconds} seconds`}
              setSelected={(value) =>
                antContract
                  ? (antContract.records = { '@': { ttlSeconds: value } })
                  : undefined
              }
              options={{
                '100secs': 100,
                '200secs': 200,
                '300secs': 300,
                '400secs': 400,
                '500secs': 500,
                '600secs': 600,
                '700secs': 700,
                '800secs': 800,
              }}
            />
          </div>
        </div>
        <UpgradeTier />
      </div>
    </>
  );
}

export default RegisterNameForm;
