import { useState } from 'react';
import { useStarknet } from '@starknet-react/core'
import { SubmitTransaction } from '~/components/SubmitTransaction'
import { SubmitTransfer } from '~/components/SubmitTransfer'
import { useRouter } from 'next/router';
import { PleaseConnect } from '../src/components/PleaseConnect';

export default function NewTransaction({ props }) {
  const { account } = useStarknet();
  const router = useRouter()
  const currentMultisigAddress = router.query.multisigAddress
  const [defaultTab, setDefaultTab] = useState(true);

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
    <>
    <div className='flex justify-center'>
      
      <div className='flex-col' >
        <button
          className={defaultTab ? "inline-block p-4 text-blue-600 rounded-t-lg border-b-2 border-blue-600 active dark:text-blue-500 dark:border-blue-500" : "inline-block p-4 rounded-t-lg border-b-2 border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"} //Copied from internet, need to personalize it 
          onClick={() => setDefaultTab(true)}>ERC-20 Transfer</button>
        <button
          className={!defaultTab ? "inline-block p-4 text-blue-600 rounded-t-lg border-b-2 border-blue-600 active dark:text-blue-500 dark:border-blue-500" : "inline-block p-4 rounded-t-lg border-b-2 border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"}
          onClick={() => setDefaultTab(false)}>Custom transaction</button>
      </div>
    </div>
    <div >
      {defaultTab ? (
        <div className=''>
          <SubmitTransfer address={currentMultisigAddress} />
        </div>
      )
        : (
          <div className=''>
            <SubmitTransaction address={currentMultisigAddress} />
          </div>
        )}
    
    </div>
    </>
  )
}
