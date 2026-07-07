export default function Header({ name }) {
  return (
    <header className="bg-pitch text-chalk overflow-hidden">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-gold bg-pitch-dark font-display text-xl font-bold text-gold">
            PC
          </div>
          <div className="min-w-0">
            <p className="font-display text-xs uppercase tracking-[0.2em] text-gold break-words">
              Turnamen Sepak Bola Desa
            </p>
            <h1 className="break-words font-display text-2xl font-bold leading-tight sm:text-3xl">
              {name}
            </h1>
          </div>
        </div>
      </div>
    </header>
  )
}
