import { useEffect, useState } from "react";
import { useStarknet, useStarknetCall } from '@starknet-react/core'
import { useMultisigContract } from '~/hooks/multisig'
import { RenderTransactions } from '~/components/RenderTransactions'
import { PleaseConnect } from '~/components/PleaseConnect'
import { useRouter } from 'next/router';


export default function Transactions() {
  const { account } = useStarknet()
  const router = useRouter()
  const currentMultisigAddress = router.query.multisigAddress
  const [transactionsLen, setTransactionsLen] = useState()

  const { contract: multisig } = useMultisigContract(currentMultisigAddress)
  const { data, loading, error } = useStarknetCall({
    contract: multisig,
    method: 'get_transactions_len',
    args: [],
  })

  useEffect(() => {
    if (!loading && data) {
      setTransactionsLen(data.toString())
    }
  }, [data, loading])

  // const router = useRouter()
  // const currentMultisigAddress = router.query.multisigAddress
  // const [arrayTransac, setArrayTransac] = useState([]);
  // const [lenTransac, setLenTransac] = useState(0);

  // const { account } = useStarknet()
  // const { contract: multisig } = useMultisigContract(currentMultisigAddress)
  // const { data, loading, error } = useStarknetCall({
  //   contract: multisig,
  //   method: 'get_transactions_len',
  //   args: [],
  // })

  // if (!loading && data) {
  //   setLenTransac(data.toString())
  // }


  // function GetTransaction(tx_index) {
  //   const { data, loading, error } = useStarknetCall({
  //     contract: multisig,
  //     method: 'get_transaction',
  //     args: [tx_index],
  //   })

  //   useEffect(() => {
  //     if (!loading && data) {
  //       const transaction = {
  //         tx_index: tx_index,
  //         data: data
  //       }
  //       if (!arrayTransac.some(transac => transac.tx_index === tx_index)) {
  //         setArrayTransac([...arrayTransac, transaction])
  //       }
  //     }
  //   }, [data])
  // }

  //Temporary solution until to find a solution to "too many renders issue"
  // for (let i = 0; i <= 10; i++) {
  //   GetTransaction(i);
  // }

  if (!account) {
    return (
      <PleaseConnect component="wallet" />
    )
  }

  if (currentMultisigAddress === "") {
    return (
      <PleaseConnect component="multisig" />
    )
  }

  return (
    <div>
    {transactionsLen &&
      <RenderTransactions len={transactionsLen} currentMultisigAddress={currentMultisigAddress}/>
    }
  </div>
  )
}
