import { useEffect, useState } from 'react';

import { useGlobalState } from '../../../state/contexts/GlobalState';
import RegistrationStateProvider from '../../../state/contexts/RegistrationState';
import { registrationReducer } from '../../../state/reducers/RegistrationReducer';
import { ArNSDomains } from '../../../types';
import { FEATURED_DOMAINS } from '../../../utils/constants';
import {
  isArNSDomainNameAvailable,
  isArNSDomainNameValid,
} from '../../../utils/searchUtils';
import { AntCard } from '../../cards';
import SearchBar from '../../inputs/Search/SearchBar/SearchBar';
import { FeaturedDomains } from '../../layout';
import { SearchBarFooter, SearchBarHeader } from '../../layout';
import ConfirmRegistration from '../../layout/ConfirmRegistration/ConfirmRegistration';
import SuccessfulRegistration from '../../layout/SuccessfulRegistration/SuccessfulRegistration';
import Workflow from '../../layout/Workflow/Workflow';
import RegisterNameModal from '../../modals/RegisterNameModal/RegisterNameModal';
import './styles.css';

function Home() {
  const [{ arnsSourceContract, isSearching }] = useGlobalState();
  const [records, setRecords] = useState<ArNSDomains>(
    arnsSourceContract.records,
  );
  const [featuredDomains, setFeaturedDomains] = useState<ArNSDomains>();
  const [registrationWorkflow, setRegistrationWorkflow] = useState({});

  useEffect(() => {
    const newRecords = arnsSourceContract.records;
    setRecords(newRecords);
    const featuredDomains = Object.fromEntries(
      Object.entries(newRecords).filter(([domain]) => {
        return FEATURED_DOMAINS.includes(domain);
      }),
    );
    setFeaturedDomains(featuredDomains);
    setRegistrationWorkflow({
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
        nextCondition: true,
        backCondition: true,
      },
      1: {
        component: <RegisterNameModal />,
        nextCondition: true,
        backCondition: true,
      },
      2: {
        component: <ConfirmRegistration />,
        nextCondition: false,
        backCondition: true,
      },
      3: {
        component: <SuccessfulRegistration />,
        nextCondition: false,
        backCondition: false,
      },
    });
  }, [arnsSourceContract, isSearching]);

  return (
    <div className="page">
      {isSearching ? (
        <></>
      ) : (
        <div className="pageHeader">Arweave Name System</div>
      )}

      <RegistrationStateProvider
        reducer={registrationReducer}
        firstStage={0}
        lastStage={3}
      >
        <Workflow stages={registrationWorkflow} />
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
