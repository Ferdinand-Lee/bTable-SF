import { NextResponse, NextRequest } from 'next/server'
import { OAuth2 } from 'jsforce';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const env = searchParams.get('env')
  const oauth2 = new OAuth2({
    loginUrl: `https://${env}`,
    clientId: process.env.SF_OAUTH2_CLIENT_ID,
    clientSecret: process.env.SF_OAUTH2_CLIENT_SECRET,
    redirectUri: process.env.SF_OAUTH2_CALLBACK
  })
  return NextResponse.redirect(new URL(oauth2.getAuthorizationUrl({ state: JSON.stringify({ env }) }), request.url))
}
