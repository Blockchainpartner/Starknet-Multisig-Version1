# Declare this file as a StarkNet contract.
%lang starknet

from starkware.cairo.common.alloc import alloc
from starkware.cairo.common.cairo_builtins import HashBuiltin
from starkware.cairo.common.math import assert_not_zero, assert_le, assert_lt
from starkware.cairo.common.bool import TRUE, FALSE
from starkware.starknet.common.syscalls import call_contract, get_caller_address, get_contract_address

const TRANSFER_SELECTOR = 232670485425082704932579856502088130646006032362877466777181098476241604910

#
# Events
#

@event
func SubmitTransaction(owner : felt, tx_index : felt, to : felt):
end

@event
func ConfirmTransaction(owner : felt, tx_index : felt):
end

@event
func RevokeConfirmation(owner : felt, tx_index : felt):
end

@event
func ExecuteTransaction(owner : felt, tx_index : felt):
end

#
# Storage
#

struct Transaction:
    member to : felt
    member function_selector : felt
    member calldata_len : felt
    member executed : felt
    member num_confirmations : felt
    member rule_id : felt
end

# Used for spending limit rules
struct Rule:
    member owner : felt
    member to : felt
    member num_confirmations_required: felt
    member asset : felt
    member allowed_amount : felt
end

@storage_var
func _rules(rule_id : felt, field : felt) -> (res : felt):
# Field enum pattern described in https://hackmd.io/@RoboTeddy/BJZFu56wF#Concise-way
end

@storage_var
func _next_rule_id() -> (res : felt):
end

@storage_var
func _can_use_rule(owner : felt, rule_id : felt) -> (res : felt):
end

@storage_var
func _owners_len() -> (res : felt):
end

@storage_var
func _owners(index : felt) -> (res : felt):
end

@storage_var
func _is_owner(address : felt) -> (res : felt):
end

@storage_var
func _next_tx_index() -> (res : felt):
end

@storage_var
func _transactions(tx_index : felt, field : felt) -> (res : felt):
# Field enum pattern described in https://hackmd.io/@RoboTeddy/BJZFu56wF#Concise-way
end

@storage_var
func _transaction_calldata(tx_index : felt, calldata_index : felt) -> (res : felt):
end

@storage_var
func _is_confirmed(tx_index : felt, owner : felt) -> (res : felt):
end

#
# Conditions
#

# Revert if the calling account is not an owner
func require_owner{
        syscall_ptr : felt*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }():
    let (caller) = get_caller_address()
    let (is_caller_owner) = is_owner(address=caller)
    with_attr error_message("not owner"):
        assert is_caller_owner = TRUE
    end
    return ()
end

func require_multisig_sender{
        syscall_ptr : felt*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }():
    let (caller) = get_caller_address()
    let (multisig_contract_address) = get_contract_address()
    with_attr error_message("not multisig that sends the transaction"):
        assert caller = multisig_contract_address
    end
    return ()
end

# Revert if tx does not exist
func require_tx_exists{
        syscall_ptr : felt*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }(tx_index : felt):
    let (next_tx_index) = _next_tx_index.read()
    with_attr error_message("tx does not exist"):
        assert_lt(tx_index, next_tx_index)
    end
    return ()
end

# Revert if tx has been executed
func require_not_executed{
        syscall_ptr : felt*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }(tx_index : felt):
    let (is_executed) = _transactions.read(tx_index=tx_index, field=Transaction.executed)
    with_attr error_message("tx already executed"):
        assert is_executed = FALSE
    end
    return ()
end

# Revert if tx has been confirmed for the calling account already
func require_not_confirmed{
        syscall_ptr : felt*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }(tx_index : felt):
    let (caller) = get_caller_address()
    let (is_confirmed_for_caller) = is_confirmed(tx_index=tx_index, owner=caller)
    with_attr error_message("tx already confirmed"):
        assert is_confirmed_for_caller = FALSE
    end
    return ()
end

# Revert if tx has not been confirmed for the calling account already
func require_confirmed{
        syscall_ptr : felt*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }(tx_index : felt):
    let (caller) = get_caller_address()
    let (is_confirmed_for_caller) = is_confirmed(tx_index=tx_index, owner=caller)
    with_attr error_message("tx not confirmed"):
        assert is_confirmed_for_caller = TRUE
    end
    return ()
