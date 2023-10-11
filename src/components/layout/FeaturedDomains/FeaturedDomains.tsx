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
    setDisplayCount(MAX_COUNT);
  }

  function showLess(e: any) {
    e.preventDefault();
    setDisplayCount(DEFAULT_INCREMENT);
  }

  return (
    <div className="featured-domains flex-center fade-in">
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
        <button
          className="outline-button center faded"
          onClick={displayCount < MAX_COUNT ? showMore : showLess}
          style={{
            padding: 0,
            fontSize: '15px',
            width: '100%',
            height: 50,
            margin: '0em 0.5em',
          }}
        >
          {displayCount < MAX_COUNT ? 'View More' : 'View Less'}
        </button>
      </div>
    </div>
  );
}
export default FeaturedDomains;
