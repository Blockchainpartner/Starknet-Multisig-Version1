import { useStarknet, useStarknetInvoke } from '@starknet-react/core'
import React from 'react'
import { useState } from 'react';

import { useMultisigContract } from '~/hooks/multisig'

export function CreateRule() {
    const { account } = useStarknet()
    const { contract: multisig } = useMultisigContract("0x030b315a8ace5643032716fa368f022d25ef7fc6b32b8d56c9e29f4fb55327a3")
    const { invoke } = useStarknetInvoke({ contract: multisig, method: 'create_rule' })
    const [recipient, setRecipient] = useState("");


    if (!account) {
        return null
    }

    return (
        <div>
            <input
                inputMode="text"
                onChange={e => setRecipient(e.target.value)}
                title="recipient address"
                type="text"
                placeholder={'Destination Address'}
                minLength={1}
                maxLength={60}
            />
            <button
                onClick={() =>
                    invoke({
                        args: [account,],
                        metadata: { method: 'create_rule', message: 'create a new rule for multisig' },
                    })
                }
            >
                create Rule
            </button>
        </div>
    )
}
