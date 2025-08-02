import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  
  return NextResponse.json({
    status: 'OAuth Configuration Test',
    environment: {
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? 'Set ✓' : 'Missing ✗',
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? 'Set ✓' : 'Missing ✗',
    },
    expectedRedirectUri: `${baseUrl}/api/auth/callback/google`,
    expectedOrigin: baseUrl,
    googleAuthUrl: `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(`${baseUrl}/api/auth/callback/google`)}&response_type=code&scope=openid%20email%20profile`,
    instructions: [
      '1. Go to Google Cloud Console: https://console.cloud.google.com/apis/credentials',
      '2. Find your OAuth 2.0 Client ID',
      '3. Add this redirect URI: ' + `${baseUrl}/api/auth/callback/google`,
      '4. Add this JavaScript origin: ' + baseUrl,
      '5. Ensure OAuth consent screen is configured',
      '6. Add your email to Test users if app is in Testing mode'
    ]
  }, { status: 200 })
}
