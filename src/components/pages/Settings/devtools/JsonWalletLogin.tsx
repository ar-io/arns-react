import { JsonWalletConnector } from '@src/services/wallets/JsonWalletConnector';
import { useWalletState } from '@src/state';
import eventEmitter from '@src/utils/events';
import { Upload } from 'lucide-react';
import { useRef, useState } from 'react';

function JsonWalletLogin() {
  const [, dispatchWalletState] = useWalletState();
  const [fileName, setFileName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsLoading(true);

    try {
      const text = await file.text();
      const jwk = JSON.parse(text);

      // Validate it looks like a JWK
      if (!jwk.n || !jwk.e || !jwk.d) {
        throw new Error('Invalid JWK format');
      }

      const connector = new JsonWalletConnector(jwk);
      await connector.connect();
      const address = await connector.getWalletAddress();

      dispatchWalletState({
        type: 'setWalletAndAddress',
        payload: {
          wallet: connector,
          walletAddress: address,
        },
      });

      eventEmitter.emit('success', {
        message: `Connected with JSON wallet: ${address.toString().slice(0, 8)}...`,
      });
    } catch (error: any) {
      console.error('Failed to load JSON wallet:', error);
      eventEmitter.emit('error', {
        name: 'JSON Wallet Error',
        message: error.message || 'Failed to load JSON wallet',
      });
      setFileName(null);
    } finally {
      setIsLoading(false);
      // Reset file input so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="flex flex-col gap-3 p-4 border border-dark-grey rounded bg-surface">
      <h3 className="text-foreground font-semibold">JSON Wallet Login</h3>
      <p className="text-muted text-sm">
        Load an Arweave JSON keyfile to connect. This is for development purposes only.
      </p>
      
      <div className="flex flex-row gap-3 items-center">
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
          id="json-wallet-input"
        />
        <label
          htmlFor="json-wallet-input"
          className={`flex items-center gap-2 px-4 py-2 rounded cursor-pointer transition-colors ${
            isLoading
              ? 'bg-muted text-muted cursor-not-allowed'
              : 'bg-primary text-primary-foreground hover:bg-primary/90'
          }`}
        >
          <Upload className="size-4" />
          {isLoading ? 'Loading...' : 'Select Keyfile'}
        </label>
        
        {fileName && !isLoading && (
          <span className="text-muted text-sm">{fileName}</span>
        )}
      </div>
      
      <p className="text-warning text-xs">
        Warning: Never use your main wallet keyfile in development. Use a test wallet only.
      </p>
    </div>
  );
}

export default JsonWalletLogin;
