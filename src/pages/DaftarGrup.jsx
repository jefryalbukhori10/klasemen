// src/pages/DaftarGrup.jsx
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { FaArrowLeft, FaUsers } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const DaftarGrup = () => {
  const [grup, setGrup] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const snapshot = await getDocs(collection(db, "grup"));
      setGrup(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    fetchData();
  }, []);

  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-blue-500 to-purple-600 p-6">
      <h2 className="relative text-4xl md:text-5xl font-extrabold text-center text-white drop-shadow-lg mb-12 tracking-wide">
        Daftar Grup <span className="text-yellow-300">Palaan Cup 2025</span>
      </h2>

      <div className="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-6">
        {/* 🔙 Tombol kembali */}
        <button
          onClick={() => navigate("/")}
          className="absolute top-4 left-4 flex items-center gap-2 bg-white cursor-pointer hover:bg-blue-900 text-blue-900 hover:text-white px-4 py-2 rounded-lg shadow-md transition"
        >
          <FaArrowLeft />
        </button>
        {grup.map((g) => (
          <div
            onClick={() => navigate(`/klasemen/${g.id}`)}
            key={g.id}
            className="bg-white/20 backdrop-blur-lg shadow-lg rounded-2xl p-6 flex items-center justify-center border border-white/30 hover:scale-105 transition cursor-pointer"
          >
            <h3 className="text-2xl font-bold text-white flex items-center gap-3">
              <FaUsers className="text-yellow-300" /> {g.nama}
            </h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DaftarGrup;
