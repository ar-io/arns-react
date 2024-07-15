import { ArrowLeft, ChevronDownIcon } from '@src/components/icons';
import { Collapse, Space } from 'antd';
import { ReactNode, useState } from 'react';

import './styles.css';

const Panel = Collapse.Panel;

function Accordian({
  children,
  title,
}: {
  children: ReactNode;
  title: ReactNode;
}) {
  const [activeKey, setActiveKey] = useState('1');
  return (
    <>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Collapse
          style={{ width: '100%' }}
          prefixCls="ario-accordian"
          onChange={(c) => setActiveKey(c[0])}
          activeKey={activeKey}
        >
          <Panel
            showArrow={false}
            header={
              <div className="flex flex-row center">
                <div style={{ position: 'relative' }}>
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

export default Accordian;
