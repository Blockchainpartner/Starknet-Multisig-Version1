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

# It's needed to have all contracts deployed in the same fixture to be in the same Starknet state
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

    not_an_owner0 = await starknet.deploy(
        "contracts/account/Account.cairo",
        constructor_calldata=[not_a_signer0.public_key],
    )


    confirmations_required = 2
    multisig = await starknet.deploy(
        "contracts/multisig.cairo",
        constructor_calldata=[
            2,
            owner0.contract_address,
            owner1.contract_address,
            confirmations_required,
        ],
    )

    target = await starknet.deploy(
        "contracts/target.cairo",
    )
    
    return starknet, multisig, target, owner0, owner1, not_an_owner0

# Larger multisig factory with 3/4 treshold needed for additional tests
@pytest.fixture(scope='module')
async def multisig_factory_2():
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
    
    return starknet, multisig, target, owner0, owner1, owner2, owner3
    
@pytest.mark.asyncio
async def test_constructor_zero_confirmations_required(multisig_factory):
    """Should fail because 0 confirmations """
    _, _, _, owner0, owner1, _ = multisig_factory

    starknet = await Starknet.empty()
    
    confirmations_required = 0
    with pytest.raises(StarkException):
        multisig = await starknet.deploy(
        "contracts/multisig.cairo",
        constructor_calldata=[
            2,
            owner0.contract_address,
            owner1.contract_address,
            confirmations_required,
        ],
    )

@pytest.mark.asyncio
async def test_constructor_invalid_confirmations_required(multisig_factory):
    """Should fail because confirmations required > n_owners """
    _, _, _, owner0, owner1, _ = multisig_factory

    starknet = await Starknet.empty()

    confirmations_required = 3
    with pytest.raises(StarkException):
        multisig = await starknet.deploy(
        "contracts/multisig.cairo",
        constructor_calldata=[
            2,
            owner0.contract_address,
            owner1.contract_address,
            confirmations_required,
        ],
    )

@pytest.mark.asyncio
async def test_constructor(multisig_factory):
    _, multisig, _, owner0, owner1, _ = multisig_factory

    expected_len = 2
    observed = await multisig.get_owners_len().call()
    assert observed.result.owners_len == expected_len

    observed = await multisig.get_owners().call()
    assert len(observed.result.owners) == expected_len
    assert observed.result.owners[0] == owner0.contract_address
    assert observed.result.owners[1] == owner1.contract_address

    expected_confirmations_required = 2
    observed = await multisig.get_rule(rule_id = 0).call()
    assert observed.result.rule.num_confirmations_required == expected_confirmations_required

@pytest.mark.asyncio
async def test_non_owner_submit_transaction(multisig_factory):
    """Should fail because not submitted by an owner"""
    _, multisig, target, _, _, not_an_owner0 = multisig_factory

    observed = await multisig.get_transactions_len().call()
    assert observed.result.res == 0
    observed = await target.get_balance().call()
    assert observed.result.res == 0, "Target contract not initialized"

    #Submit the first transaction
    to = target.contract_address
    function_selector = get_selector_from_name("increase_balance")
    rule_id = 0
    calldata_len = 0
    with pytest.raises(StarkException):
        await not_a_signer0.send_transaction(
            account=not_an_owner0,
            to=multisig.contract_address,
            selector_name="submit_transaction",
            calldata=[to, function_selector, rule_id, calldata_len]
        )

@pytest.mark.asyncio
async def test_submit_transaction(multisig_factory):
    _, multisig, target, owner0, _, _ = multisig_factory

    observed = await multisig.get_transactions_len().call()
    assert observed.result.res == 0
    observed = await target.get_balance().call()
    assert observed.result.res == 0, "Target contract not initialized"

    #Submit the first transaction
    tx_index = 0
    to = target.contract_address
    function_selector = get_selector_from_name("increase_balance")
    rule_id = 0
    calldata_len = 0
    await signer0.send_transaction(
        account=owner0,
        to=multisig.contract_address,
        selector_name="submit_transaction",
        calldata=[to, function_selector, rule_id, calldata_len]
    )

    #Check it was accepted & starts as unconfirmed
    observed = await multisig.get_transactions_len().call()
    assert observed.result.res == 1
    observed = await multisig.is_confirmed(tx_index=tx_index, owner=owner0.contract_address).call()
    assert observed.result.res == FALSE
    observed = await target.get_balance().call()
    assert observed.result.res == 0, "Balance should not be already increased"

