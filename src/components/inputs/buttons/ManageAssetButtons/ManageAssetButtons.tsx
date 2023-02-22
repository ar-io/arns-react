import { useIsMobile } from '../../../../hooks';
import { ArweaveTransactionID } from '../../../../types';
import { ASSET_TYPES } from '../../../../types';

function ManageAssetButtons({
  // eslint-disable-next-line
  asset,
  // eslint-disable-next-line
  assetType,
  setShowModal,
  disabled = true,
}: {
  asset: ArweaveTransactionID | string;
  assetType: ASSET_TYPES;
  setShowModal: (show: boolean) => void;
  disabled: boolean;
}) {
  const isMobile = useIsMobile();

  return (
    <>
      <div className="flex-row center" style={{ gap: '0.5em' }}>
        <button className="assets-see-more-button">Undernames</button>
        {!isMobile ? (
          <button
            className="assets-manage-button"
            onClick={() => setShowModal(true)}
            disabled={disabled}
          >
            Manage
          </button>
        ) : (
          <></>
        )}
      </div>
    </>
  );
}

export default ManageAssetButtons;
