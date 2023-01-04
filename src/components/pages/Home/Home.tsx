import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

import { useGlobalState } from '../../../state/contexts/GlobalState';
import RegistrationStateProvider, {
  RegistrationState,
} from '../../../state/contexts/RegistrationState';
import { registrationReducer } from '../../../state/reducers/RegistrationReducer';
import { ArNSDomains } from '../../../types';
import { FEATURED_DOMAINS } from '../../../utils/constants';
import {
  isArNSDomainNameAvailable,
  isArNSDomainNameValid,
} from '../../../utils/searchUtils';
import SearchBar from '../../inputs/Search/SearchBar/SearchBar';
import { FeaturedDomains, RegisterNameForm } from '../../layout';
import { SearchBarFooter, SearchBarHeader } from '../../layout';
import ConfirmRegistration from '../../layout/ConfirmRegistration/ConfirmRegistration';
import Workflow from '../../layout/Workflow/Workflow';
import './styles.css';

function Home() {
  const [{ arnsSourceContract, isSearching }] = useGlobalState();
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
  }, [arnsSourceContract, isSearching]);

  return (
    <div className="page">
      {isSearching ? (
        <></>
      ) : (
        <div className="page-header">Arweave Name System</div>
      )}

      <RegistrationStateProvider
        reducer={registrationReducer}
        firstStage={0}
        lastStage={4}
      >
        <Workflow
          stages={{
            0: {
              component: (
                <SearchBar
                  values={records}
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
                      defaultText={
                        'Names must be 1-32 characters. Dashes are permitted, but cannot be trailing characters and cannot be used in single character domains.'
                      }
                    />
                  }
                  height={45}
                />
              ),
              nextPredicate: (registrationState: RegistrationState) => {
                const { domain } = registrationState;
                return (
                  isArNSDomainNameAvailable({ name: domain, records }) &&
                  isArNSDomainNameValid({ name: domain })
                );
              },
            },
            1: {
              component: <RegisterNameForm />,
              nextPredicate: (registrationState: RegistrationState) => {
                const { antID } = registrationState;
                // TODO: add validated of ANT source code contract
                return !!antID;
              },
            },
            2: {
              component: <ConfirmRegistration />,
              nextPredicate: () => false, // only show confirm button
            },
            3: {
              component: <Navigate to="/manage" />,
              nextPredicate: () => false,
            },
          }}
        />
      </RegistrationStateProvider>

      {featuredDomains && !isSearching ? (
        <FeaturedDomains domains={featuredDomains} />
      ) : (
        <></>
      )}
    </div>
  );
}

export default Home;
