import React from 'react'
import Image from 'next/image'
import padlock from '../../public/padlock.png'

export function PleaseConnect(props) {
  return (
    <div className="flex h-screen justify-center items-center">
      <div className="text-4xl font-bold mx-2 text-zinc-700 mb-40">
        Please connect your {props.component}
      </div>
      <div className='mb-40'>
        <Image
          src={padlock}
          alt="Padlock"
          width={200}
          height={200}
        />
      </div>
    </div>
  )
}
