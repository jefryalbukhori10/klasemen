const TABS = [
  { key: 'live', label: 'Live' },
  { key: 'klasemen', label: 'Klasemen' },
  { key: 'jadwal', label: 'Jadwal Grup' },
  { key: 'knockout', label: 'Semifinal & Final' },
  { key: 'topskor', label: 'Top Skor' },
  { key: 'kartu', label: 'Kartu' },
  { key: 'tim', label: 'Kelola Tim' },
]

export default function Tabs({ active, onChange }) {
  return (
    <div className="sticky top-0 z-10 border-b border-pitch/10 bg-chalk/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-4 sm:px-6">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            className={`whitespace-nowrap border-b-2 px-4 py-3 font-display text-sm font-semibold uppercase tracking-wide transition-colors ${
              active === t.key
                ? 'border-gold text-pitch'
                : 'border-transparent text-pitch/40 hover:text-pitch/70'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  )
}
