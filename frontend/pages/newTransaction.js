import { useStarknet } from '@starknet-react/core'
import { SubmitTransaction } from '~/components/SubmitTransaction'
import { useRouter } from 'next/router';
import { PleaseConnect } from '../src/components/PleaseConnect';

export default function NewTransaction({ props }) {
  const { account } = useStarknet();
  const router = useRouter()
  const currentMultisigAddress = router.query.multisigAddress

  if (!account) {
    return (
      <PleaseConnect component="wallet" />
    )
  }

  if (currentMultisigAddress === ""){
      return (
        <PleaseConnect component="multisig" />
      )
  }

  return (
    <div className='mt-10 ml-10'>
      <h3>Create transaction :</h3>
      <SubmitTransaction address={currentMultisigAddress} />
    </div>
  )
}
