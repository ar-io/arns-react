import {
  AOProcess,
  IO,
  IO_DEVNET_PROCESS_ID,
  IO_TESTNET_PROCESS_ID,
} from '@ar.io/sdk';
import Toggle from '@src/components/inputs/toggle/Toggle';
import ArweaveID, {
  ArweaveIdTypes,
} from '@src/components/layout/ArweaveID/ArweaveID';
import { ArweaveCompositeDataProvider } from '@src/services/arweave/ArweaveCompositeDataProvider';
import { ArweaveTransactionID } from '@src/services/arweave/ArweaveTransactionID';
import { SimpleArweaveDataProvider } from '@src/services/arweave/SimpleArweaveDataProvider';
import { useGlobalState, useWalletState } from '@src/state';
import { isArweaveTransactionID } from '@src/utils';
import { IO_PROCESS_ID } from '@src/utils/constants';
import { Input } from 'antd';
import Arweave from 'arweave';
import { RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';

import './styles.css';

function ArNSSettings() {
  const [{ ioProcessId, aoClient, gateway }, dispatchGlobalState] =
    useGlobalState();
  const [{ wallet }] = useWalletState();
  const [registryAddress, setRegistryAddress] = useState<string>(
    ioProcessId?.toString(),
  );
  const [isValidAddress, setIsValidAddress] = useState<boolean>(true);

  useEffect(() => {
    setRegistryAddress(ioProcessId?.toString());
  }, [ioProcessId]);

  function confirmSetting(id: string) {
    if (isArweaveTransactionID(id)) {
      dispatchGlobalState({
        type: 'setIoProcessId',
        payload: id.trim(),
      });

      const arIOContract = IO.init({
        process: new AOProcess({
          processId: id.trim(),
          ao: aoClient,
        }),
        ...(wallet?.arconnectSigner ? { signer: wallet.arconnectSigner } : {}),
      });
      dispatchGlobalState({
        type: 'setArIOContract',
        payload: arIOContract,
      });

      const arweave = new Arweave({
        host: gateway,
        protocol: 'https',
      });
      const arweaveDataProvider = new SimpleArweaveDataProvider(arweave);

      const provider = new ArweaveCompositeDataProvider({
        contract: arIOContract,
        arweave: arweaveDataProvider,
      });

      dispatchGlobalState({
        type: 'setGateway',
        payload: { gateway, provider },
      });
    }
  }

  const labelClass =
    'flex w-fit justify-center items-center bg-background rounded-md px-4 py-1 border border-primary-thin text-md whitespace-nowrap text-light-grey gap-2';

  const inputClass = 'bg-foreground justify-center items-center outline-none';
  const inputContainerClass =
    'flex flex-col gap-2 border border-primary-thin p-2 rounded-md bg-metallic-grey';
  const setButtonClass =
    'text-grey border-[0.5px] border-dark-grey rounded hover:border-white hover:text-white transition-all h-full flex w-fit py-1 px-3 rounded-sm text-xs font-semibold';
  const resetIconClass = 'py-1 px-3 text-grey hover:text-white transition-all';

  return (
    <div className="flex flex-col w-full h-full p-3">
      <div className="flex flex-col w-full h-full bg-background gap-5 p-2 rounded-xl">
        <div className={inputContainerClass}>
          <div
            className="flex flex-row justify-between items-center"
            style={{ gap: '4px' }}
          >
            <span className={labelClass}>
              Current ArNS Registry:{' '}
              {ioProcessId ? (
                <ArweaveID
                  id={new ArweaveTransactionID(ioProcessId)}
                  characterCount={10}
                  shouldLink
                  type={ArweaveIdTypes.CONTRACT}
                />
              ) : (
                'N/A'
              )}
            </span>
            <div className="flex flex-row max-w-fit" style={{ gap: '4px' }}>
              <Toggle
                leftLabel="devnet"
                rightLabel="testnet"
                check={(b) => {
                  if (b) {
                    confirmSetting(IO_TESTNET_PROCESS_ID);
                  } else {
                    confirmSetting(IO_DEVNET_PROCESS_ID);
                  }
                }}
              />
            </div>
          </div>

          <Input
            className={inputClass}
            prefixCls="settings-input"
            placeholder="Enter custom ArNS Registry Address"
            value={registryAddress}
            onChange={(e) => {
              setIsValidAddress(isArweaveTransactionID(e.target.value.trim()));
              setRegistryAddress(e.target.value.trim());
            }}
            onClear={() => setRegistryAddress('')}
            onPressEnter={() =>
              isArweaveTransactionID(registryAddress) &&
              confirmSetting(registryAddress)
            }
            variant="outlined"
            status={isValidAddress ? '' : 'error'}
            addonAfter={
              <div className="flex flex-row" style={{ gap: '4px' }}>
                <button
                  disabled={!isValidAddress}
                  className={setButtonClass}
                  onClick={() => confirmSetting(registryAddress)}
                >
                  Set
                </button>
                <button
                  className={resetIconClass}
                  onClick={() => {
                    setRegistryAddress(IO_PROCESS_ID);
                    setIsValidAddress(true);
                    confirmSetting(IO_PROCESS_ID);
                  }}
                >
                  <RotateCcw width={'16px'} />
                </button>
              </div>
            }
          />
          {isValidAddress === false ? (
            <span className="text-color-error" style={{ marginBottom: '10px' }}>
              invalid address
            </span>
          ) : (
            <></>
          )}
        </div>
      </div>
    </div>
  );
}

export default ArNSSettings;
