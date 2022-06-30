# Starknet-Multisig-Version1
First version of our R&amp;D project about Starknet's multisig

> ## ⚠️ WARNING! ⚠️
>
> This repo contains highly experimental code which relies on other highly experimental code.
> Expect rapid iteration.
> **Do not use in production.**

Thanks to Sam Barnes for creating the [initial multisig code](https://github.com/sambarnes/cairo-multisig) and offering it available.
## Roadmap
### Current Version
This is the first version of our work regarding a multisig smart contract on Starknet.

It is currently a smart contract that needs other contract accounts (OpenZeppelin, ArgentX) to interact with it.

The multisig can be extended with spending limit rules configured with :
*  `owner`: The owner of the multisig that has privilegied rights. (All owners if set to `0`).
*  `to`: The recipient of the transaction. (All addresses if set to `0`).
*  `num_confirmations_required`: Number of confirmations required for the specific transaction.
*  `asset`: The ERC20 token you want to set a spending limit for (Currently restricted to OZ standard ERC20 token).
*  `allowed_amout`: The amount of `asset` the rule authorizes the owner to spend. 

Each transaction now must be linked with a spending limit (but default treshold is accessible with default rule id = `0`)

The repository contains: 
* Cairo contract code
* Unit tests for testing all the multisig functionnality (written using pytest)

### Roadmap 
* Frontend for first version
* Additional functionalities for first version:
* * Fees paiement by the multisig contract (don't know if it's possible - a sort of meta-transaction)
* Explore Contract Abstraction to implement a multisig Account Contract in a second version

## Development 
### Set up the project 
Clone the repository (spending limits branch for now)
```
git clone -b spending_limit_rules https://github.com/Blockchainpartner/Starknet-Multisig-Version1.git
```
Install pytest 
```
pip install pytest pytest-asyncio
```

Create a Python virtual environment 
```
source ~/cairo_venv/bin/activate
```
### Compile
Compile the cairo files 
```
nile compile
nile compile contracts/account/Account.cairo --account_contract
```

Run corresponding tests from root folder
```
make tests
```
> multisig_base.py is outdated for now 