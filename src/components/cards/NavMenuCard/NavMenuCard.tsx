import { Tooltip } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  useArweaveCompositeProvider,
  useIsMobile,
  useWalletAddress,
} from '../../../hooks';
import { useGlobalState } from '../../../state/contexts/GlobalState';
import { ArweaveTransactionID } from '../../../types';
import eventEmitter from '../../../utils/events';
import { ROUTES } from '../../../utils/routes';
import { LogoutIcon, MenuIcon } from '../../icons';
import ConnectButton from '../../inputs/buttons/ConnectButton/ConnectButton';
import MenuButton from '../../inputs/buttons/MenuButton/MenuButton';
import { Loader, NavBarLink } from '../../layout';
import ArweaveID, { ArweaveIdTypes } from '../../layout/ArweaveID/ArweaveID';
import { WalletAddress } from '../../layout/WalletAddress/WalletAddress';
import './styles.css';

function NavMenuCard() {
  const arweaveDataProvider = useArweaveCompositeProvider();
  const [{ pdnsContractId }, dispatchGlobalState] = useGlobalState(); // eslint-disable-line
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [walletDetails, setWalletDetails] = useState<{
    AR: number | undefined | string;
    IO: number | undefined | string;
  }>({
    AR: undefined,
    IO: undefined,
  });
  const menuRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const { wallet, walletAddress } = useWalletAddress();

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
      IO: undefined,
      AR: undefined,
    });
  }

  async function fetchWalletDetails(walletAddress: ArweaveTransactionID) {
    const ioBalance = await arweaveDataProvider.getContractBalanceForWallet(
      pdnsContractId,
      walletAddress,
    );
    const arBalance = await arweaveDataProvider.getArBalance(walletAddress);
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
      IO: formattedIOBalance,
    });
  }

  function handleClickOutside(e: any) {
    e.preventDefault();
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
      await wallet?.disconnect();
      // reset state
      setShowMenu(false);
      dispatchGlobalState({
        type: 'setWallet',
        payload: undefined,
      });
    } catch (error: any) {
      eventEmitter.emit('error', error);
    } finally {
      navigate('/');
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
                            // TODO: add error icon with hover for error details
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
