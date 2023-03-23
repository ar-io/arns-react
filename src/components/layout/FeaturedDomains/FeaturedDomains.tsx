import { useState } from 'react';

import { ArweaveTransactionID } from '../../../types';
import { ArnsCard } from '../../cards';
import './styles.css';

function FeaturedDomains(props: { domains: { [x: string]: string } }) {
  const { domains } = props;

  // show three at a time by default
  const DEFAULT_INCREMENT = 3;
  // how many rows of cards to display
  const MAX_COUNT = DEFAULT_INCREMENT * 3;
  const [displayCount, setDisplayCount] = useState(DEFAULT_INCREMENT);

  function showMore(e: any) {
    e.preventDefault();
    setDisplayCount(displayCount + DEFAULT_INCREMENT);
  }

  function showLess(e: any) {
    e.preventDefault();
    setDisplayCount(DEFAULT_INCREMENT);
  }

  return (
    <div className="featured-domains">
      <span className="section-header">Featured Domains</span>
      <div className="card-container">
        {Object.keys(domains).map((domain, index) => {
          if (index >= displayCount || index >= Object.keys(domains).length)
            return;
          return (
            <ArnsCard
              domain={domain}
              id={new ArweaveTransactionID(domains[domain])}
              key={index}
            />
          );
        })}
      </div>
      <div className="flex-row flex-center">
        {displayCount > DEFAULT_INCREMENT ? (
          <button className="link flex-right" onClick={showLess}>
            see less
          </button>
        ) : (
          <></>
        )}
        {displayCount < Object.keys(domains).length &&
        displayCount < MAX_COUNT ? (
          <button className="link flex-left" onClick={showMore}>
            see more
          </button>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}
export default FeaturedDomains;
