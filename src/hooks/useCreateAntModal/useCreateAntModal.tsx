import { useGlobalState } from '../../state/contexts/GlobalState';

export default function useCreateAntModal() {
  // eslint-disable-next-line
  const [{ showCreateAnt }] = useGlobalState();

  return {
    showCreateAntModal: showCreateAnt,
  };
}
