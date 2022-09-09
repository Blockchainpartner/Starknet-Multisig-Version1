import { ConnectWallet } from "./ConnectWallet"


export default function HeaderBar() {
  return (
    <div className="flex flex-row justify-between items-center text-kpmg_dark_blue border-b-2">
        <h1 className="text-2xl font-extrabold mx-2">Starknet Multisig</h1> 
        <ConnectWallet/>

    </div>
  )
}
