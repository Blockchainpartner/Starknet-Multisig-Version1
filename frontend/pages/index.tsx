import type { NextPage } from 'next'
import { ConnectWallet } from '~/components/ConnectWallet'
import { CreateMultisig } from '~/components/CreateMultisig'


const Home: NextPage = () => {



  return (
    <div>
      <h2>Connect your wallet</h2>
      <ConnectWallet />

    </div >
  )
}

export default Home
