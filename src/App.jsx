import { useEffect, useRef, useState } from 'react'
import {
  subscribeGroups,
  subscribeMatches,
  subscribeKnockout,
  subscribeSettings,
  saveKnockoutMatch,
} from './services/firestoreApi'
import {
  computeGroupStandings,
  isGroupComplete,
  seedSemifinals,
  matchWinnerId,
  matchLoserId,
} from './utils/tournamentLogic'

import { useAuth } from './hooks/useAuth'
import Header from './components/Header'
import Tabs from './components/Tabs'
import AuthBar from './components/AuthBar'
import Standings from './components/Standings'
import GroupSchedule from './components/GroupSchedule'
import KnockoutStage from './components/KnockoutStage'
import TeamManager from './components/TeamManager'
import LiveScores from './components/LiveScores'
import TopScorers from './components/TopScorers'

const GROUP_KEYS = ['A', 'B', 'C']

export default function App() {
  const [groups, setGroups] = useState(null)
  const [matches, setMatches] = useState(null)
  const [knockout, setKnockout] = useState(null)
  const [settings, setSettings] = useState(null)
  const [tab, setTab] = useState('live')
  const { user, isAdmin } = useAuth()
  const seedingInFlight = useRef(false)
  const finalInFlight = useRef(false)

  useEffect(() => {
    const unsubs = [
      subscribeGroups(setGroups),
      subscribeMatches(setMatches),
      subscribeKnockout(setKnockout),
      subscribeSettings(setSettings),
    ]
    return () => unsubs.forEach((u) => u())
  }, [])

  const ready = groups && matches && knockout && settings
  const criteria = settings?.sortRule ?? ['points', 'goalDifference', 'goalsFor', 'headToHead']

  // Auto-seed semifinal once all 3 groups (3 teams each) have every fixture scored.
  useEffect(() => {
    if (!ready) return
    // NOTE: the SF1/SF2 docs already exist as empty placeholders in Firestore
    // (created manually beforehand), so we must check whether they've
    // actually been filled in (home team assigned) rather than just
    // checking whether the doc exists.
    if (knockout.SF1?.home || knockout.SF2?.home) return
    if (seedingInFlight.current) return

    const allComplete = GROUP_KEYS.every((g) => {
      const teams = groups[g]?.teams ?? []
      const groupMatches = matches.filter((m) => m.group === g)
      return teams.length === 3 && isGroupComplete(groupMatches)
    })
    if (!allComplete) return

    const standingsByGroup = {}
    GROUP_KEYS.forEach((g) => {
      standingsByGroup[g] = computeGroupStandings(
        groups[g].teams,
        matches.filter((m) => m.group === g),
        criteria,
      )
    })
    const { sf1, sf2 } = seedSemifinals(standingsByGroup)

    seedingInFlight.current = true
    Promise.all([
      saveKnockoutMatch('SF1', {
        stage: 'SF1',
        label: `Semifinal 1 (Juara ${sf1.team1.fromGroup} vs Runner-up Terbaik)`,
        home: sf1.team1.id,
        away: sf1.team2.id,
        homeScore: null,
        awayScore: null,
        homePenalty: null,
        awayPenalty: null,
        played: false,
      }),
      saveKnockoutMatch('SF2', {
        stage: 'SF2',
        label: `Semifinal 2 (Juara ${sf2.team1.fromGroup} vs Juara ${sf2.team2.fromGroup})`,
        home: sf2.team1.id,
        away: sf2.team2.id,
        homeScore: null,
        awayScore: null,
        homePenalty: null,
        awayPenalty: null,
        played: false,
      }),
    ])
      .catch((e) => {
        console.error('Gagal membuat semifinal', e)
        alert('Gagal membuat jadwal semifinal otomatis. Cek koneksi internet.')
      })
      .finally(() => {
        seedingInFlight.current = false
      })
  }, [ready, groups, matches, knockout, criteria])

  // Auto-generate Final & Third-place once both semifinals have a decided winner.
  useEffect(() => {
    if (!ready) return
    if (!knockout.SF1?.home || !knockout.SF2?.home) return
    // Same placeholder-doc issue as above: FINAL/THIRD already exist as
    // empty docs, so check whether they've been filled in, not existence.
    if (knockout.FINAL?.home || knockout.THIRD?.home) return
    if (finalInFlight.current) return

    const w1 = matchWinnerId(knockout.SF1)
    const w2 = matchWinnerId(knockout.SF2)
    const l1 = matchLoserId(knockout.SF1)
    const l2 = matchLoserId(knockout.SF2)
    if (!w1 || !w2 || !l1 || !l2) return

    finalInFlight.current = true
    Promise.all([
      saveKnockoutMatch('FINAL', {
        stage: 'FINAL',
        home: w1,
        away: w2,
        homeScore: null,
        awayScore: null,
        homePenalty: null,
        awayPenalty: null,
        played: false,
      }),
      saveKnockoutMatch('THIRD', {
        stage: 'THIRD',
        home: l1,
        away: l2,
        homeScore: null,
        awayScore: null,
        homePenalty: null,
        awayPenalty: null,
        played: false,
      }),
    ])
      .catch((e) => {
        console.error('Gagal membuat final/perebutan tempat ketiga', e)
        alert('Gagal membuat jadwal final otomatis. Cek koneksi internet.')
      })
      .finally(() => {
        finalInFlight.current = false
      })
  }, [ready, knockout])

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center text-pitch/50">
        <p className="font-display text-lg">Memuat data turnamen…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-16">
      <Header name={settings.tournamentName ?? 'Palaan Cup 2026'} />
      <AuthBar user={user} />
      <Tabs active={tab} onChange={setTab} />
      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        {tab === 'live' && (
          <LiveScores groups={groups} matches={matches} knockout={knockout} settings={settings} />
        )}
        {tab === 'klasemen' && <Standings groups={groups} matches={matches} criteria={criteria} />}
        {tab === 'jadwal' && <GroupSchedule groups={groups} matches={matches} canEdit={isAdmin} />}
        {tab === 'knockout' && (
          <KnockoutStage groups={groups} knockout={knockout} canEdit={isAdmin} />
        )}
        {tab === 'topskor' && <TopScorers groups={groups} matches={matches} knockout={knockout} />}
        {tab === 'tim' && (
          <TeamManager
            groups={groups}
            matches={matches}
            settings={settings}
            knockoutStarted={Boolean(knockout.SF1?.home || knockout.SF2?.home)}
            canEdit={isAdmin}
          />
        )}
      </main>
    </div>
  )
}
