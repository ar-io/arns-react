import { FEATURED_DOMAINS } from '@src/utils/constants';
import { useState } from 'react';

import { ARNSCard } from '../../cards';
import './styles.css';

function FeaturedDomains() {
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
        }}
      >
        FEATURED DOMAINS
      </span>
      <div className="card-container flex-center">
        {Object.keys(FEATURED_DOMAINS).map((domain, index) => {
          if (
            index >= displayCount ||
            index >= Object.keys(FEATURED_DOMAINS).length
          )
            return;
          return (
            <ARNSCard
              domain={domain}
              key={domain}
              imageUrl={FEATURED_DOMAINS[domain].imageUrl}
            />
          );
        })}
      </div>
      <div className="flex flex-row mb-8 max-w-md gap-4">
        <button
          className="button-secondary center faded"
          onClick={displayCount < MAX_COUNT ? showMore : showLess}
          style={{
            padding: 0,
            fontSize: '15px',
            width: '100%',
            height: 50,
            color: 'var(--text-white)',
          }}
        >
          {displayCount < MAX_COUNT ? 'View More Domains' : 'View Less Domains'}
        </button>
      </div>
    </div>
  );
}
export default FeaturedDomains;
