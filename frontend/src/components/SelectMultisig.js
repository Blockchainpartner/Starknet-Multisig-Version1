import { useState, useEffect } from "react"
import { useRouter } from 'next/router'
import { useStarknetCall } from '@starknet-react/core'
import { useEthContract } from '~/hooks/ethContract'

export function SelectMultisig(props) {
    const router = useRouter()
    const [selected, setSelected] = useState(false)
    const [showModal, setShowModal] = useState(false);
    const [multisigAddress, setMultisigAddress] = useState("")
    const [balanceMultisig, setBalanceMultisig] = useState(0)
 
    
    function QueryBalanceMultisig() {
        const { contract: eth_contract } = useEthContract()
        const { data, loading, error } = useStarknetCall({
            contract: eth_contract,
            method: 'balanceOf',
            args: [multisigAddress],
        })
        
        useEffect(() => {
            if (!loading && data) {
                setBalanceMultisig(data.balance.low)
            }
        }, [data, loading])
    }
    QueryBalanceMultisig() //Don't know why I can't add this inside SubmitMultisigAddress() function

    function SubmitMultisigAddress() {
        setShowModal(false)
        setSelected(true)
        props.setAddressFromChild(multisigAddress)
        router.push({
            pathname: router.asPath,
            query: { multisigAddress: multisigAddress },
            },
            router.asPath) //necessary to reload the page to send multisig address to current page
        }
    
    return (
        <>
        {!selected ?
            <div className="flex items-center justify-center"> 
                <button className="mt-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-kpmg_purple to-kpmg_cobalt text-white ring-1 ring-zinc-700 font-medium" onClick={() => setShowModal(true)}>Connect multisig</button>

            </div>
            :
            <div className="flex flex-col items-center px-4 py-2 mt-2 text-kpmg_dark_blue rounded-md">
                <span className="font-semibold" >Selected multisig: </span>
                <span className="flex">{`${multisigAddress.substring(0, 6)}...${multisigAddress.substring(multisigAddress.length - 4)}`}
                    <button className="hover:bg-gradient-to-r hover:from-kpmg_purple hover:to-kpmg_cobalt hover:text-white hover:rounded-full ml-2" onClick={() => setShowModal(true)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-arrow-repeat" viewBox="0 0 16 16"> <path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41zm-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9z"/> <path fillRule="evenodd" d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5.002 5.002 0 0 0 8 3zM3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9H3.1z"/> </svg>
                    </button>
                </span>
                <span className="font-semibold mt-4">Balance</span>
                <span className="">{`${balanceMultisig / Math.pow(10, 18)}`.toString().substring(0,8)} ETH</span>
            </div>}

            {showModal && (
                <>
                    <div
                        className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none"
                    >
                        <div className="relative w-auto my-6 mx-auto max-w-3xl text-kpmg_dark_blue">
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
                                    <input className="bg-gradient-to-r from-kpmg_purple to-kpmg_cobalt border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 placeholder-white/50 dark:text-white" placeholder="0x1a2b3...6f9z"  
                                    onChange={(e) => setMultisigAddress(e.target.value)}/>
                                </div>
                                {/*footer*/}
                                <div className="flex items-center justify-end px-5 py-2 border-t border-solid border-slate-200 rounded-b">
                                    <button
                                        className="text-kpmg_pink background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                    >
                                        Close
                                    </button>
                                    <button
                                        className="bg-kpmg_cobalt text-white font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                                        type="button"
                                        onClick={() => SubmitMultisigAddress()}
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
