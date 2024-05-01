import LeaseDuration from '@src/components/data-display/LeaseDuration';
import useDomainInfo from '@src/hooks/useDomainInfo';
import { formatExpiryDate, getUndernameCount } from '@src/utils';
import { List } from 'antd';

import ControllersRow from './ControllersRow';
import DomainSettingsRow from './DomainSettingsRow';
import NicknameRow from './NicknameRow';
import OwnerRow from './OwnerRow';
import TTLRow from './TTLRow';
import TargetIDRow from './TargetIDRow';
import TickerRow from './TickerRow';
import UndernamesRow from './UndernamesRow';
import './styles.css';

function DomainSettings({ domain }: { domain: string }) {
  const { data } = useDomainInfo(domain);

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
        <NicknameRow nickname={data?.antState.name} />
        <DomainSettingsRow
          label="Contract ID"
          value={data.arnsRecord.contractTxId}
        />
        <TargetIDRow targetId={data?.antState.records['@'].transactionId} />
        <TickerRow ticker={data.antState.ticker} />
        <ControllersRow controllers={data?.antState.controllers ?? []} />
        <OwnerRow owner={data?.antState.owner} />
        <TTLRow ttlSeconds={data?.antState.records['@'].ttlSeconds} />
        <UndernamesRow
          domain={domain}
          undernameCount={getUndernameCount(data.antState.records)}
          undernameSupport={data.arnsRecord.undernames}
        />
      </List>
    </>
  );
}

export default DomainSettings;
