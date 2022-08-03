import Link from 'next/link'
import { useState } from 'react'
import { SelectMultisig } from './SelectMultisig'
import { useRouter } from 'next/router'


export default function SideBar() {
    const router = useRouter()
    const [multisigAddress, setMultisigAddress] = useState("")//0x030b315a8ace5643032716fa368f022d25ef7fc6b32b8d56c9e29f4fb55327a3'
    console.log("i'm in the sidebar and the multisig address is the follwoing:", multisigAddress)

    
    // Attention point : Do not use <Link> below props can't be passed through it, prefer useRouter pls
  return (
      <div className="border-r-2">
          <ul>
              <li>
                  <SelectMultisig setAddressFromChild={data => setMultisigAddress(data)}/>
              </li>
              <li>
                  <Link href='/dashboard'>
                      <a className="flex items-center px-4 py-2 mt-4 text-gray-600 rounded-md hover:bg-gray-200">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24"
                              stroke="currentColor">
                              <path strokeWidth="2"
                                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                          </svg>
                          <span className="mx-4 font-medium">Dashboard</span>
                      </a>
                  </Link>
              </li>

              <li>
                  <Link href="/newMultisig">
                      <a className="flex items-center px-4 py-2 mt-5 text-gray-600 rounded-md hover:bg-gray-200">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24"
                              stroke="currentColor">
                              <path strokeWidth="2"
                                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                              <path strokeWidth="2"
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>

                          <span className="mx-4 font-medium">New multisig</span>
                      </a>
                  </Link>
              </li>
              <li>
                  {/* <Link href={{
                      pathname: "/newtransaction",
                      query: { id: "test" }, // the data
                  }} as="/newTransaction">
                      <a className="flex items-center px-4 py-2 mt-5 text-gray-600 rounded-md hover:bg-gray-200">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24"
                              stroke="currentColor">
                              <path strokeWidth="2"
                                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                              <path strokeWidth="2"
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>

                          <span className="mx-4 font-medium">New transaction</span>
                      </a>
                  </Link> */}
                  <button onClick={() => router.push({
                    pathname: '/newTransaction',
                    query: {multisigAddress: multisigAddress},
                    },
                    '/newTransaction',) }>
                        <a className="flex items-center px-4 py-2 mt-5 text-gray-600 rounded-md hover:bg-gray-200">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24"
                              stroke="currentColor">
                              <path strokeWidth="2"
                                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                              <path strokeWidth="2"
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>

                          <span className="mx-4 font-medium">New transaction</span>
                      </a>
                    </button>
              </li>
              <li>
                  {/* <Link href={{
                      pathname: "/transactions",
                      query: { id: "test" }, // the data
                  }}>
                      <a className="flex items-center px-4 py-2 mt-5 text-gray-600 rounded-md hover:bg-gray-200">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24"
                              stroke="currentColor">
                              <path strokeWidth="2"
                                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                              <path strokeWidth="2"
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>

                          <span className="mx-4 font-medium">Transactions</span>
                      </a>
                  </Link> */}
                  <button onClick={() => router.push({
                    pathname: '/transactions',
                    query: {multisigAddress: multisigAddress},
                    },
                    '/transactions',) }>
                        <a className="flex items-center px-4 py-2 mt-5 text-gray-600 rounded-md hover:bg-gray-200">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24"
                              stroke="currentColor">
                              <path strokeWidth="2"
                                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                              <path strokeWidth="2"
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>

                          <span className="mx-4 font-medium">Transactions</span>
                      </a>
                    </button>
              </li>
              <li>
                
                  <Link href="/rules">
                      <a className="flex items-center px-4 py-2 mt-5 text-gray-600 rounded-md hover:bg-gray-200">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24"
                              stroke="currentColor">
                              <path strokeWidth="2"
                                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                              <path strokeWidth="2"
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>

                          <span className="mx-4 font-medium">Spending rules</span>
                      </a>
                  </Link>
              </li>
          </ul>

      </div>

  )
}
