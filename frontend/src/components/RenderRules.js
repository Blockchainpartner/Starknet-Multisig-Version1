import { useEffect, useState } from 'react'
import { useStarknet, useStarknetCall } from '@starknet-react/core'
import { useMultisigContract } from '~/hooks/multisig'
import { toHex } from 'starknet/dist/utils/number'
import { RuleItem } from '~/components/RuleItem'



export function RenderRules(props) {
    const [arrayRules, setArrayRules] = useState([])

    const { contract: multisig } = useMultisigContract(props.currentMultisigAddress)

    function GetRule(i, multisig) {
        const { data, loading, error } = useStarknetCall({
            contract: multisig,
            method: 'get_rule',
            args: [i],
        })

        useEffect(() => {
            const rule = {
                rule_index: i,
                data: data
            }
            if (!loading && data) {
                if (!arrayRules.some(transac => transac.rule_index === i)) {
                    setArrayRules([...arrayRules, rule])
                }
            }
        }, [data, loading])

    }

    for (let i = 0; i < props.len; i++) {
        GetRule(i, multisig);
    }

    console.log(arrayRules)
    console.log("je suis render renderRules")
    return (
        <div>
            <h2 className="font-semibold">Existing rules</h2>
            <div className="flex justify-between m-3">
                <h3>Rule number</h3>
                <h3>Beneficiary</h3>
                <h3>Recipient</h3>
                <h3>Allowed Amount</h3>
                <h3>Asset</h3>
                <h3>Confirmations required</h3>
            </div>
            {
                arrayRules.map((item, index) => {
                    return (
                        <RuleItem key={index} rule={item} />
                    )
                })}
                

        </div>
    )
}
