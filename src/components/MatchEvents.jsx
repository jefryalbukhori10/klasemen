import { useState } from 'react'

const uidLocal = (p) => `${p}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`

function CardDot({ type }) {
  return (
    <span
      className={`inline-block h-3 w-2 rounded-sm align-middle ${
        type === 'red' ? 'bg-red-600' : 'bg-yellow-400'
      }`}
    />
  )
}

export default function MatchEvents({ homeTeam, awayTeam, goals = [], cards = [], canEdit, onSave }) {
  const [showForm, setShowForm] = useState(false)
  const [goalDraft, setGoalDraft] = useState({ teamId: homeTeam.id, playerName: '', minute: '' })
  const [cardDraft, setCardDraft] = useState({
    teamId: homeTeam.id,
    playerName: '',
    minute: '',
    cardType: 'yellow',
  })

  const teamName = (id) =>
    id === homeTeam.id ? homeTeam.name : id === awayTeam.id ? awayTeam.name : '???'

  const sortByMinute = (arr) => [...arr].sort((a, b) => (a.minute ?? 0) - (b.minute ?? 0))

  const addGoal = () => {
    if (!goalDraft.playerName.trim()) return
    const entry = {
      id: uidLocal('goal'),
      teamId: goalDraft.teamId,
      playerName: goalDraft.playerName.trim(),
      minute: goalDraft.minute ? parseInt(goalDraft.minute, 10) : null,
    }
    onSave('goals', sortByMinute([...goals, entry]))
    setGoalDraft({ teamId: homeTeam.id, playerName: '', minute: '' })
  }

  const removeGoal = (id) => onSave('goals', goals.filter((g) => g.id !== id))

  const addCard = () => {
    if (!cardDraft.playerName.trim()) return
    const entry = {
      id: uidLocal('card'),
      teamId: cardDraft.teamId,
      playerName: cardDraft.playerName.trim(),
      minute: cardDraft.minute ? parseInt(cardDraft.minute, 10) : null,
      cardType: cardDraft.cardType,
    }
    onSave('cards', sortByMinute([...cards, entry]))
    setCardDraft({ teamId: homeTeam.id, playerName: '', minute: '', cardType: 'yellow' })
  }

  const removeCard = (id) => onSave('cards', cards.filter((c) => c.id !== id))

  const hasEvents = goals.length > 0 || cards.length > 0

  return (
    <div className="mt-2">
      {hasEvents && (
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-pitch/60">
          {goals.map((g) => (
            <span key={g.id}>
              ⚽ {g.minute != null ? `${g.minute}' ` : ''}
              {g.playerName} <span className="text-pitch/40">({teamName(g.teamId)})</span>
            </span>
          ))}
          {cards.map((c) => (
            <span key={c.id} className="inline-flex items-center gap-1">
              <CardDot type={c.cardType} />
              {c.minute != null ? `${c.minute}' ` : ''}
              {c.playerName} <span className="text-pitch/40">({teamName(c.teamId)})</span>
            </span>
          ))}
        </div>
      )}

      {canEdit && (
        <div className="mt-2">
          <button
            onClick={() => setShowForm((s) => !s)}
            className="text-xs font-semibold text-pitch/50 underline hover:text-pitch"
          >
            {showForm ? 'Tutup detail pemain' : 'Catat pencetak gol / kartu'}
          </button>

          {showForm && (
            <div className="mt-2 space-y-4 rounded-lg border border-pitch/10 bg-white p-3">
              <div>
                <p className="mb-1 text-xs font-semibold text-pitch/60">⚽ Gol</p>
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={goalDraft.teamId}
                    onChange={(e) => setGoalDraft((d) => ({ ...d, teamId: e.target.value }))}
                    className="rounded border border-pitch/20 px-2 py-1 text-xs"
                  >
                    <option value={homeTeam.id}>{homeTeam.name}</option>
                    <option value={awayTeam.id}>{awayTeam.name}</option>
                  </select>
                  <input
                    placeholder="Nama pemain"
                    value={goalDraft.playerName}
                    onChange={(e) => setGoalDraft((d) => ({ ...d, playerName: e.target.value }))}
                    onKeyDown={(e) => e.key === 'Enter' && addGoal()}
                    className="w-32 rounded border border-pitch/20 px-2 py-1 text-xs"
                  />
                  <input
                    type="number"
                    min="0"
                    placeholder="Menit"
                    value={goalDraft.minute}
                    onChange={(e) => setGoalDraft((d) => ({ ...d, minute: e.target.value }))}
                    className="w-16 rounded border border-pitch/20 px-2 py-1 text-xs"
                  />
                  <button
                    onClick={addGoal}
                    className="rounded bg-pitch px-2 py-1 text-xs font-semibold text-chalk hover:bg-pitch-light"
                  >
                    Tambah
                  </button>
                </div>
                {goals.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {goals.map((g) => (
                      <li key={g.id} className="flex items-center justify-between text-xs text-pitch/70">
                        <span>
                          {g.minute != null ? `${g.minute}' ` : ''}
                          {g.playerName} ({teamName(g.teamId)})
                        </span>
                        <button
                          onClick={() => removeGoal(g.id)}
                          className="font-semibold text-red-500/70 hover:text-red-600"
                        >
                          Hapus
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <p className="mb-1 text-xs font-semibold text-pitch/60">🟨🟥 Kartu</p>
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={cardDraft.teamId}
                    onChange={(e) => setCardDraft((d) => ({ ...d, teamId: e.target.value }))}
                    className="rounded border border-pitch/20 px-2 py-1 text-xs"
                  >
                    <option value={homeTeam.id}>{homeTeam.name}</option>
                    <option value={awayTeam.id}>{awayTeam.name}</option>
                  </select>
                  <input
                    placeholder="Nama pemain"
                    value={cardDraft.playerName}
                    onChange={(e) => setCardDraft((d) => ({ ...d, playerName: e.target.value }))}
                    onKeyDown={(e) => e.key === 'Enter' && addCard()}
                    className="w-32 rounded border border-pitch/20 px-2 py-1 text-xs"
                  />
                  <input
                    type="number"
                    min="0"
                    placeholder="Menit"
                    value={cardDraft.minute}
                    onChange={(e) => setCardDraft((d) => ({ ...d, minute: e.target.value }))}
                    className="w-16 rounded border border-pitch/20 px-2 py-1 text-xs"
                  />
                  <select
                    value={cardDraft.cardType}
                    onChange={(e) => setCardDraft((d) => ({ ...d, cardType: e.target.value }))}
                    className="rounded border border-pitch/20 px-2 py-1 text-xs"
                  >
                    <option value="yellow">Kuning</option>
                    <option value="red">Merah</option>
                  </select>
                  <button
                    onClick={addCard}
                    className="rounded bg-pitch px-2 py-1 text-xs font-semibold text-chalk hover:bg-pitch-light"
                  >
                    Tambah
                  </button>
                </div>
                {cards.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {cards.map((c) => (
                      <li key={c.id} className="flex items-center justify-between text-xs text-pitch/70">
                        <span className="inline-flex items-center gap-1">
                          <CardDot type={c.cardType} />
                          {c.minute != null ? `${c.minute}' ` : ''}
                          {c.playerName} ({teamName(c.teamId)})
                        </span>
                        <button
                          onClick={() => removeCard(c.id)}
                          className="font-semibold text-red-500/70 hover:text-red-600"
                        >
                          Hapus
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
