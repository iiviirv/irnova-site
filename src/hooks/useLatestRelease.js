import { useEffect, useState } from 'react'

// Always-current "latest release" info for the Nova Proxy Worker.
// The Worker is distributed as a .js asset on GitHub Releases, so we look up the
// newest release at runtime (from the visitor's browser) and surface a direct
// link to its .js asset. Falls back to the Releases page if the API is rate-
// limited or unreachable (e.g. inside Iran without a proxy).
export const RELEASES_PAGE = 'https://github.com/IRNova/Nova-Proxy/releases'
const RELEASES_API = 'https://api.github.com/repos/IRNova/Nova-Proxy/releases/latest'

export function useLatestRelease() {
  const [state, setState] = useState({
    loading: true,
    version: null,
    jsUrl: null,
    pageUrl: RELEASES_PAGE,
  })

  useEffect(() => {
    let cancelled = false
    fetch(RELEASES_API, { headers: { Accept: 'application/vnd.github+json' } })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data) => {
        if (cancelled) return
        setState({
          loading: false,
          version: data.tag_name || null,
          jsUrl: null,
          pageUrl: RELEASES_PAGE,
        })
      })
      .catch(() => {
        if (!cancelled) {
          setState({ loading: false, version: null, jsUrl: null, pageUrl: RELEASES_PAGE })
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  return state
}
