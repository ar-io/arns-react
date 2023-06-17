import type { UploadFile, UploadProps } from 'antd';
import { Upload } from 'antd';
import { useEffect, useState } from 'react';

import { CodeSandboxIcon } from '../../icons';

const { Dragger } = Upload;

function FileUpload({ fileCallback }: { fileCallback: (f: File) => void }) {
  const [file, setFile] = useState<UploadFile>();

  useEffect(() => {
    if (!file) {
      return;
    }
    fileCallback(file.originFileObj as File);
    console.log(file);
  }, [file]);

  const props: UploadProps = {
    name: 'file',
    onChange(info) {
      setFile(info.fileList[0]);
    },
    onDrop(e) {
      console.log('Dropped files', e.dataTransfer.files);
    },
  };

  return (
    <Dragger
      listType="picture-card"
      {...props}
      className="file-upload-container"
    >
      <div
        className="flex flex-column"
        style={{ padding: '15px', gap: '15px', boxSizing: 'border-box' }}
      >
        <span>
          <CodeSandboxIcon
            fill="var(--accent)"
            width={'30px'}
            height={'30px'}
          />
        </span>
        <span className="white bold">
          Click or drag file to this area to upload
        </span>
        <span className="faded">
          You can upload files here and they will be included in the
          registration transaction to deploy an Atomic ANT contract. This means
          that the data will be used for the target ID, and will be accessable
          via the ArNS name you are registering.
        </span>
      </div>
    </Dragger>
  );
}

export default FileUpload;
