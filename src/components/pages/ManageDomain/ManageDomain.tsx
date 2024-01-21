import { Tooltip } from 'antd';
import { Table } from 'antd';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';

import { useIsMobile } from '../../../hooks';
import { ArweaveTransactionID } from '../../../services/arweave/ArweaveTransactionID';
import { useGlobalState } from '../../../state/contexts/GlobalState';
import { useWalletState } from '../../../state/contexts/WalletState';
import { DomainDetails, ManageDomainRow } from '../../../types';
import {
  getInteractionTypeFromField,
  getLeaseDurationFromEndTimestamp,
  getPendingInteractionsRowsForContract,
  getUndernameCount,
  isArweaveTransactionID,
  lowerCaseDomain,
} from '../../../utils';
import {
  DEFAULT_MAX_UNDERNAMES,
  DEFAULT_TTL_SECONDS,
  MAX_LEASE_DURATION,
  MAX_UNDERNAME_COUNT,
  SECONDS_IN_GRACE_PERIOD,
} from '../../../utils/constants';
import eventEmitter from '../../../utils/events';
import { AntDetailKey, mapKeyToAttribute } from '../../cards/ANTCard/ANTCard';
import {
  CirclePending,
  ExternalLinkIcon,
  HamburgerOutlineIcon,
} from '../../icons';
import { Loader } from '../../layout';
import ArweaveID, { ArweaveIdTypes } from '../../layout/ArweaveID/ArweaveID';
import TransactionStatus from '../../layout/TransactionStatus/TransactionStatus';
import './styles.css';

