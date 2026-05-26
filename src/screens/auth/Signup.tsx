import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/useAuth";
import { Lbl } from "./Lbl";

export function SignupScreen() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const { login } = useAuth();

  const finish = () => {
    login();
    navigate("/dashboard");
  };

  return (
    <div className="auth-wrap">
      <aside className="auth-aside">
        <div className="lp-logo lg">
          <div className="lp-logo-mark lg">VC</div>
          <span>VeltaCore ITSM</span>
        </div>
        <div className="auth-pitch">
          <h2>
            Create your <span className="lp-highlight">multi-tenant workspace</span>
          </h2>
          <p>Connect production alert streams, logs, traces, and network telemetry.</p>
          <ul className="auth-checks">
            <li><i className="fa-solid fa-check" /> Full Business plan features</li>
            <li><i className="fa-solid fa-check" /> AI correlation + RCA</li>
            <li><i className="fa-solid fa-check" /> 45+ integrations</li>
            <li><i className="fa-solid fa-check" /> Unlimited workspaces</li>
            <li><i className="fa-solid fa-check" /> Migration help included</li>
          </ul>
          <div className="auth-trust">
            <div className="lp-avatar amber">P</div>
            <div className="lp-avatar teal">M</div>
            <div className="lp-avatar pink">Y</div>
            <span>Joined by 4,200+ teams this year</span>
          </div>
        </div>
      </aside>
      <main className="auth-main">
        <div className="auth-card">
          <div className="auth-steps">
            <div className={`auth-step${step >= 1 ? " on" : ""}`}><span>1</span> Account</div>
            <div className="auth-step-sep" />
            <div className={`auth-step${step >= 2 ? " on" : ""}`}><span>2</span> Workspace</div>
            <div className="auth-step-sep" />
            <div className={`auth-step${step >= 3 ? " on" : ""}`}><span>3</span> Team</div>
          </div>

          {step === 1 && (
            <>
              <h1>Create your account</h1>
              <p className="auth-sub">
                Use SSO or your work email. Personal email accounts not accepted.
              </p>
              <div className="sso-row">
                <button type="button" className="sso-btn">
                  <i className="fa-brands fa-google" /> Google
                </button>
                <button type="button" className="sso-btn">
                  <i className="fa-brands fa-microsoft" /> Microsoft
                </button>
                <button type="button" className="sso-btn">
                  <i className="fa-brands fa-github" /> GitHub
                </button>
              </div>
              <div className="auth-or"><span>or with email</span></div>
              <div className="auth-form">
                <div className="auth-row">
                  <Lbl l="Full name *">
                    <input className="select" placeholder="Full name" />
                  </Lbl>
                  <Lbl l="Work email *">
                    <input className="select" placeholder="name@company.com" />
                  </Lbl>
                </div>
                <Lbl l="Password *">
                  <input
                    className="select"
                    type="password"
                    placeholder="Min 12 chars, 1 number, 1 symbol"
                  />
                </Lbl>
                <Lbl l="">
                  <label style={{ fontSize: 12, display: "flex", gap: 8, alignItems: "center" }}>
                    <input type="checkbox" /> Send me product updates &amp; tips
                  </label>
                </Lbl>
              </div>
              <button type="button" className="lp-btn primary lg full" onClick={() => setStep(2)}>
                Continue <i className="fa-solid fa-arrow-right" />
              </button>
              <p className="auth-foot">
                Already have an account? <a onClick={() => navigate("/login")}>Sign in</a>
              </p>
            </>
          )}

          {step === 2 && (
            <>
              <h1>Set up your workspace</h1>
              <p className="auth-sub">Your team's home for incidents, alerts, and infra.</p>
              <div className="auth-form">
                <Lbl l="Workspace name *">
                  <input className="select" placeholder="Organization operations" />
                </Lbl>
                <Lbl l="Workspace URL *">
                  <div className="auth-url">
                    <input
                      className="select"
                      placeholder="organization-ops"
                      style={{ flex: 1, borderRight: "0", borderRadius: "3px 0 0 3px" }}
                    />
                    <span className="auth-url-suffix">.veltacore-itsm.io</span>
                  </div>
                </Lbl>
                <Lbl l="Team size">
                  <select className="select" defaultValue="11–50">
                    <option>1–10</option>
                    <option>11–50</option>
                    <option>51–250</option>
                    <option>250+</option>
                  </select>
                </Lbl>
                <Lbl l="What do you want to do first?">
                  <select className="select" defaultValue="Replace PagerDuty / Opsgenie">
                    <option>Replace PagerDuty / Opsgenie</option>
                    <option>Add on-prem infra monitoring</option>
                    <option>Connect Prometheus / Grafana</option>
                    <option>Migrate from ServiceNow</option>
                    <option>Model infrastructure and network devices</option>
                  </select>
                </Lbl>
              </div>
              <div className="auth-buttons">
                <button type="button" className="lp-btn ghost lg" onClick={() => setStep(1)}>
                  <i className="fa-solid fa-arrow-left" /> Back
                </button>
                <button type="button" className="lp-btn primary lg" onClick={() => setStep(3)}>
                  Continue <i className="fa-solid fa-arrow-right" />
                </button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h1>Invite your team</h1>
              <p className="auth-sub">You can do this later from Settings → Users.</p>
              <div className="auth-form">
                <Lbl l="Teammate emails">
                  <textarea
                    className="select"
                    rows={4}
                    placeholder="ops@company.com, sre@company.com..."
                    style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}
                  />
                </Lbl>
                <Lbl l="Default role">
                  <select className="select" defaultValue="Responder">
                    <option>Responder</option>
                    <option>Read-only</option>
                    <option>Admin</option>
                  </select>
                </Lbl>
              </div>
              <div className="auth-buttons">
                <button type="button" className="lp-btn ghost lg" onClick={() => setStep(2)}>
                  <i className="fa-solid fa-arrow-left" /> Back
                </button>
                <button type="button" className="lp-btn primary lg" onClick={finish}>
                  Create workspace <i className="fa-solid fa-arrow-right" />
                </button>
              </div>
              <p className="auth-foot">
                <a onClick={finish}>Skip — I'll invite later</a>
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