end

# Revert if the owner who submit the transaction doesn't have rights to use the rule
func require_rule_rights{
        syscall_ptr : felt*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }(rule_id : felt):
    
    let (rule) = get_rule(rule_id)
    if rule.owner != 0 :
        let (caller) = get_caller_address()
        with_attr error_message("owner doesn't have rights to use this rule"):
            assert caller = rule.owner
        end
        return ()
    end
    return ()
end

# Revert is the rule doesn't exist
func require_rule_exists{
        syscall_ptr : felt*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }(rule_id : felt):
    let (next_rule_id) = _next_rule_id.read()
    with_attr error_message("rule does not exist"):
        assert_lt(rule_id, next_rule_id)
    end
    return ()
end

# Revert if the owner concerned by the rule (future sender of the transaction) isn't a signer of the multisig
func require_sender_allowed{
        syscall_ptr : felt*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }(owner : felt):
    
    if owner != 0 :
        let (_is_owner) = is_owner(owner)
        with_attr error_message("sender isn't allowed by this rule"):
            assert _is_owner = TRUE
        end
        return ()
    end
    return ()
end

# Revert if you try to create a rule about an asset but allowing to spend 0
func require_correct_amount{
        syscall_ptr : felt*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }(asset : felt, allowed_amount : felt):
    
    if asset != 0 :
        with_attr error_message("you can't create a rule about a token with 0 allowed amount"):
            assert_lt(0, allowed_amount)
        end 
        return ()
    end
    # Check that if there is no asset, it can't be an allowed amount
    with_attr error_message("you can't create a rule about no token but with an allowed amount"):
            assert allowed_amount = 0
    end
    return ()
end


# Revert if the recipient of the transaction is not allowed by the rule 
func require_recipient_allowed{
        syscall_ptr : felt*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }(
        rule_id : felt,
        to : felt,
        calldata_len : felt,
        calldata : felt*
    ):
    
    let (rule) = get_rule(rule_id)
    if rule.to != 0 :
        if rule.asset != 0 :
            with_attr error_message("recipient isn't allowed by this rule (transfer case)"):
                assert calldata[0] = rule.to
            end
            return()
        else :
            with_attr error_message("recipient isn't allowed by this rule"):
                assert to = rule.to
            end
            return ()
        end
    end
    return ()
end

# Revert if the transaction rule is about an asset but you are not transfering it
func require_transfer{
        syscall_ptr : felt*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }(rule_id : felt, function_selector : felt, calldata_len : felt, calldata : felt*):
    
    let (rule) = get_rule(rule_id)
    if rule.asset != 0 :
        with_attr error_message("you can't submit a transaction with a rule about an asset if fonction called isn't transfer"):
            assert function_selector = TRANSFER_SELECTOR
        end

        with_attr error_message("you can't submit a transaction about transfering 0 tokens"):
            assert_lt(0, calldata[1])
        end 

        with_attr error_message("you can't submit a transaction of more than allowed tokens"):
            assert_le(calldata[1], rule.allowed_amount)
        end 
        return ()
    end
    return ()
end

#
# Getters
#

@view
func is_owner{
        syscall_ptr : felt*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }(address : felt) -> (res : felt):
    let (res) = _is_owner.read(address=address)
    return (res)
end

@view
func get_owners_len{
        syscall_ptr : felt*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }() -> (owners_len : felt):
    let (owners_len) = _owners_len.read()
    return (owners_len=owners_len)
end

@view
func _get_owners{
        syscall_ptr : felt*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }(
        owners_index : felt,
        owners_len : felt,
        owners : felt*,
    ):
    if owners_index == owners_len:
        return ()
    end

    let (owner) = _owners.read(index=owners_index)
    assert owners[owners_index] = owner

    _get_owners(owners_index=owners_index + 1, owners_len=owners_len, owners=owners)
    return ()
end

@view
func get_owners{
        syscall_ptr : felt*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }() -> (
        owners_len : felt,
        owners : felt*,
    ):
    alloc_locals
    let (owners) = alloc()
    let (owners_len) = _owners_len.read()
    if owners_len == 0:
        return (owners_len=owners_len, owners=owners)
    end

    # Recursively add owners from storage to the owners array
    _get_owners(owners_index=0, owners_len=owners_len, owners=owners)
    return (owners_len=owners_len, owners=owners)
