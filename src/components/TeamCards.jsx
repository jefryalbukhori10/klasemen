function collectCards(matches, knockout) {
  const list = []
  matches.forEach((m) => (m.cards ?? []).forEach((c) => list.push(c)))
  ;['SF1', 'SF2', 'FINAL', 'THIRD'].forEach((k) => {
    const m = knockout[k]
    if (m) (m.cards ?? []).forEach((c) => list.push(c))
  })
  return list
}

function collectAllTeams(groups) {
  const list = []
  Object.keys(groups)
    .sort()
    .forEach((g) => {
      ;(groups[g].teams ?? []).forEach((t) => list.push({ id: t.id, name: t.name, group: g }))
    })
  return list
}

export default function TeamCards({ groups, matches, knockout }) {
  const cards = collectCards(matches, knockout)

  const tally = {}
  cards.forEach((c) => {
    if (!tally[c.teamId]) tally[c.teamId] = { teamId: c.teamId, yellow: 0, red: 0 }
    if (c.type === 'red') tally[c.teamId].red += 1
    else tally[c.teamId].yellow += 1
  })

  const allTeams = collectAllTeams(groups)

  const ranking = allTeams
    .map((t) => {
      const t2 = tally[t.id] ?? { yellow: 0, red: 0 }
      return { teamId: t.id, name: t.name, group: t.group, yellow: t2.yellow, red: t2.red, total: t2.yellow + t2.red }
    })
    .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name))

  if (ranking.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-pitch/20 bg-white/60 p-8 text-center text-pitch/50">
        <p className="font-display text-lg font-bold text-pitch/70">Belum Ada Tim</p>
        <p className="mt-2 text-sm">
          Tambahkan tim di tab Kelola Tim, lalu rekap kartu akan muncul di sini otomatis.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-pitch/10 bg-white p-4">
      <h3 className="font-display text-lg font-bold text-pitch">Rekap Kartu per Tim</h3>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[360px] text-sm">
          <thead>
            <tr className="border-b border-pitch/10 text-left text-pitch/50">
              <th className="py-2 pr-2 font-medium">#</th>
              <th className="py-2 pr-2 font-medium">Tim</th>
              <th className="px-2 py-2 text-center font-medium">
                <span className="inline-block h-3 w-2.5 rounded-sm bg-yellow-400 align-middle" />{' '}
                Kuning
              </th>
              <th className="px-2 py-2 text-center font-medium">
                <span className="inline-block h-3 w-2.5 rounded-sm bg-red-500 align-middle" /> Merah
              </th>
              <th className="py-2 pl-2 text-center font-bold">Total</th>
            </tr>
          </thead>
          <tbody>
            {ranking.map((r, idx) => (
              <tr key={r.teamId} className="border-b border-pitch/5 last:border-0">
                <td className="py-2 pr-2 text-pitch/60">{idx + 1}</td>
                <td className="py-2 pr-2 text-pitch">{r.name}</td>
                <td className="px-2 py-2 text-center font-semibold text-pitch">{r.yellow}</td>
                <td className="px-2 py-2 text-center font-semibold text-red-600">{r.red}</td>
                <td className="py-2 pl-2 text-center font-display text-base font-bold text-pitch">
                  {r.total}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-pitch/40">
        Rekap dihitung dari seluruh kartu yang dicatat di fase grup maupun semifinal &amp; final.
      </p>
    </div>
  )
}
