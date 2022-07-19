import type { AppProps } from 'next/app'
import NextHead from 'next/head'
import Link from 'next/link'

import { InjectedConnector, StarknetProvider } from '@starknet-react/core'

function MyApp({ Component, pageProps }: AppProps) {
  const connectors = [new InjectedConnector({ showModal: true })]

  return (
    <StarknetProvider connectors={connectors}>
      <NextHead>
        <title>StarkNet MULTISIG</title>
      </NextHead>
      <div >
        <Link href="/" >
          <img
            src="/logoo.png"
            alt="Vaulti - Home"

          />
        </Link>
        <p >WELCOME TO YOUR MULTISIG APP</p>

        <div >
          <ul >
            <Link href="/newMultisig">
              <li>
                <a >
                  Create a new multisig
                </a>
              </li>
            </Link>

            <Link href="/existing multisig">
              <li>
                <a >
                  Add an exsiting multisig
                </a>
              </li>
            </Link>

          </ul>
        </div>
      </div>














      <Component {...pageProps} />
    </StarknetProvider >
  )
}

export default MyApp
