import { isLeasedArNSRecord } from '@ar.io/sdk/web';
import { useANT } from '@src/hooks/useANT/useANT';
import { PERMANENT_DOMAIN_MESSAGE } from '@src/utils/constants';
import { Descriptions } from 'antd';
import { startCase } from 'lodash';
import { isValidElement, useEffect, useState } from 'react';

import { useIsMobile } from '../../../hooks';
import { ArweaveTransactionID } from '../../../services/arweave/ArweaveTransactionID';
import { ARNSMapping } from '../../../types';
import {
  decodeDomainToASCII,
  formatDate,
  getLeaseDurationFromEndTimestamp,
  isArweaveTransactionID,
} from '../../../utils';
import eventEmitter from '../../../utils/events';
import { Loader } from '../../layout';
import ArweaveID, { ArweaveIdTypes } from '../../layout/ArweaveID/ArweaveID';
import './styles.css';

export const ANT_TRANSACTION_DETAILS = {
  deployedTransactionId: 'Transaction ID',
  processId: 'Process ID',
};
export const ARNS_METADATA_DETAILS = {
  domain: 'Domain',
  leaseDuration: 'Lease Duration',
  maxUndernames: 'Undernames',
};
export const ANT_MAIN_DETAILS = {
  name: 'Nickname',
  ticker: 'Ticker',
  owner: 'Owner',
  controllers: 'Controller(s)',
};

export const ANT_METADATA_DETAILS = {
  targetId: 'Target ID',
  ttlSeconds: 'TTL Seconds',
};

export const ANT_DETAIL_MAPPINGS = {
  ...ANT_TRANSACTION_DETAILS,
  ...ARNS_METADATA_DETAILS,
  ...ANT_MAIN_DETAILS,
  ...ANT_METADATA_DETAILS,
} as const;

export type AntDetailKey = keyof typeof ANT_DETAIL_MAPPINGS;

export function mapKeyToAttribute(key: AntDetailKey) {
  if (ANT_DETAIL_MAPPINGS[key]) {
    return ANT_DETAIL_MAPPINGS[key];
  }
  return startCase(key);
}

export const DEFAULT_PRIMARY_KEYS: Partial<AntDetailKey>[] = [
  'processId',
  'domain',
  'leaseDuration',
  'name',
  'ticker',
  'owner',
];

