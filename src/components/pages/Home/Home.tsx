import { useEffect, useState } from 'react';

import { useWalletAddress } from '../../../hooks/index';
import { useGlobalState } from '../../../state/contexts/GlobalState';
import { useRegistrationState } from '../../../state/contexts/RegistrationState';
import { ArweaveTransactionID, REGISTRATION_TYPES } from '../../../types';
import {
  ARNS_TX_ID_REGEX,
  DEFAULT_ANT_SOURCE_CODE_TX,
  FEATURED_DOMAINS,
} from '../../../utils/constants';
import {
  isArNSDomainNameAvailable,
  isArNSDomainNameValid,
} from '../../../utils/searchUtils';
import SearchBar from '../../inputs/Search/SearchBar/SearchBar';
import { FeaturedDomains, Loader, RegisterNameForm } from '../../layout';
import { SearchBarFooter, SearchBarHeader } from '../../layout';
import ConfirmRegistration from '../../layout/ConfirmRegistration/ConfirmRegistration';
import DeployTransaction from '../../layout/DeployTransaction/DeployTransaction';
import SuccessfulRegistration from '../../layout/SuccessfulRegistration/SuccessfulRegistration';
import Workflow from '../../layout/Workflow/Workflow';
import './styles.css';

function Home() {
  const [{ arnsSourceContract, arweaveDataProvider, arnsContractId }] =
    useGlobalState();
  const { walletAddress } = useWalletAddress();
  const [
    {
      domain,
      antID,
      stage,
      isSearching,
      antContract,
      registrationType,
      tier,
      leaseDuration,
    },
    dispatchRegisterState,
  ] = useRegistrationState();

  const [featuredDomains, setFeaturedDomains] = useState<{
    [x: string]: string;
  }>();
  const [isPostingTransaction, setIsPostingTransaction] = useState(false); // eslint-disable-line

  useEffect(() => {
    if (Object.keys(arnsSourceContract.records).length) {
      const featuredDomains = Object.fromEntries(
        FEATURED_DOMAINS.map((domain: string) =>
          arnsSourceContract.records[domain].contractTxId
            ? [domain, arnsSourceContract.records[domain].contractTxId]
            : [],
        ).filter((n) => n.length),
      );
      setFeaturedDomains(featuredDomains);
    }
  }, [arnsSourceContract.records]);

  async function registerArnsName() {
    try {
      setIsPostingTransaction(true);

      if (!antContract) {
        throw Error('No ant contract state present');
      }
      if (!domain) {
        throw new Error('No domain provided for registration');
      }
      dispatchRegisterState({
        type: 'setStage',
        payload: stage + 1,
      });
      const pendingTXId =
        antID && registrationType === REGISTRATION_TYPES.USE_EXISTING
          ? await arweaveDataProvider.writeTransaction(arnsContractId, {
              function: 'buyRecord',
              name: domain,
              contractTxId: antID.toString(),
              tierNumber: tier,
              years: leaseDuration,
            })
          : await arweaveDataProvider.registerAtomicName({
              srcCodeTransactionId: new ArweaveTransactionID(
                DEFAULT_ANT_SOURCE_CODE_TX,
              ),
              initialState: antContract.state,
              domain,
            });
      if (pendingTXId) {
        dispatchRegisterState({
          type: 'setResolvedTx',
          payload: new ArweaveTransactionID(pendingTXId.toString()),
        });
        console.log(`Posted transaction: ${pendingTXId}`);
        dispatchRegisterState({
          type: 'setStage',
          payload: stage + 2,
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsPostingTransaction(false);
    }
    // TODO: write to local storage to store pending transactions
  }

  return (
    <div className="page">
      {domain ? <></> : <div className="page-header">Arweave Name System</div>}
      {!Object.keys(arnsSourceContract.records).length ? (
        <Loader
          size={80}
          wrapperStyle={{ margin: '75px' }}
          message="Loading ArNS Registry Contract..."
        />
      ) : (
        <>
          <Workflow
            steps={
              stage > 0
                ? {
                    1: {
                      title: 'Find a Domain',
                      status: 'success',
                    },
                    2: {
                      title: `Register ${domain}`,
                      status:
                        stage + 1 === 2
                          ? 'pending'
                          : stage + 1 > 2
                          ? 'success'
                          : '',
                    },
                    3: {
                      title: 'Confirm Registration',
                      status:
                        stage + 1 === 3
                          ? 'pending'
                          : stage + 1 > 3
                          ? 'success'
                          : '',
                    },
                    4: {
                      title: 'Deploy Transaction',
                      status:
                        stage + 1 === 4
                          ? 'pending'
                          : stage + 1 > 4
                          ? 'success'
                          : '',
                    },
                    5: {
                      title: 'Success',
                      status: stage + 1 === 5 ? 'success' : '',
                    },
                  }
                : {}
            }
            stage={stage}
            onNext={() => {
              switch (stage) {
                case 2:
                  {
                    registerArnsName();
                  }
                  break;
                default:
                  dispatchRegisterState({
                    type: 'setStage',
                    payload: stage + 1,
                  });
              }
            }}
            onBack={() => {
              if (stage === 0) {
                dispatchRegisterState({
                  type: 'reset',
                });
                return;
              }
              dispatchRegisterState({
                type: 'setStage',
                payload: stage - 1,
              });
            }}
            stages={{
              0: {
                component: (
                  <SearchBar
                    values={arnsSourceContract.records}
                    value={domain}
                    onSubmit={(next = false) => {
                      dispatchRegisterState({
                        type: 'setIsSearching',
                        payload: true,
                      });
                      if (next) {
                        dispatchRegisterState({
                          type: 'setStage',
                          payload: stage + 1,
                        });
                      }
                    }}
                    onChange={() => {
                      dispatchRegisterState({
                        type: 'reset',
                      });
                    }}
                    onSuccess={(value: string) => {
                      dispatchRegisterState({
                        type: 'setDomainName',
                        payload: value,
                      });
                      dispatchRegisterState({
                        type: 'setAntID',
                        payload: undefined,
                      });
                    }}
                    onFailure={(name: string, result?: string) => {
                      dispatchRegisterState({
                        type: 'setDomainName',
                        payload: name,
                      });
                      dispatchRegisterState({
                        type: 'setAntID',
                        payload: result
                          ? new ArweaveTransactionID(result)
                          : undefined,
                      });
                    }}
                    successPredicate={(value: string | undefined) =>
                      isArNSDomainNameAvailable({
                        name: value,
                        records: arnsSourceContract.records,
                      })
                    }
                    validationPredicate={(value: string | undefined) =>
                      isArNSDomainNameValid({ name: value })
                    }
                    placeholderText={'Enter a name'}
                    headerElement={
                      <SearchBarHeader defaultText={'Find a domain name'} />
                    }
                    footerElement={
                      <SearchBarFooter
                        searchTerm={domain}
                        searchResult={
                          domain && arnsSourceContract.records[domain]
                            ? new ArweaveTransactionID(
                                arnsSourceContract.records[domain].contractTxId,
                              )
                            : undefined
                        }
                        defaultText="Names must be 1-32 characters. Dashes are permitted, but cannot be trailing characters and cannot be used in single character domains."
                      />
                    }
                    height={45}
                  />
                ),
                disableNext: !isSearching,
                showNext:
                  !!domain &&
                  isArNSDomainNameAvailable({
                    name: domain,
                    records: arnsSourceContract.records,
                  }) &&
                  isArNSDomainNameValid({ name: domain }),
                showBack: !!domain,
                requiresWallet: !!domain && !antID,
              },
              1: {
                header: (
                  <>
                    <div className="flex flex-row text-large white bold center">
                      Register Domain
                    </div>
                  </>
                ),
                component: <RegisterNameForm />,
                showNext: true,
                showBack: true,
                disableNext:
                  registrationType === REGISTRATION_TYPES.USE_EXISTING
                    ? !antID ||
                      !ARNS_TX_ID_REGEX.test(antID!.toString()) ||
                      !walletAddress
                    : false,
                requiresWallet: true,
              },
              2: {
                // this component manages buttons itself
                component: <ConfirmRegistration />,
                header: (
                  <div className="flex flex-row text-large white bold center">
                    Confirm Domain Registration
                  </div>
                ),
                showNext: true,
                showBack: true,
                nextText: 'Confirm',
                disableNext: !!domain && !!antID && !walletAddress,
                requiresWallet: true,
              },
              3: {
                component: <DeployTransaction />,
                showNext: false,
                showBack: false,
                disableNext: true,
                requiresWallet: true,
              },
              4: {
                component: <SuccessfulRegistration />,
                showNext: false,
                showBack: false,
                disableNext: true,
                requiresWallet: true,
              },
            }}
          />
          {featuredDomains && !domain ? (
            <FeaturedDomains domains={featuredDomains} />
          ) : (
            <></>
          )}
        </>
      )}
    </div>
  );
}

export default Home;
