import { useState } from 'react'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase'
import LoginForm from './LoginForm'

export default function AuthBar({ user }) {
  const [showLogin, setShowLogin] = useState(false)

  if (user) {
    return (
      <div className="mx-auto flex max-w-5xl items-center justify-end gap-3 px-4 py-2 text-xs text-pitch/60 sm:px-6">
        <span>
          Masuk sebagai <strong className="text-pitch">{user.email}</strong>
        </span>
        <button
          onClick={() => signOut(auth)}
          className="rounded bg-pitch/10 px-2 py-1 font-semibold text-pitch hover:bg-pitch/20"
        >
          Keluar
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-2 text-right sm:px-6">
      <button
        onClick={() => setShowLogin(true)}
        className="text-xs font-semibold text-pitch/50 underline hover:text-pitch"
      >
        Masuk sebagai admin
      </button>
      {showLogin && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setShowLogin(false)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <LoginForm onClose={() => setShowLogin(false)} />
          </div>
        </div>
      )}
    </div>
  )
}
