import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [kategori, setKategori] = useState("semua");
  const [loading, setLoading] = useState(true);
  const nama = localStorage.getItem("nama");
  const navigate = useNavigate();

  const fetchProducts = async (kat) => {
    setLoading(true);
    try {
      const url = kat === "semua" ? "/products" : `/products?kategori=${kat}`;
      const res = await API.get(url);
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");
    else fetchProducts("semua");
  }, []);

  const handleKategori = (k) => {
    setKategori(k);
    fetchProducts(k);
  };

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const formatHarga = (h) => "Rp " + Number(h).toLocaleString("id-ID");

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body, #root { height: 100%; width: 100%; }
        .db-root { min-height: 100vh; background: #020b18; font-family: 'DM Sans', sans-serif; color: #fff; }
        .db-nav { display: flex; align-items: center; justify-content: space-between; padding: 18px 48px; background: #040f1e; border-bottom: 1px solid #0d2440; position: sticky; top: 0; z-index: 100; }
        .db-brand { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800; color: #fff; }
        .db-brand span { color: #0057ff; }
        .db-nav-right { display: flex; align-items: center; gap: 20px; }
        .db-greeting { font-size: 14px; color: #4a6380; }
        .db-greeting strong { color: #fff; }
        .db-logout { padding: 8px 18px; background: transparent; border: 1px solid #0d2440; border-radius: 8px; color: #4a6380; font-size: 13px; cursor: pointer; transition: all 0.2s; font-family: 'DM Sans', sans-serif; }
        .db-logout:hover { border-color: #ff4444; color: #ff4444; }
        .db-hero { padding: 48px 48px 32px; background: linear-gradient(180deg, #040f1e 0%, #020b18 100%); border-bottom: 1px solid #0d2440; position: relative; overflow: hidden; }
        .db-hero::before { content: ''; position: absolute; width: 600px; height: 600px; background: radial-gradient(circle, #0057ff15, transparent 70%); top: -200px; right: -100px; border-radius: 50%; }
        .db-hero h1 { font-family: 'Syne', sans-serif; font-size: 40px; font-weight: 800; letter-spacing: -1px; margin-bottom: 8px; }
        .db-hero h1 span { background: linear-gradient(135deg, #0057ff, #00c6ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .db-hero p { color: #4a6380; font-size: 15px; font-weight: 300; }
        .db-filter { display: flex; gap: 10px; padding: 28px 48px; }
        .db-filter-btn { padding: 9px 22px; border-radius: 8px; border: 1px solid #0d2440; background: transparent; color: #4a6380; font-size: 14px; cursor: pointer; transition: all 0.2s; font-family: 'DM Sans', sans-serif; }
        .db-filter-btn:hover { border-color: #0057ff; color: #0099ff; }
        .db-filter-btn.active { background: #0057ff; border-color: #0057ff; color: #fff; }
        .db-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 20px; padding: 0 48px 48px; }
        .db-card { background: #040f1e; border: 1px solid #0d2440; border-radius: 14px; overflow: hidden; transition: all 0.2s; }
        .db-card:hover { border-color: #0057ff; transform: translateY(-4px); box-shadow: 0 12px 30px #0057ff20; }
        .db-card-img { width: 100%; height: 320px; background: #071525; display: block; align-items: center; justify-content: center; font-size: 48px; border-bottom: 1px solid #0d2440; }

        .db-card-body { padding: 18px; }
        .db-card-kategori { font-size: 16px; text-transform: uppercase; letter-spacing: 1px; color: #0099ff; font-weight: 500; margin-bottom: 6px; }
        .db-card-nama { font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 700; color: #fff; margin-bottom: 6px; }
        .db-card-desc { font-size: 13px; color: #4a6380; font-weight: 300; margin-bottom: 14px; line-height: 1.5; }
        .db-card-footer { display: flex; align-items: center; justify-content: space-between; }
        .db-card-harga { font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700; color: #0099ff; }
        .db-card-harga span { font-family: 'DM Sans', sans-serif; font-size: 11px; color: #4a6380; font-weight: 300; }
        .db-card-stok { font-size: 12px; padding: 4px 10px; border-radius: 6px; background: #071525; border: 1px solid #0d2440; color: #4a6380; }
        .db-card-stok.available { border-color: #00c6ff30; color: #00c6ff; }
        .db-loading { text-align: center; padding: 80px; color: #4a6380; font-size: 15px; }
        .db-empty { text-align: center; padding: 80px; color: #4a6380; }
        .db-empty h3 { font-family: 'Syne', sans-serif; margin-bottom: 8px; color: #fff; }
      `}</style>

      <div className="db-root">
        <nav className="db-nav">
          <div className="db-brand">Rent<span>Tech</span></div>
          <div className="db-nav-right">
            <button className="db-logout" onClick={() => navigate("/riwayat")} style={{borderColor:"#0d2440", color:"#4a6380"}}>
            Riwayat Sewa
            </button>
            <span className="db-greeting">Halo, <strong>{nama}</strong></span>
            <button className="db-logout" onClick={logout}>Keluar</button>
          </div>
        </nav>

        <div className="db-hero">
          <h1>Katalog <span>Produk</span></h1>
          <p>Temukan perangkat teknologi yang kamu butuhkan</p>
        </div>

        <div className="db-filter">
          {["semua", "HP", "Kamera"].map((k) => (
            <button key={k} className={`db-filter-btn ${kategori === k ? "active" : ""}`} onClick={() => handleKategori(k)}>
              {k === "semua" ? "Semua" : k}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="db-loading">Memuat produk...</div>
        ) : products.length === 0 ? (
          <div className="db-empty">
            <h3>Tidak ada produk</h3>
            <p>Belum ada produk dalam kategori ini</p>
          </div>
        ) : (
          <div className="db-grid">
            {products.map((p) => (
            <div key={p._id} className="db-card">
               <div className="db-card-img">
  {p.gambar ? (
    <img 
     src={p.gambar}
      alt={p.nama_produk}
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
    />
  ) : (
    <span>{p.nama_kategori === "HP" ? "📱" : "📷"}</span>
  )}
</div>
                <div className="db-card-body">
                  <div className="db-card-kategori">{p.nama_kategori}</div>
                  <div className="db-card-nama">{p.nama_produk}</div>
                  <div className="db-card-desc">{p.deskripsi}</div>
                  <div className="db-card-footer">
                    <div className="db-card-harga">{formatHarga(p.harga_sewa)} <span>/hari</span></div>
                    <div style={{display:"flex", gap:8, alignItems:"center"}}>
                      <span className={`db-card-stok ${p.stok > 0 ? "available" : ""}`}>
                        {p.stok > 0 ? `Stok: ${p.stok}` : "Habis"}
                      </span>
                      {p.stok > 0 && (
                        <button
                        onClick={() => navigate(`/booking/${p._id}`)}
                        style={{padding:"4px 12px", background:"#0057ff", color:"#fff", border:"none", borderRadius:6, fontSize:12, cursor:"pointer"}}
                        >
                          Sewa
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}