import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import API from "../services/api";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function FlyTo({ location }) {
  const map = useMap();
  useEffect(() => {
    if (location) map.flyTo([location.lat, location.lng], 16);
  }, [location]);
  return null;
}

export default function Pengembalian() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rental, setRental] = useState(null);
  const [location, setLocation] = useState(null);
  const [alamat, setAlamat] = useState("");
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSug, setShowSug] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingGPS, setLoadingGPS] = useState(false);
  const [konfirmasi, setKonfirmasi] = useState(false);
  const debounceRef = useRef(null);

useEffect(() => {
  API.get(`/rentals/${id}`).then((res) => {
    console.log("rental data:", res.data);
    setRental(res.data);
  });
}, [id]);

  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      );
      const data = await res.json();
      return data.display_name || `${lat}, ${lng}`;
    } catch {
      return `${lat}, ${lng}`;
    }
  };

  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      alert("Browser tidak mendukung geolocation.");
      return;
    }
    setLoadingGPS(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const addr = await reverseGeocode(lat, lng);
        setLocation({ lat, lng });
        setAlamat(addr);
        setQuery(addr);
        setLoadingGPS(false);
      },
      () => {
        alert("Gagal mendapatkan lokasi. Pastikan izin lokasi diaktifkan.");
        setLoadingGPS(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleQueryChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.length < 3) { setSuggestions([]); return; }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(val)}&format=json&addressdetails=1&limit=5&countrycodes=id`
        );
        const data = await res.json();
        setSuggestions(data);
        setShowSug(true);
      } catch { setSuggestions([]); }
    }, 400);
  };

  const handleSelectSuggestion = (item) => {
    setLocation({ lat: parseFloat(item.lat), lng: parseFloat(item.lon) });
    setAlamat(item.display_name);
    setQuery(item.display_name);
    setSuggestions([]);
    setShowSug(false);
  };

  const handleSubmit = async () => {
    if (!location) {
      alert("Tentukan lokasi pengembalian terlebih dahulu!");
      return;
    }
    setLoading(true);
    try {
      await API.put(`/rentals/${id}/kembalikan`, {
        latitude_kembali: location.lat,
        longitude_kembali: location.lng,
        alamat_kembali: alamat,
        tanggal_kembali: new Date().toISOString(),
      });
      navigate(`/riwayat`, { state: { successReturn: true } });
    } catch (err) {
      alert("Gagal mengembalikan: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const formatTanggal = (d) =>
    d ? new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "-";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body, #root { height: 100%; width: 100%; }
        .pk-root { min-height: 100vh; background: #020b18; font-family: 'DM Sans', sans-serif; color: #fff; }
        .pk-nav { display: flex; align-items: center; justify-content: space-between; padding: 18px 48px; background: #040f1e; border-bottom: 1px solid #0d2440; }
        .pk-brand { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800; cursor: pointer; }
        .pk-brand span { color: #0057ff; }
        .pk-back { padding: 8px 18px; background: transparent; border: 1px solid #0d2440; border-radius: 8px; color: #4a6380; font-size: 13px; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.2s; }
        .pk-back:hover { border-color: #0057ff; color: #0099ff; }
        .pk-body { max-width: 680px; margin: 0 auto; padding: 40px 24px; display: flex; flex-direction: column; gap: 20px; }
        .pk-card { background: #040f1e; border: 1px solid #0d2440; border-radius: 14px; padding: 24px; }
        .pk-card h3 { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700; margin-bottom: 18px; }
        .pk-info-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #0d2440; font-size: 14px; }
        .pk-info-row:last-child { border-bottom: none; }
        .pk-info-label { color: #4a6380; }
        .pk-info-val { font-weight: 500; }
        .pk-map-hint { font-size: 12px; color: #4a6380; margin-bottom: 10px; }
        .pk-gps-btn { width: 100%; padding: 11px; background: #071525; border: 1px dashed #0057ff60; border-radius: 8px; color: #0099ff; font-size: 14px; font-family: 'DM Sans', sans-serif; cursor: pointer; margin-bottom: 12px; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .pk-gps-btn:hover { background: #0d2440; border-color: #0057ff; }
        .pk-gps-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .pk-search-wrap { position: relative; margin-bottom: 12px; }
        .pk-search-input { width: 100%; padding: 12px 14px 12px 40px; background: #071525; border: 1px solid #0d2440; border-radius: 8px; color: #fff; font-size: 14px; font-family: 'DM Sans', sans-serif; outline: none; transition: all 0.2s; }
        .pk-search-input:focus { border-color: #0057ff; box-shadow: 0 0 0 3px #0057ff18; }
        .pk-search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); font-size: 16px; }
        .pk-suggestions { position: absolute; top: 100%; left: 0; right: 0; background: #071525; border: 1px solid #0d2440; border-radius: 8px; z-index: 1000; max-height: 200px; overflow-y: auto; margin-top: 4px; }
        .pk-sug-item { padding: 11px 14px; cursor: pointer; font-size: 13px; color: #cdd6e0; border-bottom: 1px solid #0d2440; transition: background 0.15s; display: flex; gap: 10px; }
        .pk-sug-item:last-child { border-bottom: none; }
        .pk-sug-item:hover { background: #0d2440; color: #fff; }
        .pk-map-wrap { border-radius: 10px; overflow: hidden; border: 1px solid #0d2440; margin-bottom: 14px; }
        .pk-loc-confirmed { background: #071525; border: 1px solid #00c27630; border-radius: 8px; padding: 12px 14px; font-size: 13px; color: #00c276; margin-bottom: 14px; display: flex; gap: 8px; align-items: flex-start; line-height: 1.5; }
        .pk-submit { width: 100%; padding: 14px; background: linear-gradient(135deg, #00c276, #0099ff); color: #fff; border: none; border-radius: 10px; font-size: 15px; font-weight: 500; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.2s; }
        .pk-submit:hover { transform: translateY(-1px); box-shadow: 0 8px 25px #00c27640; }
        .pk-submit:disabled { opacity: 0.6; cursor: not-allowed; }
        .pk-modal-bg { position: fixed; inset: 0; background: #00000090; z-index: 1000; display: flex; align-items: flex-start; justify-content: center; padding: 20px; overflow-y: auto; }
        .pk-modal { background: #040f1e; border: 1px solid #0d2440; border-radius: 16px; padding: 32px; max-width: 420px; width: 100%; position: relative; margin-top: 80px; }
        .pk-modal-bar { position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, #00c276, #0099ff, transparent); border-radius: 16px 16px 0 0; }
        .pk-modal h3 { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700; margin-bottom: 12px; }
        .pk-modal p { font-size: 14px; color: #cdd6e0; line-height: 1.6; margin-bottom: 10px; }
        .pk-modal-addr { background: #071525; border: 1px solid #0d2440; border-radius: 8px; padding: 10px 12px; font-size: 13px; color: #0099ff; margin-bottom: 20px; line-height: 1.5; }
        .pk-modal-btns { display: flex; gap: 10px; }
        .pk-modal-cancel { flex: 1; padding: 12px; background: transparent; border: 1px solid #0d2440; border-radius: 8px; color: #4a6380; font-size: 14px; cursor: pointer; font-family: 'DM Sans', sans-serif; }
        .pk-modal-ok { flex: 1; padding: 12px; background: linear-gradient(135deg, #00c276, #0099ff); color: #fff; border: none; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; font-family: 'DM Sans', sans-serif; }
        @media (max-width: 600px) { .pk-nav { padding: 14px 16px; } .pk-body { padding: 24px 16px; } }
      `}</style>

      <div className="pk-root">
        {konfirmasi && (
          <div className="pk-modal-bg">
            <div className="pk-modal">
              <div className="pk-modal-bar" />
              <h3>Konfirmasi Pengembalian</h3>
              <p>Pastikan lokasi pengembalian sudah benar:</p>
              <div className="pk-modal-addr">📍 {alamat}</div>
              <p>Pengembalian akan dicatat pada <strong style={{ color: "#fff" }}>{new Date().toLocaleString("id-ID")}</strong>.</p>
              <div className="pk-modal-btns">
                <button className="pk-modal-cancel" onClick={() => setKonfirmasi(false)}>Batal</button>
                <button className="pk-modal-ok" onClick={() => { setKonfirmasi(false); handleSubmit(); }}>
                  Ya, Kembalikan
                </button>
              </div>
            </div>
          </div>
        )}

        <nav className="pk-nav">
          <div className="pk-brand" onClick={() => navigate("/dashboard")}>Rent<span>Tech</span></div>
          <button className="pk-back" onClick={() => navigate("/riwayat")}>← Riwayat Sewa</button>
        </nav>

        <div className="pk-body">
          <div className="pk-card">
            <h3>Detail Sewa</h3>
            {rental ? (
              <>
                <div className="pk-info-row">
                  <span className="pk-info-label">Produk</span>
                  <span className="pk-info-val">{rental.product_id?.nama_produk || "Produk Dihapus"}</span>
                </div>
                <div className="pk-info-row">
                  <span className="pk-info-label">Tanggal Mulai</span>
                  <span className="pk-info-val">{formatTanggal(rental.tanggal_mulai)}</span>
                </div>
                <div className="pk-info-row">
                  <span className="pk-info-label">Tanggal Selesai</span>
                  <span className="pk-info-val">{formatTanggal(rental.tanggal_selesai)}</span>
                </div>
                <div className="pk-info-row">
                  <span className="pk-info-label">Lokasi Pickup</span>
                  <span className="pk-info-val" style={{ maxWidth: 260, textAlign: "right", fontSize: 13, color: "#4a6380" }}>
                    {rental.alamat_pickup || "-"}
                  </span>
                </div>
              </>
            ) : (
              <p style={{ color: "#4a6380", fontSize: 14 }}>Memuat data...</p>
            )}
          </div>

          <div className="pk-card">
            <h3>Lokasi Pengembalian</h3>
            <p className="pk-map-hint">Gunakan GPS atau ketik alamat tempat kamu mengembalikan perangkat.</p>

            <button className="pk-gps-btn" onClick={handleDetectGPS} disabled={loadingGPS}>
              {loadingGPS ? "⏳ Mendeteksi lokasi..." : "📡 Gunakan lokasi saya sekarang (GPS)"}
            </button>

            <div className="pk-search-wrap">
              <span className="pk-search-icon">📍</span>
              <input
                className="pk-search-input"
                placeholder="Atau ketik alamat pengembalian..."
                value={query}
                onChange={handleQueryChange}
                onFocus={() => suggestions.length > 0 && setShowSug(true)}
              />
              {showSug && suggestions.length > 0 && (
                <div className="pk-suggestions">
                  {suggestions.map((item, i) => (
                    <div key={i} className="pk-sug-item" onClick={() => handleSelectSuggestion(item)}>
                      <span>📍</span>
                      <span>{item.display_name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pk-map-wrap">
              <MapContainer center={[-6.2088, 106.8456]} zoom={12} style={{ height: 260, width: "100%" }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <FlyTo location={location} />
                {location && <Marker position={[location.lat, location.lng]} />}
              </MapContainer>
            </div>

            {location && (
              <div className="pk-loc-confirmed">
                ✅ <span>{alamat}</span>
              </div>
            )}

            <button
              className="pk-submit"
              disabled={loading || !location}
              onClick={() => setKonfirmasi(true)}
            >
              {loading ? "Memproses..." : "Kembalikan Perangkat"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}