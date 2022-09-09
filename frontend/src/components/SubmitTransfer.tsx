import { useStarknet, useStarknetInvoke } from '@starknet-react/core'
import React from 'react'
import { useState } from 'react';
import { number } from "starknet";
import { getSelectorFromName, starknetKeccak } from "starknet/dist/utils/hash";
import { useMultisigContract } from '~/hooks/multisig'
import { toBN } from "starknet/dist/utils/number";

//draft solution for testing purpose, will need to store these constants in a better way in the future
type Token = {
    name: string,
    decimals: number,
    l1_token_address: string,
    l2_token_address: string
}

const WBTC: Token = {
    "name": "Wrapped BTC",
    "decimals": 8,
    "l1_token_address": "0xC04B0d3107736C32e19F1c62b2aF67BE61d63a05",
    "l2_token_address": "0x12d537dc323c439dc65c976fad242d5610d27cfb5f31689a0a319b8be7f3d56"
}

const USDC: Token = {
    "name": "Goerli USD Coin",
    "decimals": 6,
    "l1_token_address": "0x07865c6e87b9f70255377e024ace6630c1eaa37f",
    "l2_token_address": "0x005a643907b9a4bc6a55e9069c4fd5fd1f5c79a22470690f75556c4736e34426"
}

const USDT: Token = {
    "name": "Tether USD",
    "decimals": 6,
    "l1_token_address": "0x509Ee0d083DdF8AC028f2a56731412edD63223B9",
    "l2_token_address": "0x386e8d061177f19b3b485c20e31137e6f6bc497cc635ccdfcab96fadf5add6a"
}

const ETH: Token = {
    "name": "Ether",
    "decimals": 18,
    "l1_token_address": "0x0000000000000000000000000000000000000000",
    "l2_token_address": "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7"
}

const DAI:Token = {
    "name": "DAI",
    "decimals": 18,
    "l1_token_address": "0x11fE4B6AE13d2a6055C8D9cF65c55bac32B5d844",
    "l2_token_address": "0x03e85bfbb8e2a42b7bead9e88e9a1b19dbccf661471061807292120462396ec9"
}

export function SubmitTransfer(props: any) {
    const { account } = useStarknet()
    const { contract: multisig } = useMultisigContract(props.address)
    const { invoke: submitTransaction } = useStarknetInvoke({ contract: multisig, method: "submit_transaction" })
    const [sumbitRuleId, setSubmitRuleId] = useState<string>("");
    const [submitAddress, setSubmitAddress] = useState<string>("");
    const [submitQuantity, setSubmitQuantity] = useState<string>("");
    const [submitToken, setSubmitToken] = useState<Token>(ETH)

    const TRANSFER_SELECTOR = number.toBN(getSelectorFromName("transfer"));

    const submit = async () => {
        //need to add a check on the decimals depending on the token (e.g: if token is WBTC, quantity can't have more than 8 decimals)
        //need to add checks on the inputs
        const ruleId = number.toBN(sumbitRuleId)
        const submitQuantityNbr = Number(submitQuantity)
        const quantityWithCorrectDecimals = submitQuantityNbr * Math.pow(10, submitToken.decimals)//x 10^18
        const stringqty = quantityWithCorrectDecimals.toString() //I had to go through string conversion to get a BN. Any alternatives ? 
        const BNqty = number.toBN(stringqty)

        const tabParameters = [submitAddress, BNqty, toBN("0")] //toBN("0") is for the right part of Uint256, left part covers 2^127 

        await submitTransaction({
            args: [submitToken.l2_token_address, TRANSFER_SELECTOR, ruleId, tabParameters], //selector must be a BN
            metadata: { method: "transfer", message: 'transfer' },
        })
    };

    const onChangeToken = (value: string) => {
        switch (value) {
            case ("ETH"):
                setSubmitToken(ETH)
            case ("DAI"):
                setSubmitToken(DAI)
            case ("USDC"):
                setSubmitToken(USDC)
            case ("WBTC"):
                setSubmitToken(WBTC)
        }
    };

    if (!account) {
        return null
    }

    return (
        <div className='mt-5 flex flex-col mx-32'>

            <label className="block mb-2 text-sm font-medium text-gray-900">Select token to transfer</label>
            <select id="countries" className="mb-2 px-1 py-2 bg-gradient-to-r from-kpmg_purple to-kpmg_cobalt text-white border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            onChange={e => onChangeToken(e.target.value)}>
                <option value="ETH">ETH</option>
                <option value="DAI">DAI</option>
                <option value="USDC">USDC</option>
                <option value="WBTC">WBTC</option>
            </select>

            <input
                className="border-b border-dashed border-zinc-700 mb-3"
                type="text"
                value={submitAddress}
                placeholder="Receiver address"
                onChange={(e) => setSubmitAddress(e.target.value)}
            ></input>
            <input
                className="border-b border-dashed border-zinc-700 mb-3"
                type="text"
                value={submitQuantity}
                placeholder="Quantity"
                onChange={(e) => setSubmitQuantity(e.target.value)}
            ></input>
            <input
                className="border-b border-dashed border-zinc-700 mb-3"
                type="text"
                value={sumbitRuleId}
                placeholder="Rule ID"
                onChange={(e) => setSubmitRuleId(e.target.value)}
            ></input>

            <button
                className="bg-gradient-to-r hover:bg-gradient-to-l from-kpmg_purple to-kpmg_cobalt text-white ring-1 ring-zinc-700 mt-5 rounded-lg text-sm font-medium px-1 py-2 mx-40 "
                onClick={submit}
            >
                Submit Transfer
            </button>
        </div >
    )
}