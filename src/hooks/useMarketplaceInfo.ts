import { useGlobalState, useWalletState } from "@src/state";
import { useQuery } from "@tanstack/react-query";

export function useMarketplaceInfo() {
    const [{ marketplaceContract, marketplaceProcessId, aoNetwork }] = useGlobalState();
    const [{walletAddress}] = useWalletState();
    return useQuery({
        queryKey: ['marketplace-intents', marketplaceProcessId, walletAddress, aoNetwork.ARIO],
        queryFn: () => {
            return marketplaceContract.getInfo();
        },
        enabled: !!marketplaceContract && !!marketplaceProcessId && !!walletAddress && !!aoNetwork.ARIO,
        staleTime: 24 * 60 * 60 * 1000, // 24 hours
    });
}
