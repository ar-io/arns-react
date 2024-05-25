import { ArNSLeaseData } from '@ar.io/sdk';
import { Descriptions } from 'antd';
import { startCase } from 'lodash';
import { isValidElement, useEffect, useState } from 'react';

import { useIsMobile } from '../../../hooks';
import { ANTContract } from '../../../services/arweave/ANTContract';
import { ArweaveTransactionID } from '../../../services/arweave/ArweaveTransactionID';
import { useGlobalState } from '../../../state/contexts/GlobalState';
import { ARNSMapping } from '../../../types';
import {
  formatDate,
  getLeaseDurationFromEndTimestamp,
  isArweaveTransactionID,
} from '../../../utils';
import { ATOMIC_FLAG } from '../../../utils/constants';
import eventEmitter from '../../../utils/events';
import { Loader } from '../../layout';
import ArweaveID, { ArweaveIdTypes } from '../../layout/ArweaveID/ArweaveID';
import './styles.css';

export const ANT_TRANSACTION_DETAILS = {
  deployedTransactionId: 'Transaction ID',
  contractTxId: 'Contract ID',
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
  'contractTxId',
  'domain',
  'leaseDuration',
  'name',
  'ticker',
  'owner',
];

function ANTCard({
  state,
  contractTxId,
  domain,
  record,
  compact = true,
  overrides,
  hover,
  disabledKeys,
  deployedTransactionId,
  mobileView,
  bordered = false,
}: ARNSMapping) {
  const isMobile = useIsMobile();
  const [{ arweaveDataProvider }] = useGlobalState();
  const [antDetails, setANTDetails] = useState<{ [x: string]: any }>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [limitDetails, setLimitDetails] = useState<boolean>(true);
  const mappedKeys = DEFAULT_PRIMARY_KEYS.map((key: AntDetailKey) =>
    mapKeyToAttribute(key),
  );

  useEffect(() => {
    setDetails();
  }, []);

  async function setDetails() {
    try {
      setIsLoading(true);
      let contract = undefined;
      if (state) {
        contract = new ANTContract(state);
      }
      if (contractTxId && contractTxId !== ATOMIC_FLAG && !state) {
        contract = await arweaveDataProvider
          .buildANTContract(contractTxId)
          .catch(() => {
            throw new Error(
              `Unable to fetch ANT contract state for ${contractTxId}`,
            );
          });
      }

      if (!contract?.isValid()) {
        throw new Error('Invalid ANT contract');
      }

      let leaseDuration = 'N/A';
      if (record) {
        leaseDuration = (record as ArNSLeaseData).endTimestamp
          ? `${(record as ArNSLeaseData).endTimestamp * 1000}`
          : 'Indefinite';
      }

      const allANTDetails: Record<AntDetailKey, any> = {
        deployedTransactionId: deployedTransactionId
          ? deployedTransactionId.toString()
          : undefined,
        contractTxId: contractTxId?.toString() ?? 'N/A',
        domain: domain,
        // TODO: add the # of associated names that point to this ANT
        leaseDuration: leaseDuration,
        // TODO: undernames are associated with the record, not the ANT - how do we want to represent this
        maxUndernames: 'Up to ' + record?.undernames,
        name: contract.name,
        ticker: contract.ticker,
        owner: contract.owner,
        controllers: contract.controllers.join(', '),
        targetId: contract.getRecord('@')?.transactionId,
        ttlSeconds: contract.getRecord('@')?.ttlSeconds,
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
    if (key === 'Controllers' || key === 'Owner') {
      return ArweaveIdTypes.ADDRESS;
    }
    if (key === 'Contract ID') {
      return ArweaveIdTypes.CONTRACT;
    }
    return ArweaveIdTypes.TRANSACTION;
  }

  if (isLoading) {
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
