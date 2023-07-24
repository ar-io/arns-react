import { useState } from 'react';

import { ArweaveTransactionID } from '../../../types';
import { PDNSCard } from '../../cards';
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
    <div className="featured-domains flex-center">
      <span
        className="text-medium center grey"
        style={{
          letterSpacing: '0.3em',
          fontWeight: 500,
          marginBottom: 20,
        }}
      >
        FEATURED DOMAINS
      </span>
      <div className="card-container flex-center">
        {Object.keys(domains).map((domain, index) => {
          if (index >= displayCount || index >= Object.keys(domains).length)
            return;
          return (
            <PDNSCard
              domain={domain}
              contractTxId={new ArweaveTransactionID(domains[domain])}
              key={index}
            />
          );
        })}
      </div>
      <div className="flex-row flex-center">
        {displayCount > DEFAULT_INCREMENT ? (
          <button
            className="flex flex-row button flex-center faded text-medium bold pointer"
            onClick={showLess}
            style={{
              border: '1px solid var(--text-faded)',
              borderRadius: 'var(--corner-radius)',
              height: 40,
              fontSize: '14px',
              color: 'var(--text-grey)',
            }}
          >
            View Less
          </button>
        ) : (
          <></>
        )}
        {displayCount < Object.keys(domains).length &&
        displayCount < MAX_COUNT ? (
          <button
            className="flex flex-row button flex-center grey text-medium bold pointer"
            onClick={showMore}
            style={{
              border: '1px solid var(--text-faded)',
              borderRadius: 'var(--corner-radius)',
              height: 40,
              fontSize: '14px',
            }}
          >
            View More
          </button>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}
export default FeaturedDomains;
