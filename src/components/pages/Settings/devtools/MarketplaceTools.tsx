import { useMarketplaceInfo } from '@src/hooks/useMarketplaceInfo';
import { useGlobalState } from '@src/state';
import { DEFAULT_MIN_MARKETPLACE_ANT_VERSION } from '@src/utils/constants';
import React, { useEffect } from 'react';

const inputContainerClass =
  'flex flex-col gap-2 border border-primary-thin p-2 rounded-md bg-metallic-grey';

function MarketplaceTools() {
  const { data: marketplaceInfo } = useMarketplaceInfo();
  const [{ minimumANTVersionForMarketplace }, dispatchGlobalState] =
    useGlobalState();
  const [expanded, setExpanded] = React.useState(false);
  const [newVersion, setNewVersion] = React.useState(
    minimumANTVersionForMarketplace.toString(),
  );

  // Sync input field when global state changes
  useEffect(() => {
    setNewVersion(minimumANTVersionForMarketplace.toString());
  }, [minimumANTVersionForMarketplace]);

  const handleVersionUpdate = () => {
    const version = parseInt(newVersion, 10);
    if (!isNaN(version) && version > 0) {
      dispatchGlobalState({
        type: 'setMinimumANTVersionForMarketplace',
        payload: version,
      });
    }
  };

  const handleReset = () => {
    dispatchGlobalState({
      type: 'setMinimumANTVersionForMarketplace',
      payload: DEFAULT_MIN_MARKETPLACE_ANT_VERSION,
    });
    setNewVersion(DEFAULT_MIN_MARKETPLACE_ANT_VERSION.toString());
  };

  return (
    <div className="flex flex-col w-full h-fit p-3 text-sm">
      <div className={inputContainerClass}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-md text-white">Marketplace Settings</span>
        </div>

        {/* Minimum ANT Version Setting */}
        <div className="flex flex-col text-white w-full mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-grey">Minimum ANT Version:</span>
            <span className="text-white font-semibold">
              {minimumANTVersionForMarketplace}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="number"
              value={newVersion}
              onChange={(e) => setNewVersion(e.target.value)}
              className="bg-background border border-dark-grey rounded px-2 py-1 text-white text-xs w-20"
              min="1"
            />
            <button
              onClick={handleVersionUpdate}
              className="text-white border border-primary-thin rounded px-2 py-1 text-xs hover:bg-primary-thin transition-all"
            >
              Update
            </button>
            <button
              onClick={handleReset}
              className="text-grey border border-dark-grey rounded px-2 py-1 text-xs hover:border-white hover:text-white transition-all"
            >
              Reset to {DEFAULT_MIN_MARKETPLACE_ANT_VERSION}
            </button>
          </div>
        </div>

        {/* Marketplace Info */}
        <div className="flex flex-col text-white w-full">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-grey">Marketplace Info</span>
            <button
              onClick={() => setExpanded((e) => !e)}
              className="text-grey border-[0.5px] border-dark-grey rounded hover:border-white hover:text-white transition-all flex w-fit py-1 px-3 rounded-sm text-xs font-semibold"
            >
              {expanded ? 'Hide' : 'Show'}
            </button>
          </div>

          {expanded && (
            <>
              {marketplaceInfo ? (
                <pre className="text-white bg-background rounded p-2 overflow-auto h-fit text-xs w-full mb-2">
                  {JSON.stringify(marketplaceInfo, null, 2)}
                </pre>
              ) : (
                <div className="text-grey text-xs mb-2">
                  Loading marketplace info... (requires wallet connection)
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default MarketplaceTools;
