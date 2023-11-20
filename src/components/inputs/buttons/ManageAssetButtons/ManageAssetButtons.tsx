import { Tooltip } from 'antd';
import { useNavigate } from 'react-router-dom';

import { ArweaveTransactionID } from '../../../../services/arweave/ArweaveTransactionID';
import { ManageTable } from '../../../../types';
import { SettingsIcon } from '../../../icons';
import './styles.css';

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
      <div className="flex-row center" style={{ gap: '0.5em' }}>
        <button
          className={
            disabled
              ? 'assets-see-more-button disabled-button'
              : 'assets-see-more-button center'
          }
          disabled={disabled}
          onClick={() =>
            navigate(`/manage/${assetType}/${id.toString()}/undernames`)
          }
          style={{
            padding: '8px 12px',
            textAlign: 'center',
            width: 'fit-content',
            height: 'fit-content',
          }}
        >
          Undernames
        </button>
        <Tooltip
          title="Manage"
          placement={'top'}
          autoAdjustOverflow={true}
          color="var(--text-faded)"
          className="manage-asset-button-tooltip"
        >
          <button
            className="outline-button manage-button"
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
