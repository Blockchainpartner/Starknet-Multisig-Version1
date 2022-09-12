import { useState } from 'react'
import { toHex, toFelt } from 'starknet/dist/utils/number'
import { useStarknet, useStarknetInvoke } from '@starknet-react/core'
import { useMultisigContract } from '~/hooks/multisig'


//draft solution for testing purpose, will need to store these constants in a better way in the future
type Token = {
  name: string,
  symbol: string,
  decimals: number,
  l1_token_address: string,
  l2_token_address: string
}

const WBTC: Token = {
  "name": "Wrapped BTC",
  "symbol": "WBTC",
  "decimals": 8,
  "l1_token_address": "0xC04B0d3107736C32e19F1c62b2aF67BE61d63a05",
  "l2_token_address": "0x12d537dc323c439dc65c976fad242d5610d27cfb5f31689a0a319b8be7f3d56"
}

const USDC: Token = {
  "name": "Goerli USD Coin",
  "symbol": "USDC",
  "decimals": 6,
  "l1_token_address": "0x07865c6e87b9f70255377e024ace6630c1eaa37f",
  "l2_token_address": "0x5a643907b9a4bc6a55e9069c4fd5fd1f5c79a22470690f75556c4736e34426"
}

const USDT: Token = {
  "name": "Tether USD",
  "symbol": "USDT",
  "decimals": 6,
  "l1_token_address": "0x509Ee0d083DdF8AC028f2a56731412edD63223B9",
  "l2_token_address": "0x386e8d061177f19b3b485c20e31137e6f6bc497cc635ccdfcab96fadf5add6a"
}

const ETH: Token = {
  "name": "Ether",
  "symbol": "ETH",
  "decimals": 18,
  "l1_token_address": "0x0000000000000000000000000000000000000000",
  "l2_token_address": "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7"
}

const DAI: Token = {
  "name": "DAI",
  "symbol": "DAI",
  "decimals": 18,
  "l1_token_address": "0x11fE4B6AE13d2a6055C8D9cF65c55bac32B5d844",
  "l2_token_address": "0x3e85bfbb8e2a42b7bead9e88e9a1b19dbccf661471061807292120462396ec9"
}

export function TransactionItem(props: any) {
  const { contract: multisig } = useMultisigContract(props.multisigAddress)
  const { invoke: confirmTransaction } = useStarknetInvoke({ contract: multisig, method: 'confirm_transaction' })
  const { invoke: revokeConfirmation } = useStarknetInvoke({ contract: multisig, method: 'revoke_confirmation' })
  const { invoke: executeTransaction } = useStarknetInvoke({ contract: multisig, method: 'execute_transaction' })
  // const [transferedToken, setTransferedToken] = useState<Token>(ETH)


  const mappingFunction = (selector: string) => {
    switch (selector) {
      case ("232670485425082704932579856502088130646006032362877466777181098476241604910"):
        return ("Transfer")
      case ("520213141508092629119819457006537688644568527244809528963486451688951563129"):
        return ("Rule creation")
      default:
        return ("Unknown function")
    }
  }

  const mappingFunctionParameters = (selector: string, token_contract: string) => {
    let transferedToken: Token = ETH
    switch (selector) {
      case ("232670485425082704932579856502088130646006032362877466777181098476241604910"):
        switch (token_contract) {
          case (ETH.l2_token_address):
            transferedToken = ETH
            break
          case (DAI.l2_token_address):
            transferedToken = DAI
            break
          case (USDC.l2_token_address):
            transferedToken = USDC
            break
          case (WBTC.l2_token_address):
            transferedToken = WBTC
            break
        }
        return (
          <div>
            <p><b>Transfer to:</b> {toHex(props.transac.data.tx_calldata[0]).substring(0, 6)}...{toHex(props.transac.data.tx_calldata[0]).substring(62)}</p>
            <p><b>Amount:</b> {(props.transac.data.tx_calldata[1].toString()) / Math.pow(10, transferedToken.decimals)} {transferedToken.symbol}</p>
          </div>
        )
      case ("520213141508092629119819457006537688644568527244809528963486451688951563129"):
        return (
          <div>
            <b>Rule creation parameters</b>
            <p><b>Owner:</b> {toHex(props.transac.data.tx_calldata[0]).substring(0, 6)}...{toHex(props.transac.data.tx_calldata[0]).substring(62)}</p>
            <p><b>Recipient:</b> {toHex(props.transac.data.tx_calldata[1]).substring(0, 6)}...{toHex(props.transac.data.tx_calldata[1]).substring(62)}</p>
            <p><b>Confirmations required: </b>{props.transac.data.tx_calldata[2].toString()}</p>
            <p><b>Asset:</b> {toHex(props.transac.data.tx_calldata[3]).substring(0, 6)}...{toHex(props.transac.data.tx_calldata[3]).substring(62)}</p>
            <p><b>Allowed amount: </b>{props.transac.data.tx_calldata[4].toString()}</p>
          </div>
        )
      default:
        return (
          <div>
            <p><b>To: </b>{toHex(props.transac.data.tx.to).substring(0,6)}...{toHex(props.transac.data.tx.to).substring(62)}</p>
            <p><b>Transaction's calldata: </b></p>
            {props.transac.data.tx_calldata.map((calldata: any) => (
              <p>{toHex(calldata)}</p>
            ))}
          </div>
        )
    }
  }

  return (
    <div className="my-4 mx-8 p-2 shadow-xl bg-gradient-to-r from-kpmg_pacific_blue to-kpmg_light_blue border rounded-lg">
      <div className="flex flex-row justify-between ">
        {/* Gros probleme ici, comment je fais pour revert get_selector_from_name et recuperer le nom de la fonction ? Obligé de faire un mapping et encore très comliqué */}
        <p><b>Tx index: </b>{props.transac.tx_index}</p>
        <p><b>{mappingFunction(props.transac.data.tx.function_selector.toString())}</b></p>
        {/* <p>To: {toHex(props.transac.data.tx.to).substring(0, 6)}...{toHex(props.transac.data.tx.to).substring(62)}</p> */}
        <p><b>Rule ID: </b>{props.transac.data.tx.rule_id.toString()}</p>
        {/* "/ 2" a modifier pour récupérer le nombre de confirmations requises depuis les rules ID */}
        <p>{props.transac.data.tx.num_confirmations.toString()} / 2</p>
      </div>
      <span>{mappingFunctionParameters(props.transac.data.tx.function_selector.toString(), toHex(props.transac.data.tx.to))}</span>

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
