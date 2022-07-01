"""multisig.cairo test file."""
import asyncio

import pytest
from starkware.starknet.public.abi import get_selector_from_name
from starkware.starknet.testing.starknet import Starknet
from starkware.starkware_utils.error_handling import StarkException

from utils.utils import TestSigner

signer0 = TestSigner(111111111111111111)
signer1 = TestSigner(222222222222222222)
signer2 = TestSigner(333333333333333333)
signer3 = TestSigner(444444444444444444)

not_a_signer0 = TestSigner(999999999999999999)

TRUE, FALSE = 1, 0

@pytest.fixture(scope='module')
def event_loop():
    return asyncio.new_event_loop()

# Multisig factory to test spending limit rules 
@pytest.fixture(scope='module')
async def multisig_factory():
    starknet = await Starknet.empty()

    owner0 = await starknet.deploy(
        "contracts/account/Account.cairo",
        constructor_calldata=[signer0.public_key],
    )
    owner1 = await starknet.deploy(
        "contracts/account/Account.cairo",
        constructor_calldata=[signer1.public_key],
    )

    owner2 = await starknet.deploy(
        "contracts/account/Account.cairo",
        constructor_calldata=[signer2.public_key],
    )

    owner3 = await starknet.deploy(
        "contracts/account/Account.cairo",
        constructor_calldata=[signer3.public_key],
    )

    not_an_owner0 = await starknet.deploy(
        "contracts/account/Account.cairo",
        constructor_calldata=[not_a_signer0.public_key],
    )


    confirmations_required = 3
    multisig = await starknet.deploy(
        "contracts/multisig.cairo",
        constructor_calldata=[
            4,
            owner0.contract_address,
            owner1.contract_address,
            owner2.contract_address,
            owner3.contract_address,
            confirmations_required,
        ],
    )

    target = await starknet.deploy(
        "contracts/target.cairo",
    )

    erc20_token = await starknet.deploy(
        "contracts/token/ERC20.cairo",
        constructor_calldata=[
            0x4d756c746973696720546f6b656e, # name = Multisig Token
            0x534947, # symbol = SIG
            18, # decimals = 18 
            500, # supply = 500
            0, # supply = 500 (second attribute of Uint256(500, 0))
            multisig.contract_address,
        ],
    )
    
    return starknet, multisig, target, owner0, owner1, owner2, owner3, not_an_owner0, erc20_token


@pytest.mark.asyncio
async def test_creation_ERC20(multisig_factory):
    """Should be successfull"""
    _, multisig, target, owner0, owner1, owner2, owner3, _, erc20_token = multisig_factory
    
    expected_balance = 500
    multisig_balance = await erc20_token.balanceOf(multisig.contract_address).call()
    assert multisig_balance.result.balance.low == expected_balance

    expected_decimals = 18
    decimals = await erc20_token.decimals().call()
    assert decimals.result.decimals == expected_decimals

@pytest.mark.asyncio
async def test_creation_base_rule(multisig_factory):
    """Should be successfull"""
    """Rule number 0 will be created here"""
    _, multisig, target, owner0, owner1, owner2, owner3, _, _ = multisig_factory
    

    # Check owners len and confirmations required
    expected_len = 4
    observed = await multisig.get_owners_len().call()
    assert observed.result.owners_len == expected_len

    observed = await multisig.get_owners().call()
    assert len(observed.result.owners) == expected_len
    assert observed.result.owners[0] == owner0.contract_address
    assert observed.result.owners[1] == owner1.contract_address
    assert observed.result.owners[2] == owner2.contract_address
    assert observed.result.owners[3] == owner3.contract_address

    expected_confirmations_required = 3
    observed = await multisig.get_confirmations_required().call()
    assert observed.result.confirmations_required == expected_confirmations_required

    # Check first rule exists and is base rule
    expected_rules_len = 1
    observed = await multisig.get_rules_len().call()
    assert observed.result.res == expected_rules_len
    observed = await multisig.get_rule(rule_id=0).call()
    assert observed.result.rule.num_confirmations_required == expected_confirmations_required

