import { useIsMobile } from '../../../../hooks';
import { ArweaveTransactionID } from '../../../../types';
import { ASSET_TYPES } from '../../../../types';

function ManageAssetButtons({
  // eslint-disable-next-line
  asset,
  // eslint-disable-next-line
  assetType,
  setShowModal,
}: {
  asset: ArweaveTransactionID | string;
  assetType: ASSET_TYPES;
  setShowModal: (show: boolean) => void;
}) {
  const isMobile = useIsMobile();

  return (
    <>
      <div
        className="flex-row center"
        style={{ gap: '.5em', width: 'fit-content' }}
      >
        <button className="assets-see-more-button center hover">
          See More
        </button>

        {!isMobile ? (
          <button
            className="assets-manage-button center hover"
            onClick={() => setShowModal(true)}
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
