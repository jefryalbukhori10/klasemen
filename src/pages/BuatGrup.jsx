// src/pages/BuatGrup.jsx
import { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { FaUsers, FaPlus, FaSave, FaArrowLeft } from "react-icons/fa";
import Swal from "sweetalert2";

const BuatGrup = () => {
  const [namaGrup, setNamaGrup] = useState("");
  const [tim, setTim] = useState([""]);
  const navigate = useNavigate();

  const handleAddTim = () => {
    setTim([...tim, ""]);
  };

  const handleChangeTim = (value, index) => {
    const newTim = [...tim];
    newTim[index] = value;
    setTim(newTim);
  };

  const handleSimpan = async () => {
    if (!namaGrup) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "warning",
        title: "Nama grup wajib diisi!",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
      return;
    }

    try {
      // 1. Simpan grup
      const grupRef = await addDoc(collection(db, "grup"), {
        nama: namaGrup,
        createdAt: new Date(),
      });

      // 2. Simpan tim ke tabel tim
      const timCollection = collection(db, "tim");
      for (let t of tim.filter((t) => t.trim() !== "")) {
        await addDoc(timCollection, {
          idGrup: grupRef.id,
          nama: t,
          main: 0,
          menang: 0,
          seri: 0,
          kalah: 0,
          golMasuk: 0,
          golKebobolan: 0,
          poin: 0,
          gm: 0,
          gk: 0,
        });
      }

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Grup & Tim berhasil disimpan 🎉",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
      navigate("/daftar-grup");
    } catch (err) {
      console.error("Error:", err);
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: "Gagal menyimpan data!",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex justify-center items-center p-6 relative overflow-hidden">
      {/* Background dekorasi */}
      {/* 🔙 Tombol kembali */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-4 left-4 flex items-center gap-2 bg-white cursor-pointer hover:bg-blue-900 text-blue-900 hover:text-white px-4 py-2 rounded-lg shadow-md transition"
      >
        <FaArrowLeft />
      </button>
      <div className="absolute w-96 h-96 bg-white/10 rounded-full blur-3xl top-10 left-10"></div>
      <div className="absolute w-96 h-96 bg-pink-300/20 rounded-full blur-3xl bottom-10 right-10"></div>

      {/* Card */}
      <div className="relative bg-white/20 backdrop-blur-xl shadow-2xl rounded-3xl p-10 w-full max-w-lg border border-white/30">
        <h2 className="text-3xl font-extrabold text-center text-white drop-shadow mb-8 flex items-center justify-center gap-3">
          <FaUsers /> Buat Grup Baru
        </h2>

        {/* Input Nama Grup */}
        <label className="block mb-2 text-white font-medium">Nama Grup</label>
        <input
          type="text"
          placeholder="Contoh: Grup A"
          value={namaGrup}
          onChange={(e) => setNamaGrup(e.target.value)}
          className="w-full p-3 mb-6 rounded-xl border border-white/30 bg-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-pink-400"
        />

        {/* Input Nama Tim */}
        <label className="block mb-2 text-white font-medium">Daftar Tim</label>
        {tim.map((t, index) => (
          <input
            key={index}
            type="text"
            placeholder={`Nama Tim ${index + 1}`}
            value={t}
            onChange={(e) => handleChangeTim(e.target.value, index)}
            className="w-full p-3 mb-3 rounded-xl border border-white/30 bg-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        ))}

        {/* Tambah Tim */}
        <button
          onClick={handleAddTim}
          className="w-full bg-gradient-to-r from-gray-200 to-gray-300 text-gray-800 py-2 rounded-xl font-semibold hover:scale-105 transition flex items-center justify-center gap-2 mb-6 cursor-pointer"
        >
          <FaPlus /> Tambah Tim
        </button>

        {/* Simpan */}
        <button
          onClick={handleSimpan}
          className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <FaSave /> Simpan Grup
        </button>
      </div>
    </div>
  );
};

export default BuatGrup;
