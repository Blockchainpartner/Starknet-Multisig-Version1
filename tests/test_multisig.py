"""multisig.cairo test file."""
import asyncio

import pytest
from starkware.starknet.public.abi import get_selector_from_name
from starkware.starknet.testing.starknet import Starknet
from starkware.starkware_utils.error_handling import StarkException

from utils.utils import TestSigner

signer0 = TestSigner(111111111111111111)
signer1 = TestSigner(222222222222222222)

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
    
# @pytest.mark.asyncio
# async def test_constructor_zero_confirmations_required(multisig_factory):
#     """Should fail because 0 confirmations """
#     _, _, _, owner0, owner1, _ = multisig_factory

#     starknet = await Starknet.empty()
    
#     confirmations_required = 0
#     with pytest.raises(StarkException):
#         multisig = await starknet.deploy(
#         "contracts/multisig.cairo",
#         constructor_calldata=[
#             2,
#             owner0.contract_address,
#             owner1.contract_address,
#             confirmations_required,
#         ],
#     )

# @pytest.mark.asyncio
# async def test_constructor_invalid_confirmations_required(multisig_factory):
#     """Should fail because confirmations required > n_owners """
#     _, _, _, owner0, owner1, _ = multisig_factory

#     starknet = await Starknet.empty()

#     confirmations_required = 3
#     with pytest.raises(StarkException):
#         multisig = await starknet.deploy(
#         "contracts/multisig.cairo",
#         constructor_calldata=[
#             2,
#             owner0.contract_address,
#             owner1.contract_address,
#             confirmations_required,
#         ],
#     )

# @pytest.mark.asyncio
# async def test_constructor(multisig_factory):
#     _, multisig, _, owner0, owner1, _ = multisig_factory

#     expected_len = 2
#     observed = await multisig.get_owners_len().call()
#     assert observed.result.owners_len == expected_len

#     observed = await multisig.get_owners().call()
#     assert len(observed.result.owners) == expected_len
#     assert observed.result.owners[0] == owner0.contract_address
#     assert observed.result.owners[1] == owner1.contract_address

#     expected_confirmations_required = 2
#     observed = await multisig.get_confirmations_required().call()
#     assert observed.result.confirmations_required == expected_confirmations_required

@pytest.mark.asyncio
async def test_non_owner_submit_transaction(multisig_factory):
    """Should fail because not submitted by an owner"""
    _, multisig, target, owner0, owner1, not_an_owner0 = multisig_factory

    observed = await multisig.get_transactions_len().call()
    assert observed.result.res == 0
    observed = await target.get_balance().call()
    assert observed.result.res == 0, "Target contract not initialized"

    #Submit the first transaction
    tx_index = 0
    to = target.contract_address
    function_selector = get_selector_from_name("increase_balance")
    calldata_len = 0
    with pytest.raises(StarkException):
        await not_a_signer0.send_transaction(
            account=not_an_owner0,
            to=multisig.contract_address,
            selector_name="submit_transaction",
            calldata=[to, function_selector, calldata_len]
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
    calldata_len = 0
    await signer0.send_transaction(
        account=owner0,
        to=multisig.contract_address,
        selector_name="submit_transaction",
        calldata=[to, function_selector, calldata_len]
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
    _, multisig, target, owner0, owner1, not_an_owner0 = multisig_factory

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
    _, multisig, target, owner0, owner1, _ = multisig_factory

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
    _, multisig, target, owner0, owner1, _ = multisig_factory

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
    _, multisig, target, owner0, owner1, _ = multisig_factory

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
    _, multisig, target, owner0, owner1, _ = multisig_factory

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
    _, multisig, target, owner0, owner1, not_an_owner0 = multisig_factory

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
    _, multisig, target, owner0, owner1, _ = multisig_factory

    #  Execute the transaction by owner1
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
    _, multisig, target, owner0, owner1, _ = multisig_factory

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
    _, multisig, target, owner0, owner1, _ = multisig_factory

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
    _, multisig, target, owner0, owner1, _ = multisig_factory

    # Confirm a non-existing transaction
    tx_index = 500
    with pytest.raises(StarkException):
        await signer0.send_transaction(
            account=owner0,
            to=multisig.contract_address,
            selector_name="execute_transaction",
            calldata=[tx_index]
        )

# @pytest.mark.asyncio
# async def test_check_signature(multisig_factory):
#     """Should successfully attest validation of the signature"""
#     _, multisig, owner0, owner1 = multisig_factory

#     # Check the test is zero initially
#     assertion_valid = await multisig.get_is_valid_signature().call()
#     assert assertion_valid.result == (0,)

#     transaction_content = 1234
#     message_hash = pedersen_hash(
#         transaction_content, 0
#     )
#     sig_r, sig_s = sign(msg_hash=message_hash, priv_key=owner0.private_key)

#     await multisig.check_signature(
#         transaction_content=transaction_content,
#         signer_public_key=owner0.public_key,
#     ).invoke(signature=[sig_r, sig_s])

#     # Check the test has changed
#     assertion_valid = await multisig.get_is_valid_signature().call()
#     assert assertion_valid.result == (10,)


# @pytest.mark.asyncio
# async def test_check_signature_not_an_owner(multisig_factory):
#     """Should fail with invalid nonce"""
#     _, multisig, owner0, owner1 = multisig_factory

#     transaction_content = 1234
#     message_hash = pedersen_hash(
#         transaction_content, 0
#     )
#     sig_r, sig_s = sign(msg_hash=message_hash, priv_key=not_an_owner0.private_key)

#     with pytest.raises(StarkException):
#         await multisig.check_signature(
#             transaction_content=transaction_content,
#             signer_public_key=owner0.public_key,
#         ).invoke(signature=[sig_r, sig_s])


# @pytest.mark.asyncio
# async def test_check_signature_sign_on_behalf_another_owner(multisig_factory):
#     """Should fail because not the right owner"""
#     _, multisig, owner0, owner1 = multisig_factory

#     transaction_content = 1234
#     message_hash = pedersen_hash(
#         transaction_content, 0
#     )
#     sig_r, sig_s = sign(msg_hash=message_hash, priv_key=owner1.private_key)

#     with pytest.raises(StarkException):
#         await multisig.check_signature(
#             transaction_content=transaction_content,
#             signer_public_key=owner0.public_key,
#         ).invoke(signature=[sig_r, sig_s])

# @pytest.mark.asyncio
# async def test_check_signature_incorrect_transacation_data(multisig_factory):
#     """Should fail because incorrect transaction data"""
#     _, multisig, owner0, owner1 = multisig_factory

#     transaction_content = 1234
#     message_hash = pedersen_hash(
#         transaction_content, 0
#     )
#     sig_r, sig_s = sign(msg_hash=message_hash, priv_key=owner0.private_key)

#     with pytest.raises(StarkException):
#         await multisig.check_signature(
#             transaction_content=12345,
#             signer_public_key=owner0.public_key,
#         ).invoke(signature=[sig_r, sig_s])


