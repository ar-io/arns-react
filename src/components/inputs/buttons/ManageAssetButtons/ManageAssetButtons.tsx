import { useNavigate } from 'react-router-dom';

import { useIsMobile } from '../../../../hooks';
import { ArweaveTransactionID } from '../../../../types';
import { ManageTable } from '../../../../types';

function ManageAssetButtons({
  id,
  assetType,
  disabled = true,
}: {
  id: ArweaveTransactionID | string;
  assetType: ManageTable;
  disabled: boolean;
}) {
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  return (
    <>
      <div className="flex-row center" style={{ gap: '0.5em' }}>
        <button
          className="assets-see-more-button"
          onClick={() =>
            navigate(`/manage/${assetType}/${id.toString()}/undernames`)
          }
        >
          Undernames
        </button>
        {!isMobile ? (
          <button
            className="assets-manage-button"
            onClick={() => navigate(`/manage/${assetType}/${id.toString()}`)}
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