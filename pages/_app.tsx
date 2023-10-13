import 'reset-css'
import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { CookiesProvider } from 'react-cookie';
import UserProvider from '../src/contexts/user';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <CookiesProvider>
      <UserProvider>
        <Component {...pageProps} />
      </UserProvider>
    </CookiesProvider>
  )
}

export default MyApp
