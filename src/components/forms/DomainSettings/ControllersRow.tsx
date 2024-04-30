import { VerticalDotMenuIcon } from '@src/components/icons';
import { Tooltip } from 'antd';

import DomainSettingsRow from './DomainSettingsRow';

export default function ControllersRow({
  controllers,
}: {
  controllers: string[];
}) {
  async function add() {}
  async function remove() {}
  return (
    <>
      <DomainSettingsRow
        label="Controllers(s):"
        value={controllers.join(', ')}
        action={[
          <Tooltip
            key={1}
            open={undefined}
            placement="bottomRight"
            color="var(--card-bg)"
            autoAdjustOverflow
            arrow={false}
            overlayInnerStyle={{
              width: 'fit-content',
              border: '1px solid var(--text-faded)',
              padding: '9px 12px',
            }}
            overlayStyle={{ width: 'fit-content' }}
            trigger={'click'}
            title={
              <div className="flex-column flex" style={{ gap: '10px' }}>
                <button
                  className="flex flex-right white pointer button"
                  onClick={() => add()}
                >
                  Add Controller
                </button>
                <button
                  className="flex flex-right white pointer button"
                  onClick={() => remove()}
                >
                  Remove Controller
                </button>
              </div>
            }
          >
            <VerticalDotMenuIcon
              width={'18px'}
              height={'18px'}
              fill="var(--text-grey)"
              className="pointer"
            />
          </Tooltip>,
        ]}
      />
    </>
  );
}
