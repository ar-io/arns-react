import { useANTVersions } from '@src/hooks/useANTVersions';
import React from 'react';

const inputContainerClass =
  'flex flex-col gap-2 border border-primary-thin p-2 rounded-md bg-metallic-grey';

function ANTTools() {
  const { data: antVersions } = useANTVersions();
  const [expanded, setExpanded] = React.useState(false);
  return (
    <div className="flex flex-col w-full h-fit p-3 text-sm">
      <div className={inputContainerClass}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-md text-white">ANT Versions</span>
        </div>
        {antVersions ? (
          <div className="flex flex-col text-white w-full">
            <button
              onClick={() => setExpanded((e) => !e)}
              className="text-grey border-[0.5px] border-dark-grey rounded hover:border-white hover:text-white transition-all flex w-fit py-1 px-3 rounded-sm text-xs font-semibold mb-2"
            >
              {expanded ? 'Click to hide' : 'Click to show'}
            </button>
            {expanded && (
              <pre className="text-white bg-background rounded p-2 overflow-auto h-fit text-xs w-full mb-2">
                {JSON.stringify(antVersions, null, 2)}
              </pre>
            )}
          </div>
        ) : (
          <span className="text-white">Loading...</span>
        )}
      </div>
    </div>
  );
}

export default ANTTools;
