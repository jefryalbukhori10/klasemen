import ScoreInput from './ScoreInput'
import { isDrawNeedingPenalty, matchWinnerId } from '../utils/tournamentLogic'
import { updateKnockoutField } from '../services/firestoreApi'

function findTeamName(groups, id) {
  for (const g of Object.keys(groups)) {
    const found = (groups[g].teams ?? []).find((t) => t.id === id)
    if (found) return found.name
  }
  return '???'
}

function MatchCard({ title, match, groups, docId, canEdit }) {
  if (!match) {
    return (
      <div className="rounded-2xl border border-dashed border-pitch/20 bg-white/50 p-5 text-center text-sm text-pitch/40">
        <p className="font-display font-bold uppercase tracking-wide">{title}</p>
        <p className="mt-1">Menunggu hasil babak sebelumnya…</p>
      </div>
    )
  }

  const needsPenalty = isDrawNeedingPenalty(match)
  const winnerId = matchWinnerId(match)

  const update = async (field, value) => {
    if (!canEdit) return
    const payload = { [field]: value }
    if (field === 'homeScore' || field === 'awayScore') {
      const homeScore = field === 'homeScore' ? value : match.homeScore
      const awayScore = field === 'awayScore' ? value : match.awayScore
      payload.played = homeScore != null && awayScore != null
    }
    try {
      for (const [f, v] of Object.entries(payload)) {
        // eslint-disable-next-line no-await-in-loop
        await updateKnockoutField(docId, f, v)
      }
    } catch (e) {
      console.error('Gagal menyimpan skor knockout', e)
      alert('Gagal menyimpan skor ke server. Cek koneksi internet lalu coba lagi.')
    }
  }

  return (
    <div className="rounded-2xl border border-pitch/10 bg-white p-5">
      <p className="font-display text-xs font-bold uppercase tracking-widest text-gold-dark">
        {title}
      </p>
      <div className="mt-3 flex items-center justify-center gap-3">
        <span
          className={`flex-1 text-right text-sm font-semibold ${
            winnerId === match.home ? 'text-pitch' : 'text-pitch/70'
          }`}
        >
          {findTeamName(groups, match.home)}
          {winnerId === match.home && <span className="ml-1 text-gold-dark">●</span>}
        </span>
        <ScoreInput value={match.homeScore} onChange={(v) => update('homeScore', v)} disabled={!canEdit} />
        <span className="font-display font-bold text-pitch/30">vs</span>
        <ScoreInput value={match.awayScore} onChange={(v) => update('awayScore', v)} disabled={!canEdit} />
        <span
          className={`flex-1 text-left text-sm font-semibold ${
            winnerId === match.away ? 'text-pitch' : 'text-pitch/70'
          }`}
        >
          {winnerId === match.away && <span className="mr-1 text-gold-dark">●</span>}
          {findTeamName(groups, match.away)}
        </span>
      </div>

      {needsPenalty && (
        <div className="mt-4 rounded-xl bg-gold/10 p-3">
          <p className="text-center text-xs font-semibold uppercase tracking-wide text-gold-dark">
            Skor imbang &mdash; adu penalti
          </p>
          <div className="mt-2 flex items-center justify-center gap-3">
            <ScoreInput value={match.homePenalty} onChange={(v) => update('homePenalty', v)} disabled={!canEdit} />
            <span className="text-xs font-bold text-pitch/40">PEN</span>
            <ScoreInput value={match.awayPenalty} onChange={(v) => update('awayPenalty', v)} disabled={!canEdit} />
          </div>
        </div>
      )}
    </div>
  )
}

export default function KnockoutStage({ groups, knockout, canEdit }) {
  const sf1 = knockout.SF1
  const sf2 = knockout.SF2
  const final = knockout.FINAL
  const third = knockout.THIRD

  if (!sf1?.home && !sf2?.home) {
    return (
      <div className="rounded-2xl border border-dashed border-pitch/20 bg-white/50 p-8 text-center text-pitch/50">
        <p className="font-display text-lg font-bold text-pitch/70">Babak Semifinal Belum Terbentuk</p>
        <p className="mt-2 text-sm">
          Selesaikan seluruh pertandingan fase grup (skor terisi semua) di tab Jadwal Grup. Semifinal akan
          otomatis terbentuk dari 3 juara grup + 1 runner-up terbaik.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {!canEdit && (
        <p className="rounded-xl border border-pitch/10 bg-white px-4 py-2 text-xs text-pitch/50">
          Mode lihat saja. Masuk sebagai admin untuk mengisi skor.
        </p>
      )}
      <div>
        <h3 className="mb-3 font-display text-lg font-bold text-pitch">Semifinal</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <MatchCard title={sf1?.label ?? 'Semifinal 1'} match={sf1} groups={groups} docId="SF1" canEdit={canEdit} />
          <MatchCard title={sf2?.label ?? 'Semifinal 2'} match={sf2} groups={groups} docId="SF2" canEdit={canEdit} />
        </div>
      </div>

      <div>
        <h3 className="mb-3 font-display text-lg font-bold text-pitch">Final &amp; Perebutan Tempat Ketiga</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <MatchCard title="Final" match={final} groups={groups} docId="FINAL" canEdit={canEdit} />
          <MatchCard title="Perebutan Tempat Ketiga" match={third} groups={groups} docId="THIRD" canEdit={canEdit} />
        </div>
      </div>
    </div>
  )
}
