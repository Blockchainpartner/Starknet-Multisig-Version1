import { useStarknet } from '@starknet-react/core'
import React from 'react'
import { useState, useEffect } from 'react';
import { number } from "starknet";
import { useContractFactory } from '~/hooks/deploy'
import multisigABI from "../src/abi/multisig.json";
import { CompiledContract, json, Abi } from "starknet";
import { PleaseConnect } from '~/components/PleaseConnect'



export default function CreateMultisig() {

    const [compiledMultisig, setCompiledMultisig] = useState<CompiledContract>();
    const [confirmationNumber, setConfirmationNumber] = useState<string>("1");
    const [owners, setOwners] = useState<string[]>([]);
    const [ownersNumber, setOwnersNumber] = useState<number>(1);
    const [deployedMultisigAddress, setDeployedMultisigAddress] = useState<string>();

    const { account } = useStarknet();
    const { deploy: deployMultisig } = useContractFactory({
        compiledContract: compiledMultisig,
        abi: (multisigABI as any).abi as Abi, //attention c'est l'abi du mauvais contrat multisig ! 
    });

    useEffect(() => {
        const getCompiledMultisig = async () => {
            const raw = await fetch("/Multisig.json");
            const compiled = json.parse(await raw.text());
            return compiled;
        };
        if (!compiledMultisig) {
            getCompiledMultisig().then(setCompiledMultisig);
        }
    }, []);

    useEffect(() => {
        const emptyOwners = [...Array(ownersNumber)].map((item) => "");
        emptyOwners[0] = account ?? "";
        setOwners(emptyOwners);
    }, [ownersNumber]);

    const getCompiledMultisig = async () => {
        const raw = await fetch("/Multisig.json");
        const compiled = json.parse(await raw.text());
        return compiled;
    };

    const onDeploy = async () => {
        const _deployMultisig = async () => {
            const Owners = owners.map((o) => number.toBN(o));
            const calldata = [ownersNumber, ...Owners, Number(confirmationNumber)]
            const deployment = await deployMultisig({
                constructorCalldata: calldata,
            });
            if (deployment) {
                setDeployedMultisigAddress(deployment.address);
            }
        };
        await _deployMultisig();
    };

    const optionsjSX = (i: number) => {
        let options = [];
        for (let j = 1; j <= i; j++) {
            options.push(j)
        }
        const listItems = options.map((number) =>
            <option key={number}>{number}</option>
        );
        return listItems
    }



    const onChangeOwner = (value: string, index: number) => {
        console.log("on changeOwner", owners.length)
        console.log("value,index", value, index)
        const addNewOwner = [...owners];
        addNewOwner[index] = value;
        setOwners([...addNewOwner]);
        console.log("owners", addNewOwner);
    };

    const onOwnersNumber = (value: string) => {
        setOwnersNumber(Number(value));
    };



    // if (!account) {
    //     return (           
    //             <PleaseConnectWallet/>           
    //     )
    // }

    return (
        <div className=''>
            <div className="pl-10 pt-5 flex flex-col">
                <div className='flex flex-row mt-5'>
                    <h1 className='text-xl font-semibold'>Configure & Deploy a new multisig account</h1>
                </div>
                <div className='flex flex-row mt-20'>
                    <h3>Number of owners:{" "}</h3>
                    <input
                        className="border rounded shadow ml-3"
                        key={0}
                        value={undefined}
                        type="number"
                        defaultValue={1}
                        onChange={(e) => {
                            onOwnersNumber(e.target.value)
                        }} >
                    </input >
                </div>
                <div className='flex flex-row mt-5'>
                    <h3>
                        Number of signers:{" "}
                    </h3>

                    <select
                        className='ml-3'
                        onChange={(e) => {
                            setConfirmationNumber(e.target.value);
                        }}
                        value={confirmationNumber}
                    >
                        {optionsjSX(ownersNumber as number)}
                    </select>
                </div>

                <div className='mt-5'>
                    {
                        owners.map((owner, i) => {
                            return (
                                <div key={i} className="flex flex-col mb-3">
                                    <div className="flex flex-row">
                                        Signer {i + 1} address:
                                        <input
                                            className="border rounded shadow ml-3 w-1/2"
                                            type="text"
                                            onChange={(e) => onChangeOwner(e.target.value, i)}
                                            value={owner}
                                        ></input>
                                    </div>
                                </div>
                            );
                        })
                    }
                </div>


                <div className='flex flex-row mt-10 justify-start'>

                    < button
                        className="bg-stone-200 ring-1 ring-zinc-700  mt-5 rounded-lg text-sm font-medium px-1 py-2 w-1/3"
                        onClick={onDeploy}
                    >
                        Deploy Multisig
                    </button >
                </div>
                {
                    deployedMultisigAddress && (
                        <div>
                            Multisig contract has been deployed to:{""}
                            {deployedMultisigAddress}
                        </div>
                    )
                }

            </div >
        </div>


    )
}
