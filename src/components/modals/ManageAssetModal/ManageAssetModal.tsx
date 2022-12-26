import { ArweaveTransactionId } from '../../../types';

function ManageAssetModal({
  asset,
  assetType,
}: {
  asset: ArweaveTransactionId | string;
  assetType: 'ant' | 'undername' | 'name';
}) {
  // todo: manage asset modal writes asset modifications to contract. It will auto detect if the asset is an ANT, name, or undername.
  // if the asset is a name, it will write modifications to the registry. If its an undername, it will write mods to the ant. If its an ant, it will write mods to the ant.

  return <div className="modal"></div>;
}

export default ManageAssetModal;
