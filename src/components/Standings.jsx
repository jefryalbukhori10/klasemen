import { computeGroupStandings } from "../utils/tournamentLogic";

const GROUP_LABELS = { A: "Grup A", B: "Grup B", C: "Grup C" };

function teamName(teams, id) {
  return teams.find((t) => t.id === id)?.name ?? "???";
}

function StandingsTable({ group, teams, matches, criteria }) {
  const standings = computeGroupStandings(teams, matches, criteria);
  const sanctioned = matches.filter((m) => m.sanction?.active);

  return (
    <div className="min-w-0 rounded-2xl border border-pitch/10 bg-white p-4">
      <h3 className="font-display text-lg font-bold text-pitch">
        {GROUP_LABELS[group] ?? `Grup ${group}`}
      </h3>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[420px] text-sm">
          <thead>
            <tr className="border-b border-pitch/10 text-left text-pitch/50">
              <th className="py-2 pr-2 font-medium">#</th>
              <th className="py-2 pr-2 font-medium">Tim</th>
              <th className="px-1 py-2 text-center font-medium">M</th>
              <th className="px-1 py-2 text-center font-medium">M</th>
              <th className="px-1 py-2 text-center font-medium">S</th>
              <th className="px-1 py-2 text-center font-medium">K</th>
              <th className="px-1 py-2 text-center font-medium">GM</th>
              <th className="px-1 py-2 text-center font-medium">GK</th>
              <th className="px-1 py-2 text-center font-medium">SG</th>
              <th className="py-2 pl-2 text-center font-bold">Pts</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((s, idx) => (
              <tr
                key={s.id}
                className={`border-b border-pitch/5 last:border-0 ${
                  idx < 2 ? "bg-gold/10 font-semibold" : ""
                }`}
              >
                <td className="py-2 pr-2 text-pitch/60">{idx + 1}</td>
                <td className="py-2 pr-2 text-pitch">{s.name}</td>
                <td className="px-1 py-2 text-center">{s.played}</td>
                <td className="px-1 py-2 text-center">{s.win}</td>
                <td className="px-1 py-2 text-center">{s.draw}</td>
                <td className="px-1 py-2 text-center">{s.lose}</td>
                <td className="px-1 py-2 text-center">{s.gf}</td>
                <td className="px-1 py-2 text-center">{s.ga}</td>
                <td className="px-1 py-2 text-center">
                  {s.gd > 0 ? `+${s.gd}` : s.gd}
                </td>
                <td className="py-2 pl-2 text-center font-display text-base font-bold text-pitch">
                  {s.pts}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-pitch/40">
        <span className="mr-2 inline-block h-2 w-2 rounded-full bg-gold align-middle" />
        Peringkat 1 &amp; 2 lolos ke babak semifinal (juara grup otomatis,
        runner-up terbaik ditentukan lintas grup).
      </p>
      {sanctioned.length > 0 && (
        <div className="mt-3 space-y-1 border-t border-red-100 pt-2">
          {sanctioned.map((m) => (
            <p key={m._docId} className="text-xs text-red-600">
              ⚠️ {teamName(teams, m.home)} vs {teamName(teams, m.away)}: poin
              disesuaikan panpel ({teamName(teams, m.home)}{" "}
              {m.sanction.homePoints} pts &middot; {teamName(teams, m.away)}{" "}
              {m.sanction.awayPoints} pts)
              {m.sanction.reason && <> — {m.sanction.reason}</>}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Standings({ groups, matches, criteria }) {
  const groupKeys = Object.keys(groups).sort();
  return (
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-1">
        {groupKeys.map((g) => (
          <StandingsTable
            key={g}
            group={g}
            teams={groups[g].teams ?? []}
            matches={matches.filter((m) => m.group === g)}
            criteria={criteria}
          />
        ))}
      </div>
      <p className="text-xs text-pitch/40">
        M = Main, M = Menang, S = Seri, K = Kalah, GM = Gol Memasukkan, GK = Gol
        Kemasukan, SG = Selisih Gol.
      </p>
    </div>
  );
}