function ANTCard({
  processId,
  domain,
  record,
  compact = true,
  overrides,
  hover,
  disabledKeys,
  deployedTransactionId,
  mobileView,
  bordered = false,
  state,
  primaryDefaultKeys = DEFAULT_PRIMARY_KEYS,
}: ARNSMapping) {
  const isMobile = useIsMobile();
  const [antDetails, setANTDetails] = useState<{ [x: string]: any }>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const {
    loading,
    owner,
    ticker,
    name,
    controllers = [],
    records,
  } = {
    ...useANT(processId.toString()),
    ...(processId.toString() === 'atomic' ? state : {}),
  };

  const [limitDetails, setLimitDetails] = useState<boolean>(true);
  const mappedKeys = primaryDefaultKeys.map((key: AntDetailKey) =>
    mapKeyToAttribute(key),
  );

  useEffect(() => {
    setDetails();
  }, [processId, loading, owner]);

  async function setDetails() {
    try {
      setIsLoading(true);
      let leaseDuration = 'N/A';
      if (record) {
        leaseDuration = isLeasedArNSRecord(record)
          ? record.endTimestamp.toString()
          : PERMANENT_DOMAIN_MESSAGE;
      }

      const apexRecord = records ? records['@'] : undefined;

      const allANTDetails: Record<AntDetailKey, any> = {
        deployedTransactionId: deployedTransactionId
          ? deployedTransactionId.toString()
          : undefined,
        processId: processId?.toString() ?? 'N/A',
        domain: decodeDomainToASCII(domain),
        // TODO: add the # of associated names that point to this ANT
        leaseDuration: leaseDuration,
        // TODO: undernames are associated with the record, not the ANT - how do we want to represent this
        maxUndernames: 'Up to ' + record?.undernameLimit,
        name: decodeDomainToASCII(name ?? 'N/A'),
        ticker: decodeDomainToASCII(ticker ?? 'N/A'),
        owner,
        controllers: controllers.join(', '),
        targetId: apexRecord?.transactionId ?? 'N/A',
        ttlSeconds: apexRecord?.ttlSeconds ?? 'N/A',
        ...overrides,
      };

      const filteredANTDetails = Object.keys(allANTDetails).reduce(
        (obj: { [x: string]: any }, key: string) => {
          const value = allANTDetails[key as AntDetailKey];
          if (!disabledKeys?.includes(key)) {
            if (typeof value === 'object' && !isValidElement(value)) {
              return obj;
            }
            obj[key] = value;
          }
          return obj;
        },
        {},
      );

      const replacedKeys = Object.keys(filteredANTDetails).reduce(
        (obj: any, key: string) => {
          const value = allANTDetails[key as AntDetailKey];
          if (typeof value === 'object' && !isValidElement(value)) {
            return obj;
          }
          obj[mapKeyToAttribute(key as AntDetailKey)] = value;
          return obj;
        },
        {},
      );
      setLimitDetails(compact);
      setANTDetails(replacedKeys);
    } catch (error) {
      eventEmitter.emit('error', error);
      setANTDetails(undefined);
    } finally {
      setIsLoading(false);
    }
  }

  function showMore() {
    setLimitDetails(!limitDetails);
  }

  function handleLinkType(key: string) {
    if (key === 'Controller(s)' || key === 'Owner' || key === 'New Owner') {
      return ArweaveIdTypes.ADDRESS;
    } else if (key === 'Process ID') {
      return ArweaveIdTypes.CONTRACT;
    } else if (key === 'Target ID') {
      return ArweaveIdTypes.TRANSACTION;
    }
    return ArweaveIdTypes.INTERACTION;
  }

  if (isLoading || loading) {
    return <Loader size={80} />;
  }

  if (!antDetails) {
    return <span className="section-header">Uh oh. Something went wrong.</span>;
  }

  return (
    <div
      className={
        hover ? 'flex flex-column hover fade-in' : 'flex flex-column fade-in'
      }
      style={{ gap: '20px' }}
    >
      <div
        className="flex flex-center"
        style={{ width: '100%', height: 'fit-content' }}
      >
        <Descriptions
          key={limitDetails ? 'limit' : 'full'}
          bordered={bordered}
          colon
          column={1}
          layout={mobileView ? 'vertical' : 'horizontal'}
          style={{ width: '100%' }}
        >
          {Object.entries(antDetails).map(([key, value]) => {
            const numberValue = +value;
            if ((!mappedKeys.includes(key) && limitDetails) || !value) {
              return;
            }
            return (
              <Descriptions.Item
                key={key}
                label={`${key}`}
                labelStyle={{
                  width: 'fit-content',
                  color: 'var(--text-grey)',
                  border: bordered ? 'solid 1px var(--text-faded)' : '',
                  borderLeft: 'none',
                  borderRight: 'none',
                  whiteSpace: 'nowrap',
                }}
                contentStyle={{
                  width: 'fit-content',
                  minWidth: '200px',
                  maxWidth: '600px',
                  color: 'white',
                  border: bordered ? 'solid 1px var(--text-faded)' : '',
                  borderLeft: 'none',
                  borderRight: 'none',
                  textAlign: 'left',
                  alignContent: 'left',
                }}
              >
                {isArweaveTransactionID(value) ? (
                  <ArweaveID
                    id={new ArweaveTransactionID(value)}
                    type={handleLinkType(key)}
                    shouldLink
                    characterCount={isMobile ? 4 : undefined}
                  />
                ) : key === 'Lease Duration' ? (
                  <span>
                    {isNaN(numberValue) ? (
                      value
                    ) : (
                      <>
                        {getLeaseDurationFromEndTimestamp(
                          Date.now(),
                          numberValue,
                        )}{' '}
                        year
                        {getLeaseDurationFromEndTimestamp(
                          Date.now(),
                          numberValue,
                        ) > 1
                          ? 's'
                          : ''}
                        &nbsp;
                        <span style={{ color: 'var(--text-grey)' }}>
                          (expires approximately{' '}
                          {+value ? formatDate(numberValue) : 'N/A'})
                        </span>
                      </>
                    )}
                  </span>
                ) : value ? (
                  value
                ) : (
                  <span>N/A</span>
                )}
              </Descriptions.Item>
            );
          })}
        </Descriptions>
      </div>

      <div
        className={`flex flex-space-between`}
        style={{ display: 'flex', width: '100%', boxSizing: 'border-box' }}
      >
        {compact ? (
          <button
            className="outline-button center faded"
            onClick={showMore}
            style={{
              padding: 0,
              fontSize: '15px',
              width: '100%',
              height: 50,
            }}
          >
            {limitDetails ? 'View More' : 'View Less'}
          </button>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}

export default ANTCard;
