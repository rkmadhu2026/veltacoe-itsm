import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/useAuth";
import { Lbl } from "./Lbl";

export function SigninScreen() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const enter = () => {
    login();
    navigate("/dashboard");
  };

  return (
    <div className="auth-wrap login-showcase">
      <section className="login-stage">
        <div className="login-orbit" />
        <div className="login-visual">
          <div className="login-browser">
            <div className="login-browser-top">
              <i /><i /><i />
              <span>ops.veltacore-itsm.io</span>
            </div>
            <div className="login-dashboard-preview">
              <div className="preview-rail">
                <span /><span /><span /><span />
              </div>
              <div className="preview-main">
                <div className="preview-head">
                  <b>Live operations</b>
                  <span>AI triage active</span>
                </div>
                <div className="preview-chart">
                  {[36, 54, 41, 78, 62, 88, 57, 69, 44, 74].map((h, i) => (
                    <span key={i} style={{ height: h + "%" }} />
                  ))}
                </div>
                <div className="preview-grid">
                  <div><b>99.99%</b><span>uptime</span></div>
                  <div><b>14s</b><span>RCA</span></div>
                  <div><b>62%</b><span>MTTR</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="login-copy">
          <div className="lp-logo lg">
            <div className="lp-logo-mark lg">VC</div>
            <span>VeltaCore ITSM</span>
          </div>
          <h2>Manage incidents, monitor performance, and stay in control securely.</h2>
          <p>
            One command center for service health, on-call response, infrastructure, runbooks, and
            AI-assisted root cause analysis.
          </p>
        </div>
      </section>
      <main className="auth-main">
        <div className="auth-card login-card">
          <h1>Hi there, great to see you</h1>
          <p className="auth-sub">Sign in to your secure VeltaCore ITSM workspace.</p>
          <form
            className="auth-form"
            onSubmit={(e) => {
              e.preventDefault();
              enter();
            }}
          >
            <Lbl l="Email*">
              <input className="select" placeholder="name@company.com" />
            </Lbl>
            <Lbl l="Password*">
              <div className="password-shell">
                <input className="select" type="password" defaultValue="••••••••••••" />
                <i className="fa-solid fa-eye" />
              </div>
            </Lbl>
            <div className="login-options">
              <label>
                <input type="checkbox" defaultChecked /> Remember me
              </label>
              <a>Forgot password?</a>
            </div>
            <button type="submit" className="login-submit">Log in</button>
          </form>
          <p className="auth-foot">
            Don't have an account? <a onClick={() => navigate("/signup")}>Sign up</a>
          </p>
          <div className="login-sso-row">
            <button type="button" onClick={enter}>
              <i className="fa-brands fa-microsoft" /> Entra ID
            </button>
            <button type="button" onClick={enter}>
              <i className="fa-solid fa-key" /> SAML
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
