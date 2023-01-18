import { useState } from 'react';

import { useIsMobile } from '../../../../hooks';
import { ASSET_TYPES, ArweaveTransactionId } from '../../../../types';

function ManageAssetButtons({
  // eslint-disable-next-line
  asset,
  assetType,
}: {
  asset: ArweaveTransactionId | string;
  assetType: ASSET_TYPES;
}) {
  const [showModal, setShowModal] = useState(false);
  const isMobile = useIsMobile();

  return (
    <>
      <div
        className="flex-row center"
        style={{ gap: '.5em', width: 'fit-content' }}
      >
        <button
          className="assets-see-more-button center hover"
          onClick={() => setShowModal(true)}
        >
          See More
        </button>

        {!isMobile ? (
          <button className="assets-manage-button center hover">Manage</button>
        ) : (
          <></>
        )}
      </div>
      {showModal ? (
        assetType == ASSET_TYPES.ANT ? (
          <></>
        ) : assetType == ASSET_TYPES.NAME ? (
          <></>
        ) : (
          <></>
        )
      ) : (
        <></>
      )}
    </>
  );
}

export default ManageAssetButtons;
