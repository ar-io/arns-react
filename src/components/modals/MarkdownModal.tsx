import ReactMarkdown from 'react-markdown';

import { useIsMobile } from '../../hooks';
import DialogModal from './DialogModal/DialogModal';

export interface MarkdownModalProps {
  title: string;
  markdownText: string;
  onClose: () => void;
}

function MarkdownModal({ title, markdownText, onClose }: MarkdownModalProps) {
  const isMobile = useIsMobile();

  return (
    <div
      className="modal-container"
      style={isMobile ? { padding: 'none' } : {}}
    >
      {/**modal header */}
      <DialogModal
        title={<div className="white text-xl">{title}</div>}
        body={
          <div
            className="flex flex-col scrollbar h-full min-h-[7.5rem] max-h-96 overflow-y-scroll overflow-x-hidden scrollbar-thumb-primary-thin scrollbar-thumb-rounded-full scrollbar-w-2"
            style={{ fontSize: '14px', maxWidth: '575px', minWidth: '475px' }}
          >
            <ReactMarkdown
              className="text-light-grey
            prose my-2 grow overflow-y-auto text-sm scrollbar prose-headings:text-white prose-h2:text-base prose-h3:text-sm
            "
              components={{
                code: ({ children }) => {
                  return <code className="text-grey text-sm">{children}</code>;
                },
              }}
            >
              {markdownText}
            </ReactMarkdown>
          </div>
        }
        onCancel={onClose}
        onClose={onClose}
        showFooterBorder={false}
      />
    </div>
  );
}

export default MarkdownModal;
