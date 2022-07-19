import { useStarknet } from '@starknet-react/core'
import React from 'react'
import { useState, useEffect } from 'react';
import { number } from "starknet";
import { useContractFactory } from '~/hooks/deploy'
import MultisigSource from "../../public/Multisig.json";
import { CompiledContract, json, Abi } from "starknet";
import next from 'next';





export function CreateMultisig() {

    const [compiledMultisig, setCompiledMultisig] = useState<CompiledContract>();
    const [confirmationNumber, setConfirmationNumber] = useState<string>();
    const [owners, setOwners] = useState<string[]>(["address 1"]);
    const [ownersNumber, setOwnersNumber] = useState<number>(5);
    const [input, setInput] = useState<JSX.Element[]>([]);
    const [counter, setcounter] = useState<number>(0);
    const [deployedMultisigAddress, setDeployedMultisigAddress] = useState<string>("");



    const { account } = useStarknet();
    const { deploy: deployMultisig } = useContractFactory({
        compiledContract: compiledMultisig,
        abi: (MultisigSource as any).abi as Abi,
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
        console.log("useeffect", ownersNumber);
        const emptyOwners = [...Array(ownersNumber)].map((item) => "");
        emptyOwners[0] = account ?? "";
        setOwners(emptyOwners);
        console.log("use effect", owners)
    }, [ownersNumber]);

    const getCompiledMultisig = async () => {
        const raw = await fetch("/Multisig.json");
        const compiled = json.parse(await raw.text());
        return compiled;
    };

    const onDeploy = async () => {
        const _deployMultisig = async () => {
            const bnOwners = number.toBN("0x066F149ad990f1bdCffe5E9048755fCE2D7fbFFF6E03AB5ab8A503D14A4350ad");
            const calldata = [1, bnOwners, 1];
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
        setOwnersNumber(+value);
    };







    const addOwner = () => {
        if (counter == 0) {
            const elem = <input defaultValue={owners[0]} key={0} type="text" onChange={(e) =>
                onChangeOwner(e.target.value, 0)
            }></input >
            setInput([elem]);
            setcounter(1);



        }
        else {
            let Oldowners = owners
            setOwners([...Oldowners, ""]);
            const elem = <input key={counter} value={owners[counter]} type="text" onChange={(e) => {
                onChangeOwner(e.target.value, counter)
            }} ></input >
            setInput((current) => [...current, elem]);
            const newCounter = counter + 1;
            setcounter(newCounter)

        }
    }





    if (!account) {
        return null
    }

    return (




        <div>
            Number of owners:{" "}

            <input key={counter} value={ownersNumber} type="text" onChange={(e) => {
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
                {optionsjSX(ownersNumber)}
            </select>



            < button
                onClick={() => {
                    addOwner()
                }}
            >
                {counter == 0 ? "Choose Owners Of Multisig " : "Add Another Owner"}
            </button >

            {input}






            {/* <input
        //             type="text"
        //             value={confirmationNumber}
        //             onChange={(e) => setConfirmationNumber(e.target.value)}

        //         ></input>
        //         <input
        //             type="text"
        //             value={owners}
        //             onChange={(e) => setowners(e.target.value)}
        //         ></input>
        
        <input
         type="text"
                     value={submitParameters}
                     onChange={(e) => setSubmitParameters(e.target.value)}
                ></input>

        //         {owners.map((owner, i) => {
        //             return (
        //                 <div key={i}>
        //                     Signer {i + 1} address:
        //                     <input
        //                         type="text"
        //                         onChange={(e) => onOwnerChange(e.target.value, i)}
        //                         value={owner}
        //                     ></input>
        //                 </div>
        //             );
        //         })} */}

            < button
                onClick={onDeploy}
            >
                Deploy Multisig
            </button >

            {
                deployedMultisigAddress && (
                    <div>
                        Multisig contract:{" "}
                        {deployedMultisigAddress}

                    </div>
                )
            }
        </div >

    )
}
