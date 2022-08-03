import { useStarknet } from '@starknet-react/core'
import { SubmitTransaction } from '~/components/SubmitTransaction'
import { PleaseConnectWallet } from '~/components/PleaseConnectWallet'
import { useRouter } from 'next/router';

export default function NewTransaction({props}) {
    const { account } = useStarknet();
    const router = useRouter()
    const currentMultisigAddress = router.query.multisigAddress

    if (!account) {
        return (
            <PleaseConnectWallet/>
        )
    }

  return (
    <div>newTransaction :
        <SubmitTransaction address={currentMultisigAddress} />
    </div>
  )
}

