import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { useWalletAddress } from '../../../hooks';
import { useGlobalState } from '../../../state/contexts/GlobalState';
import { useRegistrationState } from '../../../state/contexts/RegistrationState';
import { useTransactionState } from '../../../state/contexts/TransactionState';
import {
  ArweaveTransactionID,
  BuyRecordPayload,
  CONTRACT_TYPES,
  REGISTRY_INTERACTION_TYPES,
} from '../../../types';
import {
  FEATURED_DOMAINS,
  PDNS_REGISTRY_ADDRESS,
  PDNS_TX_ID_REGEX,
} from '../../../utils/constants';
import {
  isPDNSDomainNameAvailable,
  isPDNSDomainNameValid,
} from '../../../utils/searchUtils/searchUtils';
import SearchBar from '../../inputs/Search/SearchBar/SearchBar';
import { FeaturedDomains, Loader, RegisterNameForm } from '../../layout';
import { SearchBarFooter, SearchBarHeader } from '../../layout';
import ConfirmRegistration from '../../layout/ConfirmRegistration/ConfirmRegistration';
import SuccessfulRegistration from '../../layout/SuccessfulRegistration/SuccessfulRegistration';
import Workflow from '../../layout/Workflow/Workflow';
import './styles.css';

function Home() {
  const [, dispatchTransactionState] = useTransactionState();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [{ pdnsSourceContract }] = useGlobalState();
  const { walletAddress } = useWalletAddress();
  const [{ domain, pdntID, stage, isSearching }, dispatchRegisterState] =
    useRegistrationState();

  const [featuredDomains, setFeaturedDomains] = useState<{
    [x: string]: string;
  }>();

  useEffect(() => {
    if (domain) {
      const serializeSearchParams: Record<string, string> = {
        search: domain,
      };
      setSearchParams(serializeSearchParams);
      return;
    }
  }, [domain]);

  useEffect(() => {
    const searchDomain = searchParams.get('search');
    if (searchDomain && searchDomain !== domain) {
      dispatchRegisterState({
        type: 'setDomainName',
        payload: searchDomain,
      });
      return;
    }
  }, [searchParams]);

  useEffect(() => {
    if (Object.keys(pdnsSourceContract.records).length) {
      const featuredDomains = Object.fromEntries(
        FEATURED_DOMAINS.map((domain: string) =>
          pdnsSourceContract.records[domain]?.contractTxId
            ? [domain, pdnsSourceContract.records[domain].contractTxId]
            : [],
        ).filter((n) => n.length),
      );
      setFeaturedDomains(featuredDomains);
    }
  }, [pdnsSourceContract.records]);

  return (
    <div className="page">
      {domain ? <></> : <div className="page-header">Arweave Name System</div>}
      {!Object.keys(pdnsSourceContract.records).length ? (
        <Loader
          size={80}
          wrapperStyle={{ margin: '75px' }}
          message="Loading PDNS Registry Contract..."
        />
      ) : (
        <>
          <Workflow
            stage={stage.toString()}
            onNext={() => {
              if (stage == 1) {
                const buyRecordPayload: BuyRecordPayload = {
                  name: domain!,
                  contractTxId: pdntID!.toString(),
                  tierNumber: 1,
                  years: 1,
                };
                dispatchTransactionState({
                  type: 'setTransactionData',
                  payload: {
                    assetId: PDNS_REGISTRY_ADDRESS,
                    functionName: 'buyRecord',
                    ...buyRecordPayload,
                  },
                });
                dispatchTransactionState({
                  type: 'setContractType',
                  payload: CONTRACT_TYPES.REGISTRY,
                });
                dispatchTransactionState({
                  type: 'setInteractionType',
                  payload: REGISTRY_INTERACTION_TYPES.BUY_RECORD,
                });
                // navigate to the transaction page, which will load the updated state of the transaction context
                navigate('/transaction', {
                  state: `/?search=${domain}`,
                  replace: true,
                });
              }
              dispatchRegisterState({
                type: 'setStage',
                payload: stage + 1,
              });
            }}
            onBack={() => {
              if (stage === 0) {
                setSearchParams();
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
                    values={pdnsSourceContract.records}
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
                        type: 'setPDNTID',
                        payload: undefined,
                      });
                    }}
                    onFailure={(name: string, result?: string) => {
                      dispatchRegisterState({
                        type: 'setDomainName',
                        payload: name,
                      });
                      dispatchRegisterState({
                        type: 'setPDNTID',
                        payload: result
                          ? new ArweaveTransactionID(result)
                          : undefined,
                      });
                    }}
                    successPredicate={(value: string | undefined) =>
                      isPDNSDomainNameAvailable({
                        name: value,
                        records: pdnsSourceContract?.records ?? {},
                      })
                    }
                    validationPredicate={(value: string | undefined) =>
                      isPDNSDomainNameValid({ name: value })
                    }
                    placeholderText={'Enter a name'}
                    headerElement={
                      <SearchBarHeader defaultText={'Find a domain name'} />
                    }
                    footerElement={
                      <SearchBarFooter
                        searchTerm={domain}
                        searchResult={
                          domain && pdnsSourceContract.records[domain]
                            ? new ArweaveTransactionID(
                                pdnsSourceContract.records[domain].contractTxId,
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
                  isPDNSDomainNameAvailable({
                    name: domain,
                    records: pdnsSourceContract.records,
                  }) &&
                  isPDNSDomainNameValid({ name: domain }),
                showBack: !!domain,
                requiresWallet: !!domain && !pdntID,
              },
              1: {
                component: <RegisterNameForm />,
                showNext: true,
                showBack: true,
                disableNext:
                  !pdntID ||
                  !PDNS_TX_ID_REGEX.test(pdntID.toString()) ||
                  !walletAddress,
                requiresWallet: true,
              },
              2: {
                // this component manages buttons itself
                component: <ConfirmRegistration />,
                showNext: false,
                showBack: false,
                disableNext: !!domain && !!pdntID && !walletAddress,
                requiresWallet: true,
              },
              3: {
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