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
    <div className="featured-domains flex justify-center items-center fade-in">
      <span
        className="text-lg text-center justify-center items-center text-muted"
        style={{
          letterSpacing: '0.3em',
          fontWeight: 500,
        }}
      >
        FEATURED DOMAINS
      </span>
      <div className="card-container flex justify-center items-center">
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
      <button
        className="button-secondary text-center justify-center items-center px-8 py-3"
        onClick={displayCount < MAX_COUNT ? showMore : showLess}
      >
        {displayCount < MAX_COUNT ? 'View More Domains' : 'View Less Domains'}
      </button>
    </div>
  );
}
export default FeaturedDomains;
