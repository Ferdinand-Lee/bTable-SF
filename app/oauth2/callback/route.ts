import { NextResponse, type NextRequest } from 'next/server'
import { Connection, IdentityInfo, UserInfo } from 'jsforce'
import { promisify } from 'util'
import qs from 'querystring';


export async function GET(request: NextRequest) {

  const searchParams = request.nextUrl.searchParams

  const code = searchParams.get('code')!

  let state: Record<string, any> = {}
  if (searchParams.get('state')) {
    try {
      state = JSON.parse(searchParams.get('state')!)
    } catch (error) {
    }
  }


  const conn = new Connection({
    oauth2: {
      loginUrl: `https://${state.env}`,
      clientId: process.env.SF_OAUTH2_CLIENT_ID,
      clientSecret: process.env.SF_OAUTH2_CLIENT_SECRET,
      redirectUri: process.env.SF_OAUTH2_CALLBACK
    }
  })

  const authorize = promisify(conn.authorize.bind(conn))

  await authorize(code)

  const { email, username, urls }: IdentityInfo = await conn.identity()

  const params = {
    username, email, serverUrl: urls.custom_domain, accessToken: conn.accessToken
  }

  const res = NextResponse.redirect(`${process.env.SF_OAUTH2_SUCCESS}?${qs.stringify(params)}`)

  return res
}