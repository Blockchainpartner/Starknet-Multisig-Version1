import { useStarknet } from '@starknet-react/core'

export function ConnectWallet() {
  const { account, connect, disconnect, connectors } = useStarknet()

  if (account) {
    return (
      <div className="flex">
        <span className="flex bg-stone-200 ring-1 ring-zinc-700 ml-2 rounded-lg text-sm font-medium px-5 py-2.5 mx-2 my-2">
        <svg className="mr-2" stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="20" width="20" xmlns="http://www.w3.org/2000/svg"><path fill="none" d="M0 0h24v24H0V0z"></path><path d="M21 7.28V5c0-1.1-.9-2-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h14c1.1 0 2-.9 2-2v-2.28A2 2 0 0022 15V9a2 2 0 00-1-1.72zM20 9v6h-7V9h7zM5 19V5h14v2h-6c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h6v2H5z"></path><circle cx="16" cy="12" r="1.5"></circle></svg>
        
              {`${account.substring(0, 6)}...${account.substring(
                account.length - 4
              )}`}
        </span>
        <button className=" bg-stone-200 ring-1 ring-zinc-700 font-medium rounded-lg text-sm px-5 py-2.5 mx-2 my-2" onClick={() => disconnect()}>Disconnect</button>
      </div>
    )
  }

  return (
    <>
      {connectors.map((connector, idx) => (
        <button className=" bg-stone-200 ring-1 ring-zinc-700 font-medium rounded-lg text-sm px-5 py-2.5 mx-2 my-2" key={idx} onClick={() => connect(connector)}>
          Connect
        </button>
      ))}
    </>
  )
}


