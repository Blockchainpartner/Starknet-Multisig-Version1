import { useStarknet, useStarknetInvoke } from '@starknet-react/core'
import React from 'react'
import { useState } from 'react';
import { number } from "starknet";
import { getSelectorFromName, starknetKeccak } from "starknet/dist/utils/hash";
import { useMultisigContract } from '~/hooks/multisig'




export function SubmitTransaction() {
    const { account } = useStarknet()
    const { contract: multisig } = useMultisigContract()
    const { invoke: submitTransaction } = useStarknetInvoke({ contract: multisig, method: "submit_transaction" })

    const [recipient, setRecipient] = useState<string>("");
    const [submitParameters, setSubmitParameters] = useState<string>("");
    const [submitAddress, setSubmitAddress] = useState<string>("");
    const [submitfonction, setSubmitFunction] = useState<string>("");




    const submit = async () => {
        const newSelector = number.toBN(getSelectorFromName(submitfonction));
        const pars = submitParameters.split(" ");
        await submitTransaction({
            args: [submitAddress, newSelector, 0, pars],
            metadata: { method: 'submit_transaction', message: 'increment counter by 1' },
        })



    };


    if (!account) {
        return null
    }

    return (
        <div>
            <input
                type="text"
                value={submitAddress}
                onChange={(e) => setSubmitAddress(e.target.value)}
            ></input>
            <input
                type="text"
                value={submitfonction}
                onChange={(e) => setSubmitFunction(e.target.value)}
            ></input>
            <input
                type="text"
                value={submitParameters}
                onChange={(e) => setSubmitParameters(e.target.value)}
            ></input>

            <button
                onClick={submit}
            >
                Submit Transaction
            </button>
        </div >
    )
}
