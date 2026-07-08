// A match is only considered "schedulable" for live detection if it has
// both a date (YYYY-MM-DD) and a kickoff time (HH:mm). Without a time we
// cannot know exactly when it starts, so it's treated as 'unscheduled'.
export function getKickoffDate(match) {
  if (!match?.date || !match?.time) return null
  const dt = new Date(`${match.date}T${match.time}:00`)
  return Number.isNaN(dt.getTime()) ? null : dt
}

// Returns one of: 'unscheduled' | 'upcoming' | 'live' | 'finished'
export function getMatchStatus(match, durationMinutes, now) {
  const kickoff = getKickoffDate(match)
  if (!kickoff) return { status: 'unscheduled', kickoff: null, end: null }

  const end = new Date(kickoff.getTime() + durationMinutes * 60000)
  if (now < kickoff) return { status: 'upcoming', kickoff, end }
  if (now <= end) return { status: 'live', kickoff, end }
  return { status: 'finished', kickoff, end }
}

export function formatKickoff(kickoff) {
  if (!kickoff) return ''
  return kickoff.toLocaleString('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatCountdown(ms) {
  if (ms <= 0) return 'Sebentar lagi'
  const totalMinutes = Math.floor(ms / 60000)
  const days = Math.floor(totalMinutes / (60 * 24))
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60)
  const minutes = totalMinutes % 60
  const parts = []
  if (days > 0) parts.push(`${days} hari`)
  if (hours > 0) parts.push(`${hours} jam`)
  if (days === 0 && minutes > 0) parts.push(`${minutes} menit`)
  return parts.length ? `${parts.join(' ')} lagi` : 'Sebentar lagi'
}
