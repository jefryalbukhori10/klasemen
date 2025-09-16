import { Link } from "react-router-dom";
import { FaPlusCircle, FaListUl, FaSitemap } from "react-icons/fa";

function Home() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* 🌈 Background gradient animasi */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-400 via-blue-500 to-indigo-600 animate-gradient-x"></div>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>

      {/* 🏆 Judul */}
      <div className="relative text-center mb-16">
        <h1 className="text-5xl md:text-6xl font-extrabold text-white drop-shadow-xl tracking-wide">
          🏆 <span className="text-yellow-300">Palaan Cup 2025</span>
        </h1>
        <p className="mt-4 text-lg text-white/80 font-medium drop-shadow">
          Turnamen sepak bola antar desa yang penuh gengsi ⚽🔥
        </p>
      </div>

      {/* Menu */}
      <div className="relative grid gap-8 w-full max-w-md">
        <Link
          to="/buat-grup"
          className="flex items-center justify-between px-8 py-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg text-lg md:text-xl font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:bg-white/20"
        >
          <div className="flex items-center gap-3">
            <FaPlusCircle className="text-yellow-300 text-3xl" />
            Buat Grup
          </div>
          <span className="text-white/70 text-sm">➜</span>
        </Link>

        <Link
          to="/daftar-grup"
          className="flex items-center justify-between px-8 py-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg text-lg md:text-xl font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:bg-white/20"
        >
          <div className="flex items-center gap-3">
            <FaListUl className="text-yellow-300 text-3xl" />
            Daftar Grup
          </div>
          <span className="text-white/70 text-sm">➜</span>
        </Link>

        <Link
          to="/babak-gugur"
          className="flex items-center justify-between px-8 py-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg text-lg md:text-xl font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:bg-white/20"
        >
          <div className="flex items-center gap-3">
            <FaSitemap className="text-yellow-300 text-3xl" />
            Babak Gugur
          </div>
          <span className="text-white/70 text-sm">➜</span>
        </Link>
      </div>

      {/* Footer kecil */}
      <p className="absolute bottom-5 text-white/60 text-sm tracking-wide">
        © 2025 Palaan Cup — All Rights Reserved
      </p>
    </div>
  );
}

export default Home;
