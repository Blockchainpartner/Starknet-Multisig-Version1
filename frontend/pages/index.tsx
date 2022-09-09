import type { NextPage } from 'next'
import Image from 'next/image'
import astronautImg from '../public/astronaut-riding-on-rocket.png'

const Home: NextPage = () => {

  return (
    <div className='flex justify-center pt-3'>
      <div className='flex-col'>
      <h1 className='text-center text-lg'>Turbo boosted Starknet Multisig by Blockchain Partner</h1>
      <Image
        src={astronautImg}
        alt="Astronaut to the moon"
        width={500}
        height={500}
      />
    </div>
    </div>
  )
}

export default Home
