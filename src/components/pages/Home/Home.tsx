import { useEffect, useState } from 'react';

import { useWalletAddress } from '../../../hooks/index';
import { useGlobalState } from '../../../state/contexts/GlobalState';
import { useRegistrationState } from '../../../state/contexts/RegistrationState';
import { ArNSDomains } from '../../../types';
import { ARNS_TX_ID_REGEX, FEATURED_DOMAINS } from '../../../utils/constants';
import {
  isArNSDomainNameAvailable,
  isArNSDomainNameValid,
} from '../../../utils/searchUtils';
import SearchBar from '../../inputs/Search/SearchBar/SearchBar';
import { FeaturedDomains, RegisterNameForm } from '../../layout';
import { SearchBarFooter, SearchBarHeader } from '../../layout';
import ConfirmRegistration from '../../layout/ConfirmRegistration/ConfirmRegistration';
import SuccessfulRegistration from '../../layout/SuccessfulRegistration/SuccessfulRegistration';
import Workflow from '../../layout/Workflow/Workflow';
import './styles.css';

function Home() {
  const [{ arnsSourceContract }] = useGlobalState();
  const { walletAddress } = useWalletAddress();
  const [{ domain, antID, stage, isSearching }, dispatchRegisterState] =
    useRegistrationState(); // eslint-disable-line
  const [records, setRecords] = useState<ArNSDomains>(
    arnsSourceContract.records,
  );
  const [featuredDomains, setFeaturedDomains] = useState<ArNSDomains>();

  useEffect(() => {
    const newRecords = arnsSourceContract.records;
    setRecords(newRecords);
    const featuredDomains = Object.fromEntries(
      Object.entries(newRecords).filter(([domain]) => {
        return FEATURED_DOMAINS.includes(domain);
      }),
    );
    setFeaturedDomains(featuredDomains);
  }, [arnsSourceContract, domain, isSearching]);

  return (
    <div className="page">
      {domain ? <></> : <div className="page-header">Arweave Name System</div>}
      <Workflow
        stage={stage}
        onNext={() => {
          dispatchRegisterState({
            type: 'setStage',
            payload: stage + 1,
          });
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
                values={records}
                value={domain}
                onSubmit={() => {
                  dispatchRegisterState({
                    type: 'setIsSearching',
                    payload: true,
                  });
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
                    payload: result,
                  });
                }}
                successPredicate={(value: string | undefined) =>
                  isArNSDomainNameAvailable({ name: value, records })
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
                    searchResult={domain ? records[domain] : undefined}
                    defaultText="Names must be 1-32 characters. Dashes are permitted, but cannot be trailing characters and cannot be used in single character domains."
                  />
                }
                height={45}
              />
            ),
            disableNext: !isSearching,
            showNext:
              !!domain &&
              isArNSDomainNameAvailable({ name: domain, records }) &&
              isArNSDomainNameValid({ name: domain }),
            showBack: !!domain,
            requiresWallet: !!domain && !antID,
          },
          1: {
            component: <RegisterNameForm />,
            showNext: true,
            showBack: true,
            disableNext:
              !antID || !ARNS_TX_ID_REGEX.test(antID) || !walletAddress,
            requiresWallet: true,
          },
          2: {
            // this component manages buttons itself
            component: <ConfirmRegistration />,
            showNext: false,
            showBack: false,
            disableNext: !!domain && !!antID && !walletAddress,
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
    </div>
  );
}

export default Home;
