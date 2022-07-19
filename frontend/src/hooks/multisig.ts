import { useContract } from '@starknet-react/core'
import { Abi } from 'starknet'

import multisigAbi from '~/abi/multisig.json'

export function useMultisigContract() {
    return useContract({
        abi: multisigAbi as Abi,
        address: '0x04be32cfdc2f8debf4ea2f7a52754e9838154e9733e2654789dde4ac336ae762',
    })
}