@pytest.mark.asyncio
async def test_non_owner_confirm_transaction(multisig_factory):
    """Should fail because not confirmed by an owner"""
    _, multisig, target, _, _, not_an_owner0 = multisig_factory

    observed = await multisig.get_transactions_len().call()
    assert observed.result.res == 1
    observed = await target.get_balance().call()
    assert observed.result.res == 0, "Target contract not initialized"

    #Submit the first transaction
    tx_index = 0
    with pytest.raises(StarkException):
        await not_a_signer0.send_transaction(
            account=not_an_owner0,
            to=multisig.contract_address,
            selector_name="confirm_transaction",
            calldata=[tx_index]
        )

@pytest.mark.asyncio
async def test_execute_transaction_zero_confirmations(multisig_factory):
    """Should fail because the transaction hasn't any confirmation"""
    _, multisig, target, owner0, _, _ = multisig_factory

    # Execute it without confirming
    tx_index = 0
    with pytest.raises(StarkException):
        await signer0.send_transaction(
            account=owner0,
            to=multisig.contract_address,
            selector_name="execute_transaction",
            calldata=[tx_index]
        )
    
    # Check our initial state still holds
    observed = await multisig.is_executed(tx_index=tx_index).call()
    assert observed.result.res == FALSE
    observed = await target.get_balance().call()
    assert observed.result.res == 0, "Balance should not be already increased"

@pytest.mark.asyncio
async def test_execute_transaction_confirmations_lower_than_treshold(multisig_factory):
    """Should fail because the transaction is not confirmed by enough owners"""
    _, multisig, _, owner0, owner1, _ = multisig_factory

    # Confirm the transaction for owner0 
    tx_index = 0
    await signer0.send_transaction(
        account=owner0,
        to=multisig.contract_address,
        selector_name="confirm_transaction",
        calldata=[tx_index]
    )

    #Check the transaction is confirmed by owner0 but not owner1
    observed = await multisig.is_confirmed(tx_index=tx_index, owner=owner0.contract_address).call()
    assert observed.result.res == TRUE
    observed = await multisig.is_confirmed(tx_index=tx_index, owner=owner1.contract_address).call()
    assert observed.result.res == FALSE

    with pytest.raises(StarkException):
        await signer0.send_transaction(
            account=owner0,
            to=multisig.contract_address,
            selector_name="execute_transaction",
            calldata=[tx_index]
        )

@pytest.mark.asyncio
async def test_confirm_already_confirmed_transaction(multisig_factory):
    """Following previous test where owner0 confirmed transaction at index = 0"""
    """Should fail because owner0 tries to reconfirm an already confirmed transaction"""
    _, multisig, _, owner0, _, _ = multisig_factory

    # Re-Confirm the transaction for owner0 
    tx_index = 0
    with pytest.raises(StarkException):
        await signer0.send_transaction(
            account=owner0,
            to=multisig.contract_address,
            selector_name="confirm_transaction",
            calldata=[tx_index]
        )

@pytest.mark.asyncio
async def test_confirm_non_existing_transaction(multisig_factory):
    """Should fail because the transaction owner0 tries to confirm does not exist"""
    _, multisig, _, owner0, _, _ = multisig_factory

    # Confirm a non-existing transaction
    tx_index = 500
    with pytest.raises(StarkException):
        await signer0.send_transaction(
            account=owner0,
            to=multisig.contract_address,
            selector_name="confirm_transaction",
            calldata=[tx_index]
        )

@pytest.mark.asyncio
async def test_confirm_transaction(multisig_factory):
    """Should be successful"""
    _, multisig, _, _, owner1, _ = multisig_factory

    # Confirm the transaction for owner1 
    tx_index = 0
    await signer1.send_transaction(
        account=owner1,
        to=multisig.contract_address,
        selector_name="confirm_transaction",
        calldata=[tx_index]
    )

    #Check the transaction is confirmed by owner1
    observed = await multisig.is_confirmed(tx_index=tx_index, owner=owner1.contract_address).call()
    assert observed.result.res == TRUE

