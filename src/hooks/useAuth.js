import { useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebase'

// user === undefined -> still checking auth state (initial load)
// user === null      -> not logged in
// user === object    -> logged in
export function useAuth() {
  const [user, setUser] = useState(undefined)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u))
    return unsub
  }, [])

  return { user, loading: user === undefined, isAdmin: Boolean(user) }
}
