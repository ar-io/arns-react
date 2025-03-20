import {
  ANTRegistry,
  ANT_REGISTRY_ID,
  AOProcess,
  createAoSigner,
} from '@ar.io/sdk';
import { useANTVersions } from '@src/hooks/useANTVersions';
import { useArNSRegistryDomains } from '@src/hooks/useArNSRegistryDomains';
import { useGlobalState, useWalletState } from '@src/state';
import eventEmitter from '@src/utils/events';
import { Collapse, Space } from 'antd';
import { pLimit } from 'plimit-lit';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

import './styles.css';

const Panel = Collapse.Panel;

function ANTTools() {
  const [{ antAoClient }] = useGlobalState();
  const [{ wallet }] = useWalletState();
  const { data: antVersions } = useANTVersions();
  const { data: arnsDomains } = useArNSRegistryDomains();
  const [isUpdating, setIsUpdating] = useState(false);
  const [registrations, setRegistrations] = useState<number>(0);
  const [totalAnts, setTotalAnts] = useState<number>(0);

  async function updateANTRegistry() {
    try {
      setIsUpdating(true);
      if (!arnsDomains) throw new Error('No ARNS domains found');
      if (!wallet?.contractSigner) throw new Error('No contract signer found');
      const antIds = Array.from(
        new Set<string>(
          Object.values(arnsDomains).map((record) => record.processId),
        ),
      );
      setTotalAnts(antIds.length);
      const throttle = pLimit(50);
      const antRegistry = ANTRegistry.init({
        process: new AOProcess({
          processId: ANT_REGISTRY_ID,
          ao: antAoClient,
        }),
        signer: createAoSigner(wallet?.contractSigner),
      });

      await Promise.all(
        antIds.map((antId) =>
          throttle(() =>
            antRegistry
              .register({ processId: antId })
              .then(() => setRegistrations((count) => count + 1))
              .catch((e) => eventEmitter.emit('error', e)),
          ),
        ),
      );
    } catch (error) {
      eventEmitter.emit('error', error);
    } finally {
      setIsUpdating(false);
      setRegistrations(0);
      setTotalAnts(0);
    }
  }
  return (
    <div className="flex" style={{ width: '100%' }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Collapse style={{ width: '100%' }} prefixCls="ario-collapse">
          <Panel
            header={
              <div className="flex" style={{ justifyContent: 'space-between' }}>
                <span>ANT Tools</span>
                <button
                  disabled={isUpdating}
                  className="bg-primary text-black px-4 py-2 rounded"
                  onClick={updateANTRegistry}
                >
                  {isUpdating
                    ? `Updating ANT Registry: ${registrations}/${totalAnts} updates completed`
                    : 'Update ANT Registry'}
                </button>
              </div>
            }
            key="1"
          >
            <div className="flex flex-col text-white">
              <h2 className="text-lg">ANT Versions</h2>
              {antVersions ? (
                <ReactMarkdown className="text-white bg-background rounded p-2">
                  {'```json\n' + JSON.stringify(antVersions, null, 2) + '\n```'}
                </ReactMarkdown>
              ) : (
                <></>
              )}
            </div>
          </Panel>
        </Collapse>
      </Space>
    </div>
  );
}

export default ANTTools;
