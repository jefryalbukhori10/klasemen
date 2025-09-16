// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import BuatGrup from "./pages/BuatGrup";
import DaftarGrup from "./pages/DaftarGrup";
import Klasemen from "./pages/Klasemen";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/buat-grup" element={<BuatGrup />} />
        <Route path="/daftar-grup" element={<DaftarGrup />} />
        <Route path="/klasemen/:groupId" element={<Klasemen />} />
      </Routes>
    </Router>
  );
}

export default App;
