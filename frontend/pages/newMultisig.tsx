import { useStarknet } from '@starknet-react/core'
import React from 'react'
import { useState, useEffect } from 'react';
import { number } from "starknet";
import { useContractFactory } from '~/hooks/deploy'
import multisigABI from "../src/abi/multisig.json";
import { CompiledContract, json, Abi } from "starknet";
import { PleaseConnectWallet } from '~/components/PleaseConnectWallet'



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
            console.log("call data", calldata)
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



    if (!account) {
        return (
            
                <PleaseConnectWallet/>
            
        )
    }

    return (
        <div>
            Number of owners:{" "}

            <input 
                className="border border-zinc-700"
                key={0} 
                value={undefined} 
                type="number" 
                defaultValue={1} 
                onChange={(e) => {
                    onOwnersNumber(e.target.value)
            }} >
            </input >
            Number of signers:{" "}

            <select
                onChange={(e) => {
                    setConfirmationNumber(e.target.value);
                }}
                value={confirmationNumber}
            >
                {optionsjSX(ownersNumber as number)}
            </select>

            {
                owners.map((owner, i) => {
                    return (
                        <div key={i}>
                            Signer {i + 1} address:
                            <input
                                className="border border-zinc-700"
                                type="text"
                                onChange={(e) => onChangeOwner(e.target.value, i)}
                                value={owner}
                            ></input>
                        </div>
                    );
                })
            }

            < button
                className="bg-stone-200 ring-1 ring-zinc-700 ml-2 rounded-lg text-sm font-medium px-1 py-1"
                onClick={onDeploy}
            >
                Deploy Multisig
            </button >

            {
                deployedMultisigAddress && (
                    <div>
                        Multisig contract has been deployed to:{""}
                        {deployedMultisigAddress}
                    </div>
                )
            }

        </div >

    )
}
