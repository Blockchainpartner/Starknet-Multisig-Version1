import React from 'react'

export function PleaseConnect( props ) {
  return (
    <div className="flex h-screen justify-center items-center">
        <div className="text-4xl font-bold mx-2 text-zinc-700 mb-40">
            Please connect your {props.component}
        </div>
        <img src="/padlock.png" alt="Padlock - Illustration" className="w-1/6 h-1/6 mb-40"/>
    </div>
  )
}
