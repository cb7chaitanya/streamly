import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";
import '@solana/wallet-adapter-react-ui/styles.css';
import { useMemo } from "react";
import { RecoilRoot } from "recoil";

const Provider = ({children}: {children: React.ReactNode}) => {
    const network = WalletAdapterNetwork.Devnet;
    const endpoint: string = useMemo(() => clusterApiUrl(network), [network])
    return (
        <RecoilRoot>
        <div className='bg-white h-screen w-full'>
            <ConnectionProvider endpoint={endpoint}>
                <WalletProvider wallets={[]}>
                    <WalletModalProvider>
                        {children}
                    </WalletModalProvider>
                </WalletProvider>
            </ConnectionProvider>
        </div>
        </RecoilRoot>
    )
}

export default Provider