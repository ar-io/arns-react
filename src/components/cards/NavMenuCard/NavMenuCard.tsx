import { AntLogoIcon } from '@src/components/data-display/AntLogoIcon';
import TurboTopUpModal from '@src/components/modals/turbo/TurboTopUpModal';
import useDomainInfo from '@src/hooks/useDomainInfo';
import { usePrimaryName } from '@src/hooks/usePrimaryName';
import { useTurboCreditBalance } from '@src/hooks/useTurboCreditBalance';
import { AoAddress } from '@src/types';
import { formatARIOWithCommas, shortPrimaryName } from '@src/utils';
import {
  //buildARBalanceQuery,
  buildIOBalanceQuery,
} from '@src/utils/network';
import { useQueryClient } from '@tanstack/react-query';
import { Tooltip } from 'antd';
import Ar from 'arweave/node/ar';
import { Settings2Icon } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
// NOTE (de-AO refactor): wagmi's `useDisconnect` was used to force-disconnect
// EVM wallets via the Ethereum wallet adapter. The Solana-only refactor
// removed `WagmiProvider` from the app shell, so calling `useDisconnect()`
// here crashes the navbar with `WagmiProviderNotFoundError` the moment a
// wallet connects. Stub it out to a no-op until/unless EVM wallets come back.
const useDisconnect = () => ({ disconnectAsync: async () => {} });

import { useIsMobile } from '../../../hooks';
import { useGlobalState } from '../../../state/contexts/GlobalState';
import { useWalletState } from '../../../state/contexts/WalletState';
import eventEmitter from '../../../utils/events';
import { ROUTES } from '../../../utils/routes';
import { LogoutIcon, MenuIcon, TokenIcon } from '../../icons';
import { BrandLogo } from '../../icons';
import ConnectButton from '../../inputs/buttons/ConnectButton/ConnectButton';
import MenuButton from '../../inputs/buttons/MenuButton/MenuButton';
import { Loader, NavBarLink } from '../../layout';
import ArweaveID, { ArweaveIdTypes } from '../../layout/ArweaveID/ArweaveID';
import { WalletAddress } from '../../layout/WalletAddress/WalletAddress';
import './styles.css';

