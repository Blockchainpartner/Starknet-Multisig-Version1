import { useEffect, useState } from 'react'
import { useStarknetCall } from '@starknet-react/core'
import { useMultisigContract } from '~/hooks/multisig'
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

    return (
        <div>
            <h2 className="font-semibold m-2 text-kpmg_dark_blue">Existing rules</h2>
            {/* <div className="flex justify-between m-3">
                <h3>Rule number</h3>
                <h3>Beneficiary</h3>
                <h3>Recipient</h3>
                <h3>Allowed Amount</h3>
                <h3>Asset</h3>
                <h3>Confirmations required</h3>
            </div> */}
            <div className="grid grid-flow-col place-items-center">
                <h3>Rule number</h3>
                <h3>Beneficiary</h3>
                <h3>Recipient</h3>
                <h3 className=''>Allowed Amount</h3>
                <h3 className=''>Asset</h3>
                <h3 className=''>Confirmations required</h3>
            </div>
            {
                arrayRules
                    .sort((a, b) => a.rule_index > b.rule_index ? 1 : -1)
                    .map((item, index) => {
                    return (
                        <RuleItem key={index} rule={item} />
                    )
                })}
                

        </div>
    )
}
