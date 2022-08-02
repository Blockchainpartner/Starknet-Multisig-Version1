import '../styles/globals.css'

import type { AppProps } from 'next/app'
import NextHead from 'next/head'
import Layout from '~/components/Layout'

import { InjectedConnector, StarknetProvider } from '@starknet-react/core'

function MyApp({ Component, pageProps }: AppProps) {
  const connectors = [new InjectedConnector({ showModal: true })]

  return (
    <StarknetProvider connectors={connectors}>
      <NextHead>
        <title>StarkNet multisig</title>
      </NextHead>

      <Layout>
        <Component {...pageProps } />
      </Layout>
        

    </StarknetProvider >
  )
}

export default MyApp
