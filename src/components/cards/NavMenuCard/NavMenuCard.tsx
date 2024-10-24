import { buildARBalanceQuery, buildIOBalanceQuery } from '@src/utils/network';
import { useQueryClient } from '@tanstack/react-query';
import { Tooltip } from 'antd';
import { Settings2Icon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import { useIsMobile } from '../../../hooks';
import { ArweaveTransactionID } from '../../../services/arweave/ArweaveTransactionID';
import { useGlobalState } from '../../../state/contexts/GlobalState';
import { useWalletState } from '../../../state/contexts/WalletState';
import eventEmitter from '../../../utils/events';
import { ROUTES } from '../../../utils/routes';
import { LogoutIcon, MenuIcon, TokenIcon } from '../../icons';
import ConnectButton from '../../inputs/buttons/ConnectButton/ConnectButton';
import MenuButton from '../../inputs/buttons/MenuButton/MenuButton';
import { Loader, NavBarLink } from '../../layout';
import ArweaveID, { ArweaveIdTypes } from '../../layout/ArweaveID/ArweaveID';
import { WalletAddress } from '../../layout/WalletAddress/WalletAddress';
import './styles.css';

function NavMenuCard() {
  const [
    {
      arweaveDataProvider,
      arioContract,
      ioTicker,
      ioProcessId,
      aoNetwork,
      gateway,
    },
  ] = useGlobalState();
  const queryClient = useQueryClient();
  const [showMenu, setShowMenu] = useState(false);
  const [walletDetails, setWalletDetails] = useState<{
    AR: number | undefined | string;
    [x: string]: number | undefined | string;
  }>({
    AR: undefined,
    [ioTicker]: undefined,
  });
  const menuRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const [{ wallet, walletAddress }, dispatchWalletState] = useWalletState();

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
  }, [menuRef, showMenu, wallet, walletAddress]);

  function resetWalletDetails() {
    setWalletDetails({
      [ioTicker]: undefined,
      AR: undefined,
    });
  }

  async function fetchWalletDetails(walletAddress: ArweaveTransactionID) {
    const ioBalance = await queryClient.fetchQuery(
      buildIOBalanceQuery({
        address: walletAddress.toString(),
        arioContract,
        meta: [ioProcessId, aoNetwork.CU_URL],
      }),
    );
    const arBalance = await queryClient.fetchQuery(
      buildARBalanceQuery({
        address: walletAddress,
        provider: arweaveDataProvider,
        meta: [gateway],
      }),
    );
    const [formattedBalance, formattedIOBalance] = [arBalance, ioBalance].map(
      (balance: string | number) =>
        Intl.NumberFormat('en-US', {
          notation: 'compact',
          maximumFractionDigits: 2,
          compactDisplay: 'short',
        }).format(+balance),
    );
    setWalletDetails({
      AR: formattedBalance,
      [ioTicker]: formattedIOBalance,
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
      // reset state
      setShowMenu(false);
      dispatchWalletState({
        type: 'setWalletAddress',
        payload: undefined,
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
        arrow={{ arrowPointAtCenter: true }}
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
                          <span style={{ fontWeight: 400 }}>
                            {key} Balance:
                          </span>
                          {value ? (
                            <span className="white">{value}</span>
                          ) : (
                            <Loader
                              size={20}
                              wrapperStyle={{ margin: '0px' }}
                            />
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
                      <NavBarLink
                        path={'https://ar.io/test-io'}
                        linkText={'What are test tokens?'}
                        target={'_blank'}
                      />
                      {Object.entries(ROUTES).map(([key, route]) => {
                        if (!route.index && (!route.protected || walletAddress))
                          return (
                            <NavBarLink
                              path={route.path}
                              linkText={route.text}
                              target={route.external ? '_blank' : '_self'}
                              key={key}
                              onClick={() => {
                                setShowMenu(false);
                              }}
                            />
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
                      to={'https://ar.io/test-io'}
                      target={'_blank'}
                      className={'flex-row navbar-link hover'}
                      style={{
                        gap: '10px',
                        alignItems: 'center',
                        color: 'var(--text-white)',
                        fontSize: '14px',
                      }}
                    >
                      What are test tokens?
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
          className={walletAddress ? 'outline-button' : ''}
          style={
            walletAddress
              ? {
                  borderRadius: 'var(--corner-radius',
                  borderWidth: '1px',
                  padding: '10px',
                  borderColor: 'var(--text-faded)',
                  width: 'fit-content',
                  minWidth: 'unset',
                }
              : {}
          }
        >
          {walletAddress ? (
            <WalletAddress characterCount={4} />
          ) : (
            <MenuIcon
              width={'24px'}
              height={'24px'}
              fill={'var(--text-white)'}
            />
          )}
        </MenuButton>
      </Tooltip>
    </>
  );
}

export default NavMenuCard;
