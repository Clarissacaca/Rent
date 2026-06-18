import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

// Helper: deteksi URL Cloudinary (http...) vs nama file lokal lama
const getImgSrc = (gambar) => {
  if (!gambar) return null;
  return gambar.startsWith("http") ? gambar : `http://localhost:5000/uploads/${gambar}`;
};

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [form, setForm] = useState({ category_id: "", nama_produk: "", deskripsi: "", harga_sewa: "", stok: "" });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotif, setShowNotif] = useState(false);
  const notifRef = useRef(null);

  const navigate = useNavigate();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await API.get("/products");
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await API.get("/categories");
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await API.get("/notifications");
      setNotifications(res.data);
      setUnreadCount(res.data.filter((n) => !n.is_read).length);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await API.put("/notifications/read-all");
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotifClick = async (notif) => {
    if (!notif.is_read) {
      try {
        await API.put(`/notifications/${notif.id}/read`);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, is_read: 1 } : n))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch (err) {
        console.error(err);
      }
    }
    if (notif.rental_id) {
      setShowNotif(false);
      navigate("/admin/transaksi");
    }
  };

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotif(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "admin") navigate("/dashboard");
    fetchProducts();
    fetchCategories();
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const resetForm = () => {
    setForm({ category_id: "", nama_produk: "", deskripsi: "", harga_sewa: "", stok: "" });
    setImageFile(null);
    setImagePreview(null);
    setEditData(null);
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append("kategori", form.category_id);
      formData.append("nama_produk", form.nama_produk);
      formData.append("deskripsi", form.deskripsi);
      formData.append("harga_sewa", form.harga_sewa);
      formData.append("stok", form.stok);
      if (imageFile) formData.append("gambar", imageFile);

      if (editData) {
        await API.put(`/products/${editData._id || editData.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      } else {
        await API.post("/products", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      }

      setShowModal(false);
      resetForm();
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan produk: " + (err.response?.data?.message || err.message));
    }
  };

  const handleEdit = (p) => {
    setEditData(p);
    setForm({
      category_id: p.kategori?._id || p.kategori || "",
      nama_produk: p.nama_produk,
      deskripsi: p.deskripsi || "",
      harga_sewa: p.harga_sewa,
      stok: p.stok,
    });
    const existingGambar = Array.isArray(p.gambar) ? p.gambar[0] : p.gambar;
    setImagePreview(getImgSrc(existingGambar));
    setImageFile(null);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await API.delete(`/products/${deleteId}`);
      setShowDeleteModal(false);
      setDeleteId(null);
      fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  const logout = () => { localStorage.clear(); navigate("/login"); };
  const formatHarga = (h) => "Rp " + Number(h).toLocaleString("id-ID");

  const formatWaktu = (d) => {
    const diff = Math.floor((Date.now() - new Date(d)) / 1000);
    if (diff < 60) return "Baru saja";
    if (diff < 3600) return `${Math.floor(diff / 60)} mnt lalu`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
    return `${Math.floor(diff / 86400)} hari lalu`;
  };

  const getGambar = (gambar) => {
    if (!gambar) return null;
    if (Array.isArray(gambar)) return gambar[0] || null;
    return gambar;
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body, #root { height: 100%; width: 100%; }

        .ad-root { min-height: 100vh; background: #020b18; font-family: 'DM Sans', sans-serif; color: #fff; }

        .ad-nav { display: flex; align-items: center; justify-content: space-between; padding: 18px 48px; background: #040f1e; border-bottom: 1px solid #0d2440; position: sticky; top: 0; z-index: 100; }
        .ad-brand { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 800; }
        .ad-brand span { color: #0057ff; }
        .ad-badge { background: #0057ff20; border: 1px solid #0057ff40; color: #0099ff; font-size: 11px; padding: 3px 10px; border-radius: 20px; margin-left: 10px; }
        .ad-nav-right { display: flex; gap: 12px; align-items: center; }
        .ad-logout { padding: 8px 18px; background: transparent; border: 1px solid #0d2440; border-radius: 8px; color: #4a6380; font-size: 13px; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.2s; }
        .ad-logout:hover { border-color: #ff4444; color: #ff4444; }

        .notif-wrap { position: relative; }
        .notif-btn { position: relative; width: 38px; height: 38px; border-radius: 8px; border: 1px solid #0d2440; background: #071525; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; font-size: 18px; }
        .notif-btn:hover { border-color: #0057ff; background: #0a1f3a; }
        .notif-badge { position: absolute; top: -5px; right: -5px; background: #ff4444; color: #fff; font-size: 10px; font-weight: 700; width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid #020b18; font-family: 'DM Sans', sans-serif; }

        .notif-dropdown { position: absolute; top: calc(100% + 10px); right: 0; width: 340px; background: #040f1e; border: 1px solid #0d2440; border-radius: 12px; z-index: 300; box-shadow: 0 16px 40px #00000080; overflow: hidden; }
        .notif-header { display: flex; justify-content: space-between; align-items: center; padding: 14px 16px; border-bottom: 1px solid #0d2440; }
        .notif-title { font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 700; }
        .notif-read-all { font-size: 12px; color: #0099ff; cursor: pointer; background: none; border: none; font-family: 'DM Sans', sans-serif; }
        .notif-read-all:hover { color: #00c6ff; }
        .notif-list { max-height: 340px; overflow-y: auto; }
        .notif-item { padding: 12px 16px; border-bottom: 1px solid #071525; cursor: pointer; transition: background 0.15s; display: flex; gap: 10px; align-items: flex-start; }
        .notif-item:hover { background: #071525; }
        .notif-item.unread { background: #0057ff08; border-left: 2px solid #0057ff; }
        .notif-item.unread:hover { background: #0057ff14; }
        .notif-icon { font-size: 20px; margin-top: 2px; flex-shrink: 0; }
        .notif-content { flex: 1; min-width: 0; }
        .notif-judul { font-size: 13px; font-weight: 500; margin-bottom: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .notif-pesan { font-size: 12px; color: #4a6380; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .notif-time { font-size: 11px; color: #2a4060; margin-top: 4px; }
        .notif-dot { width: 7px; height: 7px; border-radius: 50%; background: #0057ff; margin-top: 5px; flex-shrink: 0; }
        .notif-empty { padding: 32px 16px; text-align: center; color: #2a4060; font-size: 13px; }

        .ad-header { padding: 40px 48px 24px; }
        .ad-header h1 { font-family: 'Syne', sans-serif; font-size: 32px; font-weight: 800; letter-spacing: -1px; margin-bottom: 6px; }
        .ad-header h1 span { background: linear-gradient(135deg, #0057ff, #00c6ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .ad-header p { color: #4a6380; font-size: 14px; }

        .ad-toolbar { display: flex; justify-content: space-between; align-items: center; padding: 0 48px 24px; }
        .ad-count { font-size: 14px; color: #4a6380; }
        .ad-add-btn { padding: 10px 22px; background: linear-gradient(135deg, #0057ff, #0099ff); color: #fff; border: none; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.2s; }
        .ad-add-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px #0057ff40; }

        .ad-table-wrap { padding: 0 48px 48px; overflow-x: auto; }
        .ad-table { width: 100%; border-collapse: collapse; }
        .ad-table th { text-align: center; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #4a6380; font-weight: 500; padding: 12px 16px; border-bottom: 1px solid #0d2440; }
        .ad-table td { padding: 14px 16px; border-bottom: 1px solid #071525; font-size: 14px; vertical-align: middle; white-space: nowrap; text-align: center; }
        .ad-table td:nth-child(2) { white-space: normal; max-width: 200px; text-align: left; }
        .ad-table th:nth-child(2) { text-align: left; }
        .ad-table tr:hover td { background: #040f1e; }

        .ad-cat-badge { display: inline-block; padding: 3px 10px; border-radius: 6px; font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; }
        .ad-cat-hp { background: #0057ff20; color: #0099ff; border: 1px solid #0057ff30; }
        .ad-cat-kamera { background: #7c3aed20; color: #a78bfa; border: 1px solid #7c3aed30; }

        .ad-harga { color: #0099ff; font-weight: 500; }
        .ad-stok { font-size: 12px; padding: 3px 10px; border-radius: 6px; background: #071525; border: 1px solid #0d2440; color: #4a6380; }
        .ad-stok.ok { border-color: #00c6ff30; color: #00c6ff; }

        .ad-actions { display: flex; gap: 8px; justify-content: center; align-items: center; }
        .ad-edit-btn { padding: 6px 14px; background: #071525; border: 1px solid #0d2440; border-radius: 6px; color: #4a6380; font-size: 12px; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.2s; }
        .ad-edit-btn:hover { border-color: #0057ff; color: #0099ff; }
        .ad-del-btn { padding: 6px 14px; background: #1a0a0a; border: 1px solid #ff444430; border-radius: 6px; color: #ff6b6b; font-size: 12px; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.2s; }
        .ad-del-btn:hover { background: #ff444420; }

        .ad-loading { text-align: center; padding: 80px; color: #4a6380; }

        .ad-overlay { position: fixed; inset: 0; background: #00000080; z-index: 200; display: flex; align-items: center; justify-content: center; }
        .ad-modal { background: #040f1e; border: 1px solid #0d2440; border-radius: 16px; padding: 36px; width: 480px; position: relative; max-height: 90vh; overflow-y: auto; }
        .ad-modal::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, #0057ff, #00c6ff, transparent); border-radius: 16px 16px 0 0; }
        .ad-modal h3 { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 700; margin-bottom: 24px; letter-spacing: -0.5px; }
        .ad-field { margin-bottom: 16px; }
        .ad-field label { display: block; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #4a6380; font-weight: 500; margin-bottom: 6px; }
        .ad-field input, .ad-field select, .ad-field textarea { width: 100%; padding: 12px 14px; background: #071525; border: 1px solid #0d2440; border-radius: 8px; color: #fff; font-size: 14px; font-family: 'DM Sans', sans-serif; outline: none; transition: all 0.2s; }
        .ad-field input:focus, .ad-field select:focus, .ad-field textarea:focus { border-color: #0057ff; box-shadow: 0 0 0 3px #0057ff18; }
        .ad-field select option { background: #040f1e; }
        .ad-field textarea { resize: vertical; min-height: 80px; }
        .ad-modal-footer { display: flex; gap: 10px; margin-top: 24px; }
        .ad-save-btn { flex: 1; padding: 12px; background: linear-gradient(135deg, #0057ff, #0099ff); color: #fff; border: none; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; font-family: 'DM Sans', sans-serif; }
        .ad-cancel-btn { padding: 12px 20px; background: transparent; border: 1px solid #0d2440; border-radius: 8px; color: #4a6380; font-size: 14px; cursor: pointer; font-family: 'DM Sans', sans-serif; }
        .ad-cancel-btn:hover { border-color: #ff4444; color: #ff4444; }
        .ad-thumb { width: 40px; height: 40px; border-radius: 6px; object-fit: cover; border: 1px solid #0d2440; }
      `}</style>

      <div className="ad-root">
        <nav className="ad-nav">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
           <div className="ad-brand">
             Admin Rent<span>Tech</span>
            </div>
            <div style={{ display: "flex", gap: 4, marginLeft: 8 }}>
              <button style={{ padding: "7px 16px", borderRadius: 8, border: "1px solid #0d2440", background: "#071525", color: "#fff", fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }} onClick={() => navigate("/admin")}>Produk</button>
              <button style={{ padding: "7px 16px", borderRadius: 8, border: "none", background: "transparent", color: "#4a6380", fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }} onClick={() => navigate("/admin/transaksi")}>Transaksi</button>
            </div>
          </div>
          <div className="ad-nav-right">
            <div className="notif-wrap" ref={notifRef}>
              <button
                className="notif-btn"
                onClick={() => {
                  setShowNotif((v) => !v);
                  if (!showNotif && unreadCount > 0) handleMarkAllRead();
                }}
              >
                🔔
                {unreadCount > 0 && (
                  <span className="notif-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>
                )}
              </button>

              {showNotif && (
                <div className="notif-dropdown">
                  <div className="notif-header">
                    <span className="notif-title">Notifikasi</span>
                    {unreadCount > 0 && (
                      <button className="notif-read-all" onClick={handleMarkAllRead}>
                        Tandai semua dibaca
                      </button>
                    )}
                  </div>
                  <div className="notif-list">
                    {notifications.length === 0 ? (
                      <div className="notif-empty">Belum ada notifikasi</div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`notif-item ${!n.is_read ? "unread" : ""}`}
                          onClick={() => handleNotifClick(n)}
                        >
                          <span className="notif-icon">
                            {n.tipe === "return" ? "📦" : "🔔"}
                          </span>
                          <div className="notif-content">
                            <div className="notif-judul">{n.judul}</div>
                            <div className="notif-pesan">{n.pesan}</div>
                            <div className="notif-time">{formatWaktu(n.created_at)}</div>
                          </div>
                          {!n.is_read && <div className="notif-dot" />}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <button className="ad-logout" onClick={logout}>Keluar</button>
          </div>
        </nav>

        <div className="ad-header">
          <h1>Manajemen <span>Produk</span></h1>
          <p>Kelola semua produk HP dan Kamera</p>
        </div>

        <div className="ad-toolbar">
          <span className="ad-count">{products.length} produk terdaftar</span>
          <button className="ad-add-btn" onClick={() => { resetForm(); setShowModal(true); }}>
            + Tambah Produk
          </button>
        </div>

        <div className="ad-table-wrap">
          {loading ? (
            <div className="ad-loading">Memuat data...</div>
          ) : (
            <table className="ad-table">
              <thead>
                <tr>
                  <th>Gambar</th>
                  <th>Produk</th>
                  <th>Kategori</th>
                  <th>Harga/Hari</th>
                  <th>Stok</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const thumb = getGambar(p.gambar);
                  const thumbSrc = getImgSrc(thumb);
                  return (
                    <tr key={p._id || p.id}>
                      <td>
                        {thumbSrc ? (
                          <img
                            className="ad-thumb"
                            src={thumbSrc}
                            alt={p.nama_produk}
                            onError={(e) => { e.target.style.display = "none"; }}
                          />
                        ) : (
                          <div style={{ width: 40, height: 40, borderRadius: 6, background: "#071525", border: "1px solid #0d2440", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📷</div>
                        )}
                      </td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{p.nama_produk}</div>
                        <div style={{ fontSize: 12, color: "#4a6380", marginTop: 2 }}>{p.deskripsi?.slice(0, 50)}{p.deskripsi?.length > 50 ? "..." : ""}</div>
                      </td>
                      <td>
                        <span className={`ad-cat-badge ${p.kategori?.nama_kategori === "HP" ? "ad-cat-hp" : "ad-cat-kamera"}`}>
                          {p.kategori?.nama_kategori || "-"}
                        </span>
                      </td>
                      <td className="ad-harga">{formatHarga(p.harga_sewa)}</td>
                      <td><span className={`ad-stok ${p.stok > 0 ? "ok" : ""}`}>{p.stok}</span></td>
                      <td>
                        <div className="ad-actions">
                          <button className="ad-edit-btn" onClick={() => handleEdit(p)}>Edit</button>
                          <button className="ad-del-btn" onClick={() => handleDelete(p._id || p.id)}>Hapus</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <div className="ad-overlay">
          <div className="ad-modal">
            <h3>{editData ? "Edit Produk" : "Tambah Produk"}</h3>

            <div className="ad-field">
              <label>Kategori</label>
              <select name="category_id" value={form.category_id} onChange={handleChange}>
                <option value="">Pilih kategori</option>
                {categories.map((c) => (
                  <option key={c._id || c.id} value={c._id || c.id}>{c.nama_kategori}</option>
                ))}
              </select>
            </div>

            <div className="ad-field">
              <label>Nama Produk</label>
              <input name="nama_produk" value={form.nama_produk} placeholder="iPhone 14 Pro" onChange={handleChange} />
            </div>

            <div className="ad-field">
              <label>Deskripsi</label>
              <textarea name="deskripsi" value={form.deskripsi} placeholder="Deskripsi produk..." onChange={handleChange} />
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <div className="ad-field" style={{ flex: 1 }}>
                <label>Harga/Hari</label>
                <input name="harga_sewa" type="number" value={form.harga_sewa} placeholder="150000" onChange={handleChange} />
              </div>
              <div className="ad-field" style={{ flex: 1 }}>
                <label>Stok</label>
                <input name="stok" type="number" value={form.stok} placeholder="3" onChange={handleChange} />
              </div>
            </div>

            <div className="ad-field">
              <label>Gambar Produk</label>
              <label style={{
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                border: "2px dashed #0d2440", borderRadius: 8, padding: 20, cursor: "pointer",
                background: "#071525", transition: "border-color 0.2s"
              }}>
                {imagePreview ? (
                  <img src={imagePreview} alt="preview" style={{ width: "100%", maxHeight: 160, objectFit: "cover", borderRadius: 6 }} />
                ) : (
                  <>
                    <div style={{ fontSize: 32 }}>📷</div>
                    <div style={{ color: "#4a6380", fontSize: 13, marginTop: 8 }}>Klik untuk upload gambar</div>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) { setImageFile(file); setImagePreview(URL.createObjectURL(file)); }
                  }}
                />
              </label>
            </div>

            <div className="ad-modal-footer">
              <button className="ad-cancel-btn" onClick={() => { setShowModal(false); resetForm(); }}>Batal</button>
              <button className="ad-save-btn" onClick={handleSubmit}>
                {editData ? "Simpan Perubahan" : "Tambah Produk"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="ad-overlay">
          <div className="ad-modal" style={{ width: 360, maxHeight: "unset" }}>
            <h3>Hapus Produk</h3>
            <p style={{ color: "#4a6380", fontSize: 14, marginBottom: 24 }}>Yakin ingin menghapus produk ini? Tindakan ini tidak bisa dibatalkan.</p>
            <div className="ad-modal-footer">
              <button className="ad-cancel-btn" onClick={() => { setShowDeleteModal(false); setDeleteId(null); }}>Batal</button>
              <button className="ad-save-btn" style={{ background: "linear-gradient(135deg,#ff4444,#ff6b6b)" }} onClick={confirmDelete}>Hapus</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}