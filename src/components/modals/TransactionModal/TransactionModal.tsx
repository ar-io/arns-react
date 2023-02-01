import { useArweave, useIsMobile, useWalletAddress } from '../../../hooks';
import { useGlobalState } from '../../../state/contexts/GlobalState';
import {
  ASSET_TYPES,
  ArweaveTransactionID,
  CONTRACT_INTERACTION_TYPES,
  TRANSACTION_TYPES,
} from '../../../types';
import { SettingsIcon } from '../../icons';

function TransactionModal({
  transactionType,
  assetType,
  interactionType,
  contractId,
  showAdvanced = false,
  updateSmartweaveFavorites = false,
}: {
  // main control for how the modal is build
  transactionType: TRANSACTION_TYPES;
  assetType: ASSET_TYPES;
  interactionType?: CONTRACT_INTERACTION_TYPES;
  //
  contractId?: ArweaveTransactionID; // contract ID if asset type is a contract interaction
  showAdvanced: boolean; // allow advanced settings ( data uploading, custom tags, ar transfer)
  updateSmartweaveFavorites: boolean; // saves smartweave asset to Smartweave Favorites contract
}) {
  // const [{preferences}] = useArweaveTransactionState() // arweave transaction provider states
  const [{ arnsContractId }] = useGlobalState();
  const { wallet, walletAddress } = useWalletAddress();
  const isMobile = useIsMobile();

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
                }
              : {
                  width: 400,
                  minHeight: 400,
                  height: 'fit-content',
                  padding: 0,
                }
          }
        >
          <div
            className="flex flex-row flex-space-between"
            style={{
              borderBottom: '2px rgb(0,0,0,.2) solid',
              padding: 20,
              boxSizing: 'border-box',
              position: 'relative',
            }}
          >
            <span className="text-small white bold">
              {transactionType}&nbsp;:&nbsp;{interactionType}&nbsp;{assetType}
            </span>

            <button
              className="button hover"
              style={{
                position: 'absolute',
                top: 10,
                right: 10,
              }}
            >
              <SettingsIcon fill="white" width={20} height={20} />
            </button>
          </div>
          {/** modal controls */}
          {/** abstract the modal functions as much as possible.  */}
        </div>
      </div>
    </>
  );
}

export default TransactionModal;
