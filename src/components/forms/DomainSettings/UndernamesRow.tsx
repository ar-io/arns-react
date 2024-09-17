import { NewspaperIcon } from '@src/components/icons';
import { lowerCaseDomain } from '@src/utils';
import { Skeleton } from 'antd';
import { useNavigate } from 'react-router-dom';

import DomainSettingsRow from './DomainSettingsRow';

export default function UndernamesRow({
  domain,
  antId,
  undernameLimit,
  undernameSupport,
}: {
  domain?: string;
  antId?: string;
  undernameLimit: number;
  undernameSupport: number;
}) {
  const navigate = useNavigate();
  return (
    <DomainSettingsRow
      label="Undernames:"
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
              <Skeleton.Input active style={{ width: '100%' }} />
            )
          } / ${
            undernameSupport.toLocaleString() ?? (
              <Skeleton.Input active style={{ width: '100%' }} />
            )
          }`}
          <NewspaperIcon
            width={'20px'}
            height={'20px'}
            fill="var(--text-grey)"
          />
        </span>
      }
      action={[
        <button
          key={1}
          className="flex flex-row justify-center whitespace-nowrap items-center px-2 py-[3px] rounded-[4px] border border-dark-grey hover:border-white text-grey hover:text-white transition-all"
          onClick={() =>
            navigate(
              `/manage/names/${
                domain ? lowerCaseDomain(domain) : antId
              }/undernames`,
            )
          }
        >
          Manage Undernames
        </button>,
      ]}
    />
  );
}
