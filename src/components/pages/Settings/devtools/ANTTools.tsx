import { ANT, createAoSigner } from '@ar.io/sdk';
import { Loader } from '@src/components/layout';
import ArweaveID, {
  ArweaveIdTypes,
} from '@src/components/layout/ArweaveID/ArweaveID';
import { useANTVersions } from '@src/hooks/useANTVersions';
import { ArweaveTransactionID } from '@src/services/arweave/ArweaveTransactionID';
import { useGlobalState, useWalletState } from '@src/state';
import { createAntStateForOwner, isArweaveTransactionID } from '@src/utils';
import eventEmitter from '@src/utils/events';
import { queryClient } from '@src/utils/network';
import React, { useState } from 'react';

const inputContainerClass =
  'flex flex-col gap-2 border border-primary-thin p-2 rounded-md bg-metallic-grey';

function ANTTools() {
  const { data: antVersions } = useANTVersions();
  const [expanded, setExpanded] = React.useState(false);
  const [{ aoClient, antRegistryProcessId, hyperbeamUrl }] = useGlobalState();
  const [{ wallet, walletAddress }] = useWalletState();

  // Spawn ANT state
  const [customModuleId, setCustomModuleId] = useState('');
  const [selectedModuleId, setSelectedModuleId] = useState('');
  const [antState, setAntState] = useState('');
  const [isSpawning, setIsSpawning] = useState(false);
  const [spawnResult, setSpawnResult] = useState<string | null>(null);

  // Initialize default ANT state when wallet is available
  React.useEffect(() => {
    if (walletAddress && !antState) {
      const defaultState = createAntStateForOwner(walletAddress.toString());
      setAntState(JSON.stringify(defaultState, null, 2));
    }
  }, [walletAddress, antState]);

  const moduleId = customModuleId || selectedModuleId;
  const isValidModuleId = isArweaveTransactionID(moduleId);
  const canSpawn =
    isValidModuleId && antState && wallet?.contractSigner && walletAddress;

  async function handleSpawnANT() {
    if (!canSpawn) return;
    if (!wallet?.contractSigner) {
      throw new Error('No Wander Signer found');
    }

    setIsSpawning(true);
    setSpawnResult(null);

    try {
      let parsedState;
      try {
        parsedState = JSON.parse(antState);
      } catch {
        throw new Error('Invalid JSON state');
      }

      const result = await ANT.spawn({
        state: parsedState,
        signer: createAoSigner(wallet.contractSigner),
        ao: aoClient,
        module: moduleId,
        antRegistryId: antRegistryProcessId,
        hyperbeamUrl,
      });

      setSpawnResult(result);

      // Invalidate relevant queries
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey.some(
            (key) =>
              typeof key === 'string' &&
              (key.includes('ant') || key.includes('domain')),
          ),
      });

      eventEmitter.emit('success', {
        name: 'Spawn ANT',
        message: `Successfully spawned ANT: ${result}`,
      });
    } catch (error) {
      console.error('Failed to spawn ANT:', error);
      eventEmitter.emit('error', error);
    } finally {
      setIsSpawning(false);
    }
  }
  return (
    <div className="flex flex-col w-full h-fit p-3 text-sm gap-4">
      {/* ANT Versions Section */}
      <div className={inputContainerClass}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-md text-white">ANT Versions</span>
        </div>
        {antVersions ? (
          <div className="flex flex-col text-white w-full">
            <button
              onClick={() => setExpanded((e) => !e)}
              className="text-grey border-[0.5px] border-dark-grey rounded hover:border-white hover:text-white transition-all flex w-fit py-1 px-3 rounded-sm text-xs font-semibold mb-2"
            >
              {expanded ? 'Click to hide' : 'Click to show'}
            </button>
            {expanded && (
              <pre className="text-white bg-background rounded p-2 overflow-auto h-fit text-xs w-full mb-2">
                {JSON.stringify(antVersions, null, 2)}
              </pre>
            )}
          </div>
        ) : (
          <span className="text-white">Loading...</span>
        )}
      </div>

      {/* Spawn ANT Section */}
      <div className={inputContainerClass}>
        <div className="flex items-center justify-between mb-4">
          <span className="text-md text-white">Spawn ANT</span>
        </div>

        <div className="flex flex-col gap-4">
          {/* Module ID Section */}
          <div className="flex flex-col gap-2">
            <label className="text-white text-sm font-medium">Module ID</label>

            {/* Custom Module ID Input */}
            <div className="flex flex-col gap-2">
              <input
                type="text"
                placeholder="Enter custom module ID (43-character Arweave transaction ID)"
                value={customModuleId}
                onChange={(e) => setCustomModuleId(e.target.value)}
                className={`w-full p-2 rounded border text-white bg-background ${
                  customModuleId && !isArweaveTransactionID(customModuleId)
                    ? 'border-red-500'
                    : 'border-dark-grey'
                }`}
              />
              {customModuleId && !isArweaveTransactionID(customModuleId) && (
                <span className="text-red-500 text-xs">
                  Invalid Arweave transaction ID
                </span>
              )}
            </div>

            {/* Registered Module IDs Dropdown */}
            {antVersions && Object.keys(antVersions).length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="text-grey text-xs">
                  Or select from registered modules:
                </span>
                <select
                  value={selectedModuleId}
                  onChange={(e) => setSelectedModuleId(e.target.value)}
                  disabled={!!customModuleId}
                  className="w-full p-2 rounded border border-dark-grey text-white bg-background disabled:opacity-50"
                >
                  <option value="">Select a registered module...</option>
                  {Object.entries(antVersions).map(([version, versionData]) => (
                    <option key={version} value={versionData.moduleId}>
                      {version} - {versionData.moduleId}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* ANT State Section */}
          <div className="flex flex-col gap-2">
            <label className="text-white text-sm font-medium">
              ANT State (JSON)
            </label>
            <textarea
              value={antState}
              onChange={(e) => setAntState(e.target.value)}
              placeholder="Enter ANT state as JSON..."
              rows={12}
              className="w-full p-2 rounded border border-dark-grey text-white bg-background font-mono text-xs"
            />
          </div>

          {/* Spawn Result */}
          {spawnResult && (
            <div className="flex flex-col gap-2">
              <label className="text-white text-sm font-medium">
                Spawned ANT Process ID
              </label>
              <div className="p-2 rounded border border-dark-grey bg-foreground">
                <span className="text-green-400 font-mono text-sm">
                  <ArweaveID
                    id={new ArweaveTransactionID(spawnResult)}
                    type={ArweaveIdTypes.CONTRACT}
                    shouldLink={true}
                  />
                </span>
              </div>
            </div>
          )}

          {/* Spawn Button */}
          <button
            onClick={handleSpawnANT}
            disabled={!canSpawn || isSpawning}
            className={`w-full py-2 px-4 rounded font-medium transition-colors flex items-center justify-center gap-2 ${
              canSpawn && !isSpawning
                ? 'bg-primary hover:bg-warning text-black'
                : 'bg-grey text-white cursor-not-allowed'
            }`}
          >
            {isSpawning ? (
              <>
                <Loader size={16} />
                Spawning ANT...
              </>
            ) : (
              'Spawn ANT'
            )}
          </button>

          {/* Status Messages */}
          {!walletAddress && (
            <span className="text-black text-xs">
              Connect wallet to spawn ANT
            </span>
          )}
          {walletAddress && !isValidModuleId && (
            <span className="text-error text-xs">Valid module ID required</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default ANTTools;
