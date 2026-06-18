import { useState } from "react";
import API from "../services/api";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post("/auth/login", form);
      localStorage.setItem("token", res.data.token);
localStorage.setItem("role", res.data.user.role);
localStorage.setItem("nama", res.data.user.nama);
const role = res.data.user.role;
        if (role === "admin") navigate("/admin");
        else navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }

        .login-root {
          min-height: 100vh;
          display: flex;
          font-family: 'DM Sans', sans-serif;
          background: #020b18;
          overflow: hidden;
        }

        /* LEFT PANEL */
        .login-left {
          flex: 1;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          padding: 60px;
          overflow: hidden;
          }

        .login-left::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at 30% 50%, #0057ff22 0%, transparent 70%),
                      radial-gradient(ellipse at 80% 20%, #00c6ff18 0%, transparent 60%);
        }

        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(60px);
          animation: float 8s ease-in-out infinite;
        }

        .orb-1 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, #0057ff30, transparent 70%);
          top: -100px; left: -100px;
          animation-delay: 0s;
        }

        .orb-2 {
          width: 300px; height: 300px;
          background: radial-gradient(circle, #00c6ff25, transparent 70%);
          bottom: 50px; left: 200px;
          animation-delay: 3s;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-30px) scale(1.05); }
        }

        .brand {
          position: relative;
          z-index: 1;
          margin-bottom: 60px;
        }

        .brand-name {
          font-family: 'Syne', sans-serif;
          font-size: 28px;
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.5px;
        }

        .brand-dot {
          color: #0057ff;
        }

        .hero-text {
          position: relative;
          z-index: 1;
        }

        .hero-text h1 {
          font-family: 'Syne', sans-serif;
          font-size: 52px;
          font-weight: 800;
          color: #fff;
          line-height: 1.1;
          letter-spacing: -2px;
          margin-bottom: 20px;
        }

        .hero-text h1 span {
          background: linear-gradient(135deg, #0057ff, #00c6ff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        
        .hero-text p {
          font-size: 16px;
          color: #6b8aad;
          line-height: 1.7;
          max-width: 360px;
          font-weight: 300;
          margin: 0 auto;
          }

        .stats {
          position: relative;
          z-index: 1;
          display: flex;
          gap: 40px;
          margin-top: 60px;
        }

        .stat-item strong {
          display: block;
          font-family: 'Syne', sans-serif;
          font-size: 20px;
          font-weight: 700;
          color: #fff;
        }

        .stat-item span {
          font-size: 13px;
          color: #4a6380;
          font-weight: 300;
        }

        /* RIGHT PANEL */
        .login-right {
          width: 480px;
          background: #040f1e;
          border-left: 1px solid #0d2440;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 60px 50px;
          position: relative;
        }

        .login-right::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, #0057ff, #00c6ff, transparent);
        }

        .form-box {
          width: 100%;
        }

        .form-box h2 {
          font-family: 'Syne', sans-serif;
          font-size: 30px;
          font-weight: 700;
          color: #fff;
          margin-bottom: 8px;
          letter-spacing: -1px;
        }

        .form-box .subtitle {
          font-size: 14px;
          color: #4a6380;
          margin-bottom: 40px;
          font-weight: 300;
        }

        .field {
          margin-bottom: 20px;
        }

        .field label {
          display: block;
          font-size: 12px;
          font-weight: 500;
          color: #4a6380;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 8px;
        }

        .field input {
          width: 100%;
          padding: 14px 18px;
          background: #071525;
          border: 1px solid #0d2440;
          border-radius: 10px;
          color: #fff;
          font-size: 15px;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.2s;
          outline: none;
        }

        .field input::placeholder { color: #1e3a55; }

        .field input:focus {
          border-color: #0057ff;
          background: #071d35;
          box-shadow: 0 0 0 3px #0057ff18;
        }

        .error-msg {
          background: #1a0a0a;
          border: 1px solid #ff3b3b40;
          color: #ff6b6b;
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 13px;
          margin-bottom: 20px;
        }

        .btn-login {
          width: 100%;
          padding: 15px;
          background: linear-gradient(135deg, #0057ff, #0099ff);
          color: #fff;
          border: none;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 8px;
          letter-spacing: 0.3px;
          position: relative;
          overflow: hidden;
        }

        .btn-login::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #0066ff, #00aaff);
          opacity: 0;
          transition: opacity 0.2s;
        }

        .btn-login:hover::after { opacity: 1; }
        .btn-login:hover { transform: translateY(-1px); box-shadow: 0 8px 25px #0057ff40; }
        .btn-login:active { transform: translateY(0); }
        .btn-login:disabled { opacity: 0.6; cursor: not-allowed; }

        .register-link {
          text-align: center;
          margin-top: 28px;
          font-size: 14px;
          color: #4a6380;
        }

        .register-link a {
          color: #0099ff;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s;
        }

        .register-link a:hover { color: #00c6ff; }

        @media (max-width: 1200px) {
          .login-left { display: none; }
          .login-right { width: 100%; border-left: none; }
        }
          html, body, #root {
        height: 100% !important;
        width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        }
          
      `}</style>

      <div className="login-root">
        {/* LEFT */}
        <div className="login-left">
          <div className="orb orb-1" />
          <div className="orb orb-2" />

          <div className="brand">
            <span className="brand-name">Rent<span className="brand-dot">Tech</span></span>
          </div>

          <div className="hero-text">
            <h1>Sewa alat<br /><span>teknologi</span><br />jadi mudah.</h1>
            <p>Platform rental perangkat teknologi terpercaya. Cepat, aman, dan transparan.</p>
          </div>

          <div className="stats">
            <div className="stat-item">
              <strong>⚡ Tanpa Ribet</strong>
              <span>Booking dalam hitungan menit</span>
            </div>
            <div className="stat-item">
              <strong>💳 Bayar via QRIS</strong>
              <span>Cepat & aman</span>
            </div>
            <div className="stat-item">
              <strong>📍 Lokasi Fleksibel</strong>
              <span>Pickup sesuai pilihanmu</span>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="login-right">
          <div className="form-box">
            <h2>Selamat datang</h2>
            <p className="subtitle">Masuk ke akun RentTech kamu</p>

            {error && <div className="error-msg">{error}</div>}

            <div className="field">
              <label>Email</label>
              <input name="email" type="email" placeholder="nama@email.com" onChange={handleChange} />
            </div>

            <div className="field">
              <label>Password</label>
              <input name="password" type="password" placeholder="••••••••" onChange={handleChange} />
            </div>

            <button className="btn-login" onClick={handleSubmit} disabled={loading}>
              {loading ? "Memproses..." : "Masuk"}
            </button>

            <p className="register-link">
              Belum punya akun? <Link to="/register">Daftar sekarang</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}