import {
  ANT,
  ANTRegistry,
  AOProcess,
  ARIO,
  AoARIORead,
  AoArNSNameData,
  AoClient,
} from '@ar.io/sdk/web';
import { captureException } from '@sentry/react';
import { AoAddress } from '@src/types';
import eventEmitter from '@src/utils/events';
import { buildAntStateQuery, queryClient } from '@src/utils/network';
import { Dispatch } from 'react';

import { ArNSAction } from '../reducers/ArNSReducer';

export async function dispatchArNSUpdate({
  dispatch,
  walletAddress,
  arioProcessId,
  ao,
}: {
  dispatch: Dispatch<ArNSAction>;
  walletAddress: AoAddress;
  arioProcessId: string;
  ao: AoClient;
}) {
  dispatch({ type: 'setDomains', payload: {} });
  dispatch({ type: 'setAnts', payload: {} });
  dispatch({ type: 'setPercentLoaded', payload: 0 });
  dispatch({ type: 'setAntCount', payload: 0 });
  dispatch({
    type: 'setLoading',
    payload: true,
  });
  const arioContract = ARIO.init({
    process: new AOProcess({ processId: arioProcessId, ao }),
  }) as AoARIORead;
  const antRegistry = ANTRegistry.init();
  const [arnsRecords, userAnts] = await Promise.all([
    arioContract.getArNSRecords(),
    antRegistry.accessControlList({ address: walletAddress.toString() }),
  ]);

  const flatAntIds = new Set([...userAnts.Controlled, ...userAnts.Owned]);

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

  await Promise.all(
    [...flatAntIds].map(async (id: string) => {
      try {
        const handlers = await queryClient.fetchQuery({
          queryKey: ['handlers', id],
          queryFn: async () => {
            return await ANT.init({
              processId: id,
            })
              .getHandlers()
              .catch((e) => {
                console.error(e);
                return null;
              });
          },
          staleTime: Infinity,
        });

        const state = await queryClient
          .fetchQuery(buildAntStateQuery({ processId: id }))
          .catch((e) => {
            console.error(e);
            return null;
          });

        dispatch({
          type: 'addAnts',
          payload: { [id]: { state, handlers } },
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
            eventEmitter.emit('error', new Error(e));
          }
        };
        errorHandler(error.message);
      } finally {
        dispatch({
          type: 'incrementAntCount',
        });
        dispatch({
          type: 'setPercentLoaded',
          payload: flatAntIds.size,
        });
      }
    }),
  );

  /// cleanup states

  dispatch({
    type: 'setLoading',
    payload: false,
  });
  dispatch({
    type: 'setPercentLoaded',
    payload: undefined,
  });

  // emitter.on('process', async (id, process) => {
  //   const handlers = await queryClient.fetchQuery({
  //     queryKey: ['handlers', id],
  //     queryFn: async () => {
  //       return await ANT.init({
  //         processId: id,
  //       })
  //         .getHandlers()
  //         .catch(console.error);
  //     },
  //     staleTime: Infinity,
  //   });

  //   dispatch({
  //     type: 'addDomains',
  //     payload: process.names,
  //   });
  //   dispatch({
  //     type: 'addAnts',
  //     payload: {
  //       [id]: {
  //         state: process.state as AoANTState,
  //         handlers: handlers ?? [],
  //       },
  //     },
  //   });
  // });
  // emitter.on('progress', (itemIndex, totalIds) => {
  //   dispatch({
  //     type: 'incrementAntCount',
  //   });
  //   dispatch({
  //     type: 'setPercentLoaded',
  //     payload: totalIds,
  //   });
  // });
  // const errorHandler = (e: string) => {
  //   if (e.startsWith('Error getting ArNS records')) {
  //     eventEmitter.emit('network:ao:congested', true);
  //     eventEmitter.emit(
  //       'error',
  //       new Error('Unable to load ArNS records. Please refresh to try again.'),
  //     );
  //     dispatch({
  //       type: 'setLoading',
  //       payload: false,
  //     });
  //     dispatch({
  //       type: 'setPercentLoaded',
  //       payload: undefined,
  //     });
  //   } else if (e.includes('Timeout')) {
  //     eventEmitter.emit('network:ao:congested', true);
  //     // capture and report the exception, but do not emit error notification
  //     captureException(new Error(e), {
  //       tags: {
  //         walletAddress: walletAddress.toString(),
  //         ioProcessId: ioProcessId,
  //       },
  //     });
  //   } else if (!e.includes('does not support provided action.')) {
  //     eventEmitter.emit('error', new Error(e));
  //   }
  // };
  // error listener handles timeout
  // emitter.on('error', errorHandler);
  // arns:error listener handles errors from graphql communications
  // emitter.on('arns:error', errorHandler);
  // emitter.on('end', () => {
  //   dispatch({
  //     type: 'setLoading',
  //     payload: false,
  //   });
  //   dispatch({
  //     type: 'setPercentLoaded',
  //     payload: undefined,
  //   });
  // });

  // emitter
  //   .fetchProcessesOwnedByWallet({ address: walletAddress.toString() })
  //   .catch((e) =>
  //     errorHandler('Error getting assets owned by wallet: ' + e.message),
  //   );
}
