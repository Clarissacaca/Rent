import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";

export default function Invoice() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rental, setRental] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [expired, setExpired] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploaded, setUploaded] = useState(false);

  const fetchRental = async () => {
    try {
      const res = await API.get(`/rentals/${id}`);
      setRental(res.data);
      if (res.data.payment_status === "expired") setExpired(true);
      if (res.data.bukti_bayar) setUploaded(true);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRental();
  }, [id]);

  useEffect(() => {
    if (!rental || rental.payment_status !== "unpaid") return;

    const interval = setInterval(() => {
      const deadline = new Date(rental.payment_deadline).getTime();
      const now = Date.now();
      const diff = deadline - now;

      if (diff <= 0) {
        setTimeLeft("00:00");
        setExpired(true);
        clearInterval(interval);
        return;
      }

      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [rental]);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleUpload = async () => {
    if (!file) return alert("Pilih file bukti transfer dulu!");
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("bukti", file);
      await API.post(`/rentals/${id}/upload-bukti`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setUploaded(true);
      fetchRental();
    } catch (err) {
      alert("Upload gagal: " + (err.response?.data?.message || err.message));
    } finally {
      setUploading(false);
    }
  };

  const formatHarga = (h) => "Rp " + Number(h).toLocaleString("id-ID");
  const formatDate = (d) => new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

  if (!rental) return (
    <div style={{ minHeight: "100vh", background: "#020b18", display: "flex", alignItems: "center", justifyContent: "center", color: "#4a6380", fontFamily: "'DM Sans', sans-serif" }}>
      Memuat invoice...
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body, #root { height: 100%; width: 100%; }
        .inv-root { min-height: 100vh; background: #020b18; font-family: 'DM Sans', sans-serif; color: #fff; }
        .inv-nav { display: flex; align-items: center; justify-content: space-between; padding: 18px 48px; background: #040f1e; border-bottom: 1px solid #0d2440; }
        .inv-brand { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800; cursor: pointer; }
        .inv-brand span { color: #0057ff; }
        .inv-body { max-width: 600px; margin: 40px auto; padding: 0 24px; }
        .inv-card { background: #040f1e; border: 1px solid #0d2440; border-radius: 16px; overflow: hidden; position: relative; }
        .inv-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, #0057ff, #00c6ff, transparent); }
        .inv-header { padding: 28px 28px 20px; border-bottom: 1px solid #0d2440; display: flex; justify-content: space-between; align-items: flex-start; }
        .inv-title { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800; margin-bottom: 4px; }
        .inv-id { font-size: 12px; color: #4a6380; }
        .inv-status { padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 500; }
        .inv-status.unpaid { background: #ff990020; border: 1px solid #ff990040; color: #ffaa00; }
        .inv-status.paid { background: #00c6ff20; border: 1px solid #00c6ff40; color: #00c6ff; }
        .inv-status.expired { background: #ff444420; border: 1px solid #ff444440; color: #ff6b6b; }
        .inv-section { padding: 20px 28px; border-bottom: 1px solid #0d2440; }
        .inv-section-title { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #4a6380; margin-bottom: 14px; }
        .inv-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; }
        .inv-row span:first-child { color: #4a6380; }
        .inv-row span:last-child { color: #fff; font-weight: 500; }
        .inv-total-row { display: flex; justify-content: space-between; padding-top: 12px; border-top: 1px solid #0d2440; margin-top: 4px; }
        .inv-total-row span:first-child { font-size: 15px; color: #fff; font-weight: 500; }
        .inv-total-row span:last-child { font-family: 'Syne', sans-serif; font-size: 22px; color: #0099ff; font-weight: 700; }
        .inv-qris-section { padding: 28px; text-align: center; }
        .inv-qris-title { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700; margin-bottom: 6px; }
        .inv-qris-sub { font-size: 13px; color: #4a6380; margin-bottom: 20px; }
        .inv-timer { display: inline-flex; align-items: center; gap: 8px; background: #071525; border: 1px solid #ff990040; border-radius: 10px; padding: 10px 20px; margin-bottom: 20px; }
        .inv-timer-icon { font-size: 18px; }
        .inv-timer-text { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 700; color: #ffaa00; }
        .inv-timer-label { font-size: 12px; color: #4a6380; }
        .inv-timer.urgent { border-color: #ff444440; }
        .inv-timer.urgent .inv-timer-text { color: #ff6b6b; }
        .inv-qr-box { width: 200px; height: 200px; margin: 0 auto 20px; background: #fff; border-radius: 12px; display: flex; align-items: center; justify-content: center; padding: 12px; }
        .inv-qr-box img { width: 100%; height: 100%; }
        .inv-upload-area { border: 2px dashed #0d2440; border-radius: 12px; padding: 32px 24px; margin-bottom: 16px; cursor: pointer; transition: all 0.2s; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
        .inv-upload-area:hover { border-color: #0057ff; background: #07152510; }
        .inv-upload-area input { display: none; }
        .inv-upload-icon { font-size: 32px; margin-bottom: 8px; display: block; }
        .inv-upload-text { font-size: 13px; color: #4a6380; }
        .inv-preview { max-width: 100%; max-height: 200px; border-radius: 8px; }
        .inv-preview { max-width: 100%; max-height: 200px; border-radius: 8px; margin-bottom: 16px; }
        .inv-pay-btn { width: 100%; padding: 15px; background: linear-gradient(135deg, #0057ff, #0099ff); color: #fff; border: none; border-radius: 10px; font-size: 15px; font-weight: 500; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.2s; margin-bottom: 12px; }
        .inv-pay-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 25px #0057ff40; }
        .inv-pay-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        .inv-expired-box { background: #1a0a0a; border: 1px solid #ff444430; border-radius: 10px; padding: 20px; text-align: center; }
        .inv-expired-box h3 { color: #ff6b6b; font-family: 'Syne', sans-serif; margin-bottom: 8px; }
        .inv-expired-box p { color: #4a6380; font-size: 13px; margin-bottom: 16px; }
        .inv-paid-box { background: #0a1a0a; border: 1px solid #00c6ff30; border-radius: 10px; padding: 20px; text-align: center; }
        .inv-paid-box h3 { color: #00c6ff; font-family: 'Syne', sans-serif; margin-bottom: 8px; }
        .inv-paid-box p { color: #4a6380; font-size: 13px; }
        .inv-waiting-box { background: #ff990010; border: 1px solid #ff990030; border-radius: 10px; padding: 20px; text-align: center; margin-bottom: 12px; }
        .inv-waiting-box h3 { color: #ffaa00; font-family: 'Syne', sans-serif; margin-bottom: 8px; font-size: 16px; }
        .inv-waiting-box p { color: #4a6380; font-size: 13px; }
        .inv-back-btn { width: 100%; padding: 12px; background: transparent; border: 1px solid #0d2440; border-radius: 10px; color: #4a6380; font-size: 14px; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.2s; }
        .inv-back-btn:hover { border-color: #0057ff; color: #0099ff; }
      `}</style>

      <div className="inv-root">
        <nav className="inv-nav">
          <div className="inv-brand" onClick={() => navigate("/dashboard")}>Rent<span>Tech</span></div>
        </nav>

        <div className="inv-body">
          <div className="inv-card">
            <div className="inv-header">
              <div>
                <div className="inv-title">Invoice</div>
                <div className="inv-id">#{String(rental._id).slice(-6).toUpperCase()}</div>
              </div>
              <span className={`inv-status ${rental.payment_status}`}>
                {rental.payment_status === "unpaid" ? "Menunggu Pembayaran" : rental.payment_status === "paid" ? "Lunas" : "Kadaluarsa"}
              </span>
            </div>

            <div className="inv-section">
              <div className="inv-section-title">Detail Produk</div>
              <div className="inv-row"><span>Produk</span><span>{rental.product_id?.nama_produk || "-"}</span></div>
              <div className="inv-row"><span>Tanggal Mulai</span><span>{formatDate(rental.tanggal_mulai)}</span></div>
              <div className="inv-row"><span>Tanggal Selesai</span><span>{formatDate(rental.tanggal_selesai)}</span></div>
              <div className="inv-row"><span>Lokasi Pickup</span><span style={{maxWidth:220, textAlign:"right", fontSize:12}}>{rental.alamat_pickup}</span></div>
            </div>

            <div className="inv-section">
              <div className="inv-section-title">Rincian Pembayaran</div>
             <div className="inv-row"><span>Harga/Hari</span><span>{formatHarga(rental.product_id?.harga_sewa)}</span></div>
              <div className="inv-total-row">
                <span>Total</span>
                <span>{formatHarga(rental.total_harga)}</span>
              </div>
            </div>

            <div className="inv-qris-section">
              {rental.payment_status === "paid" ? (
                <div className="inv-paid-box">
                  <h3>✅ Pembayaran Berhasil</h3>
                  <p>Pesanan kamu sedang diproses.</p>
                </div>
              ) : expired ? (
                <div className="inv-expired-box">
                  <h3>❌ Transaksi Dibatalkan</h3>
                  <p>Waktu pembayaran sudah habis. Silakan buat pesanan baru.</p>
                  <button className="inv-pay-btn" onClick={() => navigate("/dashboard")}>Kembali ke Katalog</button>
                </div>
              ) : uploaded ? (
                <div className="inv-waiting-box">
                  <h3>⏳ Menunggu Konfirmasi Admin</h3>
                  <p>Bukti pembayaran sudah diupload. Admin akan segera memverifikasi.</p>
                </div>
              ) : (
                <>
                  <div className="inv-qris-title">Scan QRIS untuk Bayar</div>
                  <div className="inv-qris-sub">Bayar dalam waktu</div>
                  <div className={`inv-timer ${timeLeft && parseInt(timeLeft) < 2 ? "urgent" : ""}`}>
                    <span className="inv-timer-icon">⏱</span>
                    <div>
                      <div className="inv-timer-text">{timeLeft || "10:00"}</div>
                      <div className="inv-timer-label">menit tersisa</div>
                    </div>
                  </div>

                  <div className="inv-qr-box">
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=176x176&data=RENTTECH-PAY-${rental._id}-${rental.total_harga}`} alt="QRIS" />
                  </div>

                  <p style={{fontSize:12, color:"#4a6380", marginBottom:20}}>
                    Setelah transfer, upload screenshot bukti pembayaran di bawah
                  </p>

                  <label className="inv-upload-area">
                    {preview ? (
                      <img src={preview} className="inv-preview" alt="Preview" />
                    ) : (
                      <>
                        <div className="inv-upload-icon">📷</div>
                        <div className="inv-upload-text">Klik untuk pilih screenshot bukti transfer</div>
                      </>
                    )}
                    <input type="file" accept="image/*" onChange={handleFileChange} />
                  </label>

                  <button className="inv-pay-btn" onClick={handleUpload} disabled={uploading || !file}>
                    {uploading ? "Mengupload..." : "Upload Bukti Pembayaran"}
                  </button>
                </>
              )}
              <button className="inv-back-btn" onClick={() => navigate("/dashboard")}>Kembali ke Katalog</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}