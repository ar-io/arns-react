import {
  AOProcess,
  ARIO,
  ARIO_DEVNET_PROCESS_ID,
  ARIO_MAINNET_PROCESS_ID,
  ARIO_TESTNET_PROCESS_ID,
} from '@ar.io/sdk/web';
import ArweaveID, {
  ArweaveIdTypes,
} from '@src/components/layout/ArweaveID/ArweaveID';
import { ArweaveCompositeDataProvider } from '@src/services/arweave/ArweaveCompositeDataProvider';
import { ArweaveTransactionID } from '@src/services/arweave/ArweaveTransactionID';
import { SimpleArweaveDataProvider } from '@src/services/arweave/SimpleArweaveDataProvider';
import { useGlobalState, useWalletState } from '@src/state';
import { isArweaveTransactionID } from '@src/utils';
import { ARIO_PROCESS_ID } from '@src/utils/constants';
import { Input } from 'antd';
import Arweave from 'arweave';
import { RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';

import './styles.css';

function ArNSSettings() {
  const [
    { arioProcessId, aoClient, gateway, turboNetwork },
    dispatchGlobalState,
  ] = useGlobalState();
  const [{ wallet }] = useWalletState();
  const [registryAddress, setRegistryAddress] = useState<string>(
    arioProcessId?.toString(),
  );
  const [isValidAddress, setIsValidAddress] = useState<boolean>(true);

  useEffect(() => {
    setRegistryAddress(arioProcessId?.toString());
  }, [arioProcessId]);

  function confirmSetting(id: string) {
    if (isArweaveTransactionID(id)) {
      dispatchGlobalState({
        type: 'setIoProcessId',
        payload: id.trim(),
      });

      const arIOContract = ARIO.init({
        paymentUrl: turboNetwork.PAYMENT_URL,
        process: new AOProcess({
          processId: id.trim(),
          ao: aoClient,
        }),
        ...(wallet?.turboSigner ? { signer: wallet.turboSigner } : {}),
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
    'flex w-fit justify-center items-center bg-background rounded-md px-4 py-1 border border-primary-thin text-sm whitespace-nowrap text-light-grey gap-2';

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
              {arioProcessId ? (
                <ArweaveID
                  id={new ArweaveTransactionID(arioProcessId)}
                  characterCount={10}
                  shouldLink
                  type={ArweaveIdTypes.CONTRACT}
                />
              ) : (
                'N/A'
              )}
            </span>
            <div
              className="flex flex-row max-w-fit text-sm"
              style={{ gap: '10px' }}
            >
              <button
                className={
                  (arioProcessId == ARIO_DEVNET_PROCESS_ID
                    ? 'bg-primary text-black'
                    : ' bg-dark-grey  text-light-grey') +
                  ` flex px-3 py-2 rounded hover:bg-primary-thin hover:text-primary transition-all`
                }
                onClick={() => confirmSetting(ARIO_DEVNET_PROCESS_ID)}
              >
                Devnet
              </button>
              <button
                className={
                  (arioProcessId == ARIO_TESTNET_PROCESS_ID
                    ? 'bg-primary text-black'
                    : ' bg-dark-grey  text-light-grey') +
                  ` flex px-3 py-2 rounded  hover:bg-primary-thin hover:text-primary transition-all`
                }
                onClick={() => confirmSetting(ARIO_TESTNET_PROCESS_ID)}
              >
                Testnet
              </button>

              <button
                className={
                  (arioProcessId == ARIO_MAINNET_PROCESS_ID
                    ? 'bg-primary text-black'
                    : ' bg-dark-grey  text-light-grey') +
                  ` flex px-3 py-2 rounded  hover:bg-primary-thin hover:text-primary transition-all`
                }
                onClick={() => confirmSetting(ARIO_MAINNET_PROCESS_ID)}
              >
                Mainnet
              </button>
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
                    setRegistryAddress(ARIO_PROCESS_ID);
                    setIsValidAddress(true);
                    confirmSetting(ARIO_PROCESS_ID);
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
