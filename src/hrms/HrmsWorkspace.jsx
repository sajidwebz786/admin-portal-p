import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { api } from "../services/apiService";
import logo from "../assets/images/logo.png";
import catalog from "./catalog.json";
import "./hrms.css";

const request = async (method, path, data) =>
  (await api({ method, url: `/hrms${path}`, data })).data;
const money = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(n || 0));
const display = (v) =>
  v === true
    ? "Yes"
    : v === false
      ? "No"
      : v?.filename ||
        (v === null || v === undefined || v === "" ? "—" : String(v));
const employeeName = (users, id) =>
  users.find((u) => u.id === Number(id))?.fullName ||
  users.find((u) => u.id === Number(id))?.firstName ||
  (id ? `Employee ${id}` : "Organization");
function exportCsv(name, rows) {
  if (!rows.length) return;
  const keys = [...new Set(rows.flatMap(Object.keys))];
  const escape = (value) =>
    '"' +
    String(value ?? "")
      .replace(/^[=+@\-\t\r]/, "'$&")
      .replaceAll('"', '""') +
    '"';
  const csv = [
    keys.map(escape).join(","),
    ...rows.map((row) =>
      keys
        .map((k) =>
          escape(typeof row[k] === "object" ? JSON.stringify(row[k]) : row[k]),
        )
        .join(","),
    ),
  ].join("\r\n");
  download(
    new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" }),
    `${name}.csv`,
  );
}
function download(blob, name) {
  const url = URL.createObjectURL(blob),
    a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function Status({ value }) {
  return (
    <span className={`hr-status hr-status-${value}`}>
      {value?.replaceAll("-", " ")}
    </span>
  );
}
function Empty({
  children = "No records yet. Add company-approved data to get started.",
}) {
  return (
    <div className="hr-empty">
      <i className="fas fa-folder-open" aria-hidden="true" />
      <p>{children}</p>
    </div>
  );
}
function Modal({ title, children, onClose }) {
  useEffect(() => {
    const listener = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", listener);
    const previous = document.activeElement;
    const first = document.querySelector(".hr-modal button");
    first?.focus();
    return () => {
      document.removeEventListener("keydown", listener);
      previous?.focus();
    };
  }, []);
  return (
    <div
      className="hr-modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section
        className="hr-modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <header>
          <h2>{title}</h2>
          <button
            type="button"
            className="hr-icon-button"
            aria-label="Close dialog"
            onClick={onClose}
          >
            ×
          </button>
        </header>
        {children}
      </section>
    </div>
  );
}
function Field({
  field,
  value,
  onChange,
  employees = [],
  headquarters = [],
  disabled = false,
}) {
  const common = {
    id: `hr-${field.name}`,
    name: field.name,
    required: field.required,
    disabled,
    value: value ?? "",
    onChange: (e) => onChange(e.target.value),
  };
  if (field.type === "checkbox")
    return (
      <label className="hr-check">
        <input
          type="checkbox"
          checked={!!value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
        />
        {field.label}
      </label>
    );
  if (field.type === "file")
    return (
      <label>
        {field.label}
        <input
          type="file"
          accept="application/pdf,image/png,image/jpeg"
          disabled={disabled}
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            if (file.size > 4 * 1024 * 1024) {
              e.target.setCustomValidity("Maximum attachment size is 4 MB.");
              e.target.reportValidity();
              return;
            }
            e.target.setCustomValidity("");
            const reader = new FileReader();
            reader.onload = () =>
              onChange({
                filename: file.name,
                mime: file.type,
                content: String(reader.result).split(",")[1],
              });
            reader.readAsDataURL(file);
          }}
        />
        {value?.filename && <small>{value.filename}</small>}
        <small>PDF, PNG or JPEG · up to 4 MB</small>
      </label>
    );
  return (
    <label
      htmlFor={common.id}
      className={field.type === "textarea" ? "hr-full" : ""}
    >
      {field.label}
      {field.required ? " *" : ""}
      {field.type === "textarea" ? (
        <textarea {...common} rows="3" />
      ) : field.type === "select" ? (
        <select {...common}>
          <option value="">Select…</option>
          {field.options.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      ) : ["employee", "hq"].includes(field.type) ? (
        <select {...common}>
          <option value="">Select…</option>
          {(field.type === "hq" ? headquarters : employees).map((o) => (
            <option key={o.id} value={o.id}>
              {o.fullName || o.name || o.firstName}
            </option>
          ))}
        </select>
      ) : (
        <input
          {...common}
          type={
            ["number", "money"].includes(field.type) ? "number" : field.type
          }
          step={
            field.type === "money"
              ? "0.01"
              : field.type === "number"
                ? "any"
                : undefined
          }
          min={field.type === "money" ? 0 : undefined}
        />
      )}
    </label>
  );
}

export default function HrmsWorkspace({ onLogout }) {
  const location = useLocation(),
    navigate = useNavigate();
  const section = location.pathname.split("/")[2] || "dashboard";
  const [meta, setMeta] = useState(null),
    [users, setUsers] = useState([]),
    [headquarters, setHeadquarters] = useState([]),
    [summary, setSummary] = useState(null);
  const [error, setError] = useState(""),
    [loading, setLoading] = useState(true),
    [mobile, setMobile] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const me = JSON.parse(localStorage.getItem("adminUser") || "{}");
  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const m = await request("get", "/meta");
      setMeta(m);
      const [u, h, s] = await Promise.all([
        request("get", "/employees"),
        request("get", "/headquarters"),
        request("get", "/dashboard"),
      ]);
      setUsers(u);
      setHeadquarters(h);
      setSummary(s);
    } catch (e) {
      setError(
        e.message ||
          "HRMS is unavailable. Please retry after the server deployment completes.",
      );
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);
  useEffect(() => {
    setMobile(false);
    document.title = "Pams-HRMS · PAMSFORCE";
  }, [location.pathname]);
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);
  useEffect(() => {
    const sync = (event) => {
      if (event.key === "adminToken" && !event.newValue) onLogout();
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, [onLogout]);
  const modules = meta?.modules || catalog.modules;
  const canRead = (id) => !meta || meta.permissions[id]?.read;
  const nav = [
    { id: "dashboard", label: "HR Dashboard", icon: "th-large" },
    { id: "employees", label: "Employee Master", icon: "id-badge" },
    ...modules.filter((m) => canRead(m.id)),
    { id: "reports", label: "HR Reports", icon: "chart-bar" },
    { id: "workflow", label: "HR Workflow", icon: "project-diagram" },
    ...(meta?.canAssignRoles
      ? [{ id: "access", label: "Roles & Permissions", icon: "user-shield" }]
      : []),
  ];
  const selected = nav.find((n) => n.id === section);
  const props = { meta, users, headquarters, me, onChanged: load };
  return (
    <div className={`hr-app ${mobile ? "hr-menu-open" : ""}`}>
      <aside className="hr-sidebar">
        <Link to="/hrms/dashboard" className="hr-brand">
          <img src={logo} alt="PAMSFORCE" />
          <div>
            <strong>Pams-HRMS</strong>
            <span>People & workplace</span>
          </div>
        </Link>
        <div className="hr-workspace-label">HUMAN RESOURCES</div>
        <nav aria-label="HR navigation">
          {nav.map((n) => (
            <Link
              key={n.id}
              to={`/hrms/${n.id}`}
              className={section === n.id ? "active" : ""}
            >
              <i
                className={`fas fa-${n.icon || "circle"}`}
                aria-hidden="true"
              />
              <span>{n.label}</span>
            </Link>
          ))}
        </nav>
        <footer>
          <a href="#/dashboard">
            <i className="fas fa-arrow-left" /> PAMS platform
          </a>
          <button
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            <i className={`fas fa-${theme === "light" ? "moon" : "sun"}`} />{" "}
            {theme === "light" ? "Dark" : "Light"} appearance
          </button>
          <button onClick={onLogout}>
            <i className="fas fa-sign-out-alt" /> Sign out
          </button>
        </footer>
      </aside>
      {mobile && (
        <button
          className="hr-backdrop"
          aria-label="Close HR navigation"
          onClick={() => setMobile(false)}
        />
      )}
      <div className="hr-body">
        <header className="hr-topbar">
          <div>
            <button
              className="hr-mobile-toggle"
              onClick={() => setMobile(!mobile)}
              aria-expanded={mobile}
              aria-label="Toggle HR navigation"
            >
              <i className="fas fa-bars" />
            </button>
            <span>
              PAMS{" "}
              <span className="hr-breadcrumb">
                / Human Resources / {selected?.label || "Page"}
              </span>
            </span>
          </div>
          <div className="hr-account">
            <span className="hr-avatar">
              {(me.firstName || "P").slice(0, 1)}
            </span>
            <div>
              <strong>
                {me.firstName} {me.lastName}
              </strong>
              <small>{meta?.role || "Connecting…"}</small>
            </div>
          </div>
        </header>
        <main className="hr-main">
          <div className="hr-page-title">
            <div>
              <span className="hr-eyebrow">PAMS-HRMS</span>
              <h1>{selected?.label || "Access restricted"}</h1>
              <p>
                {modules.find((m) => m.id === section)?.description ||
                  "One connected employee lifecycle, from joining to exit."}
              </p>
            </div>
            <button
              className="hr-button secondary"
              disabled={loading}
              onClick={load}
            >
              <i className="fas fa-sync-alt" /> Refresh
            </button>
          </div>
          {error && (
            <div className="hr-alert" role="alert">
              <strong>Unable to load HR data.</strong> {error}
              <button onClick={load}>Retry</button>
            </div>
          )}
          {loading && !meta ? (
            <div className="hr-card hr-loading" role="status">
              Connecting to Pams-HRMS…
            </div>
          ) : section === "dashboard" ? (
            <Dashboard summary={summary} />
          ) : section === "employees" ? (
            <Employees {...props} />
          ) : section === "reports" ? (
            <Reports {...props} />
          ) : section === "workflow" ? (
            <Workflow summary={summary} />
          ) : section === "access" && meta?.canAssignRoles ? (
            <Access {...props} />
          ) : modules.some((m) => m.id === section) && canRead(section) ? (
            <Register
              key={location.pathname + location.search}
              module={section}
              {...props}
            />
          ) : (
            <Empty>Your HR role does not have access to this section.</Empty>
          )}
        </main>
        <div className="hr-footnote">
          Pams-HRMS <span>Connected to PAMSFORCE</span>
        </div>
      </div>
    </div>
  );
}
function Dashboard({ summary: s }) {
  if (!s)
    return (
      <Empty>Dashboard metrics will appear when the HR API is available.</Empty>
    );
  const cards = [
    ["Total Employees", s.totalEmployees, "users"],
    ["Active Employees", s.activeEmployees, "user-check"],
    ["New Joinings", s.newJoinings, "user-plus"],
    ["Resignations", s.resignations, "door-open"],
    ["Vacant Positions", s.vacantPositions, "briefcase"],
    ["Attendance Entries", s.attendance, "calendar-check"],
    ["Leave Requests", s.leaveRequests, "calendar-alt"],
    ["Training Pending", s.pendingTraining, "graduation-cap"],
    [
      "Performance Rating",
      s.performanceRating == null
        ? "—"
        : s.performanceRating.toFixed(1) + " / 5",
      "star",
    ],
    [
      "Payroll Status",
      s.payroll
        ? `${s.payroll.settled} settled · ${s.payroll.pending} pending`
        : "Restricted",
      "wallet",
    ],
  ];
  return (
    <>
      <div className="hr-overview-banner">
        <div>
          <span className="hr-eyebrow">PEOPLE OPERATIONS</span>
          <h2>A clear view of your workforce.</h2>
          <p>
            Joining, attendance, development and employee services in one place.
          </p>
        </div>
        <Link className="hr-button" to="/hrms/employees">
          Open employee directory <span>→</span>
        </Link>
      </div>
      <div className="hr-metrics">
        {cards.map(([label, value, icon]) => (
          <article key={label} className="hr-card hr-metric">
            <i className={`fas fa-${icon}`} aria-hidden="true" />
            <span>{label}</span>
            <strong>{value}</strong>
            <small>
              {[
                "New Joinings",
                "Resignations",
                "Attendance Entries",
                "Leave Requests",
                "Payroll Status",
              ].includes(label)
                ? "Current month"
                : "Within your access scope"}
            </small>
          </article>
        ))}
      </div>
      <div className="hr-two-columns">
        <section className="hr-card">
          <header className="hr-card-title">
            <h2>Recent HR activity</h2>
            <span>{s.pending} awaiting review</span>
          </header>
          {s.recent.length ? (
            <ul className="hr-activity">
              {s.recent.map((r, i) => (
                <li key={i}>
                  <div>
                    <strong>{r.title}</strong>
                    <small>{catalog.resources[r.resource]?.label}</small>
                  </div>
                  <Status value={r.status} />
                </li>
              ))}
            </ul>
          ) : (
            <Empty />
          )}
        </section>
        <section className="hr-card">
          <header className="hr-card-title">
            <h2>PAMS integration</h2>
            <span>All recorded periods</span>
          </header>
          <dl className="hr-integration">
            <div>
              <dt>Sales recorded</dt>
              <dd>{money(s.integration.salesAmount)}</dd>
            </div>
            <div>
              <dt>Doctor call records</dt>
              <dd>{s.integration.doctorCallRecords}</dd>
            </div>
            <div>
              <dt>SFA expense records</dt>
              <dd>{s.integration.sfaExpenseRecords}</dd>
            </div>
          </dl>
          <p className="hr-muted">
            Shared employees and reporting hierarchy connect HR to field
            activity. SFA expenses remain in their existing ledger.
          </p>
          <a
            className="hr-text-link"
            href="#/expense-management"
            target="_blank"
            rel="noopener noreferrer"
          >
            Open SFA expense ledger ↗
          </a>
        </section>
      </div>
    </>
  );
}

function Register({ module, meta, users, headquarters, me, onChanged }) {
  const location = useLocation(),
    navigate = useNavigate();
  const resources = meta?.resources || catalog.resources;
  const tabs = Object.entries(resources).filter(([, r]) => r.module === module);
  const requested = new URLSearchParams(location.search).get("register");
  const resource = tabs.some(([id]) => id === requested)
      ? requested
      : tabs[0]?.[0],
    spec = resources[resource];
  const permission = meta?.permissions[module] || {};
  const [rows, setRows] = useState([]),
    [loading, setLoading] = useState(false),
    [error, setError] = useState(""),
    [success, setSuccess] = useState(""),
    [filter, setFilter] = useState(""),
    [status, setStatus] = useState(""),
    [employeeFilter, setEmployeeFilter] = useState("");
  const [calendar, setCalendar] = useState(false);
  const [editing, setEditing] = useState(null),
    [view, setView] = useState(null),
    [busy, setBusy] = useState(false),
    [form, setForm] = useState({}),
    [employee, setEmployee] = useState(""),
    [balances, setBalances] = useState([]);
  const load = async () => {
    setLoading(true);
    setError("");
    try {
      setRows(await request("get", `/records/${resource}`));
      if (module === "leave")
        setBalances(await request("get", "/leave-summary"));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (meta) load();
  }, [resource, meta]);
  const reviewerFields = [
    "actualLastDay",
    "managerReview",
    "finalRating",
    "promotionRecommendation",
    "incrementRecommendation",
    "score",
    "passMark",
    "certificate",
    "clearanceComplete",
    "assetsReturned",
    "exitInterview",
    "finalSettlement",
    "experienceLetter",
    "relievingLetter",
    "employeeResponse",
    "actionTaken",
  ];
  const canCreate =
    permission.write && (permission.global || spec?.selfService);
  const run = async (fn) => {
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      await fn();
      setSuccess("Changes saved.");
      await load();
      onChanged();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  const begin = (row) => {
    setError("");
    setEditing(row || {});
    setForm(row?.data || {});
    setEmployee(row?.employee_id || (!permission.global ? me.id : ""));
  };
  const save = (e) => {
    e.preventDefault();
    run(async () => {
      await request(
        editing.id ? "put" : "post",
        `/records/${resource}${editing.id ? "/" + editing.id : ""}`,
        { employee_id: employee || null, data: form, version: editing.version },
      );
      setEditing(null);
    });
  };
  const action = async (row, act) => {
    const comment =
      act === "reject" ? window.prompt("Reason for rejection") : "";
    if (act === "reject" && !comment) return;
    if (
      ["archive", "settle", "complete", "return"].includes(act) &&
      !window.confirm(`Confirm ${act} for “${row.data.title}”?`)
    )
      return;
    await run(() =>
      request("post", `/records/${resource}/${row.id}/action`, {
        action: act,
        version: row.version,
        comment,
        ...(act === "settle"
          ? {
              paymentReference:
                window.prompt("Payment / bank transaction reference") || "",
            }
          : {}),
      }),
    );
  };
  const visible = rows.filter(
    (r) =>
      (!filter ||
        `${r.data.title} ${employeeName(users, r.employee_id)}`
          .toLowerCase()
          .includes(filter.toLowerCase())) &&
      (!status || r.status === status) &&
      (!employeeFilter || r.employee_id === Number(employeeFilter)),
  );
  const getFile = async (row, field) => {
    try {
      const response = await api.get(
        `/hrms/records/${resource}/${row.id}/file/${field}`,
        { responseType: "blob" },
      );
      download(response.data, row.data[field].filename);
    } catch (e) {
      setError(e.message);
    }
  };
  const useSalaryStructure = async () => {
    try {
      const all = await request("get", "/records/salary-structures");
      const approved = all
        .filter(
          (r) =>
            r.employee_id === Number(employee) &&
            ["approved", "completed"].includes(r.status) &&
            r.data.effectiveDate <= new Date().toISOString().slice(0, 10),
        )
        .sort((a, b) =>
          b.data.effectiveDate.localeCompare(a.data.effectiveDate),
        );
      if (!approved.length) {
        setError(
          "No effective approved salary structure exists for this employee.",
        );
        return;
      }
      const { title, effectiveDate, notes, ...components } = approved[0].data;
      setForm((f) => ({ ...f, ...components }));
      setError("");
    } catch (e) {
      setError(e.message);
    }
  };
  const checkGPS = () => {
    if (!navigator.geolocation) {
      setError("GPS is unavailable in this browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setForm((f) => ({
          ...f,
          source: "GPS",
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracyMetres: Math.round(pos.coords.accuracy),
        })),
      () =>
        setError(
          "Location permission was denied or the location is unavailable.",
        ),
      { enableHighAccuracy: true, timeout: 15000 },
    );
  };
  return (
    <>
      <div
        className="hr-tabs"
        role="navigation"
        aria-label={`${module} registers`}
      >
        {tabs.map(([id, r]) => (
          <button
            key={id}
            className={resource === id ? "active" : ""}
            onClick={() => navigate(`/hrms/${module}?register=${id}`)}
          >
            {r.label}
          </button>
        ))}
      </div>
      {["leave", "training"].includes(module) && (
        <div className="hr-actions hr-calendar-toggle">
          <button
            className="hr-button secondary"
            onClick={() => setCalendar(!calendar)}
          >
            {calendar ? "Hide calendar" : "Open calendar"}
          </button>
        </div>
      )}
      {calendar && <HRCalendar module={module} users={users} />}
      {module === "payroll" && (
        <p className="hr-note">
          Enter company-approved salary components and statutory deductions.
          Gross and net pay are calculated from those amounts; tax rates are not
          assumed.
        </p>
      )}
      {module === "attendance" && (
        <p className="hr-note">
          GPS attendance captures browser location with consent. Face
          recognition is optional and is not enabled.
        </p>
      )}
      {module === "expenses" && (
        <p className="hr-note">
          HR claims are recorded here. Existing field claims remain available in
          the{" "}
          <a
            href="#/expense-management"
            target="_blank"
            rel="noopener noreferrer"
          >
            SFA expense ledger ↗
          </a>
          .
        </p>
      )}
      {error && (
        <div className="hr-alert" role="alert">
          {error}
        </div>
      )}
      {success && (
        <div className="hr-success" role="status">
          {success}
        </div>
      )}
      {module === "leave" && balances.length > 0 && (
        <div className="hr-balance-strip">
          {balances.map((b, i) => (
            <div key={i}>
              <strong>{b.remaining} days</strong>
              <span>
                {employeeName(users, b.employee_id)} · {b.leaveType} · {b.year}
              </span>
            </div>
          ))}
        </div>
      )}
      <section className="hr-card">
        <div className="hr-register-heading">
          <div>
            <h2>{spec?.label}</h2>
            <p>
              {visible.length} record{visible.length === 1 ? "" : "s"} within
              your access scope
            </p>
          </div>
          <div className="hr-actions">
            <button
              className="hr-button secondary"
              disabled={!visible.length}
              onClick={() =>
                exportCsv(
                  resource,
                  visible.map((r) => ({
                    employee: employeeName(users, r.employee_id),
                    status: r.status,
                    ...Object.fromEntries(
                      Object.entries(r.data).filter(([, v]) => !v?.filename),
                    ),
                  })),
                )
              }
            >
              Export CSV
            </button>
            {canCreate && (
              <button className="hr-button" onClick={() => begin(null)}>
                + Add record
              </button>
            )}
          </div>
        </div>
        <div className="hr-filters">
          <input
            aria-label="Search records"
            placeholder="Search name or title…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          <select
            aria-label="Filter status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All statuses</option>
            {[
              "draft",
              "submitted",
              "approved",
              "rejected",
              "settled",
              "completed",
            ].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <select
            aria-label="Filter employee"
            value={employeeFilter}
            onChange={(e) => setEmployeeFilter(e.target.value)}
          >
            <option value="">All visible employees</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.fullName || u.firstName}
              </option>
            ))}
          </select>
        </div>
        {loading ? (
          <div className="hr-loading" role="status">
            Loading register…
          </div>
        ) : visible.length ? (
          <div className="hr-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Record</th>
                  <th>Employee</th>
                  <th>Date / Period</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <strong>{row.data.title}</strong>
                      {row.data.netPay != null && (
                        <small>Net pay {money(row.data.netPay)}</small>
                      )}
                      {row.data.amount != null && (
                        <small>{money(row.data.amount)}</small>
                      )}
                      {row.data.lateMinutes > 0 && (
                        <small>Late: {row.data.lateMinutes} min</small>
                      )}
                      {row.data.earlyExitMinutes > 0 && (
                        <small>
                          Early exit: {row.data.earlyExitMinutes} min
                        </small>
                      )}
                    </td>
                    <td>{employeeName(users, row.employee_id)}</td>
                    <td>
                      {row.data.date ||
                        row.data.month ||
                        row.data.startDate ||
                        row.data.effectiveDate ||
                        row.data.issueDate ||
                        row.data.scheduledAt?.replace("T", " ") ||
                        new Date(row.createdAt).toLocaleDateString("en-IN")}
                    </td>
                    <td>
                      <Status value={row.status} />
                    </td>
                    <td>
                      <div className="hr-row-actions">
                        <button onClick={() => setView(row)}>View</button>
                        {permission.write &&
                          (permission.global ||
                            row.created_by === me.id ||
                            permission.review) &&
                          (["draft", "rejected"].includes(row.status) ||
                            (row.status === "submitted" &&
                              permission.review)) && (
                            <button onClick={() => begin(row)}>Edit</button>
                          )}
                        {["draft", "rejected"].includes(row.status) &&
                          row.created_by === me.id && (
                            <button
                              disabled={busy}
                              onClick={() => action(row, "submit")}
                            >
                              Submit
                            </button>
                          )}
                        {row.status === "draft" &&
                          (row.created_by === me.id ||
                            meta?.role === "HR Admin") && (
                            <button
                              disabled={busy}
                              onClick={() => action(row, "archive")}
                            >
                              Archive
                            </button>
                          )}
                        {row.status === "submitted" &&
                          permission.review &&
                          row.employee_id !== me.id &&
                          row.created_by !== me.id && (
                            <>
                              <button
                                disabled={busy}
                                onClick={() => action(row, "approve")}
                              >
                                Approve
                              </button>
                              <button
                                className="hr-danger-text"
                                disabled={busy}
                                onClick={() => action(row, "reject")}
                              >
                                Reject
                              </button>
                            </>
                          )}
                        {row.status === "approved" &&
                          ["HR Admin", "Finance"].includes(meta?.role) &&
                          ["payroll", "claims", "encashments"].includes(
                            resource,
                          ) && (
                            <button
                              disabled={busy}
                              onClick={() => action(row, "settle")}
                            >
                              Settle
                            </button>
                          )}
                        {row.status === "approved" &&
                          resource === "asset-allocations" &&
                          ["HR Admin", "HR Executive"].includes(meta?.role) && (
                            <button
                              disabled={busy}
                              onClick={() => action(row, "return")}
                            >
                              Return asset
                            </button>
                          )}
                        {row.status === "approved" &&
                          ["HR Admin", "HR Executive"].includes(meta?.role) &&
                          ![
                            "payroll",
                            "claims",
                            "encashments",
                            "asset-allocations",
                          ].includes(resource) && (
                            <button
                              disabled={busy}
                              onClick={() => action(row, "complete")}
                            >
                              Complete
                            </button>
                          )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty />
        )}
      </section>
      {editing && (
        <Modal
          title={`${editing.id ? "Edit" : "Add"} ${spec.label}`}
          onClose={() => setEditing(null)}
        >
          <form onSubmit={save}>
            <div className="hr-form-grid">
              <label>
                Employee
                <select
                  disabled={!!editing.id || !permission.global}
                  value={employee}
                  onChange={(e) => setEmployee(e.target.value)}
                >
                  <option value="">Organization / candidate record</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.fullName || u.firstName}
                    </option>
                  ))}
                </select>
              </label>
              {spec.fields.map((field) => (
                <Field
                  key={field.name}
                  field={field}
                  value={form[field.name]}
                  disabled={
                    (reviewerFields.includes(field.name) &&
                      !permission.review) ||
                    (editing.status === "submitted" &&
                      !reviewerFields.includes(field.name))
                  }
                  employees={users}
                  headquarters={headquarters}
                  onChange={(value) =>
                    setForm((f) => ({ ...f, [field.name]: value }))
                  }
                />
              ))}
            </div>
            {resource === "payroll" && (
              <button
                type="button"
                className="hr-button secondary"
                disabled={!employee}
                onClick={useSalaryStructure}
              >
                Use approved salary structure
              </button>
            )}
            {resource === "attendance" && (
              <button
                type="button"
                className="hr-button secondary"
                onClick={checkGPS}
              >
                Capture current GPS location
              </button>
            )}
            {error && (
              <div role="alert" className="hr-alert">
                {error}
              </div>
            )}
            <footer>
              <button
                type="button"
                className="hr-button secondary"
                onClick={() => setEditing(null)}
              >
                Cancel
              </button>
              <button className="hr-button" disabled={busy}>
                {busy ? "Saving…" : "Save record"}
              </button>
            </footer>
          </form>
        </Modal>
      )}
      {view && (
        <Modal
          title={resource === "payroll" ? "Employee Payslip" : view.data.title}
          onClose={() => setView(null)}
        >
          <div className="hr-record-print">
            <div className="hr-print-brand">
              <strong>PAMSFORCE · Pams-HRMS</strong>
              <p>
                {spec.label} · #{view.id}
              </p>
            </div>
            <p>
              <strong>{employeeName(users, view.employee_id)}</strong>{" "}
              <Status value={view.status} />
            </p>
            <dl className="hr-detail-grid">
              {Object.entries(view.data).map(([k, v]) => (
                <div key={k}>
                  <dt>
                    {spec.fields.find((f) => f.name === k)?.label ||
                      k.replace(/([A-Z])/g, " $1")}
                  </dt>
                  <dd>
                    {v?.filename ? (
                      <button
                        className="hr-text-link"
                        onClick={() => getFile(view, k)}
                      >
                        {v.filename} ↓
                      </button>
                    ) : (
                      display(v)
                    )}
                  </dd>
                </div>
              ))}
            </dl>
            <h3>Workflow history</h3>
            <ul className="hr-history">
              {view.history.map((h, i) => (
                <li key={i}>
                  <strong>{h.action}</strong> ·{" "}
                  {h.name || employeeName(users, h.by)} ·{" "}
                  {new Date(h.at).toLocaleString("en-IN")}
                  {h.comment && <p>{h.comment}</p>}
                </li>
              ))}
            </ul>
          </div>
          <footer>
            <button
              className="hr-button secondary"
              onClick={() => window.print()}
            >
              Print / Save PDF
            </button>
            <button className="hr-button" onClick={() => setView(null)}>
              Close
            </button>
          </footer>
        </Modal>
      )}
    </>
  );
}

