import { useStarknet } from '@starknet-react/core'
import { SubmitTransaction } from '~/components/SubmitTransaction'
import { PleaseConnectWallet } from '~/components/PleaseConnectWallet'
import { useRouter } from 'next/router';

export default function NewTransaction({ props }) {
  const { account } = useStarknet();
  const router = useRouter()
  const currentMultisigAddress = router.query.multisigAddress

  if (!account) {
    return (
      <PleaseConnectWallet />
    )
  }

  return (
    <div className='mt-10 ml-10'>
      <h3>Create transaction :</h3>
      <SubmitTransaction address={currentMultisigAddress} />
    </div>
  )
}

