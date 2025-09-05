import { NewspaperIcon } from '@src/components/icons';
import { Skeleton } from 'antd';

import DomainSettingsRow from './DomainSettingsRow';

export default function UndernamesRow({
  undernameLimit,
  undernameSupport,
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
      editable={true}
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
    />
  );
}
