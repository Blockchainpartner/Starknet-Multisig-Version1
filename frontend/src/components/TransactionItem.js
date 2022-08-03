import { toHex, toFelt } from 'starknet/dist/utils/number'
import { useStarknet, useStarknetInvoke } from '@starknet-react/core'
import { useMultisigContract } from '~/hooks/multisig'



export function TransactionItem(props) {
    const { contract: multisig } = useMultisigContract(props.multisigAddress)
    console.log("etat du hooks multisig :", multisig)
    const { invoke: confirmTransaction } = useStarknetInvoke({ contract: multisig, method: 'confirm_transaction' })
    const { invoke: revokeConfirmation } = useStarknetInvoke({ contract: multisig, method: 'revoke_confirmation' })
    const { invoke: executeTransaction } = useStarknetInvoke({ contract: multisig, method: 'execute_transaction' })

  return (
    <div className="my-4 p-2 shadow-xl bg-stone-200 border rounded-lg">
        <div className="flex flex-row justify-between ">
        {/* <p>{console.log("props inside component is :", props)}</p> */}
        {/* <p>{console.log("calldata_len:", props.transac.tx_calldata_len)}</p> */}
        {/* <p>{toFelt(props.transac.tx.function_selector)}</p> Gros probleme ici, comment je fais pour revert get_selector_from_name et recuperer le nom de la fonction ? Obligé de faire un mapping et encore très comliqué */}
        {/* <p>{toFelt(props.transac.tx.function_selector)}</p> */}
        <p>tx index: {props.transac.tx_index}</p>
        <p>function_name</p>
        <p>{toHex(props.transac.data.tx.to).substring(0,6)}...{toHex(props.transac.data.tx.to).substring(62)}</p>
        {/* {account.substring(0, 6)}...${account.substring(
                account.length - 4
              ) */}
        <p>rule : {props.transac.data.tx.rule_id.toString()}</p>
        <p>{props.transac.data.tx.num_confirmations.toString()} / 2</p>

        </div>
        <p>calldata of the transaction will be written here with dropdown</p>
        

        {!Number(props.transac.data.tx.executed.toString()) &&
        <div className="flex flex-row justify-end">
        <button className="text-white bg-green-700 hover:bg-green-800 font-medium rounded-lg text-sm px-5 py-2.5 mx-1 " onClick={() =>
          confirmTransaction({
            args: [props.transac.tx_index],
            metadata: { method: 'confirm_transaction', message: 'confirm transac' },
          })}>Confirm</button>
        <button className="text-white bg-red-700 hover:bg-red-800 font-medium rounded-lg text-sm px-5 py-2.5 mx-1" onClick={() =>
          revokeConfirmation({
            args: [props.transac.tx_index],
            metadata: { method: 'revoke_confirmation', message: 'revoke transac' },
          })}>Revoke </button>
          <button className="text-white bg-yellow-400 hover:bg-yellow-500 font-medium rounded-lg text-sm px-5 py-2.5 mx-1" onClick={() =>
          executeTransaction({
            args: [props.transac.tx_index],
            metadata: { method: 'execute transaction', message: 'execute transac' },
          })}>Execute </button>
          </div>
        }
    </div>
  )
}
