import LeaseDuration from '@src/components/data-display/LeaseDuration';
import useDomainInfo from '@src/hooks/useDomainInfo';
import { formatDate } from '@src/utils';
import { SECONDS_IN_GRACE_PERIOD } from '@src/utils/constants';
import eventEmitter from '@src/utils/events';
import { ConfigProvider, List, Skeleton } from 'antd';
import { useEffect } from 'react';

import DomainSettingsRow from './DomainSettingsRow';

function DomainSettings({ domain }: { domain: string }) {
  const { data, error } = useDomainInfo(domain);

  useEffect(() => {
    eventEmitter.emit('error', error);
  }, [error]);

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
      <ConfigProvider
        theme={{
          components: {
            List: {
              contentWidth: 0,
              colorText: 'var(--text-faded)',
            },
          },
        }}
      >
        <List
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
          }}
        >
          <DomainSettingsRow
            label="Lease Duration"
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
        </List>
      </ConfigProvider>
    </>
  );
}

export default DomainSettings;
