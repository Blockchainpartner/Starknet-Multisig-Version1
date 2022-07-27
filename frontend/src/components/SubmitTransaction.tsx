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
    const [sumbitRuleId, setSubmitRuleId] = useState<number>(0);
    const [submitAddress, setSubmitAddress] = useState<string>("");
    const [submitfonction, setSubmitFunction] = useState<string>("");


    const formatSubmittedParameters = ( submittedString:string ) => {
        if ( submittedString === "" ){
            const emptyArray:Array<string> = [];
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
            args: [submitAddress, newSelector, '0x0', goodParameters], //to change '0x0' to ruleID 
            metadata: { method: 'submit_transaction', message: 'increment counter by 1' },
        })

    };

    const onRuleNumber = (value: string) => {
        setSubmitRuleId(Number(value));
    };


    if (!account) {
        return null
    }

    return (
        <div>
            <input
                className="border border-zinc-700"
                type="text"
                value={submitAddress}
                placeholder="contract Address"
                onChange={(e) => setSubmitAddress(e.target.value)} 
            ></input>
            <input
                className="border border-zinc-700"
                type="text"
                value={submitfonction}
                placeholder="function Name"
                onChange={(e) => setSubmitFunction(e.target.value)}
            ></input>
            <input
            className="border border-zinc-700"
            type="number"
            value={sumbitRuleId}
            placeholder="rule id"
            onChange={(e) => onRuleNumber(e.target.value)}
            ></input>
            <input
                className="border border-zinc-700"
                type="text"
                value={submitParameters}
                placeholder="function Parameters"
                onChange={(e) => setSubmitParameters(e.target.value)}
            ></input>

            <button
                className="bg-stone-200 ring-1 ring-zinc-700 ml-2 rounded-lg text-sm font-medium px-1 py-1"
                onClick={submit}
            >
                Submit Transaction
            </button>
        </div >
    )
}