@pytest.mark.asyncio
async def test_creation_rule_bypass_threshold_multisig(multisig_factory):
    """Should fail because the function is not called by the multisig"""
    _, multisig, target, owner0, owner1, owner2, owner3, _, _ = multisig_factory
    
     # Create a new rule
    owner=owner3.contract_address
    to=target.contract_address
    num_confirmations_required=2
    asset=0
    allowed_amount=0
    with pytest.raises(StarkException):
        await signer3.send_transaction(
            account=owner3,
            to=multisig.contract_address,
            selector_name="create_rule",
            calldata=[owner, to, num_confirmations_required, asset, allowed_amount]
    )

@pytest.mark.asyncio
async def test_creation_rule_too_much_confirmations(multisig_factory):
    """Should fail because the number of confirmations required > number of owners"""
    _, multisig, target, owner0, owner1, owner2, owner3, _, _ = multisig_factory

    observed = await multisig.get_transactions_len().call()
    tx_index = observed.result.res
    
    # Create a new rule
    function_selector = get_selector_from_name("create_rule")
    calldata_function_len = 5
    calldata_function = [owner3.contract_address, target.contract_address, 5, 0, 0]

    await signer0.send_transaction(
        account=owner0,
        to=multisig.contract_address,
        selector_name="submit_transaction",
        calldata=[multisig.contract_address, function_selector, 0, calldata_function_len, calldata_function[0], calldata_function[1], calldata_function[2], calldata_function[3], calldata_function[4]]
    )

    # Confirm the transaction for owner0
    await signer0.send_transaction(
        account=owner0,
        to=multisig.contract_address,
        selector_name="confirm_transaction",
        calldata=[tx_index]
    )

    # Confirm the transaction for owner1
    await signer1.send_transaction(
        account=owner1,
        to=multisig.contract_address,
        selector_name="confirm_transaction",
        calldata=[tx_index]
    )

    # Confirm the transaction for owner2
    await signer2.send_transaction(
        account=owner2,
        to=multisig.contract_address,
        selector_name="confirm_transaction",
        calldata=[tx_index]
    )

    # Confirm the transaction for owner3
    await signer3.send_transaction(
        account=owner3,
        to=multisig.contract_address,
        selector_name="confirm_transaction",
        calldata=[tx_index]
    )

    with pytest.raises(StarkException):
        await signer0.send_transaction(
            account=owner0,
            to=multisig.contract_address,
            selector_name="execute_transaction",
            calldata=[tx_index]
    )

@pytest.mark.asyncio
async def test_creation_rule_wrong_beneficiary(multisig_factory):
    """Should fail because beneficiary (future sender of transaction) isn't owner of the multisig"""
    _, multisig, target, owner0, owner1, owner2, owner3, not_an_owner0, _ = multisig_factory
    
    observed = await multisig.get_transactions_len().call()
    tx_index = observed.result.res
    
    # Create a new rule
    function_selector = get_selector_from_name("create_rule")
    calldata_function_len = 5
    calldata_function = [not_an_owner0.contract_address, target.contract_address, 3, 0, 0]

    await signer0.send_transaction(
        account=owner0,
        to=multisig.contract_address,
        selector_name="submit_transaction",
        calldata=[multisig.contract_address, function_selector, 0, calldata_function_len, calldata_function[0], calldata_function[1], calldata_function[2], calldata_function[3], calldata_function[4]]
    )

    # Confirm the transaction for owner0
    await signer0.send_transaction(
        account=owner0,
        to=multisig.contract_address,
        selector_name="confirm_transaction",
        calldata=[tx_index]
    )

    # Confirm the transaction for owner1
    await signer1.send_transaction(
        account=owner1,
        to=multisig.contract_address,
        selector_name="confirm_transaction",
        calldata=[tx_index]
    )

    # Confirm the transaction for owner2
    await signer2.send_transaction(
        account=owner2,
        to=multisig.contract_address,
        selector_name="confirm_transaction",
        calldata=[tx_index]
    )

    # Confirm the transaction for owner3
    await signer3.send_transaction(
        account=owner3,
        to=multisig.contract_address,
        selector_name="confirm_transaction",
        calldata=[tx_index]
    )

    with pytest.raises(StarkException):
        await signer0.send_transaction(
            account=owner0,
            to=multisig.contract_address,
            selector_name="execute_transaction",
            calldata=[tx_index]
    )

