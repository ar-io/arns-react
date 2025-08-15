# ArNS Query Management Patterns

This document explains the efficient patterns implemented for managing ArNS
record queries in the application.

## Overview

The new ArNS query management system provides several benefits:

- **Consistent caching**: Unified query keys ensure data is shared across
  components
- **Data normalization**: Individual records are automatically populated from
  collection queries
- **Reduced API calls**: Smart cache utilization minimizes redundant requests
- **Type safety**: Proper TypeScript types throughout

## Key Components

### 1. Query Key Factory (`arns-query-keys.ts`)

Centralized query key management ensures consistent caching:

```typescript
import { arnsQueryKeys } from '@src/hooks';

// All records for a specific process
const allRecordsKey = arnsQueryKeys.allRecords(processId);

// Records for a specific address
const userRecordsKey = arnsQueryKeys.recordsForAddress(processId, address);

// Individual record by name
const singleRecordKey = arnsQueryKeys.record(processId, recordName);

// Filtered records
const filteredKey = arnsQueryKeys.recordsWithFilters(processId, filters);
```

### 2. Cache Utilities (`arns-cache-utils.ts`)

Utilities for normalizing data across different query types:

```typescript
import {
  extractRecordFromCollection,
  populateIndividualRecordQueries,
} from '@src/hooks';

// Populate individual record queries from a collection
populateIndividualRecordQueries(queryClient, processId, recordsData);

// Extract a single record from existing collection queries
const record = extractRecordFromCollection(queryClient, processId, recordName);
```

### 3. Specialized Hooks

#### `useArNSRecord`

Fetches a single ArNS record by name, with automatic cache optimization:

```typescript
import { useArNSRecord } from '@src/hooks';

function DomainDetail({ domainName }: { domainName: string }) {
  const { data: record, isLoading } = useArNSRecord({ name: domainName });

  return (
    <div>{isLoading ? 'Loading...' : `Process ID: ${record?.processId}`}</div>
  );
}
```

#### `useArNSRecords`

Fetches multiple ArNS records with optional filtering:

```typescript
import { useArNSRecords } from '@src/hooks';

function RecordsList() {
  const { data: records, isLoading } = useArNSRecords({
    filters: { type: 'lease' },
  });

  return (
    <ul>
      {records?.map((record) => (
        <li key={record.processId}>{record.processId}</li>
      ))}
    </ul>
  );
}
```

#### `useArNSRecordsForAddress`

Fetches records owned by a specific address:

```typescript
import { useArNSRecordsForAddress } from '@src/hooks';

function UserDomains({ userAddress }: { userAddress: string }) {
  const { data: userRecords, isLoading } = useArNSRecordsForAddress({
    address: userAddress,
  });

  return <div>{userRecords?.length} domains owned</div>;
}
```

#### `useArNSData`

Unified hook for coordinating multiple ArNS data requirements:

```typescript
import { useArNSData } from '@src/hooks';

function ComprehensiveDashboard({ userAddress, currentDomain }: Props) {
  const { userRecords, record, filteredRecords, utils } = useArNSData({
    address: userAddress,
    recordName: currentDomain,
    filters: { type: 'lease' },
  });

  // All three queries run in parallel and share cache efficiently

  return (
    <div>
      <UserSection data={userRecords.data} />
      <CurrentRecord data={record.data} />
      <FilteredResults data={filteredRecords.data} />
      <button onClick={utils.invalidateAll}>Refresh All</button>
    </div>
  );
}
```

## Data Flow Optimization

### Cache Population Strategy

When collection queries (like `useArNSRecordsForAddress`) run, they
automatically populate individual record queries:

```typescript
// This query runs once
const { data: userRecords } = useArNSRecordsForAddress({
  address: userAddress,
});

// These queries are satisfied from cache (no additional API calls)
const { data: domain1 } = useArNSRecord({ name: 'domain1' });
const { data: domain2 } = useArNSRecord({ name: 'domain2' });
```

### Query Coordination

