import { db } from '../firebase'
import {
  collection,
  doc,
  onSnapshot,
  updateDoc,
  setDoc,
  addDoc,
  deleteDoc,
  query,
  where,
  getDocs,
} from 'firebase/firestore'

const GROUP_IDS = ['A', 'B', 'C']
const KNOCKOUT_IDS = ['SF1', 'SF2', 'FINAL', 'THIRD']

// ---------- Subscriptions (real-time) ----------

export function subscribeGroups(cb) {
  return onSnapshot(collection(db, 'groups'), (snap) => {
    const groups = {}
    snap.forEach((d) => {
      groups[d.id] = { id: d.id, ...d.data() }
    })
    // Make sure A/B/C always exist locally even before first write.
    GROUP_IDS.forEach((g) => {
      if (!groups[g]) groups[g] = { id: g, name: `Grup ${g}`, teams: [] }
    })
    cb(groups)
  })
}

export function subscribeMatches(cb) {
  return onSnapshot(collection(db, 'matches'), (snap) => {
    const matches = []
    snap.forEach((d) => matches.push({ ...d.data(), _docId: d.id }))
    matches.sort((a, b) => (a.matchNumber ?? 0) - (b.matchNumber ?? 0))
    cb(matches)
  })
}

export function subscribeKnockout(cb) {
  return onSnapshot(collection(db, 'knockout'), (snap) => {
    const knockout = {}
    snap.forEach((d) => {
      knockout[d.id] = { ...d.data(), _docId: d.id }
    })
    cb(knockout)
  })
}

export function subscribeSettings(cb) {
  return onSnapshot(doc(db, 'settings', 'rules'), (d) => {
    cb(
      d.exists()
        ? d.data()
        : {
            tournamentName: 'PALAAN CUP 2026',
            year: 2026,
            sortRule: ['points', 'goalDifference', 'goalsFor', 'headToHead'],
          },
    )
  })
}

// ---------- Groups / teams ----------

export async function ensureGroupDoc(groupId) {
  await setDoc(
    doc(db, 'groups', groupId),
    { id: groupId, name: `Grup ${groupId}` },
    { merge: true },
  )
}

export async function saveGroupTeams(groupId, teams) {
  await setDoc(
    doc(db, 'groups', groupId),
    { id: groupId, name: `Grup ${groupId}`, teams },
    { merge: true },
  )
}

// ---------- Matches (group stage) ----------

export async function updateMatchField(matchDocId, field, value) {
  const payload = { [field]: value }
  await updateDoc(doc(db, 'matches', matchDocId), payload)
}

export async function updateMatchScores(matchDocId, homeScore, awayScore) {
  await updateDoc(doc(db, 'matches', matchDocId), {
    homeScore,
    awayScore,
    played: homeScore != null && awayScore != null,
  })
}

export async function getMatchesByGroup(groupId) {
  const q = query(collection(db, 'matches'), where('group', '==', groupId))
  const snap = await getDocs(q)
  const list = []
  snap.forEach((d) => list.push({ ...d.data(), _docId: d.id }))
  return list
}

export async function addMatch(matchData) {
  await addDoc(collection(db, 'matches'), matchData)
}

export async function deleteMatch(matchDocId) {
  await deleteDoc(doc(db, 'matches', matchDocId))
}

// Reconcile the fixtures of one group against its current team list:
// keeps existing matches (and their scores/dates) for pairs that still
// exist, removes fixtures for teams that were deleted, and creates new
// fixtures for new pairs.
export async function reconcileGroupFixtures(groupId, teams, allMatches) {
  const existing = allMatches.filter((m) => m.group === groupId)
  const teamIds = teams.map((t) => t.id)
  const desiredPairs = []
  for (let i = 0; i < teamIds.length; i++) {
    for (let j = i + 1; j < teamIds.length; j++) {
      desiredPairs.push([teamIds[i], teamIds[j]])
    }
  }

  const findExisting = (a, b) =>
    existing.find((m) => (m.home === a && m.away === b) || (m.home === b && m.away === a))

  // Delete fixtures whose pair no longer exists (team removed)
  for (const m of existing) {
    const stillValid = teamIds.includes(m.home) && teamIds.includes(m.away)
    if (!stillValid) {
      await deleteMatch(m._docId)
    }
  }

  // Figure out next global matchNumber
  const maxMatchNumber = allMatches.reduce((max, m) => Math.max(max, m.matchNumber || 0), 0)
  let nextNumber = maxMatchNumber + 1

  for (const [a, b] of desiredPairs) {
    if (findExisting(a, b)) continue
    await addMatch({
      group: groupId,
      matchNumber: nextNumber++,
      home: a,
      away: b,
      homeScore: null,
      awayScore: null,
      date: null,
      penalty: null,
      played: false,
    })
  }
}

// ---------- Knockout ----------

export async function saveKnockoutMatch(docId, data) {
  await setDoc(doc(db, 'knockout', docId), { id: docId, ...data }, { merge: true })
}

export async function updateKnockoutField(docId, field, value) {
  await updateDoc(doc(db, 'knockout', docId), { [field]: value })
}

// ---------- Settings ----------

export async function saveSettings(data) {
  await setDoc(doc(db, 'settings', 'rules'), data, { merge: true })
}

export { GROUP_IDS, KNOCKOUT_IDS }
