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
    
    return starknet, multisig, target, owner0, owner1, owner2, owner3, not_an_owner0


@pytest.mark.asyncio
async def test_creation_base_rule(multisig_factory):
    """Should be successfull"""
    _, multisig, target, owner0, owner1, owner2, owner3, _ = multisig_factory
    

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
async def test_creation_rule_too_much_confirmations(multisig_factory):
    """Should fail because the number of confirmations required > number of owners"""
    _, multisig, target, owner0, owner1, owner2, owner3, _ = multisig_factory
    
     # Create a new rule
    owner=owner3.contract_address
    to=target.contract_address
    num_confirmations_required=5
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
async def test_creation_rule_wrong_beneficiary(multisig_factory):
    """Should fail because beneficiary (future sender of transaction) isn't owner of the multisig"""
    _, multisig, target, owner0, owner1, owner2, owner3, not_an_owner0 = multisig_factory
    
     # Create a new rule
    owner=not_an_owner0.contract_address
    to=target.contract_address
    num_confirmations_required=5
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
async def test_creation_another_rule(multisig_factory):
    """Should be successful """
    _, multisig, target, owner0, owner1, owner2, owner3, _ = multisig_factory

    # Create a new rule
    owner=owner0.contract_address
    to=target.contract_address
    num_confirmations_required=2
    asset=0
    allowed_amount=0
    await signer0.send_transaction(
        account=owner0,
        to=multisig.contract_address,
        selector_name="create_rule",
        calldata=[owner, to, num_confirmations_required, asset, allowed_amount]
    )

    # Check second rule exists with corresponding attributes
    expected_rules_len = 2
    observed = await multisig.get_rules_len().call()
    assert observed.result.res == expected_rules_len
    observed = await multisig.get_rule(rule_id=1).call()
    assert observed.result.rule.num_confirmations_required == 2

@pytest.mark.asyncio
async def test_submit_transaction_rule_inexistant(multisig_factory):
    """ Should fail because the rule doesn't exist"""
    _, multisig, target, owner0, owner1, owner2, owner3, _ = multisig_factory
    
    tx_index = 0
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
            calldata=[to, function_selector, calldata_len, rule_id]
        )

@pytest.mark.asyncio
async def test_submit_transaction_owner_not_allowed_for_rule(multisig_factory):
    """ Should fail because the owner doesn't have rights to use the specified rule"""
    _, multisig, target, owner0, owner1, owner2, owner3, _ = multisig_factory
    
    tx_index = 0
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
    starknet, multisig, target, owner0, owner1, owner2, owner3, _ = multisig_factory
    
    not_allowed_target = await starknet.deploy(
        "contracts/target.cairo",
    )

    tx_index = 0
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
    _, multisig, target, owner0, owner1, owner2, owner3, _ = multisig_factory
    
    tx_index = 0
    # Submit a new transaction
    to = target.contract_address
    function_selector = get_selector_from_name("increase_balance")
    calldata_len = 0
    rule_id = 1
    await signer0.send_transaction(
        account=owner0,
        to=multisig.contract_address,
        selector_name="submit_transaction",
        calldata=[to, function_selector, calldata_len, rule_id]
    )

    #Check it was accepted
    observed = await multisig.get_transactions_len().call()
    assert observed.result.res == 1

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



    


