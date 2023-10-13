import { useSearchParams } from "next/navigation"
import { useEffect } from "react"

export default function OAuthSuccess() {

  const params = useSearchParams()

  useEffect(() => {
    if (params) {
      const payload = Object.fromEntries(params.entries())
      if (payload.username) {
        window.opener?.postMessage({ type: 'oauth2', payload }, '*')
      }
    }
  }, [params])

  return (
    <>
      <h1>success</h1>
    </>
  )
}
