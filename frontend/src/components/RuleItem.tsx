import { toHex, toFelt } from 'starknet/dist/utils/number'

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

export function RuleItem(props: any) {

  const mappingAllowedAmount = () => {
    switch (toHex(props.rule.data.rule.asset)) {
      case (ETH.l2_token_address):
        return (
          props.rule.data.rule.allowed_amount / Math.pow(10, ETH.decimals)
        )
      case (WBTC.l2_token_address):
        return (
          props.rule.data.rule.allowed_amount / Math.pow(10, WBTC.decimals)
        )
      case (DAI.l2_token_address):
        return (
          props.rule.data.rule.allowed_amount / Math.pow(10, DAI.decimals)
        )
      case (USDC.l2_token_address):
        return (
          props.rule.data.rule.allowed_amount / Math.pow(10, USDC.decimals)
        )
      default:
        return (props.rule.data.rule.allowed_amount.toString())
    }
  }

  const mappingAsset = () => {
    switch (toHex(props.rule.data.rule.asset)) {
      case (ETH.l2_token_address):
        return (
          ETH.symbol
        )
      case (WBTC.l2_token_address):
        return (
          WBTC.symbol
        )
      case (DAI.l2_token_address):
        return (
          DAI.symbol
        )
      case (USDC.l2_token_address):
        return (
          USDC.symbol
        )
      default:
        return (toHex(props.rule.data.rule.asset).substring(0, 6) + "..." + toHex(props.rule.data.rule.asset).substring(62))
    }
  }

  return (
    <div className="grid gap-4 grid-cols-6 place-items-center my-4 p-2 shadow-xl bg-gradient-to-r from-kpmg_pacific_blue to-kpmg_light_blue border rounded-lg">
      <p>{props.rule.rule_index}</p>
      <p>{props.rule.data.rule.owner.toString() == "0" ? "All multisig owners" : toHex(props.rule.data.rule.owner).substring(0, 6) + "..." + toHex(props.rule.data.rule.owner).substring(62)}</p>
      <p>{props.rule.data.rule.to.toString() == "0" ? "Any address" : toHex(props.rule.data.rule.to).substring(0, 6) + "..." + toHex(props.rule.data.rule.to).substring(62)}</p>
      <p>{props.rule.data.rule.allowed_amount.toString() == "0" ? "Any amount" : mappingAllowedAmount()}</p>
      <span>{props.rule.data.rule.asset.toString() == "0" ? "Any asset" : mappingAsset()}</span>
      <span>{props.rule.data.rule.num_confirmations_required.toString()}</span>
    </div>
  )
}