function NavMenuCard() {
  // TODO: all the balance queries here should be refactored to use balance hooks, or a central balance hook
  const queryClient = useQueryClient();
  const [{ arioContract, arioTicker }] = useGlobalState();
  const arioProcessId = '';
  const aoNetwork: any = {
    ARIO: { SCHEDULER: '', CU_URL: '', HYPERBEAM_URL: '' },
  };

  const [{ wallet, walletAddress }, dispatchWalletState] = useWalletState();
  const { disconnectAsync } = useDisconnect();
  const { data: primaryNameData } = usePrimaryName();
  const { data: domainDomain } = useDomainInfo({
    domain: primaryNameData?.name,
  });
  const { data: turboCreditBalanceRes } = useTurboCreditBalance();
  const turboCreditBalance = useMemo(() => {
    if (!turboCreditBalanceRes) return '0';
    const ar = new Ar();
    return formatARIOWithCommas(
      parseFloat(ar.winstonToAr(turboCreditBalanceRes.effectiveBalance)),
    );
  }, [turboCreditBalanceRes]);
  const isMobile = useIsMobile();

  const [showMenu, setShowMenu] = useState(false);
  const [walletDetails, setWalletDetails] = useState<{
    'Turbo Credits': number | undefined | string;
    //AR: number | undefined | string;
    [x: string]: number | undefined | string;
  }>({
    'Turbo Credits': turboCreditBalance,
    // AR: undefined,
    [arioTicker]: undefined,
  });
  const menuRef = useRef<HTMLDivElement>(null);

  const [turboTopUpModalOpen, setTurboTopUpModalOpen] = useState(false);

  useEffect(() => {
    if (walletAddress) {
      resetWalletDetails();
      fetchWalletDetails(walletAddress);
    }

    if (!menuRef.current) {
      return;
    }
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuRef, showMenu, wallet, walletAddress, turboCreditBalance]);

  function resetWalletDetails() {
    setWalletDetails({
      [arioTicker]: undefined,
      'Turbo Credits': undefined,
    });
  }

  async function fetchWalletDetails(walletAddress: AoAddress) {
    const ioBalance = await queryClient.fetchQuery(
      buildIOBalanceQuery({
        address: walletAddress.toString(),
        arioContract,
        meta: [
          arioProcessId,
          aoNetwork.ARIO.CU_URL,
          aoNetwork.ARIO.HYPERBEAM_URL,
        ],
      }),
    );

    const [formattedIOBalance] = [ioBalance].map((balance: string | number) =>
      Intl.NumberFormat('en-US', {
        notation: 'compact',
        maximumFractionDigits: 2,
        compactDisplay: 'short',
      }).format(+balance),
    );
    setWalletDetails({
      [arioTicker]: formattedIOBalance,
      'Turbo Credits': turboCreditBalance,
    });
  }

  function handleClickOutside(e: any) {
    if (
      menuRef.current &&
      e.target !== menuRef.current &&
      !menuRef.current.contains(e.target)
    ) {
      setShowMenu(false);
    }
  }

  async function logout() {
    try {
      setShowMenu(false);

      // Disconnect wallet and force disconnect wagmi for Ethereum wallets
      try {
        await wallet?.disconnect();
        await disconnectAsync();
      } catch {
        // Ignore disconnect errors - may not be connected
      }

      // Clear localStorage
      localStorage.removeItem('walletType');

      // Clear wallet state atomically
      dispatchWalletState({
        type: 'setWalletAndAddress',
        payload: {
          wallet: undefined,
          walletAddress: undefined,
        },
      });
    } catch (error: any) {
      eventEmitter.emit('error', error);
    }
  }

  return (
    <>
      <Tooltip
        rootClassName="menu-card"
        open={showMenu}
        placement="bottomRight"
        color="var(--card-bg)"
        autoAdjustOverflow
        arrow={{ pointAtCenter: true }}
        overlayInnerStyle={{
          width: 'fit-content',
          border: '1px solid var(--text-faded)',
        }}
        overlayStyle={{ width: 'fit-content', minWidth: '180px' }}
        title={
          <div
            className="flex flex-column"
            ref={menuRef}
            style={{ minWidth: '200px', gap: '15px', paddingBottom: '15px' }}
          >
            {!walletAddress || !wallet ? (
              <div className="flex flex-column" style={{ padding: '15px' }}>
                {Object.entries(ROUTES).map(([key, route]) => {
                  if (!route.protected)
                    return (
                      <NavBarLink
                        path={route.path}
                        linkText={route.text}
                        target={route.external ? '_blank' : '_self'}
                        key={key}
                        onClick={() => {
                          setShowMenu(false);
                        }}
                      >
                        <>
                          {route.icon ? (
                            route.icon({
                              height: 16,
                              width: 16,
                              fill: 'var(--text-grey)',
                            })
                          ) : (
                            <></>
                          )}
                        </>
                      </NavBarLink>
                    );
                })}
                <ConnectButton />
              </div>
            ) : (
              <>
                <div
                  className="flex flex-column"
                  style={{ padding: '15px', boxSizing: 'border-box' }}
                >
                  <ArweaveID
                    id={walletAddress}
                    type={ArweaveIdTypes.ADDRESS}
                    characterCount={14}
                    copyButtonStyle={{
                      padding: '10px',
                      background: 'var(--text-faded)',
                      borderRadius: '5px',
                      fill: 'var(--text-white)',
                    }}
                    wrapperStyle={{
                      width: '100%',
                      justifyContent: 'space-between',
                      boxSizing: 'border-box',
                      alignItems: 'center',
                    }}
                  />

                  <div
                    className="flex flex-column"
                    style={{
                      background: 'var(--box-color)',
                      borderRadius: '5px',
                      padding: '15px',
                      boxSizing: 'border-box',
                      gap: '10px',
                      borderBottom: '1px solid var(--text-faded)',
                    }}
                  >
                    {Object.entries(walletDetails).map(([key, value]) => {
                      return (
                        <span
                          key={key}
                          className="flex-row grey"
                          style={{
                            fontSize: '13px',
                            gap: '10px',
                          }}
                        >
                          <span
                            className="whitespace-nowrap"
                            style={{ fontWeight: 400 }}
                          >
                            {key}:
                          </span>
                          {value ? (
                            <span className="white">{value}</span>
                          ) : (
                            <Loader
                              size={20}
                              wrapperStyle={{ margin: '0px' }}
                            />
                          )}
                          {key === 'Turbo Credits' && (
                            <button
                              className="text-xs text-white hover:text-black bg-foreground hover:bg-white border border-dark-grey rounded px-2 py-[2px] transition-all duration-200"
                              onClick={() => {
                                setTurboTopUpModalOpen(true);
                                setShowMenu(false);
                              }}
                            >
                              Add
                            </button>
                          )}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <span
                  className="flex"
                  style={{
                    height: '1px',
                    width: '100%',
                    boxSizing: 'border-box',
                    background: 'var(--text-faded)',
                  }}
                ></span>

                <div
                  className="flex flex-column"
                  style={{
                    padding: '0px 15px',
                    boxSizing: 'border-box',
                    gap: '15px',
                  }}
                >
                  {isMobile ? (
                    <>
                      {Object.entries(ROUTES).map(([key, route]) => {
                        if (!route.index && (!route.protected || walletAddress))
                          return (
                            <NavBarLink
                              path={route.path}
                              linkText=""
                              target={route.external ? '_blank' : '_self'}
                              key={key}
                              onClick={() => {
                                setShowMenu(false);
                              }}
                            >
                              <>
                                {route.icon && (
                                  <route.icon className="grey size-3" />
                                )}
                                <span className="text-sm pl-[.125rem]">
                                  {route.text}
                                </span>
                              </>
                            </NavBarLink>
                          );
                      })}
                    </>
                  ) : (
                    Object.entries(ROUTES).map(([key, route]) => {
                      if (route.protected && walletAddress)
                        return (
                          <NavBarLink
                            path={route.path}
                            linkText={route.text}
                            key={key}
                            onClick={() => {
                              setShowMenu(false);
                            }}
                          >
                            <>
                              {route.icon ? (
                                route.icon({
                                  height: 16,
                                  width: 16,
                                  fill: 'var(--text-grey)',
                                })
                              ) : (
                                <></>
                              )}
                            </>
                          </NavBarLink>
                        );
                    })
                  )}
                  <span className="flex flex-row" style={{ gap: '10px' }}>
                    <TokenIcon
                      fill={'var(--text-grey)'}
                      width={'16px'}
                      height={'16px'}
                    />{' '}
                    <Link
                      to={'https://ar.io/token'}
                      target={'_blank'}
                      className={'flex-row navbar-link hover'}
                      style={{
                        gap: '10px',
                        alignItems: 'center',
                        color: 'var(--text-white)',
                        fontSize: '14px',
                      }}
                    >
                      What are ARIO tokens?
                    </Link>
                  </span>{' '}
                  <span className="flex flex-row" style={{ gap: '10px' }}>
                    <Settings2Icon
                      className="text-grey"
                      width={'16px'}
                      height={'16px'}
                    />{' '}
                    <Link
                      to={'/settings'}
                      className={'flex-row navbar-link hover'}
                      style={{
                        gap: '10px',
                        alignItems: 'center',
                        color: 'var(--text-white)',
                        fontSize: '14px',
                      }}
                    >
                      Settings
                    </Link>
                  </span>
                  {
                    <button
                      data-testid="nav-menu-logout-button"
                      className="navbar-link hover flex-row"
                      onClick={() => logout()}
                      style={{
                        cursor: 'pointer',
                        padding: '0px',
                        gap: '10px',
                        fontSize: '14px',
                        alignItems: 'center',
                      }}
                    >
                      <LogoutIcon
                        style={{
                          height: '16px',
                          width: '16px',
                          fill: 'var(--text-grey)',
                        }}
                      />
                      <span className="flex">Log Out</span>
                    </button>
                  }
                </div>
              </>
            )}
          </div>
        }
      >
        <MenuButton
          setShow={setShowMenu}
          show={showMenu}
          className={
            walletAddress
              ? 'outline-button items-center justify-center'
              : 'items-center justify-center'
          }
          style={
            walletAddress
              ? {
                  borderRadius: 'var(--corner-radius',
                  borderWidth: '1px',
                  padding: '0px',
                  borderColor: 'var(--text-faded)',
                  width: 'fit-content',
                  minWidth: 'unset',
                }
              : {}
          }
        >
          <span className="flex text-white gap-2 items-center justify-center text-[14px] h-[2.5rem] p-2">
            {primaryNameData?.name ? (
              <>
                <AntLogoIcon
                  className="rounded-full max-h-[1.875rem] border border-dark-grey"
                  id={domainDomain?.state?.Logo}
                  icon={
                    <div className="flex items-center justify-center rounded-full fill-white p-[5px]">
                      <BrandLogo width={'20px'} height={'20px'} />
                    </div>
                  }
                />
                {shortPrimaryName(primaryNameData.name)}
              </>
            ) : walletAddress ? (
              <WalletAddress characterCount={4} />
            ) : (
              <MenuIcon
                width={'24px'}
                height={'24px'}
                fill={'var(--text-white)'}
              />
            )}
          </span>
        </MenuButton>
      </Tooltip>
      {turboTopUpModalOpen && (
        <TurboTopUpModal onClose={() => setTurboTopUpModalOpen(false)} />
      )}
    </>
  );
}

export default NavMenuCard;