function HRCalendar({ module, users }) {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7)),
    [events, setEvents] = useState([]),
    [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const rows =
          module === "leave"
            ? await Promise.all([
                request("get", "/records/leave-requests"),
                request("get", "/records/holidays"),
              ])
            : [await request("get", "/records/training-calendar")];
        if (active) setEvents(rows.flat());
      } catch (e) {
        if (active) setError(e.message);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [module]);
  const [year, number] = month.split("-").map(Number),
    days = new Date(year, number, 0).getDate(),
    offset = new Date(year, number - 1, 1).getDay();
  return (
    <section className="hr-card hr-pad">
      <div className="hr-register-heading">
        <h2>
          {module === "leave"
            ? "Leave & holiday calendar"
            : "Training calendar"}
        </h2>
        <input
          type="month"
          aria-label="Calendar month"
          value={month}
          onChange={(e) => {
            if (e.target.value) setMonth(e.target.value);
          }}
        />
      </div>
      {error && (
        <div role="alert" className="hr-alert">
          {error}
        </div>
      )}
      <div className="hr-calendar">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <strong key={d}>{d}</strong>
        ))}
        {Array.from({ length: offset }, (_, i) => (
          <div key={"blank" + i} />
        ))}
        {Array.from({ length: days }, (_, i) => {
          const date = `${month}-${String(i + 1).padStart(2, "0")}`;
          const matches = events.filter((r) =>
            r.resource === "holidays"
              ? r.data.date === date
              : r.data.startDate <= date &&
                r.data.endDate >= date &&
                (r.resource !== "leave-requests" ||
                  ["approved", "completed"].includes(r.status)),
          );
          return (
            <div key={date}>
              <span>{i + 1}</span>
              {matches.map((r) => (
                <small key={r.id} title={r.data.title}>
                  {r.resource === "leave-requests"
                    ? employeeName(users, r.employee_id)
                    : r.data.title}
                </small>
              ))}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Employees({ meta, users, headquarters, me, onChanged }) {
  const [search, setSearch] = useState(""),
    [editing, setEditing] = useState(null),
    [form, setForm] = useState({}),
    [secret, setSecret] = useState({}),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [adding, setAdding] = useState(false),
    [newUser, setNewUser] = useState({ employeeType: "MR" });
  const canWrite = ["HR Admin", "HR Executive"].includes(meta?.role);
  const selected = users.filter((u) =>
    `${u.fullName} ${u.email} ${u.employeeId} ${u.employeeType}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  const open = async (u) => {
    setEditing(u);
    setForm(u.profile);
    setSecret({});
    setError("");
    if (canWrite || meta?.role === "Finance" || u.id === me.id)
      try {
        setSecret(await request("get", `/employees/${u.id}/private`));
      } catch (e) {
        setError(e.message);
      }
  };
  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await request("put", `/employees/${editing.id}`, {
        profile: form,
        private: secret,
        version: editing.version,
      });
      setEditing(null);
      await onChanged();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  const create = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await request("post", "/employees", newUser);
      setAdding(false);
      setNewUser({ employeeType: "MR" });
      await onChanged();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  const profileFields = [
    ["department", "Department"],
    ["grade", "Grade"],
    ["joiningDate", "Joining Date", "date"],
    ["confirmationDate", "Confirmation Date", "date"],
    ["employmentStatus", "Employment Status", "select"],
    ["emergencyName", "Emergency Contact Name"],
    ["emergencyPhone", "Emergency Contact Phone"],
    ["contactPhone", "Contact Phone"],
    ["address", "Address", "textarea"],
    ["zone", "Zone"],
    ["region", "Region"],
  ];
  return (
    <>
      <section className="hr-card">
        <div className="hr-register-heading">
          <div>
            <h2>Employee directory</h2>
            <p>Shared with PAMS users, roles and reporting hierarchy.</p>
          </div>
          <div className="hr-actions">
            <button
              className="hr-button secondary"
              onClick={() =>
                exportCsv(
                  "employees",
                  selected.map(({ profile, ...u }) => ({
                    ...u,
                    ...profile,
                    photo: undefined,
                  })),
                )
              }
              disabled={!selected.length}
            >
              Export CSV
            </button>
            {canWrite && (
              <button
                className="hr-button"
                onClick={() => {
                  setAdding(true);
                  setError("");
                }}
              >
                + Add employee
              </button>
            )}
          </div>
        </div>
        <div className="hr-filters">
          <input
            placeholder="Search employees…"
            aria-label="Search employees"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="hr-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Designation</th>
                <th>Department / Grade</th>
                <th>Reporting Manager</th>
                <th>HQ</th>
                <th>Status</th>
                <th>Profile</th>
              </tr>
            </thead>
            <tbody>
              {selected.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="hr-person">
                      {u.profile.photo ? (
                        <img src={u.profile.photo} alt="" />
                      ) : (
                        <span className="hr-avatar">
                          {u.firstName?.slice(0, 1)}
                        </span>
                      )}
                      <div>
                        <strong>
                          {u.fullName || `${u.firstName} ${u.lastName}`}
                        </strong>
                        <small>
                          {u.employeeId || "ID not assigned"} · {u.email}
                        </small>
                      </div>
                    </div>
                  </td>
                  <td>{u.employeeType || u.role}</td>
                  <td>
                    {u.profile.department || "—"} / {u.profile.grade || "—"}
                  </td>
                  <td>
                    {u.reportingTo
                      ? employeeName(users, u.reportingTo)
                      : "Not assigned"}
                  </td>
                  <td>
                    {headquarters.find((h) => h.id === u.hq_id)?.name || "—"}
                  </td>
                  <td>
                    <Status value={u.isActive ? "active" : "inactive"} />
                  </td>
                  <td>
                    <button className="hr-text-link" onClick={() => open(u)}>
                      {canWrite ? "Manage" : "View"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!selected.length && <Empty />}
      </section>
      {editing && (
        <Modal
          title={`${editing.fullName || editing.firstName} · HR Profile`}
          onClose={() => setEditing(null)}
        >
          <form onSubmit={save}>
            <div className="hr-form-grid">
              {profileFields.map(([name, label, type = "text"]) => (
                <Field
                  key={name}
                  field={{
                    name,
                    label,
                    type,
                    options: [
                      "Probation",
                      "Confirmed",
                      "Notice Period",
                      "Resigned",
                      "Terminated",
                      "Retired",
                    ],
                  }}
                  value={form[name]}
                  disabled={!canWrite}
                  onChange={(v) => setForm((f) => ({ ...f, [name]: v }))}
                />
              ))}
              {canWrite && (
                <label>
                  Employee Photo
                  <input
                    type="file"
                    accept="image/png,image/jpeg"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (file.size > 500000) {
                        setError("Employee photo must be smaller than 500 KB.");
                        return;
                      }
                      const reader = new FileReader();
                      reader.onload = () =>
                        setForm((f) => ({ ...f, photo: reader.result }));
                      reader.readAsDataURL(file);
                    }}
                  />
                </label>
              )}
            </div>
            {(canWrite || meta?.role === "Finance" || editing.id === me.id) && (
              <>
                <h3>Identity & bank details</h3>
                <p className="hr-muted">
                  Restricted to HR / Finance and the employee. Leave blank until
                  verified.
                </p>
                <div className="hr-form-grid">
                  {["aadhaar", "pan", "bankName", "bankAccount", "ifsc"].map(
                    (name) => (
                      <Field
                        key={name}
                        field={{
                          name,
                          label:
                            name === "aadhaar"
                              ? "Aadhaar"
                              : name === "pan"
                                ? "PAN"
                                : name.replace(/([A-Z])/g, " $1"),
                          type: "text",
                        }}
                        value={secret[name]}
                        disabled={!canWrite}
                        onChange={(v) =>
                          setSecret((s) => ({ ...s, [name]: v }))
                        }
                      />
                    ),
                  )}
                </div>
              </>
            )}
            {error && (
              <div role="alert" className="hr-alert">
                {error}
              </div>
            )}
            <footer>
              <button
                type="button"
                className="hr-button secondary"
                onClick={() => setEditing(null)}
              >
                Close
              </button>
              {canWrite && (
                <button className="hr-button" disabled={busy}>
                  Save profile
                </button>
              )}
            </footer>
          </form>
        </Modal>
      )}
      {adding && (
        <Modal title="Create employee & login" onClose={() => setAdding(false)}>
          <form onSubmit={create}>
            <div className="hr-form-grid">
              {[
                {
                  name: "firstName",
                  label: "First Name",
                  type: "text",
                  required: true,
                },
                {
                  name: "lastName",
                  label: "Last Name",
                  type: "text",
                  required: true,
                },
                {
                  name: "email",
                  label: "Email",
                  type: "email",
                  required: true,
                },
                { name: "username", label: "Username", type: "text" },
                {
                  name: "password",
                  label: "Initial Password (10+ characters)",
                  type: "password",
                  required: true,
                },
                {
                  name: "employeeType",
                  label: "Designation",
                  type: "select",
                  options: ["MR", "TBM", "ABM", "RBM", "ZBM", "NSM", "HR Executive", "Finance", "Employee", "Reporting Manager", ...(meta?.canGrantHrAdmin ? ["HR Admin"] : [])],
                  required: true,
                },
                { name: "hq_id", label: "Headquarter", type: "hq" },
                {
                  name: "reportingTo",
                  label: "Reporting Manager",
                  type: "employee",
                },
              ].map((field) => (
                <Field
                  key={field.name}
                  field={field}
                  value={newUser[field.name]}
                  employees={users}
                  headquarters={headquarters}
                  onChange={(v) =>
                    setNewUser((u) => ({ ...u, [field.name]: v }))
                  }
                />
              ))}
            </div>
            <p className="hr-muted">
              A unique employee ID is generated on save. Role follows the
              selected designation.
            </p>
            {error && (
              <div role="alert" className="hr-alert">
                {error}
              </div>
            )}
            <footer>
              <button
                type="button"
                className="hr-button secondary"
                onClick={() => setAdding(false)}
              >
                Cancel
              </button>
              <button className="hr-button" disabled={busy}>
                Create employee
              </button>
            </footer>
          </form>
        </Modal>
      )}
    </>
  );
}
function Access({ meta, users }) {
  const [members, setMembers] = useState([]),
    [selected, setSelected] = useState(""),
    [role, setRole] = useState("Employee"),
    [error, setError] = useState(""),
    [success, setSuccess] = useState("");
  const load = () =>
    request("get", "/memberships")
      .then(setMembers)
      .catch((e) => setError(e.message));
  useEffect(() => {
    load();
  }, []);
  const save = async (e) => {
    e.preventDefault();
    try {
      await request("put", `/memberships/${selected}`, { role });
      setSuccess("HR access role saved.");
      load();
    } catch (e) {
      setError(e.message);
    }
  };
  return (
    <section className="hr-card hr-pad">
      <h2>HR access roles</h2>
      <p className="hr-muted">
        HR roles control this workspace independently of SFA designations.
        Platform administrators retain full access.
      </p>
      {error && (
        <div role="alert" className="hr-alert">
          {error}
        </div>
      )}
      {success && <div className="hr-success">{success}</div>}
      <form className="hr-form-grid" onSubmit={save}>
        <Field
          field={{
            name: "employee",
            label: "Employee",
            type: "employee",
            required: true,
          }}
          employees={users.filter((u) => u.role.toLowerCase() !== "admin")}
          value={selected}
          onChange={setSelected}
        />
        <Field
          field={{
            name: "hrRole",
            label: "HR Role",
            type: "select",
            required: true,
            options: meta.roles.filter(
              (r) => r !== "HR Admin" || meta.canGrantHrAdmin,
            ),
          }}
          value={role}
          onChange={setRole}
        />
        <div>
          <button className="hr-button">Assign role</button>
        </div>
      </form>
      <div className="hr-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Employee</th>
              <th>HR access role</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id}>
                <td>{employeeName(users, m.user_id)}</td>
                <td>{m.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="hr-note">
        Employees use self-service. Reporting managers see their reporting team.
        Finance handles payroll and settlements. HR Executive maintains employee
        operations; HR Admin administers the HR workspace.
      </p>
    </section>
  );
}
function Reports({ meta, users }) {
  const [resource, setResource] = useState("attendance"),
    [rows, setRows] = useState([]),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [employee, setEmployee] = useState(""),
    [from, setFrom] = useState(""),
    [to, setTo] = useState("");
  const resources = meta?.resources || catalog.resources;
  const permitted = Object.entries(resources).filter(
    ([, r]) => meta?.permissions[r.module]?.read,
  );
  const load = async () => {
    setBusy(true);
    setError("");
    try {
      setRows(await request("get", `/records/${resource}`));
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  useEffect(() => {
    if (!meta) return;
    if (!permitted.some(([id]) => id === resource)) {
      if (permitted[0]) setResource(permitted[0][0]);
      return;
    }
    load();
  }, [resource, meta]);
  const filtered = rows.filter((r) => {
    const date = String(
      r.data.date ||
        r.data.month ||
        r.data.startDate ||
        r.data.periodStart ||
        r.data.resignationDate ||
        r.createdAt,
    ).slice(0, 10);
    return (
      (!employee || r.employee_id === Number(employee)) &&
      (!from || date >= from) &&
      (!to || date <= to)
    );
  });
  return (
    <section className="hr-card hr-pad">
      <h2>HR report register</h2>
      <p className="hr-muted">
        Attendance, leave, salary register, incentives, training, KPI, attrition
        and vacancies use the same underlying records. Export respects your
        employee and module permissions.
      </p>
      <div className="hr-filters">
        <select
          aria-label="Report register"
          value={resource}
          onChange={(e) => setResource(e.target.value)}
        >
          {permitted.map(([id, r]) => (
            <option key={id} value={id}>
              {r.label}
            </option>
          ))}
        </select>
        <select
          aria-label="Report employee"
          value={employee}
          onChange={(e) => setEmployee(e.target.value)}
        >
          <option value="">All visible employees</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.fullName || u.firstName}
            </option>
          ))}
        </select>
        <label>
          From
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </label>
        <label>
          To
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </label>
      </div>
      {error && (
        <div role="alert" className="hr-alert">
          {error}
        </div>
      )}
      <div className="hr-register-heading">
        <span>{filtered.length} records</span>
        <button
          className="hr-button"
          disabled={!filtered.length}
          onClick={() =>
            exportCsv(
              `hr-${resource}`,
              filtered.map((r) => ({
                employee: employeeName(users, r.employee_id),
                status: r.status,
                ...Object.fromEntries(
                  Object.entries(r.data).filter(([, v]) => !v?.filename),
                ),
              })),
            )
          }
        >
          Download CSV
        </button>
      </div>
      {busy ? (
        <p>Loading report…</p>
      ) : filtered.length ? (
        <div className="hr-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Employee</th>
                <th>Status</th>
                <th>Recorded</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td>{r.data.title}</td>
                  <td>{employeeName(users, r.employee_id)}</td>
                  <td>
                    <Status value={r.status} />
                  </td>
                  <td>{new Date(r.createdAt).toLocaleDateString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty />
      )}
    </section>
  );
}
function Workflow({ summary }) {
  const steps = [
    ["Manpower Request", "recruitment", "requisitions"],
    ["Recruitment", "recruitment", "openings"],
    ["Interview", "recruitment", "interviews"],
    ["Offer Letter", "recruitment", "offers"],
    ["Joining", "recruitment", "joining-tracker"],
    ["Induction", "onboarding", "induction"],
    ["Attendance & Leave", "attendance", "attendance"],
    ["Payroll", "payroll", "payroll"],
    ["KPI Evaluation", "performance", "evaluations"],
    ["Promotion / Transfer", "movement", "movements"],
    ["Resignation", "separation", "resignations"],
    ["Exit Process", "separation", "resignations"],
  ];
  return (
    <>
      <section className="hr-card hr-pad">
        <h2>The employee lifecycle</h2>
        <p className="hr-muted">
          Every register keeps its workflow history. Requests progress through
          submission and an independent review before completion or settlement.
        </p>
        <div className="hr-workflow">
          {steps.map(([label, module, resource], i) => (
            <Link key={label} to={`/hrms/${module}?register=${resource}`}>
              <span>{String(i + 1).padStart(2, "0")}</span>
              <strong>{label}</strong>
              <small>
                {summary
                  ? `${summary.counts[resource] || 0} records`
                  : "Open register"}
              </small>
              <i className="fas fa-arrow-right" />
            </Link>
          ))}
        </div>
      </section>
      <p className="hr-note">
        Approved transfers take effect when HR completes the record on or after
        its effective date. Exit completion requires clearance and returned
        assets and then deactivates the shared platform login.
      </p>
    </>
  );
}