@pytest.mark.asyncio
async def test_creation_another_rule(multisig_factory):
    """Should be successful """
    """Rule number 1 will be created here"""
    _, multisig, target, owner0, owner1, owner2, owner3, _, _ = multisig_factory

    observed = await multisig.get_transactions_len().call()
    tx_index = observed.result.res

    # Create a new rule
    function_selector = get_selector_from_name("create_rule")
    calldata_function_len = 5
    calldata_function = [owner0.contract_address, target.contract_address, 2, 0, 0]

    await signer0.send_transaction(
        account=owner0,
        to=multisig.contract_address,
        selector_name="submit_transaction",
        calldata=[multisig.contract_address, function_selector, 0, calldata_function_len, calldata_function[0], calldata_function[1], calldata_function[2], calldata_function[3], calldata_function[4]]
    )

    # Confirm the transaction for owner0
    await signer0.send_transaction(
        account=owner0,
        to=multisig.contract_address,
        selector_name="confirm_transaction",
        calldata=[tx_index]
    )

    # Confirm the transaction for owner1
    await signer1.send_transaction(
        account=owner1,
        to=multisig.contract_address,
        selector_name="confirm_transaction",
        calldata=[tx_index]
    )

    # Confirm the transaction for owner2
    await signer2.send_transaction(
        account=owner2,
        to=multisig.contract_address,
        selector_name="confirm_transaction",
        calldata=[tx_index]
    )

    # Confirm the transaction for owner3
    await signer3.send_transaction(
        account=owner3,
        to=multisig.contract_address,
        selector_name="confirm_transaction",
        calldata=[tx_index]
    )

    #Check the transaction is confirmed or not by owners
    observed = await multisig.is_confirmed(tx_index=tx_index, owner=owner0.contract_address).call()
    assert observed.result.res == TRUE
    observed = await multisig.is_confirmed(tx_index=tx_index, owner=owner1.contract_address).call()
    assert observed.result.res == TRUE
    observed = await multisig.is_confirmed(tx_index=tx_index, owner=owner2.contract_address).call()
    assert observed.result.res == TRUE
    observed = await multisig.is_confirmed(tx_index=tx_index, owner=owner3.contract_address).call()
    assert observed.result.res == TRUE

    # Check attributes of the transaction attributes
    expected_transactions_len = tx_index + 1
    observed = await multisig.get_transactions_len().call()
    assert observed.result.res == expected_transactions_len
    observed = await multisig.get_transaction(tx_index=tx_index).call()
    assert observed.result.tx.to == multisig.contract_address
    assert observed.result.tx.function_selector == get_selector_from_name("create_rule")
    assert observed.result.tx.rule_id == 0
    assert observed.result.tx.calldata_len == 5

    await signer0.send_transaction(
        account=owner0,
        to=multisig.contract_address,
        selector_name="execute_transaction",
        calldata=[tx_index]
    )

    # Check second rule exists with corresponding attributes
    expected_rules_len = 2
    observed = await multisig.get_rules_len().call()
    assert observed.result.res == expected_rules_len
    observed = await multisig.get_rule(rule_id=1).call()
    assert observed.result.rule.owner == owner0.contract_address
    assert observed.result.rule.num_confirmations_required == 2


