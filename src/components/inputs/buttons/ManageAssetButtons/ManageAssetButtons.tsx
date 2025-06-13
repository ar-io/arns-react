import { useNavigate } from 'react-router-dom';

import { ArweaveTransactionID } from '../../../../services/arweave/ArweaveTransactionID';
import { ManageTable } from '../../../../types';
import { Tooltip } from '../../../data-display';
import { SettingsIcon } from '../../../icons';

function ManageAssetButtons({
  id,
  assetType,
  disabled = true,
}: {
  id: ArweaveTransactionID | string;
  assetType: ManageTable;
  disabled: boolean;
}) {
  const navigate = useNavigate();

  return (
    <>
      <div className="flex flex-row justify-end gap-2">
        <Tooltip message="Manage">
          <button
            className="outline-button"
            onClick={() => navigate(`/manage/${assetType}/${id.toString()}`)}
            disabled={disabled}
            style={{
              border: 'none',
              padding: '0px',
              minWidth: '0px',
              width: 'fit-content',
            }}
          >
            <SettingsIcon width={'20px'} height={'20px'} fill="inherit" />
          </button>
        </Tooltip>
      </div>
    </>
  );
}

export default ManageAssetButtons;
