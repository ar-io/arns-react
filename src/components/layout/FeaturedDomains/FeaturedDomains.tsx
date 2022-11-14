import { useState } from 'react';

import { ArNSDomains } from '../../../types';
import { ArnsCard } from '../../cards';
import './styles.css';

function FeaturedDomains(props: { domains: ArNSDomains }) {
  const { domains } = props;

  // show three at a time by default
  const DEFAULT_INCREMENT = 3;
  // how many rows of cards to display
  const MAX_COUNT = DEFAULT_INCREMENT * 3;
  const [displayCount, setDisplayCount] = useState(DEFAULT_INCREMENT);

  function showMore(e: any) {
    if (displayCount == MAX_COUNT) {
      return;
    }
    e.preventDefault();
    setDisplayCount(displayCount + DEFAULT_INCREMENT);
  }

  return (
    <div className="featuredDomains">
      <span className="sectionHeader">Featured Domains</span>
      <div className="cardContainer">
        {Object.keys(domains).map((domain, index) => {
          if (index >= displayCount || index >= Object.keys(domains).length)
            return;
          return <ArnsCard domain={domain} id={domains[domain]} key={index} />;
        })}
      </div>
      {displayCount < Object.keys(domains).length ? (
        <button className="link" onClick={showMore}>
          see more
        </button>
      ) : (
        <></>
      )}
    </div>
  );
}
export default FeaturedDomains;
