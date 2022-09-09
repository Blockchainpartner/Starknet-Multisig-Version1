import { useStarknet, useStarknetInvoke } from '@starknet-react/core'
import React from 'react'
import { useState } from 'react';
import { number } from "starknet";
import { getSelectorFromName, starknetKeccak } from "starknet/dist/utils/hash";
import { useMultisigContract } from '~/hooks/multisig'
import { toBN } from "starknet/dist/utils/number";


export function SubmitTransaction(props: any) {


    const { account } = useStarknet()
    const { contract: multisig } = useMultisigContract(props.address)
    const { invoke: submitTransaction } = useStarknetInvoke({ contract: multisig, method: "submit_transaction" })
    const [submitParameters, setSubmitParameters] = useState<string>("");
    const [sumbitRuleId, setSubmitRuleId] = useState<string>(""); //causes an error because it changes from undefined to controlled input
    const [submitAddress, setSubmitAddress] = useState<string>("");
    const [submitfonction, setSubmitFunction] = useState<string>("");


    const formatSubmittedParameters = (submittedString: string) => {
        if (submittedString === "") {
            const emptyArray: Array<string> = [];
            return emptyArray;
        }
        else {
            const parametersArrayBNumberized = submittedString.split(" ").map((p) => toBN(p));
            return parametersArrayBNumberized;
        }
    }


    const submit = async () => {
        const newSelector = number.toBN(getSelectorFromName(submitfonction));
        const ruleId = number.toBN(sumbitRuleId)
        const goodParameters = formatSubmittedParameters(submitParameters)
        await submitTransaction({
            args: [submitAddress, newSelector, ruleId, goodParameters],
            metadata: { method: submitfonction, message: 'to add later' },
        })
    };

    if (!account) {
        return null
    }

    return (
        <div className='mt-5 flex flex-col mx-32'>
            <h3 className='mb-2 text-sm font-medium text-gray-900'>Custom transaction</h3>
            <input
                className="border-b border-dashed border-zinc-700 mb-3"
                type="text"
                value={submitAddress}
                placeholder="Contract address"
                onChange={(e) => setSubmitAddress(e.target.value)}
            ></input>
            <input
                className="border-b border-dashed border-zinc-700 mb-3"
                type="text"
                value={submitfonction}
                placeholder="Function name"
                onChange={(e) => setSubmitFunction(e.target.value)}
            ></input>
            <input
                className="border-b border-dashed border-zinc-700 mb-3"
                type="number"
                value={sumbitRuleId}
                placeholder="Rule ID"
                onChange={(e) => setSubmitRuleId(e.target.value)}
            ></input>
            <input
                className="border-b border-dashed border-zinc-700 mb-3"
                type="text"
                value={submitParameters}
                placeholder="Function parameters"
                onChange={(e) => setSubmitParameters(e.target.value)}
            ></input>

            <button
                className="bg-gradient-to-r hover:bg-gradient-to-l from-kpmg_purple to-kpmg_cobalt text-white ring-1 ring-zinc-700 mt-5 rounded-lg text-sm font-medium px-1 py-2 mx-40"
                onClick={submit}
            >
                Submit Transaction
            </button>
        </div >
    )
}