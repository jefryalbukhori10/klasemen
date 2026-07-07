export default function ScoreInput({ value, onChange, disabled = false }) {
  return (
    <input
      type="number"
      min="0"
      inputMode="numeric"
      value={value ?? ''}
      disabled={disabled}
      onChange={(e) => {
        const v = e.target.value
        onChange(v === '' ? null : Math.max(0, parseInt(v, 10) || 0))
      }}
      className="w-14 rounded-lg border border-pitch/20 bg-white px-2 py-1.5 text-center font-display text-lg font-semibold text-pitch focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/40 disabled:bg-chalk disabled:text-pitch/40"
      placeholder="-"
    />
  )
}
