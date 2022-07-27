import { useStarknet } from '@starknet-react/core'
import { SubmitTransaction } from '~/components/SubmitTransaction'


export default function newTransaction() {
    const { account } = useStarknet();
    const deployedMultisigAddress = "0x030b315a8ace5643032716fa368f022d25ef7fc6b32b8d56c9e29f4fb55327a3"


    if (!account) {
        return (
            <div>Please connect a wallet to submit a transaction </div>
        )
    }

  return (
    <div>newTransaction
        <SubmitTransaction address={deployedMultisigAddress} />
    </div>
  )
}

