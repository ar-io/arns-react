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
          className="p-[6px] px-[10px] text-[12px] rounded-[4px] bg-primary-thin hover:bg-primary border hover:border-primary border-primary-thin text-primary hover:text-black transition-all"
          onClick={() =>
            navigate(
              `/manage/names/${
                domain ? lowerCaseDomain(domain) : antId
              }/undernames`,
            )
          }
        >
          Manage
        </button>,
      ]}
    />
  );
}
