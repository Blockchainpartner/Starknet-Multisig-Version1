import { useContract } from '@starknet-react/core'
import { Abi } from 'starknet'

import multisigAbi from '~/abi/multisig.json'

export function useMultisigContract(multisigAddress: string) {
    return useContract({
        abi: multisigAbi as Abi,
        address: multisigAddress,
    })
}