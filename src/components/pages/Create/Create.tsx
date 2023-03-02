import { useEffect, useState } from 'react';

import { useIsMobile, useWalletAddress } from '../../../hooks';
import { AntContractProvider } from '../../../state/AntContractProvider';
import { useGlobalState } from '../../../state/contexts/GlobalState';

function Create() {
  const isMobile = useIsMobile();
  const [{ arweaveDataProvider }] = useGlobalState();
  const { walletAddress } = useWalletAddress();

  const [ant, setAnt] = useState<AntContractProvider>();

  useEffect(() => {
    if (walletAddress) {
      setAnt(new AntContractProvider(walletAddress, arweaveDataProvider));
    }
  }, []);

  return (
    <>
      <div
        className="page flex flex-column center"
        style={{
          boxSizing: 'border-box',
          height: '100%',
        }}
      >
        <div className="flex flex-row text-large white bold center">
          Create an ANT
        </div>
        <div
          className="flex flex-column card center"
          style={
            isMobile
              ? {
                  width: '95%',
                  height: '75%',
                  position: 'relative',
                }
              : {
                  width: '75%',
                  height: '50%',
                  maxHeight: '638px',
                  maxWidth: '1000px',
                  position: 'relative',
                }
          }
        >
          {/* todo: implement validation input */}

          {/* card div end */}
        </div>
      </div>
    </>
  );
}

export default Create;
