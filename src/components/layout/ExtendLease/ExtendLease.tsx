import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useGlobalState } from '../../../state/contexts/GlobalState';
import { PDNSRecordEntry, TRANSACTION_TYPES } from '../../../types';
import {
  getLeaseDurationFromEndTimestamp,
  lowerCaseDomain,
} from '../../../utils';
import { YEAR_IN_MILLISECONDS } from '../../../utils/constants';
import { InfoIcon } from '../../icons';
import PageLoader from '../progress/PageLoader/PageLoader';

function ExtendLease() {
  const [{ pdnsSourceContract }, dispatchGlobalState] = useGlobalState();
  const location = useLocation();
  const navigate = useNavigate();
  const name = location.pathname.split('/').at(-2);
  const [record, setRecord] = useState<PDNSRecordEntry>();
  const [registrationType, setRegistrationType] = useState<TRANSACTION_TYPES>();
  const [newLeaseDuration, setNewLeaseDuration] = useState<number>(1);

  useEffect(() => {
    if (!name) {
      navigate(-1);
      return;
    }
    const domainRecord = pdnsSourceContract.records[lowerCaseDomain(name)];
    if (!record) {
      return;
    }
    setRecord(domainRecord);
    dispatchGlobalState({
      type: 'setNavItems',
      payload: [
        {
          name: 'Manage Assets',
          route: '/manage/names',
        },
        {
          name: `${name}`,
          route: `/manage/names/${name}`,
        },
        {
          name: 'Extend Lease',
          route: location.pathname,
        },
      ],
    });

    if (!domainRecord.endTimestamp) {
      setRegistrationType(TRANSACTION_TYPES.BUY);
      return;
    }

    handleLeaseDuration(
      domainRecord.endTimestamp * 1000,
      newLeaseDuration * YEAR_IN_MILLISECONDS,
    );
  }, [name]);

  /**
   * @param currentDuration timestamp in milliseconds
   * @param addedDuration timestamp in milliseconds
   */
  function handleLeaseDuration(currentDuration: number, addedDuration: number) {
    const isExpired = currentDuration < Date.now();

    const yearsRemaining = isExpired
      ? 0
      : Math.round(
          // round up to nearest year. Year must be fully expired to be considered expired, hence the half year addition to ensure that
          (currentDuration - Date.now() + YEAR_IN_MILLISECONDS / 2) /
            YEAR_IN_MILLISECONDS,
        );
  }

  if (!record) {
    return <PageLoader loading={!record} />;
  }

  return (
    <div className="page center">
      <div className="flex flex-column">
        <div
          className="flex flex-row center"
          style={{ justifyContent: 'space-between' }}
        >
          <h1 className="white">Extend Lease</h1>

          <div
            className="flex flex-row center white"
            style={{
              border: 'solid 1px var(--text-faded)',
              borderRadius: 'var(--corner-radius)',
              gap: '8px',
            }}
          >
            <InfoIcon width={'16px'} height={'16px'} fill="var(--text-grey)" />
            Expiring on {}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExtendLease;
