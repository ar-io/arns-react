import type { QueryKey as BaseQueryKey } from '@tanstack/react-query';

export const queryKeys = {
  primaryName: (walletAddress?: string, arioProcessId?: string) =>
    ['primary-name', walletAddress, arioProcessId] as const,
} as const;

export type QueryKey =
  | ReturnType<(typeof queryKeys)[keyof typeof queryKeys]>
  | BaseQueryKey;
