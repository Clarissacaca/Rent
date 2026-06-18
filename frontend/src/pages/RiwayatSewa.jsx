import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

export default function RiwayatSewa() {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();


  const user_id = localStorage.getItem("token")
    ? JSON.parse(atob(localStorage.getItem("token").split(".")[1])).id
    : null;

  useEffect(() => {
    if (!user_id) { navigate("/login"); return; }
    fetchRentals();
  }, []);

  const fetchRentals = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/rentals/user/${user_id}`);
      setRentals(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };


  const formatHarga = (h) => "Rp " + Number(h).toLocaleString("id-ID");
  const formatDate = (d) => new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  const formatDateTime = (d) => new Date(d).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

  const getStatusStyle = (status) => {
    if (status === "pending") return { bg: "#ff990020", border: "#ff990040", color: "#ffaa00" };
    if (status === "approved") return { bg: "#0057ff20", border: "#0057ff40", color: "#0099ff" };
    if (status === "ongoing") return { bg: "#7c3aed20", border: "#7c3aed40", color: "#a78bfa" };
    if (status === "return_requested") return { bg: "#f59e0b20", border: "#f59e0b40", color: "#f59e0b" };
    if (status === "completed") return { bg: "#00c6ff20", border: "#00c6ff40", color: "#00c6ff" };
    if (status === "cancelled") return { bg: "#ff444420", border: "#ff444440", color: "#ff6b6b" };
    return { bg: "#071525", border: "#0d2440", color: "#4a6380" };
  };

  const getStatusLabel = (status) => {
    if (status === "pending") return "Pending";
    if (status === "approved") return "Approved";
    if (status === "ongoing") return "Sedang Dipinjam";
    if (status === "return_requested") return "Menunggu Konfirmasi";
    if (status === "completed") return "Selesai";
    if (status === "cancelled") return "Dibatalkan";
    return status;
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body, #root { height: 100%; width: 100%; }
        .rw-root { min-height: 100vh; background: #020b18; font-family: 'DM Sans', sans-serif; color: #fff; }
        .rw-nav { display: flex; align-items: center; justify-content: space-between; padding: 18px 48px; background: #040f1e; border-bottom: 1px solid #0d2440; position: sticky; top: 0; z-index: 100; }
        .rw-brand { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800; cursor: pointer; }
        .rw-brand span { color: #0057ff; }
        .rw-nav-right { display: flex; gap: 12px; align-items: center; }
        .rw-back { padding: 8px 18px; background: transparent; border: 1px solid #0d2440; border-radius: 8px; color: #4a6380; font-size: 13px; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.2s; }
        .rw-back:hover { border-color: #0057ff; color: #0099ff; }
        .rw-header { padding: 40px 48px 24px; }
        .rw-header h1 { font-family: 'Syne', sans-serif; font-size: 32px; font-weight: 800; letter-spacing: -1px; margin-bottom: 6px; }
        .rw-header h1 span { background: linear-gradient(135deg, #0057ff, #00c6ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .rw-header p { color: #4a6380; font-size: 14px; }
        .rw-list { padding: 0 48px 48px; display: flex; flex-direction: column; gap: 16px; }
        .rw-card { background: #040f1e; border: 1px solid #0d2440; border-radius: 14px; padding: 24px; transition: all 0.2s; }
        .rw-card:hover { box-shadow: 0 4px 20px #00000040; }
        .rw-card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
        .rw-card-left { display: flex; gap: 16px; align-items: flex-start; }
        .rw-card-icon { width: 52px; height: 52px; background: #071525; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0; border: 1px solid #0d2440; }
        .rw-card-nama { font-family: 'Syne', sans-serif; font-size: 17px; font-weight: 700; margin-bottom: 4px; }
        .rw-card-no { font-size: 12px; color: #4a6380; }
        .rw-card-badges { display: flex; gap: 8px; flex-wrap: wrap; }
        .rw-badge { display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 500; }
        .rw-badge.unpaid { background: #ff990020; border: 1px solid #ff990040; color: #ffaa00; }
        .rw-badge.paid { background: #00c6ff20; border: 1px solid #00c6ff40; color: #00c6ff; }
        .rw-badge.expired { background: #ff444420; border: 1px solid #ff444440; color: #ff6b6b; }
        .rw-card-body { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; padding-top: 16px; border-top: 1px solid #071525; }
        .rw-info-label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #4a6380; margin-bottom: 4px; }
        .rw-info-value { font-size: 13px; color: #fff; }
        .rw-info-value.harga { color: #0099ff; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 15px; }
        .rw-card-footer { margin-top: 16px; padding-top: 16px; border-top: 1px solid #071525; }
        .rw-progress { display: flex; align-items: center; }
        .rw-step { display: flex; flex-direction: column; align-items: center; gap: 4px; }
        .rw-step-dot { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; border: 2px solid; }
        .rw-step-dot.done { background: #0057ff; border-color: #0057ff; color: #fff; }
        .rw-step-dot.inactive { background: #071525; border-color: #0d2440; color: #4a6380; }
        .rw-step-label { font-size: 10px; color: #4a6380; text-align: center; max-width: 60px; }
        .rw-step-label.done { color: #0099ff; }
        .rw-step-line { flex: 1; height: 2px; margin-bottom: 18px; }
        .rw-step-line.done { background: #0057ff; }
        .rw-step-line.inactive { background: #0d2440; }
        .rw-pengembalian-box { margin-top: 16px; padding: 14px 16px; background: #071525; border-radius: 10px; border: 1px solid #0d2440; }
        .rw-pengembalian-title { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #4a6380; margin-bottom: 10px; }
        .rw-pengembalian-row { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 6px; }
        .rw-pengembalian-row span:first-child { color: #4a6380; }
        .rw-kondisi { font-size: 11px; padding: 2px 8px; border-radius: 4px; }
        .rw-kondisi.baik { background: #00c6ff15; color: #00c6ff; border: 1px solid #00c6ff30; }
        .rw-kondisi.rusak { background: #ff990015; color: #ffaa00; border: 1px solid #ff990030; }
        .rw-kondisi.hilang { background: #ff444415; color: #ff6b6b; border: 1px solid #ff444430; }
        .rw-btn-wrap { margin-top: 12px; display: flex; gap: 8px; flex-wrap: wrap; }
        .rw-invoice-btn { padding: 8px 16px; background: transparent; border: 1px solid #0057ff40; border-radius: 6px; color: #0099ff; font-size: 12px; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.2s; }
        .rw-invoice-btn:hover { background: #0057ff20; }
        .rw-return-btn { padding: 8px 16px; background: transparent; border: 1px solid #7c3aed40; border-radius: 6px; color: #a78bfa; font-size: 12px; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.2s; }
        .rw-return-btn:hover { background: #7c3aed20; }
        .rw-return-info { margin-top: 12px; padding: 10px 14px; background: #f59e0b10; border: 1px solid #f59e0b30; border-radius: 8px; font-size: 12px; color: #f59e0b; }
        .rw-loading { text-align: center; padding: 80px; color: #4a6380; }
        .rw-empty { text-align: center; padding: 80px; color: #4a6380; }
        .rw-empty h3 { font-family: 'Syne', sans-serif; font-size: 20px; color: #fff; margin-bottom: 8px; }
        @media (max-width: 768px) {
          .rw-nav, .rw-header, .rw-list { padding-left: 20px; padding-right: 20px; }
          .rw-card-body { grid-template-columns: 1fr 1fr; }
        }
      `}</style>

      <div className="rw-root">
        <nav className="rw-nav">
          <div className="rw-brand" onClick={() => navigate("/dashboard")}>Rent<span>Tech</span></div>
          <div className="rw-nav-right">
            <button className="rw-back" onClick={() => navigate("/dashboard")}>← Katalog</button>
          </div>
        </nav>

        <div className="rw-header">
          <h1>Riwayat <span>Sewa</span></h1>
          <p>Pantau status peminjaman dan pengembalian perangkat kamu</p>
        </div>

        <div className="rw-list">
          {loading ? (
            <div className="rw-loading">Memuat data...</div>
          ) : rentals.length === 0 ? (
            <div className="rw-empty">
              <h3>Belum ada riwayat sewa</h3>
              <p>Kamu belum pernah menyewa perangkat</p>
            </div>
          ) : rentals.map((r) => {
            const sc = getStatusStyle(r.status);
            const steps = [
              { label: "Booking", done: true },
              { label: "Approved", done: ["approved","ongoing","return_requested","completed"].includes(r.status) },
              { label: "Diambil", done: ["ongoing","return_requested","completed"].includes(r.status) },
              { label: "Dikembalikan", done: r.status === "completed" },
            ];

            return (
            <div key={r._id} className="rw-card">
                <div className="rw-card-top">
                  <div className="rw-card-left">
                   <div className="rw-card-icon">
  {r.product_id?.gambar ? (
    <img 
      src={`http://localhost:5000/uploads/${Array.isArray(r.product_id.gambar) ? r.product_id.gambar[0] : r.product_id.gambar}`}
      alt={r.product_id?.nama_produk}
      style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 10 }}
      onError={(e) => { e.target.style.display = "none"; }}
    />
  ) : (
    r.product_id?.kategori?.nama_kategori === "HP" ? "📱" : "📷"
  )}
</div>
                    <div>
                      <div className="rw-card-nama">{r.product_id?.nama_produk || r.nama_produk || "Produk Dihapus"}</div>
                     <div className="rw-card-no">ID Sewa: #{String(r._id).slice(-6).toUpperCase()}</div>

                    </div>
                  </div>
                  <div className="rw-card-badges">
                    <span className="rw-badge" style={{background: sc.bg, border: `1px solid ${sc.border}`, color: sc.color}}>
                      {getStatusLabel(r.status)}
                    </span>
                    <span className={`rw-badge ${r.payment_status}`}>
                      {r.payment_status === "unpaid" ? "Belum Lunas" : r.payment_status === "paid" ? "Lunas" : "Kadaluarsa"}
                    </span>
                  </div>
                </div>

                <div className="rw-card-body">
                  <div>
                    <div className="rw-info-label">Tanggal Mulai</div>
                    <div className="rw-info-value">{formatDate(r.tanggal_mulai)}</div>
                  </div>
                  <div>
                    <div className="rw-info-label">Tanggal Selesai</div>
                    <div className="rw-info-value">{formatDate(r.tanggal_selesai)}</div>
                  </div>
                  <div>
                    <div className="rw-info-label">Total Bayar</div>
                    <div className="rw-info-value harga">{formatHarga(r.total_harga)}</div>
                  </div>
                </div>

                <div className="rw-card-footer">
                  <div className="rw-progress">
                   {steps.map((step, i) => (
                  <div key={i} style={{display:"flex", alignItems:"center", flex: i < steps.length - 1 ? 1 : 0}}>
                 <div className="rw-step">
                <div className={`rw-step-dot ${step.done ? "done" : "inactive"}`}>
                    {step.done ? "✓" : i + 1}
                </div>
                  <div className={`rw-step-label ${step.done ? "done" : ""}`}>{step.label}</div>
                </div>
                 {i < steps.length - 1 && (
                <div className={`rw-step-line ${step.done ? "done" : "inactive"}`} />
                 )}
                </div>
                    ))}
                  </div>
                </div>

                {(r.tanggal_pengambilan || r.tanggal_pengembalian_aktual) && (
                  <div className="rw-pengembalian-box">
                    <div className="rw-pengembalian-title">Detail Peminjaman</div>
                    {r.tanggal_pengambilan && (
                      <div className="rw-pengembalian-row">
                        <span>Waktu Pengambilan</span>
                        <span>{formatDateTime(r.tanggal_pengambilan)}</span>
                      </div>
                    )}
                    {r.tanggal_pengembalian_aktual && (
                      <div className="rw-pengembalian-row">
                        <span>Waktu Pengembalian</span>
                        <span>{formatDateTime(r.tanggal_pengembalian_aktual)}</span>
                      </div>
                    )}
                    {r.kondisi_kembali && (
                      <div className="rw-pengembalian-row">
                        <span>Kondisi Barang</span>
                        <span className={`rw-kondisi ${r.kondisi_kembali}`}>{r.kondisi_kembali}</span>
                      </div>
                    )}
                    {r.catatan && (
                      <div className="rw-pengembalian-row">
                        <span>Catatan</span>
                        <span style={{maxWidth:200, textAlign:"right", fontSize:12}}>{r.catatan}</span>
                      </div>
                    )}
                  </div>
                )}

                {r.status === "return_requested" && (
                  <div className="rw-return-info">
                    ⏳ Pengajuan pengembalian sedang menunggu konfirmasi admin
                  </div>
                )}

                <div className="rw-btn-wrap">
                  {r.payment_status === "unpaid" && r.status !== "cancelled" && (
                 <button className="rw-invoice-btn" onClick={() => navigate(`/invoice/${r._id}`)}>
                      💳 Lihat Invoice & Bayar
                    </button>
                  )}
                {r.status === "ongoing" && (
                 <button className="rw-return-btn" onClick={() => navigate(`/pengembalian/${r._id}`)}>
                  ↩ Kembalikan Perangkat
                   </button>
                 )}
                  
                </div>
              </div>
            );
          })}
          </div>
      </div>

    </>
  );
}
       