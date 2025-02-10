import {
  ANTRegistry,
  ANT_REGISTRY_ID,
  AOProcess,
  ARIO,
  AoANTHandler,
  AoARIORead,
  AoArNSNameData,
} from '@ar.io/sdk/web';
import { connect } from '@permaweb/aoconnect';
import { captureException } from '@sentry/react';
import { buildDomainInfoQuery } from '@src/hooks/useDomainInfo';
import { AoAddress } from '@src/types';
import { NETWORK_DEFAULTS } from '@src/utils/constants';
import eventEmitter from '@src/utils/events';
import { queryClient } from '@src/utils/network';
import { pLimit } from 'plimit-lit';
import { Dispatch } from 'react';

import { ArNSAction } from '../reducers/ArNSReducer';

// TODO: pass in network config instead of separate AoClients
export async function dispatchArNSUpdate({
  dispatch,
  walletAddress,
  arioProcessId,
  aoNetworkSettings,
}: {
  dispatch: Dispatch<ArNSAction>;
  walletAddress: AoAddress;
  arioProcessId: string;
  aoNetworkSettings: typeof NETWORK_DEFAULTS.AO;
}) {
  try {
    const ao = connect(aoNetworkSettings.ARIO);
    const throttle = pLimit(20);
    // reset queries
    queryClient.resetQueries({ queryKey: ['domainInfo'] });
    queryClient.resetQueries({
      queryKey: ['ant'],
    });
    queryClient.resetQueries({
      queryKey: ['ant-info'],
    });

    dispatch({ type: 'reset' });
    dispatch({
      type: 'setLoading',
      payload: true,
    });
    const arioContract = ARIO.init({
      process: new AOProcess({ processId: arioProcessId, ao }),
    }) as AoARIORead;
    const antRegistry = ANTRegistry.init({
      process: new AOProcess({
        processId: ANT_REGISTRY_ID,
        ao: connect(aoNetworkSettings.ANT),
      }),
    });
    // TODO: we should paginate or send a filter by process ID on the network process for the records we want
    const [arnsRecords, allUserAnts] = await Promise.all([
      arioContract.getArNSRecords({ limit: 100_000 }),
      antRegistry.accessControlList({ address: walletAddress.toString() }),
    ]);

    const flatAntIds = new Set([
      ...allUserAnts.Controlled,
      ...allUserAnts.Owned,
    ]);

    const userDomains = arnsRecords.items.reduce(
      (acc: Record<string, AoArNSNameData>, recordData) => {
        const { name, ...record } = recordData;
        if (flatAntIds.has(record.processId)) {
          acc[name] = record;
        }
        return acc;
      },
      {},
    );

    // ONLY QUERY FOR ANTS THAT WE ARE INTERESTED IN, EG REGISTERED ANTS
    const registeredUserAnts = Array.from(
      new Set(Object.values(userDomains).map((record) => record.processId)),
    );

    dispatch({
      type: 'setDomains',
      payload: userDomains,
    });

    // we set the default states to null so that they can match up in the tables
    dispatch({
      type: 'setAnts',
      payload: [...flatAntIds].reduce(
        (acc: Record<string, { state: null; handlers: null }>, id: string) => {
          acc[id] = { state: null, handlers: null };
          return acc;
        },
        {},
      ),
    });

    // Can be useDomainInfo fetch here (from ant id, not domain)
    const fetchAntDetails = async (id: string) => {
      try {
        const domainInfo = await queryClient.fetchQuery(
          buildDomainInfoQuery({
            antId: id,
            aoNetwork: aoNetworkSettings,
          }),
        );
        dispatch({
          type: 'addAnts',
          payload: {
            [id]: {
              state: domainInfo.state ?? null,
              handlers: (domainInfo.info?.Handlers ?? null) as
                | AoANTHandler[]
                | null,
              errors: domainInfo.errors ?? [],
            },
          },
        });
      } catch (error: any) {
        const errorHandler = (e: string) => {
          if (e.startsWith('Error getting ArNS records')) {
            eventEmitter.emit('network:ao:congested', true);
            eventEmitter.emit(
              'error',
              new Error(
                'Unable to load ArNS records. Please refresh to try again.',
              ),
            );
            dispatch({
              type: 'setLoading',
              payload: false,
            });
            dispatch({
              type: 'setPercentLoaded',
              payload: undefined,
            });
          } else if (e.includes('Timeout')) {
            eventEmitter.emit('network:ao:congested', true);
            // capture and report the exception, but do not emit error notification
            captureException(new Error(e), {
              tags: {
                walletAddress: walletAddress.toString(),
                arioProcessId: arioProcessId,
              },
            });
          } else if (!e.includes('does not support provided action.')) {
            captureException(new Error(e), {
              tags: {
                walletAddress: walletAddress.toString(),
                arioProcessId: arioProcessId,
              },
            });
            console.error(new Error(e));
          }
        };
        errorHandler(error.message);
      } finally {
        dispatch({
          type: 'incrementAntCount',
        });
        dispatch({
          type: 'setPercentLoaded',
          payload: registeredUserAnts.length,
        });
      }
    };

    await Promise.all(
      registeredUserAnts.map((id) => throttle(() => fetchAntDetails(id))),
    );
  } catch (error) {
    captureException(error);
  } finally {
    /// cleanup states
    dispatch({
      type: 'setLoading',
      payload: false,
    });
    dispatch({
      type: 'setPercentLoaded',
      payload: undefined,
    });
  }
}