@pytest.mark.asyncio
async def test_submit_transaction_rule_inexistant(multisig_factory):
    """ Should fail because the rule doesn't exist"""
    _, multisig, target, owner0, owner1, owner2, owner3, _, _ = multisig_factory
    
    # Submit a new transaction
    to = target.contract_address
    function_selector = get_selector_from_name("increase_balance")
    calldata_len = 0
    rule_id = 300
    with pytest.raises(StarkException):
        await signer2.send_transaction(
            account=owner2,
            to=multisig.contract_address,
            selector_name="submit_transaction",
            calldata=[to, function_selector, rule_id, calldata_len]
        )

@pytest.mark.asyncio
async def test_submit_transaction_owner_not_allowed_for_rule(multisig_factory):
    """ Should fail because the owner doesn't have rights to use the specified rule"""
    _, multisig, target, owner0, owner1, owner2, owner3, _, _ = multisig_factory
    
    # Submit a new transaction
    to = target.contract_address
    function_selector = get_selector_from_name("increase_balance")
    calldata_len = 0
    rule_id = 1
    with pytest.raises(StarkException):
        await signer2.send_transaction(
            account=owner2,
            to=multisig.contract_address,
            selector_name="submit_transaction",
            calldata=[to, function_selector, calldata_len, rule_id]
        )

@pytest.mark.asyncio
async def test_submit_transaction_recipient_not_allowed_for_rule(multisig_factory):
    """ Should fail because the recipient is not allowed in the specified rule"""
    starknet, multisig, target, owner0, owner1, owner2, owner3, _, _ = multisig_factory
    
    not_allowed_target = await starknet.deploy(
        "contracts/target.cairo",
    )

    # Submit a new transaction
    to = not_allowed_target.contract_address
    function_selector = get_selector_from_name("increase_balance")
    calldata_len = 0
    rule_id = 1
    with pytest.raises(StarkException):
        await signer0.send_transaction(
            account=owner0,
            to=multisig.contract_address,
            selector_name="submit_transaction",
            calldata=[to, function_selector, calldata_len, rule_id]
        )


@pytest.mark.asyncio
async def test_execution_with_another_rule(multisig_factory):
    """ Should be successful """
    _, multisig, target, owner0, owner1, owner2, owner3, _, _ = multisig_factory
    
    observed = await multisig.get_transactions_len().call()
    tx_index = observed.result.res

    # Submit a new transaction
    to = target.contract_address
    function_selector = get_selector_from_name("increase_balance")
    rule_id = 1
    calldata_len = 0
    await signer0.send_transaction(
        account=owner0,
        to=multisig.contract_address,
        selector_name="submit_transaction",
        calldata=[to, function_selector, rule_id, calldata_len]
    )

    #Check it was accepted
    observed = await multisig.get_transactions_len().call()
    assert observed.result.res == tx_index + 1

    # Confirm the transaction for owner0
    await signer0.send_transaction(
        account=owner0,
        to=multisig.contract_address,
        selector_name="confirm_transaction",
        calldata=[tx_index]
    )

    # Confirm the transaction for owner1
    await signer1.send_transaction(
        account=owner1,
        to=multisig.contract_address,
        selector_name="confirm_transaction",
        calldata=[tx_index]
    )

    #Check the transaction is confirmed or not by owners
    observed = await multisig.is_confirmed(tx_index=tx_index, owner=owner0.contract_address).call()
    assert observed.result.res == TRUE
    observed = await multisig.is_confirmed(tx_index=tx_index, owner=owner1.contract_address).call()
    assert observed.result.res == TRUE
    observed = await multisig.is_confirmed(tx_index=tx_index, owner=owner2.contract_address).call()
    assert observed.result.res == FALSE
    observed = await multisig.is_confirmed(tx_index=tx_index, owner=owner3.contract_address).call()
    assert observed.result.res == FALSE

    await signer0.send_transaction(
        account=owner0,
        to=multisig.contract_address,
        selector_name="execute_transaction",
        calldata=[tx_index]
    )

    #Check the transaction has been executed
    observed = await multisig.is_executed(tx_index=tx_index).call()
    assert observed.result.res == TRUE
    observed = await target.get_balance().call()
    assert observed.result.res == 1

