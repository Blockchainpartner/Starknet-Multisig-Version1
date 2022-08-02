import { useEffect, useState } from "react";
import { useStarknet, useStarknetCall } from '@starknet-react/core'
import { useMultisigContract } from '~/hooks/multisig'
import { bnToUint256, uint256ToBN } from 'starknet/dist/utils/uint256'
import { TransactionItem } from '~/components/TransactionItem'
import { PleaseConnectWallet } from '~/components/PleaseConnectWallet'



export default function Transactions(deployedMultisigAddress) {
    //need to use getInitialProps from NextJS to pass multisigAddress from root
    const [arrayTransac, setArrayTransac] = useState([]);
    const [lenTransac, setLenTransac] = useState(0);
    
    
    const { account } = useStarknet()
    const { contract : multisig } = useMultisigContract('0x030b315a8ace5643032716fa368f022d25ef7fc6b32b8d56c9e29f4fb55327a3')
    const { data, loading, error } = useStarknetCall({ 
      contract: multisig, 
      method: 'get_transactions_len',
      args: [],
    })

    // if (!loading && data) {
    //   setLenTransac(data.toString())
    // }
    

    function GetTransaction(tx_index) { 
      const { data, loading, error } = useStarknetCall({ 
          contract: multisig, 
          method: 'get_transaction',
          args: [tx_index],
      })

      useEffect(() => {
        if(!loading && data){
          const transaction = {
            tx_index: tx_index,
            data: data
          }
          if (!arrayTransac.some(transac => transac.tx_index === tx_index)){
            setArrayTransac([...arrayTransac, transaction])
          }
        }
      }, [data])
    }

    //Temporary solution until to find a solution to "too many renders issue"
    for(let i=0; i<=10; i++){
      GetTransaction(i);
    }

  if (!account) {
    return (
        <PleaseConnectWallet/>
    )
  }
  
  return (
    <div className="m-2">
      <h2 className="font-semibold">Queue transactions</h2>
        {arrayTransac.length !== 0 &&
          arrayTransac.map((item, index) => {
            if (item.data.tx.executed.toString() != 1) {
              return(
                <TransactionItem key={index} transac={item} multisigAddress={'0x030b315a8ace5643032716fa368f022d25ef7fc6b32b8d56c9e29f4fb55327a3'}/>
              )}
        })}
        <h2 className="font-semibold">History</h2>
        {arrayTransac.length !== 0 &&
          arrayTransac.map((item, index) => {
            if (item.data.tx.executed.toString() != 0) {
              return(
                <TransactionItem key={index} transac={item} multisigAddress={'0x030b315a8ace5643032716fa368f022d25ef7fc6b32b8d56c9e29f4fb55327a3'}/>
              )}
        })}  
    </div>
  )
}
