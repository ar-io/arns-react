import LeaseDuration from '@src/components/data-display/LeaseDuration';
import useDomainInfo from '@src/hooks/useDomainInfo';
import { formatDate } from '@src/utils';
import { SECONDS_IN_GRACE_PERIOD } from '@src/utils/constants';
import { List, Skeleton } from 'antd';

import ControllersRow from './ControllersRow';
import DomainSettingsRow from './DomainSettingsRow';
import NicknameRow from './NicknameRow';
import TargetIDRow from './TargetIDRow';
import TickerRow from './TickerRow';
import './styles.css';

function DomainSettings({ domain }: { domain: string }) {
  const { data } = useDomainInfo(domain);

  function formatExpiryDate(endTimestamp?: number) {
    if (!endTimestamp) {
      return <Skeleton.Input active />;
    }
    return (
      <span
        style={{
          color:
            endTimestamp * 1000 > Date.now()
              ? 'var(--success-green)'
              : endTimestamp * 1000 + SECONDS_IN_GRACE_PERIOD * 1000 <
                Date.now()
              ? 'var(--accent)'
              : 'var(--error-red)',
        }}
      >
        {formatDate(endTimestamp * 1000)}
      </span>
    );
  }

  return (
    <>
      <List prefixCls="domain-settings-list">
        <DomainSettingsRow
          label="Expiry Date"
          value={formatExpiryDate(data?.arnsRecord.endTimestamp)}
        />
        <DomainSettingsRow
          label="Lease Duration"
          value={
            <LeaseDuration
              startTimestamp={data?.arnsRecord.startTimestamp}
              endTimestamp={data?.arnsRecord.endTimestamp}
            />
          }
        />
        <DomainSettingsRow label="Associated Names" value={'N/A'} />
        <DomainSettingsRow label="Status" value={'N/A'} />
        <NicknameRow nickname={data?.arnsRecord.nickname ?? 'N/A'} />
        <DomainSettingsRow label="Contract ID" value={'N/A'} />
        <TargetIDRow targetId={'N/A'} />
        <TickerRow ticker={'N/A'} />
        <ControllersRow controllers={data?.arnsRecord.controllers ?? []} />
      </List>
    </>
  );
}

export default DomainSettings;