@pytest.mark.asyncio
async def test_creation_rule_ERC20_token(multisig_factory):
    """Should be successful"""
    """Rule number 2 will be created here"""
    _, multisig, target, owner0, owner1, owner2, owner3, _, erc20_token = multisig_factory

    observed = await multisig.get_transactions_len().call()
    tx_index = observed.result.res

    # Create a new rule about an erc20 token
    function_selector = get_selector_from_name("create_rule")
    calldata_function_len = 5
    calldata_function = [0, owner1.contract_address, 2, erc20_token.contract_address, 100]

    await signer0.send_transaction(
        account=owner0,
        to=multisig.contract_address,
        selector_name="submit_transaction",
        calldata=[multisig.contract_address, function_selector, 0, calldata_function_len, calldata_function[0], calldata_function[1], calldata_function[2], calldata_function[3], calldata_function[4]]
    )

    # Confirm the transaction for owner0
    await signer0.send_transaction(
        account=owner0,
        to=multisig.contract_address,
        selector_name="confirm_transaction",
        calldata=[tx_index]
    )

    # Confirm the transaction for owner1
    await signer1.send_transaction(
        account=owner1,
        to=multisig.contract_address,
        selector_name="confirm_transaction",
        calldata=[tx_index]
    )

    # Confirm the transaction for owner2
    await signer2.send_transaction(
        account=owner2,
        to=multisig.contract_address,
        selector_name="confirm_transaction",
        calldata=[tx_index]
    )

    # Confirm the transaction for owner3
    await signer3.send_transaction(
        account=owner3,
        to=multisig.contract_address,
        selector_name="confirm_transaction",
        calldata=[tx_index]
    )

    #Check the transaction is confirmed or not by owners
    observed = await multisig.is_confirmed(tx_index=tx_index, owner=owner0.contract_address).call()
    assert observed.result.res == TRUE
    observed = await multisig.is_confirmed(tx_index=tx_index, owner=owner1.contract_address).call()
    assert observed.result.res == TRUE
    observed = await multisig.is_confirmed(tx_index=tx_index, owner=owner2.contract_address).call()
    assert observed.result.res == TRUE
    observed = await multisig.is_confirmed(tx_index=tx_index, owner=owner3.contract_address).call()
    assert observed.result.res == TRUE

    # Check attributes of the transaction attributes
    expected_transactions_len = tx_index + 1
    observed = await multisig.get_transactions_len().call()
    assert observed.result.res == expected_transactions_len
    observed = await multisig.get_transaction(tx_index=tx_index).call()
    assert observed.result.tx.to == multisig.contract_address
    assert observed.result.tx.function_selector == get_selector_from_name("create_rule")
    assert observed.result.tx.rule_id == 0
    assert observed.result.tx.calldata_len == 5

    await signer0.send_transaction(
        account=owner0,
        to=multisig.contract_address,
        selector_name="execute_transaction",
        calldata=[tx_index]
    )

    # Check the rule exists with corresponding attributes
    expected_rules_len = 3
    expected_allowed_amount = 100
    observed = await multisig.get_rules_len().call()
    assert observed.result.res == expected_rules_len
    observed = await multisig.get_rule(rule_id=2).call()
    assert observed.result.rule.num_confirmations_required == 2
    assert observed.result.rule.asset == erc20_token.contract_address
    assert observed.result.rule.allowed_amount == expected_allowed_amount

