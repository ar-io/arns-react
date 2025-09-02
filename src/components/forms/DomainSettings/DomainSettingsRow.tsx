import { Tooltip } from '@src/components/data-display';
import { InfoIcon, PencilIcon } from '@src/components/icons';
import { CSSProperties } from 'react';

export default function DomainSettingsRow({
  label,
  labelTooltip,
  value,
  action = [],
  editable,
  editing = false,
  customStyle = {},
  onCancel,
  onSave,
  setEditing,
}: {
  label?: string;
  labelTooltip?: string;
  value?: React.ReactNode;
  action?: React.ReactNode[] | React.ReactNode;
  editable?: boolean;
  editing?: boolean;
  customStyle?: CSSProperties;
  onCancel?: () => void;
  onSave?: () => void;
  setEditing?: () => void;
}) {
  return (
    <div
      className="flex flex-row relative items-start justify-center rounded px-4 py-2 overflow-hidden min-h-[40px]"
      style={{
        border: '1px solid var(--disabled-grey)',
        borderColor: editing ? 'var(--text-grey)' : 'var(--disabled-grey)',
        color: 'var(--text-grey)',
        ...customStyle,
      }}
    >
      <div className="flex flex-col w-full gap-2">
        {/* Label section */}
        <div className="flex text-xs overflow-hidden gap-2 text-grey w-fit items-center">
          <div className="flex gap-1 items-start whitespace-nowrap">
            {label}
            {labelTooltip && (
              <Tooltip
                message={labelTooltip}
                icon={<InfoIcon className="w-4 h-4 fill-grey" />}
              />
            )}
          </div>
        </div>

        {/* Value section */}
        <div
          className={`flex text-xs h-full mr-[120px] mx-[5px] items-center whitespace-nowrap ${
            value ? 'text-white' : 'text-grey'
          }`}
        >
          {value || 'None'}
        </div>
      </div>

      {/* Actions section */}
      <div className="flex items-center gap-1 ml-1 absolute right-5 ">
        {/* Custom action */}
        {Array.isArray(action)
          ? action.map((act, idx) => <div key={idx}>{act}</div>)
          : action}

        {/* Edit/Save/Cancel buttons */}
        {editable && (
          <>
            {!editing && setEditing ? (
              <button
                className="p-1 rounded transition-colors hover:opacity-80 hover:scale-105"
                onClick={setEditing}
              >
                <PencilIcon
                  className="w-4 h-4"
                  style={{ fill: 'var(--text-grey)' }}
                />
              </button>
            ) : (
              editable &&
              onSave && (
                <div className="flex gap-2">
                  <button
                    className="px-2 py-1 text-xs font-bold rounded transition-colors hover:opacity-80 hover:scale-105 text-grey"
                    onClick={onCancel}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-2 py-1 text-xs rounded transition-colors hover:opacity-80 hover:scale-105 bg-primary text-black"
                    onClick={onSave}
                  >
                    Save
                  </button>
                </div>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
}
