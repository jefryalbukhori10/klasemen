import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import {
  FaSave,
  FaTrophy,
  FaMedal,
  FaUsers,
  FaCrown,
  FaRegClock,
  FaImage,
} from "react-icons/fa";
import html2canvas from "html2canvas-pro";
import Swal from "sweetalert2";
import { FaScreenpal } from "react-icons/fa6";

const BabakGugur = () => {
  const [teams, setTeams] = useState([]);
  const [showTeamPicker, setShowTeamPicker] = useState(null); // untuk buka modal pilih tim
  const [knockout, setKnockout] = useState({
    semi1_home: "",
    semi1_away: "",
    semi1_home_score: "",
    semi1_away_score: "",
    semi1_home_pen: "",
    semi1_away_pen: "",
    semi1_winner: "",

    semi2_home: "",
    semi2_away: "",
    semi2_home_score: "",
    semi2_away_score: "",
    semi2_home_pen: "",
    semi2_away_pen: "",
    semi2_winner: "",

    final_home: "",
    final_away: "",
    final_home_score: "",
    final_away_score: "",
    final_home_pen: "",
    final_away_pen: "",
    final_winner: "",

    third_home: "",
    third_away: "",
    third_home_score: "",
    third_away_score: "",
    third_home_pen: "",
    third_away_pen: "",
    third_winner: "",
  });

  useEffect(() => {
    // const fetchTeams = async () => {
    //   const querySnapshot = await getDocs(collection(db, "tim"));
    //   const teamList = querySnapshot.docs.map((doc) => ({
    //     id: doc.id,
    //     ...doc.data(),
    //   }));
    //   setTeams(teamList);
    // };

    const fetchTeams = async () => {
      const querySnapshot = await getDocs(collection(db, "tim"));
      let allTeams = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Hitung selisih gol (sg)
      allTeams.forEach((team) => {
        team.sg = (team.gm || 0) - (team.gk || 0);
      });

      // Grouping berdasarkan idGrup
      const groupedTeams = allTeams.reduce((acc, team) => {
        if (!acc[team.idGrup]) acc[team.idGrup] = [];
        acc[team.idGrup].push(team);
        return acc;
      }, {});

      // Ambil hanya 2 tim teratas tiap grup
      const topTeams = [];
      Object.keys(groupedTeams).forEach((groupId) => {
        let sorted = groupedTeams[groupId].sort((a, b) => {
          if (b.poin !== a.poin) return b.poin - a.poin;
          return (b.sg || 0) - (a.sg || 0);
        });

        topTeams.push(...sorted.slice(0, 2));
      });

      setTeams(topTeams);
    };

    fetchTeams();

    const fetchKnockout = async () => {
      const docRef = doc(db, "knockout", "palaan2025");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setKnockout(docSnap.data());
      }
    };

    fetchTeams();
    fetchKnockout();
  }, []);

  // 🟡 helper toast
  const showToast = (icon, title) => {
    Swal.fire({
      toast: true,
      position: "top-end",
      icon,
      title,
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true,
    });
  };

  // Hitung pemenang otomatis
  const calculateWinner = (
    home,
    away,
    homeScore,
    awayScore,
    homePen,
    awayPen
  ) => {
    if (!home || !away) return "";

    if (homeScore !== "" && awayScore !== "") {
      if (parseInt(homeScore) > parseInt(awayScore)) return home;
      if (parseInt(awayScore) > parseInt(homeScore)) return away;
      if (parseInt(homeScore) === parseInt(awayScore)) {
        if (homePen !== "" && awayPen !== "") {
          if (parseInt(homePen) > parseInt(awayPen)) return home;
          if (parseInt(awayPen) > parseInt(homePen)) return away;
        }
      }
    }
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updated = { ...knockout, [name]: value };

    // Semi 1
    updated.semi1_winner = calculateWinner(
      updated.semi1_home,
      updated.semi1_away,
      updated.semi1_home_score,
      updated.semi1_away_score,
      updated.semi1_home_pen,
      updated.semi1_away_pen
    );
    if (updated.semi1_winner) {
      updated.final_home = updated.semi1_winner;
      updated.third_home =
        updated.semi1_winner === updated.semi1_home
          ? updated.semi1_away
          : updated.semi1_home;
    }

    // Semi 2
    updated.semi2_winner = calculateWinner(
      updated.semi2_home,
      updated.semi2_away,
      updated.semi2_home_score,
      updated.semi2_away_score,
      updated.semi2_home_pen,
      updated.semi2_away_pen
    );
    if (updated.semi2_winner) {
      updated.final_away = updated.semi2_winner;
      updated.third_away =
        updated.semi2_winner === updated.semi2_home
          ? updated.semi2_away
          : updated.semi2_home;
    }

    // Final
    updated.final_winner = calculateWinner(
      updated.final_home,
      updated.final_away,
      updated.final_home_score,
      updated.final_away_score,
      updated.final_home_pen,
      updated.final_away_pen
    );

    // Juara 3
    updated.third_winner = calculateWinner(
      updated.third_home,
      updated.third_away,
      updated.third_home_score,
      updated.third_away_score,
      updated.third_home_pen,
      updated.third_away_pen
    );

    setKnockout(updated);
  };

  const handleSave = async () => {
    const docRef = doc(db, "knockout", "palaan2025");
    await setDoc(docRef, knockout, { merge: true });
    showToast("success", "Bracket Knockout berhasil disimpan!");
  };

  const ScoreInput = ({
    home,
    away,
    homeScore,
    awayScore,
    homePen,
    awayPen,
    prefix,
  }) => (
    <div>
      <div className="flex items-center justify-between gap-3 text-lg font-semibold mb-2">
        <span>{home || "?"}</span>
        <input
          type="number"
          name={`${prefix}_home_score`}
          value={homeScore}
          onChange={handleChange}
          className="w-16 text-center p-2 rounded-lg bg-white text-blue-900 font-bold shadow"
        />
        <span className="text-yellow-400 font-extrabold">VS</span>
        <input
          type="number"
          name={`${prefix}_away_score`}
          value={awayScore}
          onChange={handleChange}
          className="w-16 text-center p-2 rounded-lg bg-white text-blue-900 font-bold shadow"
        />
        <span>{away || "?"}</span>
      </div>
      {homeScore !== "" &&
        awayScore !== "" &&
        parseInt(homeScore) === parseInt(awayScore) && (
          <div className="mt-2 text-center">
            <div className="text-sm text-gray-200">Penalti:</div>
            <div className="flex justify-center gap-4 mt-1">
              <input
                type="number"
                name={`${prefix}_home_pen`}
                value={homePen}
                onChange={handleChange}
                placeholder="Home"
                className="w-16 text-center p-1 rounded-lg bg-white text-blue-900 font-bold shadow"
              />
              <span className="text-gray-300">-</span>
              <input
                type="number"
                name={`${prefix}_away_pen`}
                value={awayPen}
                onChange={handleChange}
                placeholder="Away"
                className="w-16 text-center p-1 rounded-lg bg-white text-blue-900 font-bold shadow"
              />
            </div>
          </div>
        )}
    </div>
  );

  const Card = ({ title, children, color = "bg-white/10" }) => (
    <div
      className={`relative rounded-2xl border border-white/20 shadow-lg p-5 ${color}`}
    >
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-1 rounded-full bg-yellow-400 text-blue-900 font-extrabold text-sm shadow-md">
        {title}
      </div>
      {children}
    </div>
  );

  const ResultCard = ({ knockout }) => (
    <div className="w-full max-w-2xl mt-4 rounded-2xl bg-gradient-to-br from-indigo-900 to-slate-900 border border-white/20 shadow-xl p-6 text-white">
      <h2 className="text-center text-2xl font-extrabold text-yellow-400 mb-6 tracking-wide">
        HASIL AKHIR PALAAN CUP 2025
      </h2>

      <div className="flex flex-col gap-5">
        {/* Juara 1 */}
        <div className="flex items-center justify-between bg-white/10 rounded-xl px-5 py-3 shadow-md">
          <div className="flex items-center gap-3">
            <FaCrown className="text-yellow-400 text-2xl" />
            <span className="font-bold text-lg">Juara 1</span>
          </div>
          <span className="font-extrabold text-yellow-300 text-xl">
            {knockout.final_winner || "-"}
          </span>
        </div>

        {/* Juara 2 */}
        <div className="flex items-center justify-between bg-white/10 rounded-xl px-5 py-3 shadow-md">
          <div className="flex items-center gap-3">
            <FaTrophy className="text-gray-300 text-xl" />
            <span className="font-bold text-lg">Juara 2</span>
          </div>
          <span className="font-extrabold text-gray-200 text-xl">
            {knockout.final_winner
              ? knockout.final_winner === knockout.final_home
                ? knockout.final_away
                : knockout.final_home
              : "-"}
          </span>
        </div>

        {/* Juara 3 */}
        <div className="flex items-center justify-between bg-white/10 rounded-xl px-5 py-3 shadow-md">
          <div className="flex items-center gap-3">
            <FaMedal className="text-orange-400 text-xl" />
            <span className="font-bold text-lg">Juara 3</span>
          </div>
          <span className="font-extrabold text-orange-300 text-xl">
            {knockout.third_winner || "-"}
          </span>
        </div>
      </div>
    </div>
  );

  const TeamPicker = ({ field }) => (
    <div
      onClick={() => setShowTeamPicker(field)}
      className="cursor-pointer group relative w-full p-4 mt-3 rounded-xl bg-white/90 text-blue-900 font-bold flex items-center justify-between shadow-md hover:shadow-xl transition duration-300 border border-transparent hover:border-yellow-400"
    >
      {/* Icon / Placeholder */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 text-white shadow-md group-hover:scale-110 transition">
          <FaUsers />
        </div>
        <span className="text-lg tracking-wide">
          {knockout[field] || "Pilih Tim"}
        </span>
      </div>
    </div>
  );

  const handleReset = async () => {
    const result = await Swal.fire({
      title: "Yakin reset?",
      text: "Semua data knockout akan dihapus!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, reset!",
      cancelButtonText: "Batal",
    });
    if (!result.isConfirmed) return;

    const emptyKnockout = {
      semi1_home: "",
      semi1_away: "",
      semi1_home_score: "",
      semi1_away_score: "",
      semi1_home_pen: "",
      semi1_away_pen: "",
      semi1_winner: "",

      semi2_home: "",
      semi2_away: "",
      semi2_home_score: "",
      semi2_away_score: "",
      semi2_home_pen: "",
      semi2_away_pen: "",
      semi2_winner: "",

      final_home: "",
      final_away: "",
      final_home_score: "",
      final_away_score: "",
      final_home_pen: "",
      final_away_pen: "",
      final_winner: "",

      third_home: "",
      third_away: "",
      third_home_score: "",
      third_away_score: "",
      third_home_pen: "",
      third_away_pen: "",
      third_winner: "",
    };

    const docRef = doc(db, "knockout", "palaan2025");
    await setDoc(docRef, emptyKnockout);
    setKnockout(emptyKnockout);
    showToast("success", "Knockout berhasil direset!");
  };

  const handleScreenshot = () => {
    const captureElement = document.getElementById("knockout-area");
    if (!captureElement) return;

    html2canvas(captureElement, {
      scale: 2,
      ignoreElements: (element) => element.classList.contains("no-screenshot"),
    }).then((canvas) => {
      const link = document.createElement("a");
      link.download = "knockout_palaan2025.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
      showToast("success", "Screenshot berhasil diunduh!");
    });
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 p-6 text-white flex flex-col items-center"
      id="knockout-area"
    >
      <h1 className="text-4xl font-extrabold text-center mb-12 tracking-wide">
        BABAK KNOCKOUT <span className="text-yellow-400">PALAAN CUP 2025</span>
      </h1>

      {/* Modal Pilih Tim */}
      {showTeamPicker && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-[500px] max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-blue-900 mb-4">Pilih Tim</h2>
            <div className="grid grid-cols-2 gap-4">
              {teams.map((team) => (
                <div
                  key={team.id}
                  className="p-3 rounded-lg border-2 border-blue-900 text-blue-900 font-bold text-center cursor-pointer hover:bg-yellow-300 transition"
                  onClick={() => {
                    setKnockout({ ...knockout, [showTeamPicker]: team.nama });
                    setShowTeamPicker(null);
                  }}
                >
                  {team.nama}
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowTeamPicker(null)}
              className="mt-4 w-full py-2 rounded-lg bg-red-500 text-white font-bold cursor-pointer"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-12 w-full max-w-7xl">
        <div className="flex flex-col gap-16">
          <Card title="SEMI FINAL 1">
            <ScoreInput
              home={knockout.semi1_home}
              away={knockout.semi1_away}
              homeScore={knockout.semi1_home_score}
              awayScore={knockout.semi1_away_score}
              homePen={knockout.semi1_home_pen}
              awayPen={knockout.semi1_away_pen}
              prefix="semi1"
            />
            <TeamPicker field="semi1_home" />
            <TeamPicker field="semi1_away" />
          </Card>

          <Card title="SEMI FINAL 2">
            <ScoreInput
              home={knockout.semi2_home}
              away={knockout.semi2_away}
              homeScore={knockout.semi2_home_score}
              awayScore={knockout.semi2_away_score}
              homePen={knockout.semi2_home_pen}
              awayPen={knockout.semi2_away_pen}
              prefix="semi2"
            />
            <TeamPicker field="semi2_home" />
            <TeamPicker field="semi2_away" />
          </Card>
        </div>

        <div className="col-span-2 flex flex-col items-center gap-14">
          <Card title="FINAL">
            <ScoreInput
              home={knockout.final_home}
              away={knockout.final_away}
              homeScore={knockout.final_home_score}
              awayScore={knockout.final_away_score}
              homePen={knockout.final_home_pen}
              awayPen={knockout.final_away_pen}
              prefix="final"
            />
            {knockout.final_winner && (
              <div className="mt-6 text-center font-bold text-yellow-400 text-xl flex items-center justify-center gap-2">
                <FaTrophy /> {knockout.final_winner} JUARA!
              </div>
            )}
          </Card>

          <Card title="JUARA 3">
            <ScoreInput
              home={knockout.third_home}
              away={knockout.third_away}
              homeScore={knockout.third_home_score}
              awayScore={knockout.third_away_score}
              homePen={knockout.third_home_pen}
              awayPen={knockout.third_away_pen}
              prefix="third"
            />
            {knockout.third_winner && (
              <div className="mt-6 text-center font-bold text-gray-200 text-xl flex items-center justify-center gap-2">
                <FaMedal /> {knockout.third_winner} JUARA 3
              </div>
            )}
          </Card>

          <ResultCard knockout={knockout} />
        </div>
      </div>

      <div className="flex gap-4 mt-12 no-screenshot">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-blue-900 font-bold rounded-xl shadow-lg transition cursor-pointer "
        >
          <FaSave /> Simpan Bracket
        </button>

        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-blue-900 font-bold rounded-xl shadow-lg transition cursor-pointer "
        >
          <FaRegClock /> Reset
        </button>

        <button
          onClick={handleScreenshot}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-blue-900 font-bold rounded-xl shadow-lg transition cursor-pointer "
        >
          <FaImage /> Screenshot
        </button>
      </div>
    </div>
  );
};

export default BabakGugur;
