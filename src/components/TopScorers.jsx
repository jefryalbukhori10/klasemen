import { findTeamName } from '../utils/tournamentLogic'

function collectGoals(matches, knockout) {
  const list = []
  matches.forEach((m) => (m.goals ?? []).forEach((g) => list.push(g)))
  ;['SF1', 'SF2', 'FINAL', 'THIRD'].forEach((k) => {
    const m = knockout[k]
    if (m) (m.goals ?? []).forEach((g) => list.push(g))
  })
  return list
}

export default function TopScorers({ groups, matches, knockout }) {
  const goals = collectGoals(matches, knockout)

  const tally = {}
  goals.forEach((g) => {
    const key = `${g.teamId}|${g.playerName.trim().toLowerCase()}`
    if (!tally[key]) {
      tally[key] = { playerName: g.playerName.trim(), teamId: g.teamId, count: 0 }
    }
    tally[key].count += 1
  })

  const ranking = Object.values(tally).sort(
    (a, b) => b.count - a.count || a.playerName.localeCompare(b.playerName),
  )

  if (ranking.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-pitch/20 bg-white/60 p-8 text-center text-pitch/50">
        <p className="font-display text-lg font-bold text-pitch/70">Belum Ada Data Pencetak Gol</p>
        <p className="mt-2 text-sm">
          Data akan muncul otomatis setelah admin mencatat pencetak gol lewat &quot;Catat pencetak gol /
          kartu&quot; di tab Jadwal Grup atau Semifinal &amp; Final.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-pitch/10 bg-white p-4">
      <h3 className="font-display text-lg font-bold text-pitch">Top Skor</h3>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[360px] text-sm">
          <thead>
            <tr className="border-b border-pitch/10 text-left text-pitch/50">
              <th className="py-2 pr-2 font-medium">#</th>
              <th className="py-2 pr-2 font-medium">Pemain</th>
              <th className="py-2 pr-2 font-medium">Tim</th>
              <th className="py-2 pl-2 text-center font-bold">Gol</th>
            </tr>
          </thead>
          <tbody>
            {ranking.map((r, idx) => (
              <tr
                key={`${r.teamId}-${r.playerName}`}
                className={`border-b border-pitch/5 last:border-0 ${
                  idx < 3 ? 'bg-gold/10 font-semibold' : ''
                }`}
              >
                <td className="py-2 pr-2 text-pitch/60">{idx + 1}</td>
                <td className="py-2 pr-2 text-pitch">{r.playerName}</td>
                <td className="py-2 pr-2 text-pitch/70">{findTeamName(groups, r.teamId)}</td>
                <td className="py-2 pl-2 text-center font-display text-base font-bold text-pitch">
                  {r.count}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
