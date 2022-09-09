import { toHex, toFelt } from 'starknet/dist/utils/number'
import { useStarknet, useStarknetInvoke } from '@starknet-react/core'
import { useMultisigContract } from '~/hooks/multisig'



export function TransactionItem(props) {
  const { contract: multisig } = useMultisigContract(props.multisigAddress)
  const { invoke: confirmTransaction } = useStarknetInvoke({ contract: multisig, method: 'confirm_transaction' })
  const { invoke: revokeConfirmation } = useStarknetInvoke({ contract: multisig, method: 'revoke_confirmation' })
  const { invoke: executeTransaction } = useStarknetInvoke({ contract: multisig, method: 'execute_transaction' })

  return (
    <div className="my-4 p-2 shadow-xl bg-gradient-to-r from-kpmg_pacific_blue to-kpmg_light_blue border rounded-lg">
      <div className="flex flex-row justify-between ">
        {/* Gros probleme ici, comment je fais pour revert get_selector_from_name et recuperer le nom de la fonction ? Obligé de faire un mapping et encore très comliqué */}
        <p>Tx index: {props.transac.tx_index}</p>
        <p>function_name</p>
        <p>To: {toHex(props.transac.data.tx.to).substring(0, 6)}...{toHex(props.transac.data.tx.to).substring(62)}</p>
        <p>Rule ID: {props.transac.data.tx.rule_id.toString()}</p>
        {/* "/ 2" a modifier pour récupérer le nombre de confirmations requises depuis les rules ID */}
        <p>{props.transac.data.tx.num_confirmations.toString()} / 2</p>
      </div>
      <p>calldata of the transaction will be written here with dropdown</p>

      {!Number(props.transac.data.tx.executed.toString()) &&
        <div className="flex flex-row justify-end">
          <button className="text-white bg-kpmg_blue font-medium rounded-lg text-sm px-5 py-2.5 mx-1 " onClick={() =>
            confirmTransaction({
              args: [props.transac.tx_index],
              metadata: { method: 'confirm_transaction', message: 'confirm transac' },
            })}>Confirm</button>
          <button className="text-white bg-kpmg_cobalt font-medium rounded-lg text-sm px-5 py-2.5 mx-1" onClick={() =>
            revokeConfirmation({
              args: [props.transac.tx_index],
              metadata: { method: 'revoke_confirmation', message: 'revoke transac' },
            })}>Revoke </button>
          <button className="text-white bg-kpmg_purple font-medium rounded-lg text-sm px-5 py-2.5 mx-1" onClick={() =>
            executeTransaction({
              args: [props.transac.tx_index],
              metadata: { method: 'execute transaction', message: 'execute transac' },
            })}>Execute </button>
        </div>
      }
    </div>
  )
}
