import { AoARIORead, AoARIOWrite } from '@ar.io/sdk/web';
import { Dispatch } from 'react';

import { GlobalAction } from '../reducers';

/**
 * Push a freshly-built ARIO client into global state. Solana-only after the
 * de-AO refactor, so the previous `arioProcessId` arg is no longer needed —
 * Phase 4 strips the call sites that still pass it. Accept it as an
 * optional, ignored field to soften the cross-phase landing.
 */
export function dispatchArIOContract({
  contract,
  dispatch,
}: {
  contract: AoARIORead | AoARIOWrite;
  arioProcessId?: string; // ignored; kept for caller compatibility
  dispatch: Dispatch<GlobalAction>;
}) {
  dispatch({
    type: 'setArIOContract',
    payload: contract,
  });
}
