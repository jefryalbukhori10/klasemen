import { Link } from "react-router-dom";
import { FaPlusCircle, FaListUl } from "react-icons/fa";

function Home() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* 🌈 Background animasi gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-400 via-blue-500 to-indigo-600 animate-gradient-x"></div>
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>

      {/* 🏆 Judul */}
      <h1 className="relative text-5xl md:text-6xl font-extrabold text-center text-white drop-shadow-lg mb-16 tracking-wide">
        🏆 <span className="text-yellow-300">Palaan Cup 2025</span>
      </h1>

      {/* Menu */}
      <div className="relative grid gap-8 w-full max-w-sm">
        <Link
          to="/buat-grup"
          className="flex items-center justify-center gap-3 px-10 py-5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg text-xl font-semibold text-white transition transform hover:scale-105 hover:shadow-2xl hover:bg-white/20"
        >
          <FaPlusCircle className="text-yellow-300 text-2xl" />
          Buat Grup
        </Link>

        <Link
          to="/daftar-grup"
          className="flex items-center justify-center gap-3 px-10 py-5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg text-xl font-semibold text-white transition transform hover:scale-105 hover:shadow-2xl hover:bg-white/20"
        >
          <FaListUl className="text-yellow-300 text-2xl" />
          Daftar Grup
        </Link>
      </div>
    </div>
  );
}

export default Home;
