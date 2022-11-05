import { LocalFileSystemDataProvider } from '../../services/arweave/LocalFilesystemDataProvider';
import localContractState from '../../../data/contracts/bLAgYxAdX2Ry-nt6aH2ixgvJXbpsEYm28NgJgyqfs-U.json'
import { useStateValue } from '../../state/state';
import { useState, useEffect } from 'react';


const localContractAddress = "bLAgYxAdX2Ry-nt6aH2ixgvJXbpsEYm28NgJgyqfs-U";

export default function useArNSContract(){
  try {
    const localProvider = new LocalFileSystemDataProvider();
    const localState = localProvider.getContractState(localContractAddress);
    const localContractRecords = localState.records;
    console.log(localContractRecords)
    const [{arnsSourceContract}, dispatch] = useStateValue();

    useEffect(()=>{
      dispatch({type:'setArnsContractState', payload:{records:localContractRecords}})

    },[])
   


  } catch (error) {
    console.log(
      `error in setting contract state to GlobalState provider >>>`,
      error,
    );
  }
}
