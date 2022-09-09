import Link from 'next/link'
import { useState } from 'react'
import { SelectMultisig } from './SelectMultisig'
import { useRouter } from 'next/router'


export default function SideBar() {
    const router = useRouter()
    const [multisigAddress, setMultisigAddress] = useState("")//0x030b315a8ace5643032716fa368f022d25ef7fc6b32b8d56c9e29f4fb55327a3'
    const [submenucollapsed, setSubmenuCollapsed] = useState(false)

    // Attention point : Do not use <Link> below props can't be passed through it, prefer useRouter pls
    return (

        <ul className="border-r-2">
            <li>
                <SelectMultisig setAddressFromChild={data => setMultisigAddress(data)} />
            </li>
            <li>
                <Link href='/'>
                    <a className="flex items-center px-4 py-2 mt-4 text-kpmg_dark_blue rounded-md hover:bg-gradient-to-r hover:from-kpmg_purple hover:to-kpmg_cobalt hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path strokeWidth="2"
                                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        <span className="ml-2 font-medium">Dashboard</span>
                    </a>
                </Link>
            </li>

            <li>
                <Link href="/newMultisig">
                    <a className="flex items-center px-4 py-2 mt-5 text-kpmg_dark_blue rounded-md hover:bg-gradient-to-r hover:from-kpmg_purple hover:to-kpmg_cobalt hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="currentColor" viewBox="0 0 16 16">
                            <path fillRule="evenodd" d="M8 5.5a.5.5 0 0 1 .5.5v1.5H10a.5.5 0 0 1 0 1H8.5V10a.5.5 0 0 1-1 0V8.5H6a.5.5 0 0 1 0-1h1.5V6a.5.5 0 0 1 .5-.5z" />
                            <path d="m10.273 2.513-.921-.944.715-.698.622.637.89-.011a2.89 2.89 0 0 1 2.924 2.924l-.01.89.636.622a2.89 2.89 0 0 1 0 4.134l-.637.622.011.89a2.89 2.89 0 0 1-2.924 2.924l-.89-.01-.622.636a2.89 2.89 0 0 1-4.134 0l-.622-.637-.89.011a2.89 2.89 0 0 1-2.924-2.924l.01-.89-.636-.622a2.89 2.89 0 0 1 0-4.134l.637-.622-.011-.89a2.89 2.89 0 0 1 2.924-2.924l.89.01.622-.636a2.89 2.89 0 0 1 4.134 0l-.715.698a1.89 1.89 0 0 0-2.704 0l-.92.944-1.32-.016a1.89 1.89 0 0 0-1.911 1.912l.016 1.318-.944.921a1.89 1.89 0 0 0 0 2.704l.944.92-.016 1.32a1.89 1.89 0 0 0 1.912 1.911l1.318-.016.921.944a1.89 1.89 0 0 0 2.704 0l.92-.944 1.32.016a1.89 1.89 0 0 0 1.911-1.912l-.016-1.318.944-.921a1.89 1.89 0 0 0 0-2.704l-.944-.92.016-1.32a1.89 1.89 0 0 0-1.912-1.911l-1.318.016z" />
                        </svg>

                        <span className="ml-2 font-medium">New multisig</span>
                    </a>
                </Link>
            </li>
            <li className="mt-5">
                <button
                    className='w-full'
                    onClick={() => router.push({
                        pathname: '/newTransaction',
                        query: { multisigAddress: multisigAddress },
                    },
                        '/newTransaction')}>
                    <a className="flex items-center px-4 py-2 text-kpmg_dark_blue rounded-md hover:bg-gradient-to-r hover:from-kpmg_purple hover:to-kpmg_cobalt hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="currentColor" viewBox="0 0 16 16">
                            <path fillRule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8zm15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM4.5 7.5a.5.5 0 0 0 0 1h5.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5H4.5z" />
                        </svg>

                        <span className="ml-2 font-medium truncate">New transaction</span>
                    </a>
                </button>
            </li>
            <li className="mt-5 ">
                <button className="w-full" onClick={() => router.push({
                    pathname: '/transactions',
                    query: { multisigAddress: multisigAddress },
                },
                    '/transactions')}>
                    <a className="flex items-center px-4 py-2 text-kpmg_dark_blue rounded-md hover:bg-gradient-to-r hover:from-kpmg_purple hover:to-kpmg_cobalt hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="currentColor" viewBox="0 0 16 16">
                            <path strokeWidth="2" d="M11.5 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L11 2.707V14.5a.5.5 0 0 0 .5.5zm-7-14a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L4 13.293V1.5a.5.5 0 0 1 .5-.5z" />
                        </svg>

                        <span className="ml-2 font-medium">Transactions</span>
                    </a>
                </button>
            </li>
            <li>
                <button
                    className='w-full'
                    onClick={() => setSubmenuCollapsed(!submenucollapsed)}>
                    <a className="flex items-center px-4 py-2 mt-5 text-kpmg_dark_blue rounded-md hover:bg-gradient-to-r hover:from-kpmg_purple hover:to-kpmg_cobalt hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path strokeWidth="2"
                                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeWidth="2"
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>

                        <span className="ml-2 mr-6 font-medium">Settings</span>
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"></path></svg>
                    </a>
                </button>
            </li>

            {submenucollapsed &&

                <div>
                    <li className="mt-3">
                        <button className="w-full rounded-md py-2 text-kpmg_dark_blue hover:bg-gradient-to-r hover:from-kpmg_purple hover:to-kpmg_cobalt hover:text-white" onClick={() => router.push({
                            pathname: '/owners',
                            query: { multisigAddress: multisigAddress },
                        },
                            '/owners')}>
                            <span className="flex ml-10 text-base justify-start">Owners</span>
                        </button>
                    </li>
                    <li className="mt-3">
                        <button className="w-full rounded-md py-2 text-kpmg_dark_blue hover:bg-gradient-to-r hover:from-kpmg_purple hover:to-kpmg_cobalt hover:text-white" onClick={() => router.push({
                            pathname: '/rules',
                            query: { multisigAddress: multisigAddress },
                        },
                            '/rules')}>
                            <span className="ml-10 text-base flex justify-start">Spending limits</span>
                        </button>
                    </li>
                </div>
            }
        </ul>


    )
}
