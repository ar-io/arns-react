import { NoNetworkError } from '@src/utils/errors';

import { ArweaveCompositeDataProvider } from './arweave/ArweaveCompositeDataProvider';

class ArweaveServiceController {
  private _provider: ArweaveCompositeDataProvider;

  constructor(provider: ArweaveCompositeDataProvider) {
    this._provider = provider;
    return new Proxy(this, this._methodInterceptor());
  }

  private _methodInterceptor(): ProxyHandler<ArweaveServiceController> {
    return {
      get: (target, prop: string | symbol, receiver: any) => {
        const origMethod = (target._provider as any)[prop];
        if (typeof origMethod === 'function') {
          return (...args: any[]) => {
            // Call the validation function
            this._validateMethodAccess();

            // Proceed with the original method
            return origMethod.apply(target._provider, args);
          };
        }
        return Reflect.get(target._provider, prop, receiver);
      },
    };
  }

  private _validateMethodAccess() {
    // TODO: add gateway and arns service validation based on health checks

    if (!navigator.onLine) {
      throw new NoNetworkError('No Network Connection, please try again later');
    }
  }
}

export default ArweaveServiceController;
