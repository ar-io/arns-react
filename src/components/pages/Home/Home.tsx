import HomeSearch from '@src/components/inputs/Search/HomeSearch';

import { useIsMobile } from '../../../hooks';
import { FeaturedDomains } from '../../layout';

function Home() {
  const isMobile = useIsMobile();

  return (
    <div className={`page flex flex-col items-center pb-8 ${isMobile ? 'px-4' : ''}`}>
      {/* Hero Section */}
      <h1
        className="text-foreground pb-4 pt-3 font-medium text-center"
        style={{ fontSize: isMobile ? 26 : 50 }}
      >
        Get your own smart domain
      </h1>
      
      <p className="text-muted text-center text-base max-w-[500px] pb-6">
        The Arweave Name System (ArNS) connects friendly names to permanent
        applications, pages, data, or identities.
      </p>

      {/* Search Section */}
      <div className="flex flex-col items-center w-full max-w-[800px] gap-8">
        <HomeSearch />
        <FeaturedDomains />
      </div>
    </div>
  );
}

export default Home;
