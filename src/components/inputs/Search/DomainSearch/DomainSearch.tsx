import { AoArNSNameData, ArNSReservedNameData } from '@ar.io/sdk';
import { useGlobalState } from '@src/state/contexts/GlobalState';
import { lowerCaseDomain } from '@src/utils';
import eventEmitter from '@src/utils/events';
import { Input } from 'antd';
import { useState } from 'react';

import './styles.css';

const { Search } = Input;

export type RegistrationStatus = 'available' | 'reserved' | 'unavailable';
function DomainSearch({
  domainCb,
  registrationCb,
}: {
  domainCb: (domain: string) => void;
  registrationCb: (p: {
    status: RegistrationStatus;
    record?: AoArNSNameData | ArNSReservedNameData;
  }) => void;
}) {
  // global hooks
  const [{ arioContract }] = useGlobalState();
  // internal hooks
  const [loading, setLoading] = useState(false);
  const [domain, setDomain] = useState('');

  async function onSubmit(domain: string) {
    try {
      setLoading(true);
      const name = lowerCaseDomain(domain.trim());
      const [record, reserved] = await Promise.all([
        arioContract.getArNSRecord({
          name,
        }),
        arioContract.getArNSReservedName({
          name,
        }),
      ]);

      registrationCb({
        status: record ? 'unavailable' : reserved ? 'reserved' : 'available',
        record: record || reserved,
      });
    } catch (error) {
      eventEmitter.emit('error', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Search
      inputPrefixCls="domain-search-input"
      prefixCls="domain-search"
      placeholder="Search for a name"
      loading={loading}
      enterButton
      value={domain}
      onChange={(e) => {
        setDomain(e.target.value.trim());
        domainCb(e.target.value.trim());
      }}
      onSearch={onSubmit}
    />
  );
}

export default DomainSearch;
