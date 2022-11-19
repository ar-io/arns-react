import { useEffect, useState } from 'react';

import { useStateValue } from '../../../state/state';
import { ArNSDomains, SearchBarFooterProps } from '../../../types';
import { FEATURED_DOMAINS } from '../../../utils/constants';
import AntCard from '../../cards/AntCard/AntCard';
import FeaturedDomains from '../FeaturedDomains/FeaturedDomains';
import UpgradeTier from '../UpgradeTier/UpgradeTier';
import './styles.css';

function SearchBarFooter({
  defaultText,
  searchResult,
  isSearchValid,
  isAvailable,
}: SearchBarFooterProps): JSX.Element {
  const [{ arnsSourceContract }] = useStateValue();
  const [featuredDomains, setFeaturedDomains] = useState<ArNSDomains>();

  useEffect(() => {
    const records = arnsSourceContract.records;
    const featuredDomains = Object.fromEntries(
      Object.entries(records).filter(([domain]) => {
        return FEATURED_DOMAINS.includes(domain);
      }),
    );
    setFeaturedDomains(featuredDomains);
  }, [arnsSourceContract]);

  return (
    <>
      {!searchResult?.domain ? (
        <>
          <div className="text faded center">
            {!isSearchValid ? (
              <div className="errorContainer">
                <span className="illegalChar">{defaultText}</span>
              </div>
            ) : (
              defaultText
            )}
          </div>
          {featuredDomains ? (
            <FeaturedDomains domains={featuredDomains} />
          ) : (
            <></>
          )}
        </>
      ) : isAvailable ? (
        <UpgradeTier domain={searchResult.domain} />
      ) : (
        <AntCard domain={searchResult?.domain} id={searchResult?.id} />
      )}
    </>
  );
}
export default SearchBarFooter;
