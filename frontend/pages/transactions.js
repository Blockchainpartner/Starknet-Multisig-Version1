import { useEffect, useState, useMemo } from "react";
import { useStarknet, useStarknetCall } from '@starknet-react/core'
import { useMultisigContract } from '~/hooks/multisig'
import { useTokenContract } from '~/hooks/token'
import { bnToUint256, uint256ToBN } from 'starknet/dist/utils/uint256'


export default function transactions() {
    //faire les appels pour récupérer les transactions du multisig donc besoin d'un props pour l'adresse du contrat 

    function GetTransactionLen() {
        const { multisig } = useMultisigContract('0x030b315a8ace5643032716fa368f022d25ef7fc6b32b8d56c9e29f4fb55327a3')
        const { data, loading, error } = useStarknetCall({ 
            contract: multisig, 
            method: 'get_transactions_len',
        })

        const content = useMemo(() => {

            if (loading || !data?.length) {
    
                return <div>Loading multisig</div>
            }
    
            if (error) {
                return <div>Error: {error}</div>
            }
    
            const nbTransac = data[0]
            //return <p className={`text-sm font-light mb-4`}>{`nbTransac: ${nbTransac}`}</p>
            return <div>{nbTransac}</div>
        }, [data, loading, error])
        console.log("multisig :", data)
        console.log("error multisig: ", error)

        return (
            <div>
                <div>Multisig </div>
            </div>
        )

    }

    function UserBalance() {
        const { contract } = useTokenContract()
      
        const { data, loading, error } = useStarknetCall({
          contract,
          method: 'balanceOf',
          args: ['0x01DF5be62C235Ed7718A35919183ea1908c5957769D1bB2337C746Be7A8a2c34'],
        })
      
        const content = useMemo(() => {
          if (loading || !data?.length) {
            return <div>Loading balance</div>
          }
      
          if (error) {
            return <div>Error: {error}</div>
          }
      
          const balance = uint256ToBN(data[0])
          return <div>{balance.toString(10)}</div>
        }, [data, loading, error])
        console.log("compteur :", data)
      
        return (
          <div>
            <h2>User balance</h2>
            {content}
          </div>
        )
      }



  return (
    <div>list of transactions and actions to do on these transactions
        <UserBalance/>
        <GetTransactionLen/>
    </div>
  )
}
