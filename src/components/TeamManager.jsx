import { useState } from 'react'
import { uid } from '../utils/tournamentLogic'
import { saveGroupTeams, reconcileGroupFixtures, saveSettings } from '../services/firestoreApi'

const GROUP_LABELS = { A: 'Grup A', B: 'Grup B', C: 'Grup C' }
const CRITERIA_LABELS = {
  points: 'Poin',
  goalDifference: 'Selisih Gol',
  goalsFor: 'Gol Memasukkan',
  headToHead: 'Head-to-head',
}

export default function TeamManager({ groups, matches, settings, knockoutStarted, canEdit }) {
  const [newNames, setNewNames] = useState({ A: '', B: '', C: '' })
  const [editing, setEditing] = useState({}) // { [teamId]: draftName }
  const [busy, setBusy] = useState(false)

  const groupKeys = Object.keys(groups).sort()

  const withBusy = async (fn) => {
    if (!canEdit) return
    setBusy(true)
    try {
      await fn()
    } catch (e) {
      console.error(e)
      alert('Gagal menyimpan ke server. Cek koneksi internet lalu coba lagi.')
    } finally {
      setBusy(false)
    }
  }

  const addTeam = (group) =>
    withBusy(async () => {
      const name = newNames[group].trim()
      if (!name) return
      const currentTeams = groups[group].teams ?? []
      if (currentTeams.length >= 3) return
      const newTeams = [...currentTeams, { id: uid('team'), name }]
      await saveGroupTeams(group, newTeams)
      await reconcileGroupFixtures(group, newTeams, matches)
      setNewNames((prev) => ({ ...prev, [group]: '' }))
    })

  const removeTeam = (group, teamId) =>
    withBusy(async () => {
      const currentTeams = groups[group].teams ?? []
      const newTeams = currentTeams.filter((t) => t.id !== teamId)
      await saveGroupTeams(group, newTeams)
      await reconcileGroupFixtures(group, newTeams, matches)
    })

  const startEdit = (teamId, currentName) => {
    setEditing((prev) => ({ ...prev, [teamId]: currentName }))
  }

  const saveEdit = (group, teamId) =>
    withBusy(async () => {
      const draft = (editing[teamId] ?? '').trim()
      if (!draft) return
      const currentTeams = groups[group].teams ?? []
      const newTeams = currentTeams.map((t) => (t.id === teamId ? { ...t, name: draft } : t))
      await saveGroupTeams(group, newTeams)
      setEditing((prev) => {
        const next = { ...prev }
        delete next[teamId]
        return next
      })
    })

  // ---- Settings: reorder tiebreak criteria (points always locked at #1) ----
  const criteria = settings.sortRule ?? ['points', 'goalDifference', 'goalsFor', 'headToHead']
  const movable = criteria.filter((c) => c !== 'points')

  const moveCriterion = (index, direction) =>
    withBusy(async () => {
      const next = [...movable]
      const target = index + direction
      if (target < 0 || target >= next.length) return
      ;[next[index], next[target]] = [next[target], next[index]]
      await saveSettings({ sortRule: ['points', ...next] })
    })

  const durationMinutes = settings.matchDurationMinutes ?? 90
  const updateDuration = (value) =>
    withBusy(async () => {
      const n = Math.max(1, parseInt(value, 10) || 90)
      await saveSettings({ matchDurationMinutes: n })
    })

  return (
    <div className="space-y-8">
      {!canEdit && (
        <p className="rounded-xl border border-pitch/10 bg-white px-4 py-2 text-xs text-pitch/50">
          Mode lihat saja. Masuk sebagai admin untuk mengelola tim dan mengubah aturan klasemen.
        </p>
      )}
      <div className="rounded-2xl border border-pitch/10 bg-white p-5">
        <h3 className="font-display text-lg font-bold text-pitch">Aturan Peringkat Klasemen</h3>
        <p className="mt-1 text-sm text-pitch/60">
          Poin selalu jadi kriteria utama. Atur urutan kriteria berikutnya dengan tombol naik/turun.
        </p>
        <ol className="mt-3 space-y-2">
          <li className="flex items-center justify-between rounded-xl border border-gold bg-gold/10 px-3 py-2 text-sm font-semibold text-pitch">
            <span>1. Poin</span>
            <span className="text-xs font-normal text-pitch/40">selalu pertama</span>
          </li>
          {movable.map((c, idx) => (
            <li
              key={c}
              className="flex items-center justify-between rounded-xl bg-chalk px-3 py-2 text-sm"
            >
              <span className="font-medium text-pitch">
                {idx + 2}. {CRITERIA_LABELS[c] ?? c}
              </span>
              <span className="flex gap-1">
                <button
                  disabled={busy || !canEdit || idx === 0}
                  onClick={() => moveCriterion(idx, -1)}
                  className="rounded bg-white px-2 py-1 text-xs font-bold text-pitch shadow-sm disabled:opacity-30"
                >
                  ↑
                </button>
                <button
                  disabled={busy || !canEdit || idx === movable.length - 1}
                  onClick={() => moveCriterion(idx, 1)}
                  className="rounded bg-white px-2 py-1 text-xs font-bold text-pitch shadow-sm disabled:opacity-30"
                >
                  ↓
                </button>
              </span>
            </li>
          ))}
        </ol>
      </div>

      <div className="rounded-2xl border border-pitch/10 bg-white p-5">
        <h3 className="font-display text-lg font-bold text-pitch">Durasi Pertandingan (Live Score)</h3>
        <p className="mt-1 text-sm text-pitch/60">
          Dipakai untuk menentukan kapan status pertandingan otomatis berubah dari "Live" ke selesai di tab
          Live, dihitung sejak jam kick-off yang diisi di jadwal.
        </p>
        <div className="mt-3 flex items-center gap-2">
          <input
            type="number"
            min="1"
            disabled={!canEdit || busy}
            value={durationMinutes}
            onChange={(e) => updateDuration(e.target.value)}
            className="w-24 rounded-lg border border-pitch/20 px-3 py-1.5 text-sm focus:border-gold focus:outline-none disabled:bg-chalk"
          />
          <span className="text-sm text-pitch/60">menit</span>
        </div>
      </div>

      {knockoutStarted && (
        <div className="rounded-xl border border-gold bg-gold/10 p-4 text-sm text-pitch">
          Babak semifinal sudah terbentuk. Menambah/menghapus tim di grup tidak akan mengubah semifinal
          yang sudah berjalan — hanya memengaruhi jadwal &amp; klasemen grup.
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-3">
        {groupKeys.map((g) => {
          const teams = groups[g].teams ?? []
          return (
            <div key={g} className="min-w-0 rounded-2xl border border-pitch/10 bg-white p-4">
              <h3 className="font-display text-lg font-bold text-pitch">{GROUP_LABELS[g] ?? `Grup ${g}`}</h3>
              <ul className="mt-3 space-y-2">
                {teams.map((t) => (
                  <li key={t.id} className="flex items-center gap-2 rounded-lg bg-chalk px-3 py-2">
                    {canEdit && editing[t.id] !== undefined ? (
                      <>
                        <input
                          autoFocus
                          value={editing[t.id]}
                          onChange={(e) =>
                            setEditing((prev) => ({ ...prev, [t.id]: e.target.value }))
                          }
                          onKeyDown={(e) => e.key === 'Enter' && saveEdit(g, t.id)}
                          className="min-w-0 flex-1 rounded border border-pitch/20 px-2 py-1 text-sm"
                        />
                        <button
                          disabled={busy}
                          onClick={() => saveEdit(g, t.id)}
                          className="rounded bg-pitch px-2 py-1 text-xs font-semibold text-chalk disabled:opacity-50"
                        >
                          Simpan
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="min-w-0 flex-1 truncate text-sm font-medium text-pitch">
                          {t.name}
                        </span>
                        {canEdit && (
                          <>
                            <button
                              onClick={() => startEdit(t.id, t.name)}
                              className="rounded px-2 py-1 text-xs font-semibold text-pitch/60 hover:text-pitch"
                            >
                              Edit
                            </button>
                            <button
                              disabled={busy}
                              onClick={() => removeTeam(g, t.id)}
                              className="rounded px-2 py-1 text-xs font-semibold text-red-500/70 hover:text-red-600 disabled:opacity-50"
                            >
                              Hapus
                            </button>
                          </>
                        )}
                      </>
                    )}
                  </li>
                ))}
              </ul>

              {canEdit && teams.length < 3 && (
                <div className="mt-3 flex gap-2">
                  <input
                    value={newNames[g]}
                    onChange={(e) => setNewNames((prev) => ({ ...prev, [g]: e.target.value }))}
                    onKeyDown={(e) => e.key === 'Enter' && addTeam(g)}
                    placeholder="Nama tim baru"
                    className="min-w-0 flex-1 rounded-lg border border-pitch/20 px-3 py-1.5 text-sm focus:border-gold focus:outline-none"
                  />
                  <button
                    disabled={busy}
                    onClick={() => addTeam(g)}
                    className="rounded-lg bg-pitch px-3 py-1.5 text-sm font-semibold text-chalk hover:bg-pitch-light disabled:opacity-50"
                  >
                    Tambah
                  </button>
                </div>
              )}
              {teams.length >= 3 && (
                <p className="mt-3 text-xs text-pitch/40">Grup sudah terisi 3 tim.</p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
