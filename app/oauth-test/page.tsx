'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function OAuthTestPage() {
  const [authUrl, setAuthUrl] = useState('')

  const generateAuthUrl = () => {
    const clientId = '605205887113-oem5j58iueah3rbsp207acdjclu407h8.apps.googleusercontent.com'
    const redirectUri = 'http://localhost:3000/api/auth/callback/google'
    const scope = 'openid email profile'
    const responseType = 'code'
    const state = 'test-' + Math.random().toString(36).substring(7)
    
    const url = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${encodeURIComponent(clientId)}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=${responseType}&` +
      `scope=${encodeURIComponent(scope)}&` +
      `state=${state}`
    
    setAuthUrl(url)
    return url
  }

  const testDirectAuth = () => {
    const url = generateAuthUrl()
    window.open(url, '_blank')
  }

  return (
    <div className="container mx-auto p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Google OAuth Configuration Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Current Configuration:</h3>
            <ul className="text-sm space-y-1">
              <li><strong>Client ID:</strong> 605205887113-oem5j58iueah3rbsp207acdjclu407h8.apps.googleusercontent.com</li>
              <li><strong>Redirect URI:</strong> http://localhost:3000/api/auth/callback/google</li>
              <li><strong>Origin:</strong> http://localhost:3000</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">Steps to Fix "Access Blocked":</h3>
            <ol className="text-sm space-y-1 list-decimal list-inside">
              <li>Go to: <a href="https://console.cloud.google.com/apis/credentials" target="_blank" className="text-blue-600 underline">Google Cloud Console</a></li>
              <li>Find your OAuth 2.0 Client ID</li>
              <li>Add redirect URI: <code className="bg-gray-100 px-1">http://localhost:3000/api/auth/callback/google</code></li>
              <li>Add JavaScript origin: <code className="bg-gray-100 px-1">http://localhost:3000</code></li>
              <li>Check OAuth consent screen - add your email to test users if needed</li>
              <li>Save and wait 5-10 minutes</li>
            </ol>
          </div>

          <div>
            <Button onClick={generateAuthUrl} className="mr-2">
              Generate Auth URL
            </Button>
            <Button onClick={testDirectAuth} variant="outline">
              Test Direct Auth
            </Button>
          </div>

          {authUrl && (
            <div>
              <h4 className="font-semibold mb-2">Generated Auth URL:</h4>
              <textarea 
                value={authUrl} 
                readOnly 
                className="w-full h-32 p-2 border rounded text-xs"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