end

@view
func get_transactions_len{
        syscall_ptr : felt*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }() -> (res : felt):
    let (res) = _next_tx_index.read()
    return (res)
end

@view
func is_confirmed{
        syscall_ptr : felt*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }(tx_index : felt, owner : felt) -> (res : felt):
    let (res) = _is_confirmed.read(tx_index=tx_index, owner=owner)
    return (res)
end

@view
func is_executed{
        syscall_ptr : felt*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }(tx_index : felt) -> (res : felt):
    let (res) = _transactions.read(tx_index=tx_index, field=Transaction.executed)
    return (res)
end

func _get_transaction_calldata{
        syscall_ptr : felt*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }(
        tx_index : felt,
        calldata_index : felt,
        calldata_len : felt,
        calldata : felt*,
    ):
    if calldata_index == calldata_len:
        return ()
    end

    let (calldata_arg) = _transaction_calldata.read(tx_index=tx_index, calldata_index=calldata_index)
    assert calldata[calldata_index] = calldata_arg

    _get_transaction_calldata(
        tx_index=tx_index,
        calldata_index=calldata_index + 1,
        calldata_len=calldata_len,
        calldata=calldata,
    )
    return ()
end

@view
func get_transaction{
        syscall_ptr : felt*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }(tx_index : felt) -> (
        tx : Transaction,
        tx_calldata_len : felt,
        tx_calldata : felt*,
    ):
    alloc_locals

    let (to) = _transactions.read(tx_index=tx_index, field=Transaction.to)
    let (function_selector) = _transactions.read(tx_index=tx_index, field=Transaction.function_selector)
    let (calldata_len) = _transactions.read(tx_index=tx_index, field=Transaction.calldata_len)
    let (executed) = _transactions.read(tx_index=tx_index, field=Transaction.executed)
    let (num_confirmations) = _transactions.read(tx_index=tx_index, field=Transaction.num_confirmations)
    let (rule_id) = _transactions.read(tx_index=tx_index, field=Transaction.rule_id)

    let tx = Transaction(
        to=to,
        function_selector=function_selector,
        calldata_len=calldata_len,
        executed=executed,
        num_confirmations=num_confirmations,
        rule_id=rule_id,
    )

    let (calldata) = alloc()
    if calldata_len == 0:
        return (tx=tx, tx_calldata_len=calldata_len, tx_calldata=calldata)
    end

    # Recursively get more calldata args and add them to the list
    _get_transaction_calldata(
        tx_index=tx_index,
        calldata_index=0,
        calldata_len=calldata_len,
        calldata=calldata,
    )
    return (tx=tx, tx_calldata_len=calldata_len, tx_calldata=calldata)
end

@view
func get_rules_len{
        syscall_ptr : felt*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }() -> (res : felt):
    let (res) = _next_rule_id.read()
    return (res)
end

@view
func get_rule{
        syscall_ptr : felt*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }(rule_id : felt) -> (
        rule : Rule
    ):
    alloc_locals
    let (owner) = _rules.read(rule_id=rule_id, field=Rule.owner)
    let (to) = _rules.read(rule_id=rule_id, field=Rule.to)
    let (num_confirmations_required) = _rules.read(rule_id=rule_id, field=Rule.num_confirmations_required)
    let (asset) = _rules.read(rule_id=rule_id, field=Rule.asset)
    let (allowed_amount) = _rules.read(rule_id=rule_id, field=Rule.allowed_amount)
    
    let rule = Rule(
        owner=owner,
        to=to,
        num_confirmations_required=num_confirmations_required,
        asset=asset,
        allowed_amount=allowed_amount,
    )

    return (rule=rule)
end

#
# Actions
#

@constructor
func constructor{
        syscall_ptr : felt*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr,
    }(
        owners_len : felt,
        owners : felt*,
        confirmations_required : felt,
    ):
    with_attr error_message("invalid number of required confirmations"):
        assert_le(1, confirmations_required)
        assert_le(confirmations_required, owners_len)
    end

    _owners_len.write(value=owners_len)
    _set_owners(owners_index=0, owners_len=owners_len, owners=owners)
    _create_base_rule(owner=0, to=0, num_confirmations_required=confirmations_required, asset=0, allowed_amount=0)
    return ()
