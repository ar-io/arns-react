import { ArweaveTransactionID } from '@src/services/arweave/ArweaveTransactionID';
import { useGlobalState } from '@src/state/contexts/GlobalState';
import { ContractInteraction } from '@src/types';
import { mioToIo, shortTransactionId } from '@src/utils';
import { Space, Tag } from 'antd';
import { startCase } from 'lodash';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { DataColumn, DataTable } from './common';

export type ArNSTransaction = {
  id: string;
  functionName: string;
  contractTxId: string; // ant or registry
  from: string;
  to: string;
  amount: string;
  timestamp: string;
  status: string;
};

const stubData: ArNSTransaction[] = [
  {
    functionName: 'transfer',
    id: ''.padEnd(43, '7'),
    from: '0x123'.padEnd(43, '7'),
    to: '0x456'.padEnd(43, '7'),
    amount: '100',
    contractTxId: '0x123'.padEnd(43, '7'),
    timestamp: '2021-10-10',
    status: 'active',
  },
];

const FUNCTION_COLORS: Record<string, string> = {
  // REGISTRY
  TRANSFER: 'blue',
  BUYRECORD: 'green',
  EXTENDRECORD: 'red',
  INCREASEUNDERNAMECOUNT: 'purple',
  SUBMITAUCTIONBID: 'red',
  JOINNETWORK: 'purple',
  DELEGATESTAKE: 'orange',
  DECREASEDELEGATESTAKE: 'cyan',
  INCREASEOPERATORSTAKE: 'magenta',
  DECREASEOPERATORSTAKE: 'volcano',
  UPDATEGATEWAYSETTINGS: 'gold',
  SAVEOBSERVATIONS: 'lime',
  // ANT
  SETRECORD: 'purple',
  SETCONTROLLERS: 'orange',
  SETNAME: 'cyan',
  SETTICKER: 'magenta',
};

function arnsTransactionsColumnsGenerator(
  data: Record<string, any>,
): DataColumn[] {
  const renderKeys = [
    'id',
    'to',
    'from',
    'amount',
    'status',
    'functionName',
    'timestamp',
  ];

  return Object.keys(data)
    .map((key, index) => {
      if (!renderKeys.includes(key)) {
        return;
      }
      return new DataColumn({
        className: 'white manage-assets-table-header',
        key: index.toString(),
        title: startCase(key),
        dataIndex: key,
        render: (value: any) => {
          switch (key) {
            case 'functionName':
              return (
                <Space>
                  <Tag color={FUNCTION_COLORS[value.toUpperCase()]}>
                    {value}
                  </Tag>
                </Space>
              );
            case 'timestamp':
              return new Date(value).toLocaleDateString();
            case 'id':
              return shortTransactionId(value);
            case 'contractTxId':
              return shortTransactionId(value);
            case 'to':
              return shortTransactionId(value);
            case 'from':
              return shortTransactionId(value);
            case 'amuont':
              return shortTransactionId(value);
            case 'status':
              return value;
            default:
              return value;
          }
        },
      });
    })
    .filter((column) => column !== undefined) as DataColumn[];
}

function ArNSTransactionsTable() {
  const { address } = useParams<{ address: string }>();
  const navigate = useNavigate();
  const [{ arweaveDataProvider }] = useGlobalState();
  const [dataRequestKey, setDataRequestKey] = useState(
    `${address}-interactions` + Date.now(),
  );

  useEffect(() => {
    if (!address) {
      navigate('/');
    }
  }, [address]);

  function refresh() {
    setDataRequestKey(`${address}-interactions` + Date.now());
  }

  function mapInteractionPayloadToData(interaction: ContractInteraction) {
    const { owner, contractTxId, id, input, valid, timestamp } = interaction;
    const defaults = {
      id,
      contractTxId,
      from: owner,
      to: address,
      timestamp: timestamp,
      status: valid ? 'active' : 'invalid',
      functionName: input?.function ?? 'Unknown Function',
      amount: '0',
    };

    switch (input?.function) {
      case 'transfer':
        return {
          ...defaults,
          amount: mioToIo(input?.qty),
        };
      //   case 'buyRecord':
      //     break;
      //   case 'extendRecord':
      //     break;
      //   case 'increaseUnderNameCount':
      //     break;
      //   case 'submitAuctionBid':
      //     break;
      //   case 'joinNetwork':
      //     break;
      //   case 'delegateStake':
      //     break;
      //   case 'decreaseDelegateStake':
      //     break;
      //   case 'increaseOperatorsStake':
      //     break;
      //   case 'decreaseOperatorsStake':
      //     break;
      //   case 'updateGatewaySettings':
      //     break;
      //   case 'saveObservations':
      //     break;
      //   case 'setName':
      //     break;
      //   case 'setRecord':
      //     break;
      //   case 'setControllers':
      //     break;
      //   case 'setTicker':
      //     break;
      default:
        return defaults;
    }
  }

  const proposalsFetcher = async () => {
    // TODO: add ant contracts interactions
    // const { contractTxIds: userContracts } =
    //   await arweaveDataProvider.getContractsForWallet(
    //     new ArweaveTransactionID(address!),
    //   );

    const interactions = await arweaveDataProvider
      .getContractInteractions(
        new ArweaveTransactionID('bLAgYxAdX2Ry-nt6aH2ixgvJXbpsEYm28NgJgyqfs-U'),
      )
      .then((ints) =>
        ints.filter(
          (interaction) =>
            (interaction?.input?.function == 'transfer' &&
              interaction.owner == address) ||
            (interaction?.input?.function == 'transfer' &&
              interaction?.input?.target == address),
        ),
      );

    const data = interactions.map((interaction: any) => {
      return mapInteractionPayloadToData(interaction);
    });
    return data;
  };

  return (
    <div className="flex-column flex">
      <div
        className="flex-row flex"
        style={{
          justifyContent: 'space-between',
          marginBottom: '1rem',
        }}
      >
        <h1>IO Transactions</h1>
        <button onClick={refresh} className="button-primary">
          Refresh
        </button>
      </div>
      <DataTable
        columnGenerator={arnsTransactionsColumnsGenerator}
        defaultColumns={arnsTransactionsColumnsGenerator(stubData[0])}
        requestCacheKey={`${dataRequestKey}`}
        dataFetcher={proposalsFetcher}
      />
    </div>
  );
}

export default ArNSTransactionsTable;
