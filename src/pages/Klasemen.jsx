// // src/pages/Klasemen.jsx
// import React, { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import {
//   collection,
//   query,
//   where,
//   getDocs,
//   doc,
//   updateDoc,
//   getDoc,
// } from "firebase/firestore";
// import { db } from "../firebase";
// import { FaDownload, FaEdit, FaTimes } from "react-icons/fa";

// const Klasemen = () => {
//   const { groupId } = useParams();
//   const [teams, setTeams] = useState([]);
//   const [selectedTeam, setSelectedTeam] = useState(null); // tim yang mau diedit
//   const [formData, setFormData] = useState({}); // data form
//   const [showModal, setShowModal] = useState(false);
//   const [groupName, setGroupName] = useState("");

//   useEffect(() => {
//     const fetchTeams = async () => {
//       if (!groupId) return;

//       const q = query(collection(db, "tim"), where("idGrup", "==", groupId));
//       const querySnapshot = await getDocs(q);
//       const teamData = querySnapshot.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//       }));

//       // Hitung SG otomatis
//       teamData.forEach((team) => {
//         team.sg = (team.gm || 0) - (team.gk || 0);
//       });

//       // Urutkan berdasarkan poin → SG
//       teamData.sort((a, b) => {
//         if (b.poin !== a.poin) return b.poin - a.poin;
//         return (b.sg || 0) - (a.sg || 0);
//       });

//       setTeams(teamData);
//     };

//     fetchTeams();
//   }, [groupId]);

//   useEffect(() => {
//     const fetchGroupName = async () => {
//       if (!groupId) return;
//       const groupRef = doc(db, "grup", groupId);
//       const groupSnap = await getDoc(groupRef);
//       if (groupSnap.exists()) {
//         setGroupName(groupSnap.data().nama);
//       }
//     };

//     fetchGroupName();
//   }, [groupId]);

//   const handleEditClick = (team) => {
//     setSelectedTeam(team);
//     setFormData({
//       nama: team.nama,
//       main: team.main || 0,
//       menang: team.menang || 0,
//       seri: team.seri || 0,
//       kalah: team.kalah || 0,
//       gm: team.gm || 0,
//       gk: team.gk || 0,
//       poin: team.poin || 0,
//     });
//     setShowModal(true);
//   };

//   const handleChange = (e) => {
//     setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
//   };

//   const handleSave = async () => {
//     if (!selectedTeam) return;

//     const poin = Number(formData.menang) * 3 + Number(formData.seri) * 1;

//     const teamRef = doc(db, "tim", selectedTeam.id);
//     await updateDoc(teamRef, {
//       ...formData,
//       main: Number(formData.main),
//       menang: Number(formData.menang),
//       seri: Number(formData.seri),
//       kalah: Number(formData.kalah),
//       gm: Number(formData.gm),
//       gk: Number(formData.gk),
//       poin, // otomatis
//     });

//     setShowModal(false);
//     window.location.reload();
//   };

//   return (
//     <div
//       id="klasemenWrapper"
//       className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-700 via-blue-800 to-blue-900 p-6"
//     >
//       <div className="bg-blue-900/80 rounded-2xl shadow-2xl p-8 w-full max-w-6xl text-white">
//         <h1 className="text-3xl font-extrabold text-center mb-2">
//           PALAAN CUP 2025
//         </h1>
//         <h2 className="text-xl font-bold text-center text-yellow-400 mb-8">
//           Klasemen {groupName}
//         </h2>

//         <div className="overflow-x-auto">
//           <table className="w-full text-center border-separate border-spacing-y-3">
//             <thead>
//               <tr className="bg-white text-blue-900">
//                 <th className="py-3 px-2 rounded-l-lg">No.</th>
//                 <th className="py-3 px-2 text-left">TIM</th>
//                 <th className="py-3 px-2">M</th>
//                 <th className="py-3 px-2">M</th>
//                 <th className="py-3 px-2">S</th>
//                 <th className="py-3 px-2">K</th>
//                 <th className="py-3 px-2">GM</th>
//                 <th className="py-3 px-2">GK</th>
//                 <th className="py-3 px-2">SG</th>
//                 <th className="py-3 px-2">Poin</th>
//                 <th className="py-3 px-2">Aksi</th>
//               </tr>
//             </thead>
//             <tbody>
//               {teams.map((team, index) => (
//                 <tr
//                   key={team.id}
//                   className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-md"
//                 >
//                   <td>{index + 1}</td>
//                   <td className="py-3 px-2 text-left font-semibold">
//                     {team.nama}
//                   </td>
//                   <td className="py-3 px-2">{team.main || 0}</td>
//                   <td className="py-3 px-2">{team.menang || 0}</td>
//                   <td className="py-3 px-2">{team.seri || 0}</td>
//                   <td className="py-3 px-2">{team.kalah || 0}</td>
//                   <td className="py-3 px-2">{team.gm || 0}</td>
//                   <td className="py-3 px-2">{team.gk || 0}</td>
//                   <td className="py-3 px-2">{team.sg || 0}</td>
//                   <td className="py-3 px-2 font-bold">{team.poin || 0}</td>

