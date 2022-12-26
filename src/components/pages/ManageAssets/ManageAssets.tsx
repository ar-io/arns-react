import { useEffect, useState } from 'react';

import { CodeSandboxIcon, NotebookIcon } from '../../icons';
import { AntTable, NameTable } from '../../layout/tables';
import './styles.css';

function ManageAssets() {
  const [tableType, setTableType] = useState('ant'); // ant or name

  return (
    <div className="page">
      <div className="flex-column">
        <div className="table-selector-group">
          <button
            className="table-selector text bold center"
            onClick={() => setTableType('name')}
            style={
              tableType === 'name'
                ? {
                    borderColor: 'var(--text-white)',
                    color: 'var(--text-white)',
                    fill: 'var(--text-white)',
                  }
                : {}
            }
          >
            <NotebookIcon width={'20px'} height="20px" />
            Domains
          </button>
          <button
            className="table-selector text bold center"
            onClick={() => setTableType('ant')}
            style={
              tableType === 'ant'
                ? {
                    borderColor: 'var(--text-white)',
                    color: 'var(--text-white)',
                    fill: 'var(--text-white)',
                  }
                : {}
            }
          >
            <CodeSandboxIcon width={'20px'} height="20px" />
            ANTs
          </button>
        </div>

        {tableType === 'name' ? <NameTable /> : <></>}
        {tableType === 'ant' ? <AntTable /> : <></>}
      </div>
    </div>
  );
}

export default ManageAssets;