end

@external
func submit_transaction{
        syscall_ptr : felt*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }(
        to : felt,
        function_selector : felt,
        rule_id : felt,
        calldata_len : felt,
        calldata : felt*,
    ):
    alloc_locals
    require_owner()
    require_rule_exists(rule_id)
    require_rule_rights(rule_id)
    require_recipient_allowed(rule_id, to, calldata_len, calldata)

    # Require about asset, amount and transferAmount
    require_transfer(rule_id, function_selector, calldata_len, calldata)
    
    let (tx_index) = _next_tx_index.read()

    # Store the tx descriptor
    _transactions.write(tx_index=tx_index, field=Transaction.to, value=to)
    _transactions.write(tx_index=tx_index, field=Transaction.function_selector, value=function_selector)
    _transactions.write(tx_index=tx_index, field=Transaction.calldata_len, value=calldata_len)
    _transactions.write(tx_index=tx_index, field=Transaction.rule_id, value=rule_id)

    # Recursively store the tx calldata
    _set_transaction_calldata(
        tx_index=tx_index,
        calldata_index=0,
        calldata_len=calldata_len,
        calldata=calldata,
    )

    # Emit event & update tx count
    let (caller) = get_caller_address()
    SubmitTransaction.emit(owner=caller, tx_index=tx_index, to=to)
    _next_tx_index.write(value=tx_index + 1)

    return ()
end

@external
func confirm_transaction{
        syscall_ptr : felt*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }(tx_index : felt):
    require_owner()
    require_tx_exists(tx_index=tx_index)
    require_not_executed(tx_index=tx_index)
    require_not_confirmed(tx_index=tx_index)

    let (num_confirmations) = _transactions.read(
        tx_index=tx_index, field=Transaction.num_confirmations
    )
    _transactions.write(
        tx_index=tx_index,
        field=Transaction.num_confirmations,
        value=num_confirmations + 1,
    )
    let (caller) = get_caller_address()
    _is_confirmed.write(tx_index=tx_index, owner=caller, value=TRUE)

    ConfirmTransaction.emit(owner=caller, tx_index=tx_index)
    return ()
end

@external
func revoke_confirmation{
        syscall_ptr : felt*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }(tx_index : felt):
    require_owner()
    require_tx_exists(tx_index=tx_index)
    require_not_executed(tx_index=tx_index)
    require_confirmed(tx_index=tx_index)

    let (num_confirmations) = _transactions.read(
        tx_index=tx_index, field=Transaction.num_confirmations
    )
    _transactions.write(
        tx_index=tx_index,
        field=Transaction.num_confirmations,
        value=num_confirmations - 1,
    )
    let (caller) = get_caller_address()
    _is_confirmed.write(tx_index=tx_index, owner=caller, value=FALSE)

    RevokeConfirmation.emit(owner=caller, tx_index=tx_index)
    return ()
end

@external
func execute_transaction{
        syscall_ptr : felt*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }(tx_index : felt) -> (
        response_len : felt,
        response : felt*
    ):
    alloc_locals
    require_owner()
    require_tx_exists(tx_index=tx_index)
    require_not_executed(tx_index=tx_index)

    let (tx, tx_calldata_len, tx_calldata) = get_transaction(tx_index=tx_index)
    let (required_confirmations) = _rules.read(rule_id=tx.rule_id, field=Rule.num_confirmations_required)

    # Require minimum configured confirmations
    with_attr error_message("need more confirmations"):
        assert_le(required_confirmations, tx.num_confirmations)
    end

    # Update the remaining amount of the spending limit
    _update_allowed_amount(tx_index=tx_index)

    # Mark as executed
    _transactions.write(
        tx_index=tx_index,
        field=Transaction.executed,
        value=TRUE,
    )
    let (caller) = get_caller_address()
    let (multisig_address) = get_contract_address()
    ExecuteTransaction.emit(owner=caller, tx_index=tx_index)
    
    # Actually execute it
    let response = call_contract(
        contract_address=tx.to,
        function_selector=tx.function_selector,
        calldata_size=tx_calldata_len,
        calldata=tx_calldata,
    )
    return (response_len=response.retdata_size, response=response.retdata)
end

