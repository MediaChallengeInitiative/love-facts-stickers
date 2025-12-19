import { google } from 'googleapis'

/**
 * Google OAuth2 Configuration for Drive API Access
 */

export const GOOGLE_OAUTH_SCOPES = [
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/drive.metadata.readonly',
]

export function createOAuth2Client() {
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXTAUTH_URL}/api/auth/google/callback`
  )
  
  return client
}

export function getAuthUrl(state?: string): string {
  const client = createOAuth2Client()
  return client.generateAuthUrl({
    access_type: 'offline',
    scope: GOOGLE_OAUTH_SCOPES,
    prompt: 'consent',
    state,
  })
}

export async function getTokensFromCode(code: string) {
  const client = createOAuth2Client()
  const { tokens } = await client.getToken(code)
  return tokens
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function setCredentials(client: any, tokens: Record<string, unknown>) {
  client.setCredentials(tokens)
  return client
}