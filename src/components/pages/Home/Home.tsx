import { useEffect, useState } from 'react';
import { LocalFileSystemDataProvider } from '../../../services/arweave/LocalFilesystemDataProvider';
import './styles.css';

const ARNS_SOURCE_CONTRACT_TX_ID =
  'bLAgYxAdX2Ry-nt6aH2ixgvJXbpsEYm28NgJgyqfs-U';

function Home() {
  const [arnsRecords, setArnsRecords] = useState('');
  useEffect(() => {
    // TODO: might be beneficial to move this to a web worker
    const fetchArNSContract = async (txId: string): Promise<Map<string, string>> => {
      const arnsContractState =
        await new LocalFileSystemDataProvider().getContractState(txId);
      if (!arnsContractState) {
        throw Error('State failed to load.');
      }
      const { records } = arnsContractState;
      return records;
    };
    fetchArNSContract(ARNS_SOURCE_CONTRACT_TX_ID)
      .then((records) => {
        setArnsRecords(JSON.stringify(records, null, 2));
      })
      .catch((error) => {
        console.log(error.message);
      });
  }, [arnsRecords]);

  return (
    <div className="home">
      Home
      <div className="container">
        <pre>{arnsRecords}</pre>
      </div>
    </div>
  );
}

export default Home;
