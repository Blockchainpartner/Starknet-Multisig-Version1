import { useEffect, useState } from 'react'
import { useStarknetCall } from '@starknet-react/core'
import { useMultisigContract } from '~/hooks/multisig'
import { TransactionItem } from '~/components/TransactionItem'



export function RenderTransactions(props) {
    const [arrayTransactions, setArrayTransactions] = useState([])

    const { contract: multisig } = useMultisigContract(props.currentMultisigAddress)

    function GetTransaction(i, multisig) {
        const { data, loading, error } = useStarknetCall({
            contract: multisig,
            method: 'get_transaction',
            args: [i],
        })

        useEffect(() => {
            const transaction = {
                tx_index: i,
                data: data
            }
            if (!loading && data) {
                if (!arrayTransactions.some(transac => transac.tx_index === i)) {
                    setArrayTransactions([...arrayTransactions, transaction])
                }
            }
        }, [data, loading])

    }

    for (let i = 0; i < props.len; i++) {
        GetTransaction(i, multisig);
    }

    return (
        <div className="m-2">
      <h2 className="font-semibold">Queue transactions</h2>
      {arrayTransactions.length !== 0 &&
        arrayTransactions.map((item, index) => {
          if (item.data.tx.executed.toString() != 1) {
            return (
              <TransactionItem key={index} transac={item} multisigAddress={props.currentMultisigAddress} />
            )
          }
        })}
      <h2 className="font-semibold">History</h2>
      {arrayTransactions.length !== 0 &&
        arrayTransactions.map((item, index) => {
          if (item.data.tx.executed.toString() != 0) {
            return (
              <TransactionItem key={index} transac={item} multisigAddress={props.currentMultisigAddress} />
            )
          }
        })}
    </div>
    )
}
