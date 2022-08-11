import { useEffect, useState } from 'react'
import { PleaseConnect } from '~/components/PleaseConnect'
import { useStarknet, useStarknetCall } from '@starknet-react/core'
import { useRouter } from 'next/router';
import { useMultisigContract } from '~/hooks/multisig'
import { RenderRules } from '../src/components/RenderRules';
import { CreateRule } from '../src/components/CreateRule';


export default function rules() {
  const { account } = useStarknet()
  const router = useRouter()
  const currentMultisigAddress = router.query.multisigAddress
  const [ruleLen, setRuleLen] = useState()

  const { contract: multisig } = useMultisigContract(currentMultisigAddress)
  if (currentMultisigAddress != "") {
    const { data, loading, error } = useStarknetCall({
      contract: multisig,
      method: 'get_rules_len',
      args: [],
    })

    useEffect(() => {
      if (!loading && data) {
        setRuleLen(data.toString())
      }
    }, [data, loading])
}



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
  
      {ruleLen &&
        <RenderRules len={ruleLen} currentMultisigAddress={currentMultisigAddress}/>
      }
      <CreateRule currentMultisigAddress={currentMultisigAddress}/>

    </div>
  )
}
