import { LocalFileSystemDataProvider } from '../../services/arweave/LocalFilesystemDataProvider';
import localContractState from '../../../data/contracts/bLAgYxAdX2Ry-nt6aH2ixgvJXbpsEYm28NgJgyqfs-U.json'
import { useStateValue } from '../../state/state';
import { useState, useEffect } from 'react';
import { ArNSContractState } from '../../types';


const localContractAddress = "bLAgYxAdX2Ry-nt6aH2ixgvJXbpsEYm28NgJgyqfs-U";

export default async function useArNSContract(){
  const [{arnsSourceContract}, dispatch] = useStateValue();
  const [sendingContractState, setSendingContractState] = useState(false)

  try {
    const localProvider = new LocalFileSystemDataProvider();
 
    useEffect(()=>{
      dispatchNewContractState()
    },[])
   async function dispatchNewContractState():Promise<void>{
    if (sendingContractState){
      return;
    }
    setSendingContractState(true)

    const localState = await localProvider.getContractState(localContractAddress);
    if (!localState){
      throw Error("ArNS contract state is empty")
    } 
    console.log(localState)
    dispatch({type:'setArnsContractState', payload:{records: localState.records}})


   }


  } catch (error) {
    console.log(
      `error in setting contract state to GlobalState provider >>>`,
      error,
    );
  }
}