#test appel d'une transaction sur le contrat de notre erc20 (ex: balanceOf) pour verifier que la restriction au transfer fronctionne bien 
@pytest.mark.asyncio
async def test_submit_transaction_asset_not_transfer(multisig_factory):
    """ Should fail because the called contract is erc20_token but the called function is not transfer"""
    starknet, multisig, target, owner0, owner1, owner2, owner3, _, erc20_token = multisig_factory
    
    # Submit the transaction transaction
    to = erc20_token.contract_address
    function_selector = get_selector_from_name("balanceOf")
    calldata_function_len = 1
    calldata_function = [multisig.contract_address]
    rule_id = 2
    with pytest.raises(StarkException):
        await signer2.send_transaction(
            account=owner2,
            to=multisig.contract_address,
            selector_name="submit_transaction",
            calldata=[to, function_selector, rule_id, calldata_function_len, calldata_function[0]]
        )

@pytest.mark.asyncio
async def test_submit_transaction_asset(multisig_factory):
    """ Should be successful because the function called is erc20's transfer function"""
    starknet, multisig, target, owner0, owner1, owner2, owner3, _, erc20_token = multisig_factory

    observed = await multisig.get_transactions_len().call()
    tx_index = observed.result.res
    
    # Submit the transaction
    to = erc20_token.contract_address
    function_selector = get_selector_from_name("transfer")
    calldata_function_len = 3
    # Send 100 tokens from multisig to owner1 - should be allowed by rule 3 with 2 expected confirmations
    # Attention point, it's not possible to send the array directly
    calldata_function = [owner1.contract_address, 10, 0]
    rule_id = 2
    await signer2.send_transaction(
        account=owner2,
        to=multisig.contract_address,
        selector_name="submit_transaction",
        calldata=[to, function_selector, rule_id, calldata_function_len, calldata_function[0], calldata_function[1], calldata_function[2]]
    )

    #Check it was accepted
    observed = await multisig.get_transactions_len().call()
    assert observed.result.res == tx_index + 1
    observed = await multisig.get_transaction(tx_index).call()
    assert observed.result.tx_calldata[0] == owner1.contract_address
    assert observed.result.tx_calldata[1] == 10


@pytest.mark.asyncio
async def test_confirmation_transaction_asset(multisig_factory):
    """ Should be successful """
    _, multisig, target, owner0, owner1, owner2, owner3, _, erc20_token = multisig_factory

    observed = await multisig.get_transactions_len().call()
    tx_index = observed.result.res - 1

    # Confirm the transaction for owner0
    await signer0.send_transaction(
        account=owner0,
        to=multisig.contract_address,
        selector_name="confirm_transaction",
        calldata=[tx_index]
    )

    # Confirm the transaction for owner1
    await signer1.send_transaction(
        account=owner1,
        to=multisig.contract_address,
        selector_name="confirm_transaction",
        calldata=[tx_index]
    )

    # Check the transaction is confirmed by only 2 owners
    observed = await multisig.is_confirmed(tx_index=tx_index, owner=owner0.contract_address).call()
    assert observed.result.res == TRUE
    observed = await multisig.is_confirmed(tx_index=tx_index, owner=owner1.contract_address).call()
    assert observed.result.res == TRUE
    observed = await multisig.is_confirmed(tx_index=tx_index, owner=owner2.contract_address).call()
    assert observed.result.res == FALSE
    observed = await multisig.is_confirmed(tx_index=tx_index, owner=owner3.contract_address).call()
    assert observed.result.res == FALSE

    # Should be executed even if there are only 2 confirmations
    await signer0.send_transaction(
        account=owner0,
        to=multisig.contract_address,
        selector_name="execute_transaction",
        calldata=[tx_index]
    )

    # Check the transaction has been executed
    observed = await multisig.is_executed(tx_index=tx_index).call()
    assert observed.result.res == TRUE
    observed = await erc20_token.balanceOf(owner1.contract_address).call()
    assert observed.result.balance.low == 10
    observed = await erc20_token.balanceOf(multisig.contract_address).call()
    assert observed.result.balance.low == 490

    # Check the remaining amount allowed in the rule 
    observed = await multisig.get_rule(rule_id=2).call()
    assert observed.result.rule.allowed_amount == 90







    


