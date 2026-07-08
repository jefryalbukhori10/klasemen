import { useState } from 'react'

export default function MatchSanction({ homeTeam, awayTeam, sanction, canEdit, onSave }) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState({
    homePoints: sanction?.homePoints ?? 0,
    awayPoints: sanction?.awayPoints ?? 0,
    reason: sanction?.reason ?? '',
  })

  const save = () => {
    onSave('sanction', {
      active: true,
      homePoints: Math.max(0, parseInt(draft.homePoints, 10) || 0),
      awayPoints: Math.max(0, parseInt(draft.awayPoints, 10) || 0),
      reason: draft.reason.trim(),
    })
    setOpen(false)
  }

  const clear = () => {
    onSave('sanction', null)
    setDraft({ homePoints: 0, awayPoints: 0, reason: '' })
    setOpen(false)
  }

  return (
    <div className="mt-2">
      {sanction?.active && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          ⚠️ Poin disesuaikan panpel: <strong>{homeTeam.name}</strong> {sanction.homePoints} poin,{' '}
          <strong>{awayTeam.name}</strong> {sanction.awayPoints} poin
          {sanction.reason && <> — {sanction.reason}</>}
        </p>
      )}

      {canEdit && (
        <div className="mt-1">
          <button
            onClick={() => setOpen((o) => !o)}
            className="text-xs font-semibold text-pitch/50 underline hover:text-pitch"
          >
            {open ? 'Tutup' : sanction?.active ? 'Ubah sanksi/koreksi poin' : 'Sanksi/koreksi poin (panpel)'}
          </button>

          {open && (
            <div className="mt-2 space-y-2 rounded-lg border border-pitch/10 bg-white p-3">
              <p className="text-xs text-pitch/50">
                Gol tetap sah untuk statistik gol. Ini hanya mengoreksi poin klasemen yang didapat
                masing-masing tim untuk laga ini (menggantikan poin otomatis dari skor).
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <label className="flex items-center gap-1.5 text-xs text-pitch">
                  {homeTeam.name}:
                  <input
                    type="number"
                    min="0"
                    value={draft.homePoints}
                    onChange={(e) => setDraft((d) => ({ ...d, homePoints: e.target.value }))}
                    className="w-14 rounded border border-pitch/20 px-1.5 py-1 text-xs"
                  />
                  poin
                </label>
                <label className="flex items-center gap-1.5 text-xs text-pitch">
                  {awayTeam.name}:
                  <input
                    type="number"
                    min="0"
                    value={draft.awayPoints}
                    onChange={(e) => setDraft((d) => ({ ...d, awayPoints: e.target.value }))}
                    className="w-14 rounded border border-pitch/20 px-1.5 py-1 text-xs"
                  />
                  poin
                </label>
              </div>
              <input
                value={draft.reason}
                onChange={(e) => setDraft((d) => ({ ...d, reason: e.target.value }))}
                placeholder="Alasan (mis. pemain tidak terdaftar dari desanya)"
                className="w-full rounded border border-pitch/20 px-2 py-1.5 text-xs"
              />
              <div className="flex gap-2">
                <button
                  onClick={save}
                  className="rounded bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
                >
                  Terapkan Sanksi
                </button>
                {sanction?.active && (
                  <button
                    onClick={clear}
                    className="rounded bg-pitch/10 px-3 py-1.5 text-xs font-semibold text-pitch hover:bg-pitch/20"
                  >
                    Batalkan Sanksi
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
