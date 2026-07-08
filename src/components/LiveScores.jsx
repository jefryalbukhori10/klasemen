import { useNow } from '../hooks/useNow'
import { getMatchStatus, formatKickoff, formatCountdown } from '../utils/liveStatus'
import { findTeamName } from '../utils/tournamentLogic'

const GROUP_LABELS = { A: 'Grup A', B: 'Grup B', C: 'Grup C' }
const KNOCKOUT_LABELS = { SF1: 'Semifinal 1', SF2: 'Semifinal 2', FINAL: 'Final', THIRD: 'Perebutan Tempat Ketiga' }

function buildMatchList(groups, matches, knockout) {
  const list = []

  matches.forEach((m) => {
    list.push({
      key: m._docId,
      label: GROUP_LABELS[m.group] ?? `Grup ${m.group}`,
      home: m.home,
      away: m.away,
      homeScore: m.homeScore,
      awayScore: m.awayScore,
      date: m.date,
      time: m.time,
    })
  })

  ;['SF1', 'SF2', 'FINAL', 'THIRD'].forEach((k) => {
    const m = knockout[k]
    if (!m?.home) return
    list.push({
      key: k,
      label: m.label ?? KNOCKOUT_LABELS[k],
      home: m.home,
      away: m.away,
      homeScore: m.homeScore,
      awayScore: m.awayScore,
      date: m.date,
      time: m.time,
      isPenalty: m.homePenalty != null && m.awayPenalty != null,
      homePenalty: m.homePenalty,
      awayPenalty: m.awayPenalty,
    })
  })

  return list
}

function LiveCard({ match, groups, elapsedMinutes }) {
  return (
    <div className="overflow-hidden rounded-2xl border-2 border-red-400 bg-white shadow-lg shadow-red-100">
      <div className="flex items-center justify-between bg-red-500 px-4 py-1.5">
        <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-white">
          <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
          Live
        </span>
        <span className="text-xs font-semibold text-white/90">{match.label}</span>
      </div>
      <div className="flex items-center justify-center gap-4 px-5 py-6">
        <span className="flex-1 text-right font-display text-lg font-bold text-pitch">
          {findTeamName(groups, match.home)}
        </span>
        <span className="font-display text-3xl font-extrabold text-pitch">
          {match.homeScore ?? 0} - {match.awayScore ?? 0}
        </span>
        <span className="flex-1 text-left font-display text-lg font-bold text-pitch">
          {findTeamName(groups, match.away)}
        </span>
      </div>
      <p className="pb-3 text-center text-xs font-semibold text-red-500">
        Menit ke-{elapsedMinutes}'
      </p>
    </div>
  )
}

function UpcomingRow({ match, groups, kickoff, now }) {
  return (
    <li className="flex flex-col gap-1 rounded-xl bg-chalk px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-pitch/10 px-2 py-0.5 text-xs font-semibold text-pitch/70">
          {match.label}
        </span>
        <span className="text-sm font-medium text-pitch">
          {findTeamName(groups, match.home)} <span className="text-pitch/40">vs</span>{' '}
          {findTeamName(groups, match.away)}
        </span>
      </div>
      <div className="text-xs text-pitch/50">
        {formatKickoff(kickoff)} &middot;{' '}
        <span className="font-semibold text-gold-dark">
          {formatCountdown(kickoff.getTime() - now.getTime())}
        </span>
      </div>
    </li>
  )
}

export default function LiveScores({ groups, matches, knockout, settings }) {
  const now = useNow(15000)
  const durationMinutes = settings.matchDurationMinutes ?? 90

  const all = buildMatchList(groups, matches, knockout).map((m) => ({
    ...m,
    ...getMatchStatus(m, durationMinutes, now),
  }))

  const live = all.filter((m) => m.status === 'live')
  const upcoming = all
    .filter((m) => m.status === 'upcoming')
    .sort((a, b) => a.kickoff.getTime() - b.kickoff.getTime())
    .slice(0, 5)
  const anyScheduled = all.some((m) => m.status !== 'unscheduled')

  return (
    <div className="space-y-6">
      {live.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {live.map((m) => (
            <LiveCard
              key={m.key}
              match={m}
              groups={groups}
              elapsedMinutes={Math.min(
                durationMinutes,
                Math.max(0, Math.floor((now.getTime() - m.kickoff.getTime()) / 60000)),
              )}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-pitch/20 bg-white/60 p-8 text-center text-pitch/50">
          <p className="font-display text-lg font-bold text-pitch/70">
            Tidak Ada Pertandingan yang Sedang Berlangsung
          </p>
          <p className="mt-2 text-sm">
            Halaman ini otomatis menampilkan skor live begitu jadwal kick-off tiba.
          </p>
        </div>
      )}

      {upcoming.length > 0 && (
        <div>
          <h3 className="mb-3 font-display text-lg font-bold text-pitch">Pertandingan Berikutnya</h3>
          <ul className="space-y-2">
            {upcoming.map((m) => (
              <UpcomingRow key={m.key} match={m} groups={groups} kickoff={m.kickoff} now={now} />
            ))}
          </ul>
        </div>
      )}

      {!anyScheduled && (
        <p className="rounded-xl border border-pitch/10 bg-white px-4 py-3 text-xs text-pitch/50">
          Belum ada jadwal yang punya tanggal &amp; jam kick-off. Admin bisa mengisinya di tab{' '}
          <strong>Jadwal Grup</strong> atau <strong>Semifinal &amp; Final</strong> supaya halaman ini bisa
          mendeteksi pertandingan live secara otomatis.
        </p>
      )}
    </div>
  )
}