//                   <td className="py-3 px-2 flex justify-center">
//                     <button
//                       onClick={() => handleEditClick(team)}
//                       className="bg-yellow-400 text-blue-900 px-3 py-2 rounded-lg hover:bg-yellow-300 transition flex items-center gap-1"
//                     >
//                       <FaEdit /> Edit
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Modal Edit */}
//       {showModal && (
//         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50">
//           <div className="bg-white/95 rounded-2xl shadow-2xl p-8 w-full max-w-lg relative">
//             {/* Tombol close */}
//             <button
//               onClick={() => setShowModal(false)}
//               className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition cursor-pointer"
//             >
//               <FaTimes size={22} />
//             </button>

//             {/* Judul */}
//             <h2 className="text-2xl font-extrabold text-center mb-6 text-blue-800">
//               ✏️ Edit Tim{" "}
//               <span className="text-yellow-500">{selectedTeam?.nama}</span>
//             </h2>

//             {/* Form input */}
//             <div className="grid grid-cols-2 gap-5">
//               {["main", "menang", "seri", "kalah", "gm", "gk"].map((field) => (
//                 <div key={field} className="flex flex-col">
//                   <label className="text-sm font-semibold text-gray-700 mb-1 capitalize">
//                     {field}
//                   </label>
//                   <input
//                     type="number"
//                     name={field}
//                     value={formData[field]}
//                     onChange={handleChange}
//                     className="p-3 rounded-xl border border-gray-300 bg-white/80 shadow-sm focus:ring-2 focus:ring-yellow-400 outline-none"
//                   />
//                 </div>
//               ))}
//             </div>
//             {/* Poin otomatis */}
//             <div className="flex flex-col mt-4">
//               <label className="text-sm font-semibold text-gray-700 mb-1">
//                 Poin
//               </label>
//               <input
//                 type="number"
//                 value={formData.menang * 3 + formData.seri * 1}
//                 readOnly
//                 className="p-3 rounded-xl border border-gray-300 bg-yellow-100 text-yellow-700 font-bold shadow-sm"
//               />
//             </div>

//             {/* Tombol simpan */}
//             <div className="mt-8 flex justify-center gap-4">
//               <button
//                 onClick={() => setShowModal(false)}
//                 className="px-6 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold transition cursor-pointer"
//               >
//                 ❌ Batal
//               </button>
//               <button
//                 onClick={handleSave}
//                 className="px-6 py-2 rounded-xl bg-yellow-500 hover:bg-yellow-600 text-white font-semibold shadow-md transition cursor-pointer"
//               >
//                 💾 Simpan
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Klasemen;

// src/pages/Klasemen.jsx
import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import {
  FaDownload,
  FaEdit,
  FaTimes,
  FaCamera,
  FaFileImage,
  FaArrowLeft,
} from "react-icons/fa";
import html2canvas from "html2canvas-pro";