@pytest.mark.asyncio
async def test_non_owner_execute_confirmed_transaction(multisig_factory):
    """Should fail because not executed by an owner"""
    _, multisig, _, _, _, not_an_owner0 = multisig_factory

    # Index of the confirmed transaction
    tx_index = 0
    with pytest.raises(StarkException):
        await not_a_signer0.send_transaction(
            account=not_an_owner0,
            to=multisig.contract_address,
            selector_name="execute_transaction",
            calldata=[tx_index]
        )

@pytest.mark.asyncio
async def test_execute_transaction(multisig_factory):
    """Following previous tests, transaction has been confirmed by owner0 and owner1"""
    """Should be successful"""
    _, multisig, target, _, owner1, _ = multisig_factory

    # Owner1 excutes the transaction
    tx_index = 0
    await signer1.send_transaction(
        account=owner1,
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
async def test_confirm_already_executed_transaction(multisig_factory):
    """Should fail because the transaction owner1 tries to confirm has already been executed"""
    _, multisig, _, _, owner1, _ = multisig_factory

    # Confirm an already executed transaction
    tx_index = 1
    with pytest.raises(StarkException):
        await signer1.send_transaction(
            account=owner1,
            to=multisig.contract_address,
            selector_name="confirm_transaction",
            calldata=[tx_index]
        )

@pytest.mark.asyncio
async def test_execute_already_executed_transaction(multisig_factory):
    """Should fail because the transaction owner0 tries to execute has already been executed"""
    _, multisig, _, owner0, _, _ = multisig_factory

    # Execute an already executed transaction
    tx_index = 0
    with pytest.raises(StarkException):
        await signer0.send_transaction(
            account=owner0,
            to=multisig.contract_address,
            selector_name="execute_transaction",
            calldata=[tx_index]
        )

@pytest.mark.asyncio
async def test_execute_non_existing_transaction(multisig_factory):
    """Should fail because the transaction owner0 tries to execute does not exist"""
    _, multisig, _, owner0, _, _ = multisig_factory

    # Confirm a non-existing transaction
    tx_index = 500
    with pytest.raises(StarkException):
        await signer0.send_transaction(
            account=owner0,
            to=multisig.contract_address,
            selector_name="execute_transaction",
            calldata=[tx_index]
        )


# --------- Revoke tests -----------
@pytest.mark.asyncio
async def test_revoke_executed_transaction(multisig_factory):
    """Should fail because the transaction already executed"""
    _, multisig, _, owner0, _, _ = multisig_factory

    # Revoke a confirmation for an executed transaction
    tx_index = 0
    with pytest.raises(StarkException):
        await signer0.send_transaction(
            account=owner0,
            to=multisig.contract_address,
            selector_name="revoke_confirmation",
            calldata=[tx_index]
        )

@pytest.mark.asyncio
async def test_revoke_non_existing_transaction(multisig_factory):
    """Should fail because the already executed"""
    _, multisig, _, owner0, _, _ = multisig_factory

    # Revoke a confirmation for a non-existing transaction
    tx_index = 750
    with pytest.raises(StarkException):
        await signer0.send_transaction(
            account=owner0,
            to=multisig.contract_address,
            selector_name="revoke_confirmation",
            calldata=[tx_index]
        )

@pytest.mark.asyncio
async def test_non_owner_revokes_confirmation(multisig_factory):
    """Should fail because non owner tries to revoke"""
    _, multisig, target, owner0, _, not_an_owner0 = multisig_factory

    # Get nonce
    tx_index = await multisig.get_transactions_len().call()
    tx_index = tx_index.result.res
    assert tx_index == 1
    
    # Submit a new transactions
    to = target.contract_address
    function_selector = get_selector_from_name("increase_balance")
    rule_id = 0
    calldata_len = 0
    await signer0.send_transaction(
        account=owner0,
        to=multisig.contract_address,
        selector_name="submit_transaction",
        calldata=[to, function_selector, rule_id, calldata_len]
    )

    # Owner0 confirms the transaction
    await signer0.send_transaction(
        account=owner0,
        to=multisig.contract_address,
        selector_name="confirm_transaction",
        calldata=[tx_index]
    )

    #Check the transaction is confirmed by owner0
    observed = await multisig.is_confirmed(tx_index=tx_index, owner=owner0.contract_address).call()
    assert observed.result.res == TRUE

    # Non-owner tries to revoke the confirmation of owner0
    with pytest.raises(StarkException):
        await not_a_signer0.send_transaction(
            account=not_an_owner0,
            to=multisig.contract_address,
            selector_name="revoke_confirmation",
            calldata=[tx_index]
        )

@pytest.mark.asyncio
async def test_revoke_confirmation(multisig_factory):
    """Should be successfull"""
    _, multisig, _, owner0, _, _ = multisig_factory

    # Get nonce
    tx_index = await multisig.get_transactions_len().call()
    tx_index = tx_index.result.res - 1
    assert tx_index == 1

    # Check the transaction has been previously confirmed by owner0
    observed = await multisig.is_confirmed(tx_index=tx_index, owner=owner0.contract_address).call()
    assert observed.result.res == TRUE

    # Owner0 revokes his confirmation
    await signer0.send_transaction(
        account=owner0,
        to=multisig.contract_address,
        selector_name="revoke_confirmation",
        calldata=[tx_index]
    )

    # Check the transaction has been revoked by owner0
    observed = await multisig.is_confirmed(tx_index=tx_index, owner=owner0.contract_address).call()
    assert observed.result.res == FALSE

@pytest.mark.asyncio
async def test_revoke_already_revoked_confirmation(multisig_factory):
    """Should fail because confirmation has already been revoked"""
    _, multisig, _, owner0, _, _ = multisig_factory

    # Get nonce
    tx_index = await multisig.get_transactions_len().call()
    tx_index = tx_index.result.res - 1
    assert tx_index == 1

    # Check the transaction has been revoked by owner 0
    observed = await multisig.is_confirmed(tx_index=tx_index, owner=owner0.contract_address).call()
    assert observed.result.res == FALSE

    # Owner0 revokes confirmation
    with pytest.raises(StarkException):
        await signer0.send_transaction(
            account=owner0,
            to=multisig.contract_address,
            selector_name="revoke_confirmation",
            calldata=[tx_index]
        )

@pytest.mark.asyncio
async def test_execute_revoked_transaction(multisig_factory):
    """Should fail because confirmation for owner0 has been revoked"""
    _, multisig, target, owner0, owner1, not_an_owner0 = multisig_factory

    # Get nonce
    tx_index = await multisig.get_transactions_len().call()
    tx_index = tx_index.result.res - 1
    assert tx_index == 1
    
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

    # Check the transaction has been revoked by owner 0
    observed = await multisig.is_confirmed(tx_index=tx_index, owner=owner0.contract_address).call()
    assert observed.result.res == TRUE
    observed = await multisig.is_confirmed(tx_index=tx_index, owner=owner1.contract_address).call()
    assert observed.result.res == TRUE

    # Revoke the transaction for owner1
    await signer1.send_transaction(
        account=owner1,
        to=multisig.contract_address,
        selector_name="revoke_confirmation",
        calldata=[tx_index]
    )

    observed = await multisig.is_confirmed(tx_index=tx_index, owner=owner1.contract_address).call()
    assert observed.result.res == FALSE

    # Owner0 tries to execute confirmation
    with pytest.raises(StarkException):
        await signer0.send_transaction(
            account=owner0,
            to=multisig.contract_address,
            selector_name="execute_transaction",
            calldata=[tx_index]
        )

# --------- Tests on multisig_factory_2 -----------
@pytest.mark.asyncio
async def test_execute_with_too_many_transaction(multisig_factory_2):
    """Should be successfull even with superfluous confirmations"""
    """Should be successfull even if a superfluous confirmation is revoked"""
    _, multisig, target, owner0, owner1, owner2, owner3 = multisig_factory_2
    

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
    observed = await multisig.get_rule(rule_id = 0).call()
    assert observed.result.rule.num_confirmations_required == expected_confirmations_required

    tx_index = 0

    # Submit a new transactions
    to = target.contract_address
    function_selector = get_selector_from_name("increase_balance")
    rule_id = 0
    calldata_len = 0
    await signer0.send_transaction(
        account=owner0,
        to=multisig.contract_address,
        selector_name="submit_transaction",
        calldata=[to, function_selector, rule_id, calldata_len]
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

    #Check the transaction is confirmed by owners
    observed = await multisig.is_confirmed(tx_index=tx_index, owner=owner0.contract_address).call()
    assert observed.result.res == TRUE
    observed = await multisig.is_confirmed(tx_index=tx_index, owner=owner1.contract_address).call()
    assert observed.result.res == TRUE
    observed = await multisig.is_confirmed(tx_index=tx_index, owner=owner2.contract_address).call()
    assert observed.result.res == TRUE
    observed = await multisig.is_confirmed(tx_index=tx_index, owner=owner3.contract_address).call()
    assert observed.result.res == TRUE

    # Revoke the transaction for owner0
    await signer0.send_transaction(
        account=owner0,
        to=multisig.contract_address,
        selector_name="revoke_confirmation",
        calldata=[tx_index]
    )

    observed = await multisig.is_confirmed(tx_index=tx_index, owner=owner0.contract_address).call()
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
async def test_execute_subsequent_transaction(multisig_factory_2):
    """Should be successfull to execute subsequent transactions"""
    _, multisig, target, owner0, owner1, owner2, _ = multisig_factory_2

    
    # Submit a new transactions
    to = target.contract_address
    function_selector = get_selector_from_name("increase_balance")
    rule_id = 0
    calldata_len = 0
    await signer0.send_transaction(
        account=owner0,
        to=multisig.contract_address,
        selector_name="submit_transaction",
        calldata=[to, function_selector, rule_id, calldata_len]
    )

    # Submit a new transactions
    to = target.contract_address
    function_selector = get_selector_from_name("increase_balance")
    rule_id = 0
    calldata_len = 0
    await signer0.send_transaction(
        account=owner0,
        to=multisig.contract_address,
        selector_name="submit_transaction",
        calldata=[to, function_selector, rule_id, calldata_len]
    )

    # Submit a new transactions
    to = target.contract_address
    function_selector = get_selector_from_name("increase_balance")
    rule_id = 0
    calldata_len = 0
    await signer0.send_transaction(
        account=owner0,
        to=multisig.contract_address,
        selector_name="submit_transaction",
        calldata=[to, function_selector, rule_id, calldata_len]
    )

    #Check it was accepted
    observed = await multisig.get_transactions_len().call()
    assert observed.result.res == 4

    subsequent_tx = 3
    # Confirm the transaction number 3 for owner0
    await signer0.send_transaction(
        account=owner0,
        to=multisig.contract_address,
        selector_name="confirm_transaction",
        calldata=[subsequent_tx]
    )

    # Confirm the transaction number 3 for owner1
    await signer1.send_transaction(
        account=owner1,
        to=multisig.contract_address,
        selector_name="confirm_transaction",
        calldata=[subsequent_tx]
    )

    # Confirm the transaction number 3 for owner2
    await signer2.send_transaction(
        account=owner2,
        to=multisig.contract_address,
        selector_name="confirm_transaction",
        calldata=[subsequent_tx]
    )

    await signer0.send_transaction(
        account=owner0,
        to=multisig.contract_address,
        selector_name="execute_transaction",
        calldata=[subsequent_tx]
    )

    #Check the transaction has been executed but not others
    observed = await multisig.is_executed(tx_index=subsequent_tx).call()
    assert observed.result.res == TRUE
    observed = await multisig.is_executed(tx_index=subsequent_tx - 1).call()
    assert observed.result.res == FALSE
    observed = await multisig.is_executed(tx_index=subsequent_tx + 1).call()
    assert observed.result.res == FALSE

    observed = await target.get_balance().call()
    assert observed.result.res == 2
