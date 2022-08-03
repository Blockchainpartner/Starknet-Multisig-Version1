import { useState } from "react"

export function SelectMultisig(props) {
    const [selected, setSelected] = useState(false)
    const [showModal, setShowModal] = useState(false);
    const [multisigAddress, setMultisigAddress] = useState("")
 
    const submitMultisigAddress = () => {
        setShowModal(false)
        setSelected(true)
        props.setAddressFromChild(multisigAddress)
    }

    return (
        <>
        {!selected ?
            <div className="flex items-center px-4 py-2 mt-2 text-gray-600 rounded-md hover:bg-gray-200">
                <button onClick={() => setShowModal(true)}>Use existing multisig</button>

            </div>
            :
            <div className="flex flex-col items-center px-4 py-2 mt-2 text-gray-600 rounded-md hover:bg-gray-200">
                <span className="font-semibold" >Selected multisig: </span>
                <span>{`${multisigAddress.substring(0, 6)}...${multisigAddress.substring(multisigAddress.length - 4)}`}</span>
                <button className="border-2" onClick={() => setShowModal(true)}>Change multisig</button>
            </div>}

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
                                        Enter an existing multisig
                                    </h3>
                                </div>
                                {/*body*/}
                                <div className="relative px-5 py-2 flex-auto">
                                    <input className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" placeholder="0x1a2b3...6f9z"  onChange={(e) => setMultisigAddress(e.target.value)}/>
                                </div>
                                {/*footer*/}
                                <div className="flex items-center justify-end px-5 py-2 border-t border-solid border-slate-200 rounded-b">
                                    <button
                                        className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                    >
                                        Close
                                    </button>
                                    <button
                                        className="bg-emerald-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                                        type="button"
                                        onClick={() => submitMultisigAddress()}
                                    >
                                        Save
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
                </>
            )}
</>
    )
}
