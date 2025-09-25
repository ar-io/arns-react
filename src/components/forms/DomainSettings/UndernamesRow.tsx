import { Tooltip } from '@src/components/data-display';
import { NewspaperIcon } from '@src/components/icons';
import { lowerCaseDomain } from '@src/utils';
import { Skeleton } from 'antd';
import { Link } from 'react-router-dom';

import DomainSettingsRow from './DomainSettingsRow';

export default function UndernamesRow({
  undernameLimit,
  undernameSupport,
  domain,
}: {
  domain?: string;
  antId?: string;
  undernameLimit: number;
  undernameSupport: number;
}) {
  return (
    <DomainSettingsRow
      label="Undernames"
      labelTooltip={`
        Adding undernames to this ANT will affect resolution for all associated names.
      `}
      editable={!!domain && domain.length > 0}
      value={
        <span
          className="flex center"
          style={{
            justifyContent: 'flex-start',
            gap: '10px',
          }}
        >
          {`${
            undernameLimit ?? (
              <Skeleton.Input
                active
                style={{
                  backgroundColor: 'var(--card-bg)',
                  height: '16px',
                }}
              />
            )
          } / ${
            undernameSupport.toLocaleString() ?? (
              <Skeleton.Input
                active
                style={{
                  backgroundColor: 'var(--card-bg)',
                  height: '16px',
                }}
              />
            )
          }`}
          <NewspaperIcon
            width={'20px'}
            height={'20px'}
            fill="var(--text-grey)"
          />
        </span>
      }
      action={
        domain && domain.length > 0
          ? [
              <Tooltip
                key={1}
                message={'Increase undername support'}
                icon={
                  <Link
                    className={`p-2 px-[8px] text-[12px] rounded-[4px] bg-primary-thin hover:bg-primary border hover:border-primary border-primary-thin text-primary hover:text-black transition-all whitespace-nowrap`}
                    to={`/manage/names/${lowerCaseDomain(
                      domain || '',
                    )}/upgrade-undernames`}
                  >
                    Increase Undernames
                  </Link>
                }
              />,
            ]
          : []
      }
    />
  );
}
