import { useContract } from '@starknet-react/core'
import { Abi } from 'starknet'

import CounterAbi from '~/abi/target.json'

export function useTargetContract() {
    return useContract({
        abi: CounterAbi as Abi,
        address: '0x075363e4d018d2ba58ff5db3b6be01e6d806cd8e9d59abf7f103cb764b06dfb6',
    })
}
