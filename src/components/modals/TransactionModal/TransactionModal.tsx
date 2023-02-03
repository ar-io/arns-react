import { useEffect, useState } from 'react';

import { useArweave, useIsMobile, useWalletAddress } from '../../../hooks';
import { ArweaveCompositeDataProvider } from '../../../services/arweave/ArweaveCompositeDataProvider';
import { useGlobalState } from '../../../state/contexts/GlobalState';
import {
  ANTContractState,
  ANT_INTERACTION_TYPES,
  ASSET_TYPES,
  AntMetadata,
  ArweaveTransactionID,
  TRANSACTION_TYPES,
} from '../../../types';
import { AlertTriangleIcon, CloseIcon } from '../../icons';
import Dropdown from '../../inputs/Dropdown/Dropdown';
import CopyTextButton from '../../inputs/buttons/CopyTextButton/CopyTextButton';
import './styles.css';

function TransactionModal({
  transactionType,
  interactionType,
  contractId,
  showAdvanced = false,
  updateSmartweaveFavorites = false,
  state,
  showModal,
}: {
  // main control for how the modal is build
  transactionType: TRANSACTION_TYPES;
  interactionType?: ANT_INTERACTION_TYPES;
  //
  state?: AntMetadata;
  //
  contractId?: ArweaveTransactionID; // contract ID if asset type is a contract interaction
  showAdvanced?: boolean; // allow advanced settings ( data uploading, custom tags, ar transfer)
  updateSmartweaveFavorites?: boolean; // saves smartweave asset to Smartweave Favorites contract
  showModal: () => void;
}) {
  // const [{preferences}] = useArweaveTransactionState() // arweave transaction provider states
  const [{ arnsSourceContract, arnsContractId, arweaveDataProvider }] =
    useGlobalState();
  const { wallet, walletAddress } = useWalletAddress();
  const isMobile = useIsMobile();
  const [addreses, setAddresses] = useState<{ [x: string]: string }>();
  const [accepted, setAccepted] = useState<boolean>(false);

  useEffect(() => {
    getAddresses();
  }, []);

  async function getAddresses() {
    const addreses = await window.arweaveWallet.getWalletNames();
    setAddresses(addreses);
  }

  function getAssociatedNames(txId: ArweaveTransactionID) {
    return Object.entries(arnsSourceContract.records)
      .map(([name, id]) => {
        if (id === txId.toString()) return name;
      })
      .filter((n) => !!n);
  }

  return (
    <>
      <div
        className="modal-container"
        style={isMobile ? { padding: 'none' } : {}}
      >
        {/**modal header */}
        <div
          className="flex flex-column card"
          style={
            isMobile
              ? {
                  width: '95%',
                  maxWidth: 'none',
                  height: '95%',
                  padding: 0,
                  boxSizing: 'border-box',
                  gap: '1em',
                }
              : {
                  width: 400,
                  minHeight: 200,
                  padding: 0,
                  paddingBottom: 15,
                  gap: '1em',
                }
          }
        >
          <div
            className="flex flex-column flex-space-between"
            style={{
              borderBottom: '2px rgb(0,0,0,.2) solid',
              padding: 15,
              boxSizing: 'border-box',
              marginTop: 5,
              gap: '.5em',
              position: 'relative',
            }}
          >
            <span className="text-medium white bold">
              {interactionType}&nbsp;:&nbsp;{state?.state.ticker}
            </span>
            <span className="flex faded text" style={{ alignItems: 'center' }}>
              Contract ID:&nbsp;
              <CopyTextButton
                copyText={contractId ? contractId.toString() : ''}
                displayText={`${contractId!
                  .toString()
                  .slice(0, isMobile ? 6 : 15)}...${contractId!
                  .toString()
                  .slice(isMobile ? -6 : -15)}`}
                size={25}
                wrapperStyle={{
                  fontStyle: 'bold',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                position="relative"
              />
            </span>
            <button className="modal-close-button" onClick={() => showModal()}>
              <CloseIcon
                width="20px"
                height={'20px'}
                fill="var(--text-white)"
              />
            </button>
          </div>
          {/** modal body - condition render edit or transfer */}
          {interactionType === ANT_INTERACTION_TYPES.TRANSFER ? (
            <div
              className="flex flex-column"
              style={{
                width: '90%',
                height: '100%',
                gap: '1em',
              }}
            >
              {/*                        todo: show 'transfer between accounts' option     
                         {addreses ? <span className="flex flex-column white text">{Object.entries(addreses).map(([address, name])=> <span>{`${name} : ${address}`}</span>)}</span> : <></>}

                         */}
              <input
                className="data-input center"
                type="text"
                placeholder="Enter recipients address"
              />
              {getAssociatedNames(contractId!).length ? (
                <span
                  className="flex flex-row"
                  style={{
                    gap: 10,
                    alignItems: 'flex-start',
                  }}
                >
                  <AlertTriangleIcon
                    width={20}
                    height={20}
                    fill={'var(--accent)'}
                  />
                  <span
                    className="text faded"
                    style={{ textAlign: 'left', width: '90%' }}
                  >
                    This ANT has{' '}
                    {`${getAssociatedNames(contractId!).length} name(s)`} that
                    are associated with it. By transferring this ANT, you will
                    also be transferring control of those names to the new ANT
                    holder.
                  </span>
                </span>
              ) : (
                <></>
              )}
            </div>
          ) : (
            <></>
          )}

          {/** abstract the modal functions as much as possible.  */}
          <div className="flex flex-column center" style={{ width: '90%' }}>
            <span
              className="flex flex-row text white"
              style={{
                gap: 10,
                alignItems: 'center',
              }}
            >
              <input
                type="checkbox"
                className="accept-terms"
                checked={accepted}
                onClick={() => setAccepted(!accepted)}
              />
              I understand that this action cannot be undone.
            </span>
            <button
              className="accent-button center"
              disabled={!accepted}
              style={
                accepted
                  ? { width: '100%' }
                  : { width: '100%', backgroundColor: 'var(--text-faded)' }
              }
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default TransactionModal;
