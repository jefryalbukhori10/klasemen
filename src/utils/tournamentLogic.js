// ---- Utility ----
export const uid = (prefix = 'id') =>
  `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`

function emptyStat(team) {
  return {
    id: team.id,
    name: team.name,
    played: 0,
    win: 0,
    draw: 0,
    lose: 0,
    gf: 0,
    ga: 0,
    gd: 0,
    pts: 0,
  }
}

// Head-to-head mini table limited to matches played among `ids`
function headToHeadStats(ids, matches) {
  const stats = {}
  ids.forEach((id) => (stats[id] = { pts: 0, gf: 0, ga: 0, gd: 0 }))
  matches.forEach((m) => {
    if (m.homeScore == null || m.awayScore == null) return
    if (!ids.includes(m.home) || !ids.includes(m.away)) return
    const s1 = stats[m.home]
    const s2 = stats[m.away]
    s1.gf += m.homeScore
    s1.ga += m.awayScore
    s2.gf += m.awayScore
    s2.ga += m.homeScore
    if (m.homeScore > m.awayScore) s1.pts += 3
    else if (m.homeScore < m.awayScore) s2.pts += 3
    else {
      s1.pts += 1
      s2.pts += 1
    }
  })
  Object.values(stats).forEach((s) => (s.gd = s.gf - s.ga))
  return stats
}

// Get the comparable metric value for one team stat, for a given criterion key.
// criterion is one of: 'points' | 'goalDifference' | 'goalsFor' | 'headToHead'
function getMetric(item, criterion, matches, groupIds) {
  switch (criterion) {
    case 'points':
      return item.pts
    case 'goalDifference':
      return item.gd
    case 'goalsFor':
      return item.gf
    case 'headToHead': {
      const h2h = headToHeadStats(groupIds, matches)
      const s = h2h[item.id] ?? { pts: 0, gd: 0 }
      // encode (h2h points, h2h goal-diff) into one sortable number
      return s.pts * 1000 + s.gd
    }
    default:
      return 0
  }
}

// Recursively sort a list of tied teams by the remaining tiebreak criteria.
function recursiveSort(list, matches, criteria) {
  if (list.length <= 1 || criteria.length === 0) return list
  const [crit, ...rest] = criteria
  const ids = list.map((l) => l.id)
  const withMetric = list.map((l) => ({ ...l, __m: getMetric(l, crit, matches, ids) }))
  withMetric.sort((a, b) => b.__m - a.__m)

  const result = []
  let i = 0
  while (i < withMetric.length) {
    let j = i
    while (j < withMetric.length && withMetric[j].__m === withMetric[i].__m) j++
    let segment = withMetric.slice(i, j).map(({ __m, ...rest2 }) => rest2)
    if (segment.length > 1) segment = recursiveSort(segment, matches, rest)
    result.push(...segment)
    i = j
  }
  return result
}

// Compute sorted standings for one group.
// `criteria` is the ordered tiebreak rule array from settings, e.g.
// ['points', 'goalDifference', 'goalsFor', 'headToHead']
export function computeGroupStandings(teams, matches, criteria) {
  const stats = {}
  teams.forEach((t) => (stats[t.id] = emptyStat(t)))

  matches.forEach((m) => {
    if (m.homeScore == null || m.awayScore == null) return
    const s1 = stats[m.home]
    const s2 = stats[m.away]
    if (!s1 || !s2) return
    s1.played++
    s2.played++
    s1.gf += m.homeScore
    s1.ga += m.awayScore
    s2.gf += m.awayScore
    s2.ga += m.homeScore
    if (m.homeScore > m.awayScore) {
      s1.win++
      s1.pts += 3
      s2.lose++
    } else if (m.homeScore < m.awayScore) {
      s2.win++
      s2.pts += 3
      s1.lose++
    } else {
      s1.draw++
      s2.draw++
      s1.pts += 1
      s2.pts += 1
    }
  })

  const arr = Object.values(stats).map((s) => ({ ...s, gd: s.gf - s.ga }))
  return recursiveSort(arr, matches, criteria)
}

export function isGroupComplete(matches) {
  return matches.length > 0 && matches.every((m) => m.homeScore != null && m.awayScore != null)
}

// Determine the winner id of a knockout match, accounting for penalties.
// Returns null if not yet decided (draw with no/incomplete penalty scores).
export function matchWinnerId(match) {
  if (!match || match.homeScore == null || match.awayScore == null) return null
  if (match.homeScore > match.awayScore) return match.home
  if (match.homeScore < match.awayScore) return match.away
  if (match.homePenalty == null || match.awayPenalty == null) return null
  if (match.homePenalty === match.awayPenalty) return null
  return match.homePenalty > match.awayPenalty ? match.home : match.away
}

export function matchLoserId(match) {
  const winner = matchWinnerId(match)
  if (!winner) return null
  return winner === match.home ? match.away : match.home
}

export function isDrawNeedingPenalty(match) {
  return (
    match &&
    match.homeScore != null &&
    match.awayScore != null &&
    match.homeScore === match.awayScore
  )
}

// Rank a list of teams (already-computed stat objects) purely by
// pts > gd > gf > name — used for cross-group comparisons (winners seeding,
// best runner-up) where real head-to-head data does not exist.
function rankCrossGroup(list) {
  return [...list].sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts
    if (b.gd !== a.gd) return b.gd - a.gd
    if (b.gf !== a.gf) return b.gf - a.gf
    return a.name.localeCompare(b.name)
  })
}

// Given standings per group ({A: [...], B: [...], C: [...]}), produce the
// two semifinal pairings: SF1 = Seed1 (best group winner) vs Best Runner-up
//                          SF2 = Seed2 vs Seed3
export function seedSemifinals(standingsByGroup) {
  const groupKeys = Object.keys(standingsByGroup)
  const winners = groupKeys.map((g) => ({ ...standingsByGroup[g][0], fromGroup: g }))
  const runnersUp = groupKeys.map((g) => ({ ...standingsByGroup[g][1], fromGroup: g }))

  const seededWinners = rankCrossGroup(winners)
  const bestRunnerUp = rankCrossGroup(runnersUp)[0]

  const [seed1, seed2, seed3] = seededWinners

  return {
    sf1: { team1: seed1, team2: bestRunnerUp },
    sf2: { team1: seed2, team2: seed3 },
    seededWinners,
    bestRunnerUp,
  }
}
