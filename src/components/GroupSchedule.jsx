import ScoreInput from './ScoreInput'
import { updateMatchScores } from '../services/firestoreApi'

const GROUP_LABELS = { A: 'Grup A', B: 'Grup B', C: 'Grup C' }

function teamName(teams, id) {
  return teams.find((t) => t.id === id)?.name ?? '???'
}

function formatDate(dateStr) {
  if (!dateStr) return null
  try {
    const d = new Date(dateStr)
    if (Number.isNaN(d.getTime())) return dateStr
    return d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })
  } catch {
    return dateStr
  }
}

export default function GroupSchedule({ groups, matches, canEdit }) {
  const groupKeys = Object.keys(groups).sort()

  const updateScore = async (match, field, value) => {
    if (!canEdit) return
    const homeScore = field === 'homeScore' ? value : match.homeScore
    const awayScore = field === 'awayScore' ? value : match.awayScore
    try {
      await updateMatchScores(match._docId, homeScore, awayScore)
    } catch (e) {
      console.error('Gagal menyimpan skor', e)
      alert('Gagal menyimpan skor ke server. Cek koneksi internet lalu coba lagi.')
    }
  }

  return (
    <div className="space-y-6">
      {!canEdit && (
        <p className="rounded-xl border border-pitch/10 bg-white px-4 py-2 text-xs text-pitch/50">
          Mode lihat saja. Masuk sebagai admin untuk mengisi skor.
        </p>
      )}
      {groupKeys.map((g) => {
        const groupMatches = matches
          .filter((m) => m.group === g)
          .sort((a, b) => (a.matchNumber ?? 0) - (b.matchNumber ?? 0))
        const teams = groups[g].teams ?? []
        return (
          <div key={g} className="min-w-0 rounded-2xl border border-pitch/10 bg-white p-4">
            <h3 className="font-display text-lg font-bold text-pitch">
              {GROUP_LABELS[g] ?? `Grup ${g}`} &middot; Jadwal &amp; Skor
            </h3>
            {groupMatches.length === 0 ? (
              <p className="mt-2 text-sm text-pitch/50">
                Jadwal akan muncul otomatis setelah grup ini terisi 3 tim (lihat tab Kelola Tim).
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {groupMatches.map((m, idx) => (
                  <li
                    key={m._docId}
                    className="flex flex-col gap-2 rounded-xl bg-chalk px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <span className="text-xs font-semibold uppercase tracking-wide text-pitch/40">
                      Laga {m.matchNumber ?? idx + 1}
                      {m.date && (
                        <span className="ml-2 normal-case tracking-normal text-pitch/50">
                          &middot; {formatDate(m.date)}
                        </span>
                      )}
                    </span>
                    <div className="flex flex-1 items-center justify-center gap-3">
                      <span className="flex-1 text-right text-sm font-medium text-pitch">
                        {teamName(teams, m.home)}
                      </span>
                      <ScoreInput
                        value={m.homeScore}
                        onChange={(v) => updateScore(m, 'homeScore', v)}
                        disabled={!canEdit}
                      />
                      <span className="font-display font-bold text-pitch/30">vs</span>
                      <ScoreInput
                        value={m.awayScore}
                        onChange={(v) => updateScore(m, 'awayScore', v)}
                        disabled={!canEdit}
                      />
                      <span className="flex-1 text-left text-sm font-medium text-pitch">
                        {teamName(teams, m.away)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )
      })}
    </div>
  )
}
