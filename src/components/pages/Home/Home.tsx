import HomeSearch from '@src/components/inputs/Search/HomeSearch';

import { useIsMobile } from '../../../hooks';
import { FeaturedDomains } from '../../layout';

function Home() {
  const isMobile = useIsMobile();

  return (
    <div
      className="page"
      style={{ padding: isMobile ? '15px' : '0px', boxSizing: 'border-box' }}
    >
      <div
        className={'white pb-2'}
        style={{
          fontSize: isMobile ? 26 : 50,
          paddingTop: '10px',
          fontWeight: 500,
          whiteSpace: isMobile ? undefined : 'nowrap',
        }}
      >
        Get your own smart domain
      </div>
      <span className="flex flex-col items-center pb-2 justify-center align-center text-center gap-[5px] text-md min-h-[45px] text-grey max-w-[500px]">
        The Arweave Name System (ArNS) connects friendly names to permanent
        applications, pages, data, or identities.
      </span>
      <div
        className="flex flex-column flex-center"
        style={{
          width: '100%',
          maxWidth: '900px',
          gap: '2rem',
          minWidth: isMobile ? '100%' : '750px',
        }}
      >
        <div className="flex flex-col w-full max-w-[800px] h-[200px]">
          <HomeSearch />
        </div>

        <FeaturedDomains />
      </div>
    </div>
  );
}

export default Home;
