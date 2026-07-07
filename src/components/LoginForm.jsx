import { useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase'

export default function LoginForm({ onClose }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password)
      onClose?.()
    } catch (err) {
      console.error(err)
      setError('Email atau password salah.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto w-full max-w-sm space-y-3 rounded-2xl border border-pitch/10 bg-white p-5"
    >
      <h3 className="font-display text-lg font-bold text-pitch">Masuk sebagai Admin</h3>
      <p className="text-xs text-pitch/50">
        Hanya admin yang login yang bisa mengubah skor dan mengelola tim.
      </p>
      <input
        type="email"
        required
        autoFocus
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full rounded-lg border border-pitch/20 px-3 py-2 text-sm focus:border-gold focus:outline-none"
      />
      <input
        type="password"
        required
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full rounded-lg border border-pitch/20 px-3 py-2 text-sm focus:border-gold focus:outline-none"
      />
      {error && <p className="text-xs font-medium text-red-500">{error}</p>}
      <button
        disabled={busy}
        type="submit"
        className="w-full rounded-lg bg-pitch px-3 py-2 text-sm font-semibold text-chalk hover:bg-pitch-light disabled:opacity-50"
      >
        {busy ? 'Memproses…' : 'Masuk'}
      </button>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="w-full text-xs font-semibold text-pitch/40 hover:text-pitch/70"
        >
          Batal
        </button>
      )}
    </form>
  )
}
