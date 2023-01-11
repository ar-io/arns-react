import { useState } from 'react';

import { useIsMobile } from '../../../../hooks';
import { ArweaveTransactionId } from '../../../../types';

function ManageAssetButtons({
  asset,
  assetType,
}: {
  asset: ArweaveTransactionId | string;
  assetType: 'ant' | 'undername' | 'name';
}) {
  const [showModal, setShowModal] = useState(false);
  const isMobile = useIsMobile();

  return (
    <>
      <div className="flex-row center" style={{ gap: '.5em' }}>
        <button
          className="assets-see-more-button center"
          onClick={() => setShowModal(true)}
        >
          See More
        </button>

        {!isMobile ? (
          <button className="assets-manage-button center">Manage</button>
        ) : (
          <></>
        )}
      </div>
      {showModal ? (
        assetType == 'ant' ? (
          <></>
        ) : assetType == 'name' ? (
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
