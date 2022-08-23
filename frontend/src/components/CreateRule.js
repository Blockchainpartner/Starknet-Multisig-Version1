import { useState } from 'react'
import { toBN } from "starknet/dist/utils/number";
import { number } from "starknet";
import { useMultisigContract } from '~/hooks/multisig'
import { useStarknetInvoke } from '@starknet-react/core'




export function CreateRule(props) {
    const [modalPage, setModalPage] = useState(1)
    const [showModal, setShowModal] = useState(false)

    const { contract: multisig } = useMultisigContract(props.currentMultisigAddress)
    const { invoke: submitTransaction } = useStarknetInvoke({ contract: multisig, method: "submit_transaction" })

    // parameters of the new rule
    const [submittedOwner, setSubmittedOwner] = useState("");
    const [submittedRecipient, setSubmittedRecipient] = useState("");
    const [submittedAllowedAmount, setSubmittedAllowedAmount] = useState("");
    const [submittedAsset, setSubmittedAsset] = useState("");
    const [submittedRequiredConfirmations, setSubmittedRequiredConfirmations] = useState("");

    const createRuleSelector = number.toBN("520213141508092629119819457006537688644568527244809528963486451688951563129") // create_rule function selector

    const incrementModalPage = () => {
        modalPage < 6 ? setModalPage(modalPage + 1) : setShowModal(false)
    }

    const decrementModalPage = () => {
        modalPage > 1 ? setModalPage(modalPage - 1) : setShowModal(false)
    }

    const openModal = () => {
        setModalPage(1)
        setShowModal(true)
    }

    const submitRule = async () => {
        setShowModal(false)
        // besoin de reset les states utilisés
        const newRuleParameters = [];
        newRuleParameters.push(toBN(submittedOwner))
        newRuleParameters.push(toBN(submittedRecipient))
        newRuleParameters.push(toBN(submittedRequiredConfirmations))
        newRuleParameters.push(toBN(submittedAsset))
        newRuleParameters.push(toBN(submittedAllowedAmount))

        await submitTransaction({
            args: [props.currentMultisigAddress, createRuleSelector, '0x0', newRuleParameters],
            metadata: { method: 'submit_transaction', message: 'submit a transaction that will add a new rule' },
        })

        setSubmittedOwner("")
        setSubmittedRecipient("")
        setSubmittedRequiredConfirmations("")
        setSubmittedAllowedAmount("")
        setSubmittedAsset("")
    }

    return (
        <div className='flex justify-center'>
            <button className="mt-2 px-1 py-2 rounded-lg bg-stone-200 ring-1 ring-zinc-700 text-gray-600" onClick={() => openModal()}>Create a new rule</button>

            {showModal && (
                <>
                    <div
                        className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none"
                    >
                        <div className="relative w-auto my-6 mx-auto max-w-3xl">
                            {/*content*/}
                            <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                                {/*header*/}
                                <div className="flex justify-center px-5 py-2 border-b border-solid border-slate-200 rounded-t">
                                    <h3 className="text-3xl font-semibold">
                                        Create a new rule
                                    </h3>
                                    <button
                                        className="p-1 ml-auto bg-transparent border-0 text-black opacity-40 float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                                        onClick={() => setShowModal(false)}
                                        
                                    >x</button>
                                </div>
                                {/*body*/}
                                <div className="relative px-5 py-2 flex-auto">
                                    {(() => {
                                        switch (modalPage) {
                                            case 1:
                                                return (
                                                    <div>
                                                        <p>Beneficiary</p>
                                                        <input className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" placeholder="0x1a2b3...6f9z (owner address) or 0"
                                                            onChange={(e) => setSubmittedOwner(e.target.value)} value={submittedOwner} />
                                                        <p>Warning, you can create this rule for all owners if you set the field to 0</p>
                                                        {/*footer*/}
                                                        <div className="flex w-full justify-between items-center px-5 py-2 border-t border-solid border-slate-200 rounded-b">
                                                            <div className="">
                                                                <p>Step {modalPage} of 5</p>
                                                            </div>
                                                            <div className="">
                                                                
                                                                <button
                                                                    className="bg-emerald-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 ease-linear transition-all duration-150"
                                                                    type="button"
                                                                    onClick={() => incrementModalPage()}
                                                                >
                                                                    Next
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>

                                                )
                                            case 2:
                                                return (
                                                    <div>
                                                        <p>Recipient</p>
                                                        <input className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" placeholder="0x1a2b3...6f9z (account or smart contract) or 0"
                                                            onChange={(e) => setSubmittedRecipient(e.target.value)} value={submittedRecipient}/>
                                                        <p>Warning, you can create this rule for any recipient if you set the field to 0</p>
                                                        {/*footer*/}
                                                        <div className="flex w-full justify-between items-center px-5 py-2 border-t border-solid border-slate-200 rounded-b">
                                                            <div className="">
                                                                <p>Step {modalPage} of 5</p>
                                                            </div>
                                                            <div className="">
                                                                <button
                                                                    className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 ease-linear transition-all duration-150"
                                                                    type="button"
                                                                    onClick={() => decrementModalPage()}
                                                                >
                                                                    Back
                                                                </button>
                                                                <button
                                                                    className="bg-emerald-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 ease-linear transition-all duration-150"
                                                                    type="button"
                                                                    onClick={() => incrementModalPage()}
                                                                >
                                                                    Next
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            case 3:
                                                return (
                                                    <div>
                                                        <p>Asset</p>
                                                        <input className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" placeholder="0x1a2b3...6f9z (asset address) or 0"
                                                            onChange={(e) => setSubmittedAsset(e.target.value)} value={submittedAsset}/>
                                                        <p>Warning, you can create this rule for any asset if you set the field to 0</p>
                                                        {/*footer*/}
                                                        <div className="flex w-full justify-between items-center px-5 py-2 border-t border-solid border-slate-200 rounded-b">
                                                            <div className="">
                                                                <p>Step {modalPage} of 5</p>
                                                            </div>
                                                            <div className="">
                                                                <button
                                                                    className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 ease-linear transition-all duration-150"
                                                                    type="button"
                                                                    onClick={() => decrementModalPage()}
                                                                >
                                                                    Back
                                                                </button>
                                                                <button
                                                                    className="bg-emerald-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 ease-linear transition-all duration-150"
                                                                    type="button"
                                                                    onClick={() => incrementModalPage()}
                                                                >
                                                                    Next
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            case 4:
                                                return (
                                                    <div>
                                                        <p>Allowed Amount</p>
                                                        <input className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" placeholder="e.g: 0, 2.5, 1000"
                                                            onChange={(e) => setSubmittedAllowedAmount(e.target.value)} value={submittedAllowedAmount} />
                                                        <p>Warning, you can create this rule for any amount if you set the field to 0</p>
                                                        {/*footer*/}
                                                        <div className="flex w-full justify-between items-center px-5 py-2 border-t border-solid border-slate-200 rounded-b">
                                                            <div className="">
                                                                <p>Step {modalPage} of 5</p>
                                                            </div>
                                                            <div className="">
                                                                <button
                                                                    className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 ease-linear transition-all duration-150"
                                                                    type="button"
                                                                    onClick={() => decrementModalPage()}
                                                                >
                                                                    Back
                                                                </button>
                                                                <button
                                                                    className="bg-emerald-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 ease-linear transition-all duration-150"
                                                                    type="button"
                                                                    onClick={() => incrementModalPage()}
                                                                >
                                                                    Next
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            case 5:
                                                return (
                                                    <div>
                                                        <p>Number of required confirmations</p>
                                                        <input className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" placeholder="e.g: 1, 2, 3"
                                                            onChange={(e) => setSubmittedRequiredConfirmations(e.target.value)} value={submittedRequiredConfirmations}/>
                                                        <p>All owners of the multisig will need to confirm the creation of the rule</p>
                                                        {/*footer*/}
                                                        <div className="flex w-full justify-between items-center px-5 py-2 border-t border-solid border-slate-200 rounded-b">
                                                            <div className="">
                                                                <p>Step {modalPage} of 5</p>
                                                            </div>
                                                            <div className="">
                                                                <button
                                                                    className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 ease-linear transition-all duration-150"
                                                                    type="button"
                                                                    onClick={() => decrementModalPage()}
                                                                >
                                                                    Back
                                                                </button>
                                                                <button
                                                                    className="bg-emerald-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 ease-linear transition-all duration-150"
                                                                    type="button"
                                                                    onClick={() => submitRule()}
                                                                >
                                                                    Create
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            default:
                                                return null
                                        }
                                    })()}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
                </>
            )}

        </div>

    )
}
