import { ChevronDownIcon } from '@src/components/icons';
import { Collapse, Space } from 'antd';
import { ReactNode, useState } from 'react';

import './styles.css';

const Panel = Collapse.Panel;

function Accordion({
  children,
  title,
  bordered = false,
}: {
  children: ReactNode;
  title: ReactNode;
  bordered?: boolean;
}) {
  const [activeKey, setActiveKey] = useState<string>();
  return (
    <>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Collapse
          style={{ width: '100%' }}
          prefixCls="ario-Accordion"
          onChange={(c) => setActiveKey(c[0])}
          activeKey={activeKey}
          bordered={bordered}
        >
          <Panel
            showArrow={false}
            header={
              <div className="flex flex-row center">
                <div
                  className="flex flex-row center"
                  style={{ position: 'relative', width: 'fit-content' }}
                >
                  {title}{' '}
                  <ChevronDownIcon
                    width={'12px'}
                    fill={'var(--text-white)'}
                    style={{
                      position: 'absolute',
                      right: '-30px',
                      rotate: !activeKey ? '-90deg' : '0deg',
                    }}
                  />
                </div>
              </div>
            }
            key="1"
          >
            {children}
          </Panel>
        </Collapse>
      </Space>
    </>
  );
}

export default Accordion;
