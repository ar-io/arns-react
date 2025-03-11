import { useANTVersions } from '@src/hooks/useANTVersions';
import { Collapse, Space } from 'antd';
import ReactMarkdown from 'react-markdown';

import './styles.css';

const Panel = Collapse.Panel;

function ANTTools() {
  const { data: antVersions } = useANTVersions();
  return (
    <div className="flex" style={{ width: '100%' }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Collapse style={{ width: '100%' }} prefixCls="ario-collapse">
          <Panel
            header={
              <div className="flex" style={{ justifyContent: 'space-between' }}>
                <span>ANT Tools</span>
              </div>
            }
            key="1"
          >
            <div className="flex flex-col text-white">
              <h2 className="text-lg">ANT Versions</h2>
              {antVersions ? (
                <ReactMarkdown className="text-white bg-background rounded p-2">
                  {'```json\n' + JSON.stringify(antVersions, null, 2) + '\n```'}
                </ReactMarkdown>
              ) : (
                <></>
              )}
            </div>
          </Panel>
        </Collapse>
      </Space>
    </div>
  );
}

export default ANTTools;