const Klasemen = () => {
  const { groupId } = useParams();
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [formData, setFormData] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const tableRef = useRef(null); // ⬅️ ref untuk screenshot

  useEffect(() => {
    const fetchTeams = async () => {
      if (!groupId) return;
      const q = query(collection(db, "tim"), where("idGrup", "==", groupId));
      const querySnapshot = await getDocs(q);
      const teamData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      teamData.forEach((team) => {
        team.sg = (team.gm || 0) - (team.gk || 0);
      });

      teamData.sort((a, b) => {
        if (b.poin !== a.poin) return b.poin - a.poin;
        return (b.sg || 0) - (a.sg || 0);
      });

      setTeams(teamData);
    };

    fetchTeams();
  }, [groupId]);

  useEffect(() => {
    const fetchGroupName = async () => {
      if (!groupId) return;
      const groupRef = doc(db, "grup", groupId);
      const groupSnap = await getDoc(groupRef);
      if (groupSnap.exists()) {
        setGroupName(groupSnap.data().nama);
      }
    };
    fetchGroupName();
  }, [groupId]);

  const handleEditClick = (team) => {
    setSelectedTeam(team);
    setFormData({
      nama: team.nama,
      main: team.main || 0,
      menang: team.menang || 0,
      seri: team.seri || 0,
      kalah: team.kalah || 0,
      gm: team.gm || 0,
      gk: team.gk || 0,
      poin: team.poin || 0,
    });
    setShowModal(true);
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    if (!selectedTeam) return;

    const poin = Number(formData.menang) * 3 + Number(formData.seri) * 1;
    const teamRef = doc(db, "tim", selectedTeam.id);

    await updateDoc(teamRef, {
      ...formData,
      main: Number(formData.main),
      menang: Number(formData.menang),
      seri: Number(formData.seri),
      kalah: Number(formData.kalah),
      gm: Number(formData.gm),
      gk: Number(formData.gk),
      poin,
    });

    setShowModal(false);
    window.location.reload();
  };

  // 📸 Fungsi screenshot
  const handleScreenshot = async () => {
    if (!tableRef.current) return;
    const canvas = await html2canvas(tableRef.current, {
      ignoreElements: (el) => el.classList.contains("no-screenshot"),
    });
    const dataUrl = canvas.toDataURL("image/jpg");
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `klasemen-${groupName}.jpg`;
    link.click();
  };

  const navigate = useNavigate();

  return (
    <div
      id="klasemenWrapper"
      className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-700 via-blue-800 to-blue-900 p-6"
    >
      {/* 🔙 Tombol kembali */}
      <button
        onClick={() => navigate("/daftar-grup")}
        className="absolute top-4 left-4 flex items-center gap-2 bg-white cursor-pointer hover:bg-blue-900 text-blue-900 hover:text-white px-4 py-2 rounded-lg shadow-md transition"
      >
        <FaArrowLeft />
      </button>
      <div
        ref={tableRef} // ⬅️ area yang akan di-screenshot
        className="bg-blue-900 shadow-2xl p-8 w-full max-w-6xl text-white"
      >
        <h1 className="text-3xl font-extrabold text-center mb-2">
          PALAAN CUP 2025
        </h1>
        <h2 className="text-xl font-bold text-center text-yellow-400 mb-8">
          Klasemen {groupName}
        </h2>

        {/* Tombol Screenshot */}
        <button
          onClick={handleScreenshot}
          className="mt-6 no-screenshot flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-700 hover:bg-blue-800 cursor-pointer text-white font-bold shadow-lg transition"
        >
          <FaDownload /> Download Klasemen
        </button>

        <div className="overflow-x-auto">
          <table className="w-full text-center border-separate border-spacing-y-3">
            <thead>
              <tr className="bg-white text-blue-900">
                <th className="py-3 px-2 rounded-l-lg">No.</th>
                <th className="py-3 px-2 text-left">TIM</th>
                <th className="py-3 px-2">M</th>
                <th className="py-3 px-2">M</th>
                <th className="py-3 px-2">S</th>
                <th className="py-3 px-2">K</th>
                <th className="py-3 px-2">GM</th>
                <th className="py-3 px-2">GK</th>
                <th className="py-3 px-2">SG</th>
                <th className="py-3 px-2">Poin</th>
                <th className="py-3 px-2 no-screenshot">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((team, index) => (
                <tr
                  key={team.id}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-md"
                >
                  <td>{index + 1}</td>
                  <td className="py-3 px-2 text-left font-semibold">
                    {team.nama}
                  </td>
                  <td className="py-3 px-2">{team.main || 0}</td>
                  <td className="py-3 px-2">{team.menang || 0}</td>
                  <td className="py-3 px-2">{team.seri || 0}</td>
                  <td className="py-3 px-2">{team.kalah || 0}</td>
                  <td className="py-3 px-2">{team.gm || 0}</td>
                  <td className="py-3 px-2">{team.gk || 0}</td>
                  <td className="py-3 px-2">{team.sg || 0}</td>
                  <td className="py-3 px-2 font-bold">{team.poin || 0}</td>
                  <td className="py-3 px-2 flex justify-center no-screenshot">
                    <button
                      onClick={() => handleEditClick(team)}
                      className="bg-yellow-400 text-blue-900 px-3 py-2 rounded-lg hover:bg-yellow-300 transition flex items-center gap-1 cursor-pointer"
                    >
                      <FaEdit /> Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white/95 rounded-2xl shadow-2xl p-8 w-full max-w-lg relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition cursor-pointer"
            >
              <FaTimes size={22} />
            </button>
            <h2 className="text-2xl font-extrabold text-center mb-6 text-blue-800">
              ✏️ Edit Tim{" "}
              <span className="text-yellow-500">{selectedTeam?.nama}</span>
            </h2>
            <div className="grid grid-cols-2 gap-5">
              {["main", "menang", "seri", "kalah", "gm", "gk"].map((field) => (
                <div key={field} className="flex flex-col">
                  <label className="text-sm font-semibold text-gray-700 mb-1 capitalize">
                    {field}
                  </label>
                  <input
                    type="number"
                    name={field}
                    value={formData[field]}
                    onChange={handleChange}
                    className="p-3 rounded-xl border border-gray-300 bg-white/80 shadow-sm focus:ring-2 focus:ring-yellow-400 outline-none"
                  />
                </div>
              ))}
            </div>
            <div className="flex flex-col mt-4">
              <label className="text-sm font-semibold text-gray-700 mb-1">
                Poin
              </label>
              <input
                type="number"
                value={formData.menang * 3 + formData.seri * 1}
                readOnly
                className="p-3 rounded-xl border border-gray-300 bg-yellow-100 text-yellow-700 font-bold shadow-sm"
              />
            </div>
            <div className="mt-8 flex justify-center gap-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold transition cursor-pointer"
              >
                ❌ Batal
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 rounded-xl bg-yellow-500 hover:bg-yellow-600 text-white font-semibold shadow-md transition cursor-pointer"
              >
                💾 Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Klasemen;
