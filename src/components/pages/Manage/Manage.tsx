import { Tooltip } from '@src/components/data-display';
import ValidationInput from '@src/components/inputs/text/ValidationInput/ValidationInput';
import { ArweaveTransactionID } from '@src/services/arweave/ArweaveTransactionID';
import {
  dispatchArNSUpdate,
  useArNSState,
  useGlobalState,
  useModalState,
  useWalletState,
} from '@src/state';
import eventEmitter from '@src/utils/events';
import { Progress } from 'antd';
import { useState } from 'react';

import { doAntsRequireUpdate } from '../../../utils';
import DomainsTable from '../../data-display/tables/DomainsTable';
import { RefreshIcon, SearchIcon } from '../../icons';
import './styles.css';

function Manage() {
  const [{ ioProcessId }] = useGlobalState();
  const [
    {
      percentLoaded: percent,
      loading: loadingArnsState,
      domains,
      ants,
      luaSourceTx,
      arnsEmitter,
    },
    dispatchArNSState,
  ] = useArNSState();
  const [{ walletAddress }] = useWalletState();
  const [, dispatchModalState] = useModalState();
  const [search, setSearch] = useState<string>('');

  return (
    <div className="page" style={{ overflow: 'auto' }}>
      <div className="flex-column" style={{ gap: '10px' }}>
        <div className="flex flex-start">
          <h1
            className="flex white text-[2rem]"
            style={{
              width: 'fit-content',
              whiteSpace: 'nowrap',
              marginTop: '0px',
            }}
          >
            Manage Assets
          </h1>
        </div>
        <div
          id="manage-table-wrapper"
          style={{
            position: 'relative',
            border: 'none',
            borderRadius: 'var(--corner-radius)',
            height: '100%',
            minHeight: '400px',
          }}
        >
          <div id="manage-table-toolbar">
            {loadingArnsState && percent >= 0 ? (
              <div
                className="flex flex-row center"
                style={{
                  padding: '20px 100px',
                }}
              >
                <Progress
                  type={'line'}
                  percent={percent}
                  strokeColor={{
                    '0%': '#F7C3A1',
                    '100%': '#DF9BE8',
                  }}
                  trailColor="var(--text-faded)"
                  format={(p) => `${p}%`}
                  strokeWidth={10}
                />
              </div>
            ) : (
              <div className="flex w-full flex-row pr-10">
                <div className="flex w-full border-b-[1px] border-dark-grey p-[5px]">
                  <SearchIcon
                    width={'18px'}
                    height={'18px'}
                    className="fill-white"
                  />
                  <input
                    className="flex bg-background pl-2 w-full focus:outline-none text-white placeholder:text-dark-grey"
                    onChange={(e) => setSearch(e.target.value)}
                    value={search}
                    placeholder="Search your assets"
                  />
                </div>

                {doAntsRequireUpdate({ ants, luaSourceTx }) && (
                  <Tooltip
                    message={'Your ANTs require an update'}
                    icon={
                      <button
                        onClick={() =>
                          dispatchModalState({
                            type: 'setModalOpen',
                            payload: { showUpgradeAntModal: true },
                          })
                        }
                        className="h-fit animate-pulse rounded-[4px] bg-primary-thin px-4 py-1 text-sm text-primary transition-all hover:bg-primary hover:text-black"
                      >
                        Upgrade ANTs
                      </button>
                    }
                  />
                )}
                <button
                  disabled={loadingArnsState}
                  className={'button center pointer'}
                  onClick={() =>
                    walletAddress
                      ? dispatchArNSUpdate({
                          emitter: arnsEmitter,
                          dispatch: dispatchArNSState,
                          walletAddress: new ArweaveTransactionID(
                            walletAddress?.toString(),
                          ),
                          ioProcessId,
                        })
                      : eventEmitter.emit('error', {
                          name: 'Manage Assets',
                          message: 'Connect wallet before refreshing',
                        })
                  }
                  style={{
                    position: 'absolute',
                    right: '20px',
                    top: '0px',
                    bottom: '0px',
                  }}
                >
                  <RefreshIcon height={16} width={16} fill="var(--text-grey)" />
                </button>
              </div>
            )}
          </div>

          <DomainsTable
            domainData={{ names: domains, ants }}
            loading={loadingArnsState}
            filter={search}
          />
        </div>
      </div>
    </div>
  );
}

export default Manage;
