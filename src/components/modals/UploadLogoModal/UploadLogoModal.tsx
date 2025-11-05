import { useUploadArNSLogo } from '@src/hooks/useUploadArNSLogo';
import { isArweaveTransactionID } from '@src/utils';
import eventEmitter from '@src/utils/events';
import { ChangeEvent, useState } from 'react';

import DialogModal from '../DialogModal/DialogModal';

const UploadLogoModal = ({
  close,
  confirm,
}: {
  close: () => void;
  confirm: (transaction_id: string) => Promise<void>;
}) => {
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const { handleUploadArNSLogo } = useUploadArNSLogo(image);
  const [loading, setLoading] = useState(false);

  const selectImage = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setImage(null);
      setImageUrl('');
      return;
    }
    setImage(file);
    setImageUrl(URL.createObjectURL(file));
  };

  const handleUpdateLogo = async () => {
    if (!image) return;
    try {
      setLoading(true);
      const transaction_id = await handleUploadArNSLogo();
      if (!transaction_id || !isArweaveTransactionID(transaction_id)) {
        throw new Error('Logo upload failed');
      }
      await confirm(transaction_id);
      setLoading(false);
      close();
    } catch (error) {
      eventEmitter.emit('error', error);
      setLoading(false);
    }
  };

  return (
    <div className="modal-container">
      <DialogModal
        title={<h2 className="text-white text-2xl">Choose image to upload</h2>}
        body={
          <div
            className="flex flex-column text-white max-h-[600px] overflow-auto scrollbar scrollbar-w-2 scrollbar-thumb-grey scrollbar-thumb-rounded-md px-2"
            style={{ gap: '10px' }}
          >
            <input
              onChange={selectImage}
              type="file"
              accept="image/*"
              name="logo"
            />
            {!!imageUrl.trim().length && (
              <img
                src={imageUrl}
                className="w-full max-w-[350px] mt-4 radius"
                alt={image?.name}
              />
            )}
          </div>
        }
        onClose={close}
        onCancel={close}
        showClose={false}
        onNext={image ? handleUpdateLogo : undefined}
        nextText={loading ? '...' : 'Upload'}
        cancelText="Cancel"
      />
    </div>
  );
};

export default UploadLogoModal;
