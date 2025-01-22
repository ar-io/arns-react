import {
  ANT,
  ANTRegistry,
  ANT_REGISTRY_ID,
  AOProcess,
  ARIO,
  AoANTHandler,
  AoARIORead,
  AoArNSNameData,
  AoClient,
} from '@ar.io/sdk/web';
import { captureException } from '@sentry/react';
import { AoAddress } from '@src/types';
import eventEmitter from '@src/utils/events';
import { buildAntStateQuery, queryClient } from '@src/utils/network';
import { Tag } from 'arweave/node/lib/transaction';
import { pLimit } from 'plimit-lit';
import { Dispatch } from 'react';

import { ArNSAction } from '../reducers/ArNSReducer';

export async function dispatchArNSUpdate({
  dispatch,
  walletAddress,
  arioProcessId,
  ao,
  antAo,
}: {
  dispatch: Dispatch<ArNSAction>;
  walletAddress: AoAddress;
  arioProcessId: string;
  ao: AoClient;
  antAo: AoClient;
}) {
  try {
    const limit = pLimit(20);
    dispatch({ type: 'reset' });
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
    const antRegistry = ANTRegistry.init({
      process: new AOProcess({
        processId: ANT_REGISTRY_ID,
        ao,
      }),
    });
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

    const fetchAntDetails = async (id: string) => {
      try {
        const handlers = await queryClient.fetchQuery({
          queryKey: ['handlers', id],
          queryFn: async () => {
            try {
              const dryTransferRes = await antAo
                .dryrun({
                  process: id,
                  Owner: walletAddress.toString(),
                  From: walletAddress.toString(),
                  tags: [
                    { name: 'Action', value: 'Transfer' },
                    { name: 'Recipient', value: '0x'.padEnd(42, '0') },
                  ],
                })
                .catch(() => {
                  return {} as ReturnType<typeof antAo.dryrun>;
                });

              const hasError =
                dryTransferRes?.Messages?.find((msg) => {
                  return msg.Tags.find((t: Tag) => t.name === 'Error');
                }) !== undefined;

              if (hasError) {
                return [] as AoANTHandler[];
              }

              const handlers = await ANT.init({
                process: new AOProcess({ processId: id, ao: antAo }),
              }).getHandlers();

              return handlers ?? null;
            } catch (error: any) {
              captureException(error);
              throw new Error(error);
            }
          },
          staleTime: Infinity,
        });

        const state = await queryClient
          .fetchQuery(buildAntStateQuery({ processId: id, ao: antAo }))
          .catch((e) => {
            captureException(e);
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
          payload: flatAntIds.size,
        });
      }
    };

    await Promise.all(
      registeredUserAnts.map((id) => limit(() => fetchAntDetails(id))),
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
