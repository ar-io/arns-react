// browser only: https://react.dev/reference/react/use-client
import { HoneycombWebSDK } from '@honeycombio/opentelemetry-web';
import { trace } from '@opentelemetry/api';
import { getWebAutoInstrumentations } from '@opentelemetry/auto-instrumentations-web';
import {
  useArNSState,
  useGlobalState,
  useTransactionState,
  useWalletState,
} from '@src/state';
import { useEffect } from 'react';

// observability.jsx|tsx
('use client'); // browser only: https://react.dev/reference/react/use-client

const configDefaults = {
  ignoreNetworkEvents: true,
  // propagateTraceHeaderCorsUrls: [
  // /.+/g, // Regex to match your backend URLs. Update to the domains you wish to include.
  // ]
};

// Create a singleton instance
class HoneycombInstance {
  private static instance: HoneycombWebSDK;

  public static getInstance(): HoneycombWebSDK {
    if (!HoneycombInstance.instance) {
      try {
        const sdk = new HoneycombWebSDK({
          debug: true,
          apiKey: '[API_KEY_HERE]',
          serviceName: 'arns-app',
          instrumentations: [
            getWebAutoInstrumentations({
              '@opentelemetry/instrumentation-xml-http-request': configDefaults,
              '@opentelemetry/instrumentation-fetch': configDefaults,
              '@opentelemetry/instrumentation-document-load': configDefaults,
            }),
          ],
        });

        sdk.start();
        HoneycombInstance.instance = sdk;
      } catch (e) {
        console.error('Failed to initialize Honeycomb SDK:', e);
      }
    }
    return HoneycombInstance.instance;
  }

  public static updateAttributes(attributes: Record<string, any>) {
    try {
      const tracer = trace.getTracer('arns-app');
      const span = tracer.startSpan('update-attributes');

      Object.entries(attributes).forEach(([key, value]) => {
        span.setAttribute(key, value);
      });

      span.end();
    } catch (e) {
      console.error('Failed to update attributes:', e);
    }
  }
}

// Initialize the SDK once at app startup
HoneycombInstance.getInstance();

// Component just handles updates
export default function Observability() {
  const [{ aoNetwork, arioProcessId }] = useGlobalState();
  const [{ walletAddress }] = useWalletState();
  const [{ ants, domains }] = useArNSState();
  const [{ workflowName, interactionResult, interactionType }] =
    useTransactionState();

  useEffect(() => {
    const attributes = {
      'user.address': walletAddress?.toString() ?? 'unknown',
      'network.ao.ant.cu_url': aoNetwork?.ANT.CU_URL,
      'network.ao.ant.mu_url': aoNetwork?.ANT.MU_URL,
      'network.ao.ant.scheduler': aoNetwork?.ANT.SCHEDULER,
      'network.ao.ant.graphql_url': aoNetwork?.ANT.GRAPHQL_URL,
      'network.ao.ario.cu_url': aoNetwork?.ARIO.CU_URL,
      'network.ao.ario.mu_url': aoNetwork?.ARIO.MU_URL,
      'network.ao.ario.scheduler': aoNetwork?.ARIO.SCHEDULER,
      'network.ario.process_id': arioProcessId,
      'workflow.name': workflowName,
      'workflow.interaction_result': interactionResult,
      'workflow.interaction_type': interactionType,
      'assets.ants': Object.keys(ants),
      'assets.domains': Object.keys(domains),
    };

    HoneycombInstance.updateAttributes(attributes);
  }, [
    walletAddress,
    aoNetwork,
    arioProcessId,
    workflowName,
    interactionResult,
    interactionType,
    ants,
    domains,
  ]);

  return null;
}

// Export the instance for use in other parts of the app if needed
export const honeycomb = HoneycombInstance;