@external 
func create_rule{
        syscall_ptr : felt*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }(
        owner : felt,
        to : felt,
        num_confirmations_required : felt,
        asset : felt,
        allowed_amount : felt
    ):

    # Require the caller is the multisig because the create rule transaction have to be confirmed enough times
    require_multisig_sender()

    require_sender_allowed(owner=owner)

    let (owners_len) = get_owners_len()
    with_attr error_message("invalid number of required confirmations"):
        assert_le(1, num_confirmations_required)
        assert_le(num_confirmations_required, owners_len)
    end

    # We check that amount > 0 if the rule is about any asset
    require_correct_amount(asset=asset, allowed_amount=allowed_amount)

    let (rule_id) = _next_rule_id.read()

    # Store the rule descriptor
    _rules.write(rule_id=rule_id, field=Rule.owner, value=owner)
    _rules.write(rule_id=rule_id, field=Rule.to, value=to)
    _rules.write(rule_id=rule_id, field=Rule.num_confirmations_required, value=num_confirmations_required)
    _rules.write(rule_id=rule_id, field=Rule.asset, value=asset)
    _rules.write(rule_id=rule_id, field=Rule.allowed_amount, value=allowed_amount)

    # Update tx count
    _next_rule_id.write(value=rule_id + 1)

    return ()
end


#
# Storage Helpers
#

func _set_owners{
        syscall_ptr : felt*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr,
    }(
        owners_index : felt,
        owners_len : felt,
        owners : felt*,
    ):
    if owners_index == owners_len:
        return ()
    end

     # Write the current iteration to storage
    _owners.write(index=owners_index, value=[owners])
    _is_owner.write(address=[owners], value=TRUE)

    # Recursively write the rest
    _set_owners(owners_index=owners_index + 1, owners_len=owners_len, owners=owners + 1)
    return ()
end

func _set_transaction_calldata{
        syscall_ptr : felt*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr,
    }(
        tx_index : felt,
        calldata_index : felt,
        calldata_len : felt,
        calldata : felt*,
    ):
    if calldata_index == calldata_len:
        return ()
    end

     # Write the current iteration to storage
    _transaction_calldata.write(
        tx_index=tx_index,
        calldata_index=calldata_index,
        value=[calldata],
    )

    # Recursively write the rest
    _set_transaction_calldata(
        tx_index=tx_index,
        calldata_index=calldata_index + 1,
        calldata_len=calldata_len,
        calldata=calldata + 1,
    )
    return ()
end

func _create_base_rule{
        syscall_ptr : felt*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }(
        owner : felt,
        to : felt,
        num_confirmations_required : felt,
        asset : felt,
        allowed_amount : felt
    ):

    let (rule_id) = _next_rule_id.read()

    # Store the rule descriptor
    _rules.write(rule_id=rule_id, field=Rule.owner, value=owner)
    _rules.write(rule_id=rule_id, field=Rule.to, value=to)
    _rules.write(rule_id=rule_id, field=Rule.num_confirmations_required, value=num_confirmations_required)
    _rules.write(rule_id=rule_id, field=Rule.asset, value=asset)
    _rules.write(rule_id=rule_id, field=Rule.allowed_amount, value=allowed_amount)

    # Update rule count
    _next_rule_id.write(value=rule_id + 1)

    return ()
end

func _update_allowed_amount{
        syscall_ptr : felt*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr,
    }(
        tx_index : felt,
    ):
    let (tx, tx_calldata_len, tx_calldata) = get_transaction(tx_index=tx_index)
    if tx.function_selector == TRANSFER_SELECTOR:
        # Rajouter ici le fait de ne pas soustraire si c'est une règle sans allowed amount 
        let (allowed_amount) = _rules.read(rule_id=tx.rule_id, field=Rule.allowed_amount)
        let (sent_amount) = _transaction_calldata.read(tx_index=tx_index, calldata_index=1)
        # require allowed amount pas zero
        assert_not_zero(allowed_amount)
        assert_lt(sent_amount, allowed_amount)
        # require sent amount <= allowed amount  
        # Besoin d'ecrire plusieurs tests pour tester ce scenario
        _rules.write(rule_id=tx.rule_id, field=Rule.allowed_amount, value=allowed_amount - sent_amount)
        return ()
    end
    return ()
end