function ManageDomain() {
  const { name } = useParams();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();
  const [{ arweaveDataProvider }] = useGlobalState();
  const [{ walletAddress }] = useWalletState();
  const [rows, setRows] = useState<ManageDomainRow[]>([]);
  const [isMaxLeaseDuration, setIsMaxLeaseDuration] = useState<boolean>(false);
  const [isMaxUndernameCount, setIsMaxUndernameCount] =
    useState<boolean>(false);
  const [undernameCount, setUndernameCount] = useState<number>();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!name || !walletAddress) {
      navigate('/manage/ants');
      return;
    }

    fetchDomainDetails(walletAddress, name);
  }, [name]);

  // TODO: [PE-4630] tech debt, refactor this into smaller pure functions
  async function fetchDomainDetails(
    address: ArweaveTransactionID,
    domainName: string,
  ) {
    try {
      setLoading(true);

      const recordEntry = await arweaveDataProvider.getRecord({
        domain: lowerCaseDomain(domainName),
      });
      const txId = recordEntry?.contractTxId;
      if (!txId) {
        throw Error('This name is not registered');
      }
      const contractTxId = new ArweaveTransactionID(txId);

      const [contract, confirmations, pendingContractInteractions] =
        await Promise.all([
          arweaveDataProvider.buildANTContract(contractTxId),
          arweaveDataProvider
            .getTransactionStatus(contractTxId)
            .then((status) => status[contractTxId.toString()].confirmations),
          arweaveDataProvider.getPendingContractInteractions(contractTxId),
        ]);

      // simple check that it is ANT shaped contract
      // TODO: add more checks, eg AST tree and function IO's
      if (!contract.isValid()) {
        throw Error('Invalid ANT contract');
      }

      const record = name
        ? await arweaveDataProvider
            .getRecord({
              domain: lowerCaseDomain(name),
            })
            .catch(() => undefined)
        : undefined;
      if (!record) {
        throw Error('This name is not registered');
      }

      const duration = record?.endTimestamp
        ? getLeaseDurationFromEndTimestamp(
            record.startTimestamp * 1000,
            record.endTimestamp * 1000,
          )
        : 'Indefinite';

      const getLeaseDurationString = () => {
        if (record?.endTimestamp) {
          const duration = Math.max(
            1,
            getLeaseDurationFromEndTimestamp(
              record.startTimestamp * 1000,
              record.endTimestamp * 1000,
            ),
          );
          const y = duration > 1 ? 'years' : 'year';
          return `${duration} ${y}`;
        }
        return 'Indefinite';
      };

      setIsMaxLeaseDuration(
        (duration &&
          typeof duration === 'number' &&
          duration >= MAX_LEASE_DURATION) ||
          duration === 'Indefinite',
      );

      setUndernameCount(record.undernames);
      setIsMaxUndernameCount(
        !!undernameCount && record.undernames >= MAX_UNDERNAME_COUNT,
      );

      const consolidatedDetails: DomainDetails = {
        expiryDate: record?.endTimestamp
          ? // assume permabuy if missing timestamp
            +record.endTimestamp
          : 'Indefinite',
        status: <TransactionStatus confirmations={confirmations} />,
        name: contract.name ?? 'N/A',
        contractTxId: contractTxId.toString(),
        targetID:
          contract.getRecord('@') &&
          isArweaveTransactionID(contract.getRecord('@')!.transactionId)
            ? contract.getRecord('@')!.transactionId
            : 'N/A',
        ticker: contract.ticker ?? 'N/A',
        controllers: contract.controllers.join(', ') ?? 'N/A',
        owner: contract.owner ?? 'N/A',
        ttlSeconds: contract.getRecord('@')?.ttlSeconds ?? DEFAULT_TTL_SECONDS,
        leaseDuration: `${getLeaseDurationString()}`,
        // -1 because @ record is not counted
        undernames: `${getUndernameCount(contract.records)}/${(
          record?.undernames ?? DEFAULT_MAX_UNDERNAMES
        ).toLocaleString()}`,
      };

      // get pending tx details
      const pendingTxs = getPendingInteractionsRowsForContract(
        pendingContractInteractions,
        consolidatedDetails,
      );

      const rows = Object.keys(consolidatedDetails).reduce(
        (details: ManageDomainRow[], attribute: string, index: number) => {
          const existingValue =
            consolidatedDetails[attribute as keyof DomainDetails];
          const pendingInteraction = pendingTxs.find(
            (i) => i.attribute === attribute,
          );
          const value = pendingInteraction
            ? pendingInteraction.value
            : existingValue;
          const detail = {
            attribute,
            value,
            key: index,
            interactionType: getInteractionTypeFromField(attribute),
            pendingInteraction,
          };
          details.push(detail);
          return details;
        },
        [],
      );

      setRows(rows);
      setLoading(false);
    } catch (error) {
      eventEmitter.emit('error', error);
      navigate('/manage/names', { state: location.pathname });
    }
  }

  return (
    <>
      <div className="page" style={{ gap: '30px' }}>
        <div
          className="flex flex-row"
          style={{ justifyContent: 'space-between', width: '100%' }}
        >
          <h2 className="flex white center" style={{ gap: '16px' }}>
            <HamburgerOutlineIcon
              width={'20px'}
              height={'20px'}
              fill="var(--text-white)"
            />
            {name}
          </h2>
          <div
            className="flex flex-row"
            style={{ gap: '20px', width: 'fit-content' }}
          >
            <Tooltip
              trigger={['hover']}
              title={
                isMaxUndernameCount
                  ? 'Max undername support reached'
                  : 'Increase undername support'
              }
              color="#222224"
              placement="top"
              rootClassName="notification-tooltip"
            >
              <button
                disabled={loading || isMaxUndernameCount}
                className={`button-secondary ${
                  loading || isMaxUndernameCount ? 'disabled-button' : 'hover'
                }`}
                style={{
                  padding: loading || isMaxUndernameCount ? '0px' : '9px',
                  gap: '8px',
                  fontSize: '14px',
                  color: 'var(--accent)',
                  fontFamily: 'Rubik',
                }}
                onClick={() => navigate(`/manage/names/${name}/undernames`)}
              >
                Increase Undernames
              </button>
            </Tooltip>
            <Tooltip
              trigger={['hover']}
              title={
                isMaxLeaseDuration
                  ? 'Max lease duration reached'
                  : 'Extend lease'
              }
              color="#222224"
              placement="top"
              rootClassName="notification-tooltip"
            >
              <button
                disabled={loading || isMaxLeaseDuration}
                className={`button-primary ${
                  loading || isMaxLeaseDuration ? 'disabled-button' : 'hover'
                }`}
                style={{
                  padding: loading || isMaxLeaseDuration ? '0px' : '9px',
                  gap: '8px',
                  fontSize: '14px',
                  color: 'var(--text-black)',
                  fontFamily: 'Rubik',
                }}
                onClick={() => navigate(`/manage/names/${name}/extend`)}
              >
                Extend Lease
              </button>
            </Tooltip>
          </div>
        </div>
        <div className="flex-row center">
          {loading ? (
            <div className="flex" style={{ padding: '10%' }}>
              <Loader size={80} />
            </div>
          ) : (
            <Table
              showHeader={false}
              style={{ width: '100%' }}
              scroll={{ x: true }}
              pagination={false}
              prefixCls="manage-domain-table"
              columns={[
                {
                  title: '',
                  dataIndex: 'attribute',
                  key: 'attribute',
                  align: 'left',
                  width: isMobile ? '0px' : '15%',
                  className: 'grey',
                  render: (value: string) => {
                    return `${mapKeyToAttribute(value as AntDetailKey)}:`;
                  },
                },
                {
                  title: '',
                  dataIndex: 'value',
                  key: 'value',
                  align: 'left',
                  width: '70%',
                  className: 'white',
                  render: (value: any, row: ManageDomainRow) =>
                    isArweaveTransactionID(value) ? (
                      <ArweaveID
                        id={new ArweaveTransactionID(value)}
                        shouldLink
                        copyButtonStyle={{ display: 'none' }}
                        type={
                          row.attribute === 'targetID'
                            ? ArweaveIdTypes.TRANSACTION
                            : row.attribute === 'contractTxId'
                              ? ArweaveIdTypes.CONTRACT
                              : ArweaveIdTypes.ADDRESS
                        }
                      />
                    ) : row.attribute === 'expiryDate' &&
                      typeof value === 'number' ? (
                      <span
                        style={{
                          color:
                            value * 1000 > Date.now()
                              ? 'var(--success-green)'
                              : value * 1000 + SECONDS_IN_GRACE_PERIOD * 1000 <
                                  Date.now()
                                ? 'var(--accent)'
                                : 'var(--error-red)',
                        }}
                      >
                        {Intl.DateTimeFormat('en-US').format(value * 1000)}
                      </span>
                    ) : (
                      value
                    ),
                },
                {
                  title: '',
                  dataIndex: 'pendingInteraction',
                  key: 'pendingInteraction',
                  align: 'left',
                  width: '2%',
                  className: 'white',
                  render: (interaction: {
                    value: string;
                    valid: boolean;
                    id: string;
                  }) => {
                    if (interaction) {
                      return (
                        <Tooltip
                          placement="right"
                          title={
                            <Link
                              className="link white text underline"
                              to={`https://viewblock.io/arweave/tx/${interaction.id}`}
                              target="_blank"
                            >
                              There is a pending transaction modifying this
                              field.
                              <ExternalLinkIcon
                                height={12}
                                width={12}
                                fill={'var(--text-white)'}
                              />
                            </Link>
                          }
                          showArrow={true}
                          overlayStyle={{
                            maxWidth: 'fit-content',
                          }}
                        >
                          <CirclePending
                            height={20}
                            width={20}
                            fill={'var(--accent)'}
                          />
                        </Tooltip>
                      );
                    }
                    return <></>;
                  },
                },
              ]}
              dataSource={rows}
            />
          )}
        </div>
      </div>
    </>
  );
}

export default ManageDomain;