The updated `dispatchArNSUpdate` now works with the query cache system:

```typescript
// Uses existing cache data when available
// Populates individual record queries
// Integrates with React Query's stale-while-revalidate strategy
```

## Migration Guide

### Before

```typescript
// Separate, uncoordinated queries
const { data: allRecords } = useQuery(['arns-records'], fetchAllRecords);
const { data: singleRecord } = useQuery(['arns-record', name], () =>
  fetchSingleRecord(name),
);
```

### After

```typescript
// Coordinated queries with shared cache
const { data: allRecords } = useArNSRecords();
const { data: singleRecord } = useArNSRecord({ name }); // May use cache from above
```

## Performance Benefits

1. **Reduced API Calls**: Individual record queries often satisfied from
   collection cache
2. **Faster Load Times**: Smart cache utilization means less waiting
3. **Consistent Data**: Single source of truth prevents data inconsistencies
4. **Memory Efficiency**: Proper cache management prevents memory leaks

## Best Practices

1. **Use specific hooks**: Prefer `useArNSRecord` over `useArNSRecords` when you
   only need one record
2. **Leverage the unified hook**: Use `useArNSData` when you need multiple types
   of queries
3. **Invalidate efficiently**: Use the provided utility functions for cache
   invalidation
4. **Monitor cache size**: The stale time is set to 4 hours - adjust if needed
   for your use case

## Mutation Integration with `updateCollectionQueries`

The new mutation hooks integrate seamlessly with `updateCollectionQueries` to
provide optimistic updates and cache consistency. Here's how they leverage the
patterns from `dispatchArIOInteraction.ts`:

### Enhanced Mutation Pattern

```typescript
import { useBuyRecord, useExtendLease, useUpgradeName } from '@src/hooks';

function DomainActions({ domainName }: { domainName: string }) {
  const buyRecord = useBuyRecord();
  const extendLease = useExtendLease();
  const upgradeName = useUpgradeName();

  // These mutations provide:
  // 1. Optimistic updates using updateCollectionQueries
  // 2. Automatic cache invalidation on success
  // 3. Rollback on error
  // 4. Integration with existing dispatchArIOInteraction

  return (
    <div>
      <button onClick={() => buyRecord.mutateAsync(params)}>
        {buyRecord.isPending ? 'Buying...' : 'Buy Record'}
      </button>
      <button onClick={() => extendLease.mutateAsync(params)}>
        {extendLease.isPending ? 'Extending...' : 'Extend Lease'}
      </button>
      <button onClick={() => upgradeName.mutateAsync(params)}>
        {upgradeName.isPending ? 'Upgrading...' : 'Upgrade to Permabuy'}
      </button>
    </div>
  );
}
```

### Cache Update Flow

1. **Optimistic Update**: `updateCollectionQueries` immediately updates cache
2. **API Call**: Uses existing `dispatchArIOInteraction` for consistency
3. **Success**: Invalidates related queries to fetch fresh data
4. **Error**: Rolls back optimistic updates using stored previous state

### Migration from Direct Dispatch

```typescript
// BEFORE: Direct dispatchArIOInteraction call
await dispatchArIOInteraction({
  payload: { name: 'domain', years: 1 },
  workflowName: ARNS_INTERACTION_TYPES.EXTEND_LEASE,
  // ... other params
});

// AFTER: Using mutation hook with cache management
const extendLease = useExtendLease();
await extendLease.mutateAsync({
  name: 'domain',
  years: 1,
  // ... other params
});
```

### Benefits Over Direct Dispatch

- **Optimistic Updates**: UI responds immediately
- **Automatic Rollback**: Errors restore previous state
- **Cache Consistency**: All related queries stay synchronized
- **Loading States**: Built-in pending/error states
- **Type Safety**: Better TypeScript support

## Future Enhancements

- Real-time updates via WebSocket integration
- Background refresh strategies
- ✅ **Optimistic updates for mutations** (implemented)
- Enhanced error handling and retry logic
- Mutation queuing for offline support
