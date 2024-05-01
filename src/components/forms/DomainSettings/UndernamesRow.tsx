import { NewspaperIcon, VerticalDotMenuIcon } from '@src/components/icons';
import { UNDERNAME_TABLE_ACTIONS } from '@src/types';
import { Skeleton, Tooltip } from 'antd';
import { useNavigate } from 'react-router-dom';

import DomainSettingsRow from './DomainSettingsRow';

export default function UndernamesRow({
  domain,
  undernameCount,
  undernameSupport,
}: {
  domain?: string;
  undernameCount: number;
  undernameSupport: number;
}) {
  const navigate = useNavigate();
  return (
    <>
      <DomainSettingsRow
        label="Undernames:"
        value={
          domain ? (
            <span
              className="flex center"
              style={{
                justifyContent: 'flex-start',
                gap: '10px',
              }}
            >
              {`${undernameCount} / ${undernameSupport.toLocaleString()}`}
              <NewspaperIcon
                width={'20px'}
                height={'20px'}
                fill="var(--text-grey)"
              />
            </span>
          ) : (
            <Skeleton.Input active />
          )
        }
        action={[
          <Tooltip
            key={1}
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
                  onClick={() => navigate(`/manage/names/${domain}/undernames`)}
                >
                  Manage
                </button>

                <button
                  className="flex flex-right white pointer button"
                  onClick={() => {
                    const params = new URLSearchParams({
                      modal: UNDERNAME_TABLE_ACTIONS.CREATE,
                    });
                    navigate(
                      encodeURI(
                        `/manage/names/${domain}/undernames?${params.toString()}`,
                      ),
                    );
                  }}
                >
                  Add Undername
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
