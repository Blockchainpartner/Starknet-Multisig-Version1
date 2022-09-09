import { toHex, toFelt } from 'starknet/dist/utils/number'

export function RuleItem(props) {

  return (
    <div className="grid gap-4 grid-cols-6 place-items-center my-4 p-2 shadow-xl bg-gradient-to-r from-kpmg_pacific_blue to-kpmg_light_blue border rounded-lg">
        {/* <div className="flex flex-row justify-between "> */}
        {/* <p>{console.log("props inside component is :", props)}</p> */}
        {/* <p>{console.log("calldata_len:", props.transac.tx_calldata_len)}</p> */}
        {/* <p>{toFelt(props.transac.tx.function_selector)}</p> Gros probleme ici, comment je fais pour revert get_selector_from_name et recuperer le nom de la fonction ? Obligé de faire un mapping et encore très comliqué */}
        {/* <p>{toFelt(props.transac.tx.function_selector)}</p> */}
        <p>{props.rule.rule_index}</p>
        <p>{toHex(props.rule.data.rule.owner).substring(0,6)}...{toHex(props.rule.data.rule.owner).substring(62)}</p>
        <p>{toHex(props.rule.data.rule.to).substring(0,6)}...{toHex(props.rule.data.rule.to).substring(62)}</p>
        <p>{props.rule.data.rule.allowed_amount.toString()}</p>
        <span>{toHex(props.rule.data.rule.asset).substring(0,6)}...{toHex(props.rule.data.rule.asset).substring(62)}</span>
        <span>{props.rule.data.rule.num_confirmations_required.toString()}</span>
        {/* </div> */}
        
    </div>
  )
}
