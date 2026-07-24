import {
  doors,
  kpiMetrics,
  assigneeSummaries,
  assignments,
  type DoorRecord,
  type AssigneeSummary as AssigneeSummaryType,
  type TaskRecord,
  type KpiMetric,
} from "@/lib/data";

function formatRefreshed(): string {
  return new Date().toLocaleString("en-US", {
    timeZone: "America/Los_Angeles",
    month: "numeric",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default function DashboardPage() {
  const inYardRows = doors.filter((d: DoorRecord) => d.status === "Occupied" || d.status === "Reserved");
  const refreshed = formatRefreshed();

  return (
    <main className="dashboard-shell">
      {/* Top action buttons */}
      <div className="top-actions">
        <div className="action-left">
          <button>Auto Suggest</button>
          <button>Auto Assign All</button>
          <button>Autonomous</button>
        </div>
        <div className="action-right">
          <button>Refresh</button>
          <button>Download CSV</button>
        </div>
      </div>

      {/* Page header */}
      <header className="page-header">
        <div>
          <h1>Bay 4 Dashboard</h1>
          <p>Valley View (LT_F1)</p>
        </div>
        <div className="refresh-time">
          <strong>Last refreshed {refreshed}</strong>
          <span>DOCK50-DOCK72</span>
        </div>
      </header>

      {/* Info strip */}
      <div className="info-strip">
        <span>Fresh WISE data every 5 minutes</span>
        <span>Auto Suggest holds RNs and orders until Auto Assign is confirmed</span>
        <span>Auto Assign assigns new tasks only after confirmation</span>
      </div>

      {/* KPI Cards */}
      <section className="kpi-grid">
        {kpiMetrics.map((m: KpiMetric) => (
          <div className="kpi-card" key={m.label}>
            <strong>{m.value}</strong>
            <span>{m.label}</span>
          </div>
        ))}
      </section>

      {/* Main content grid */}
      <div className="content-grid">
        <div className="content-left">
          {/* Section 1 - In-Yard FULL Equipment */}
          <section className="panel section-one">
            <div className="panel-header">
              <h2>Section 1 - In-Yard FULL Equipment</h2>
              <span>{inYardRows.length} rows</span>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Equipment #</th>
                    <th>RN #</th>
                    <th>Check-in (PT)</th>
                    <th>Time in Yard</th>
                    <th>Customer</th>
                    <th>Location</th>
                    <th>Assignee</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {inYardRows.length === 0 ? (
                    <tr><td colSpan={8} className="empty-state">No in-yard equipment</td></tr>
                  ) : (
                    inYardRows.map((d: DoorRecord) => (
                      <tr key={d.door}>
                        <td>{d.door}</td>
                        <td>{d.taskIds.join(", ") || "-"}</td>
                        <td>-</td>
                        <td>{d.duration || "-"}</td>
                        <td>{d.customer || "-"}</td>
                        <td>
                          <select className="control-select" defaultValue={d.door}>
                            {doors.map((door: DoorRecord) => (
                              <option key={door.door} value={door.door}>{door.door}</option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <select className="control-select" defaultValue={d.assignee || ""}>
                            {assigneeSummaries.map((a: AssigneeSummaryType) => (
                              <option key={a.name} value={a.name}>{a.name}</option>
                            ))}
                          </select>
                        </td>
                        <td><button className="assign-button">Assign</button></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 2 - PLANNED Outbound Orders */}
          <section className="panel section-two">
            <div className="panel-header">
              <h2>Section 2 - PLANNED Outbound Orders</h2>
              <span>{assignments.length} rows</span>
            </div>
            <div className="section-tools">
              <div className="chip-row">
                <span>All ({assignments.length})</span>
                <span>GURUNANDA, LLC ({assignments.filter((a: TaskRecord) => a.customer.includes("GURUNANDA")).length})</span>
              </div>
              <input placeholder="Search order, PO, carrier..." />
            </div>
            <div className="table-wrap orders-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Customer</th>
                    <th>Status</th>
                    <th>Assignee</th>
                    <th>Action</th>
                    <th>Door</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.length === 0 ? (
                    <tr><td colSpan={6} className="empty-state">No planned orders</td></tr>
                  ) : (
                    assignments.map((row: TaskRecord) => (
                      <tr key={row.taskId}>
                        <td>{row.taskId}</td>
                        <td>{row.customer}</td>
                        <td><span className="status planned">{row.pieces}</span></td>
                        <td>{row.assignee}</td>
                        <td><button className="assign-button">Assign</button></td>
                        <td>{row.door}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 3 - Outbound Shipping */}
          <section className="panel section-three">
            <div className="panel-header">
              <h2>Section 3 - Outbound Shipping</h2>
              <span>{assignments.filter((a: TaskRecord) => a.dns === "LOAD").length} rows</span>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>DN / Order</th>
                    <th>Customer</th>
                    <th>DN Status</th>
                    <th>Load Status</th>
                    <th>Dock</th>
                    <th>ET</th>
                    <th>Assignee</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.filter((a: TaskRecord) => a.dns === "LOAD").length === 0 ? (
                    <tr><td colSpan={8} className="empty-state">No outbound shipments</td></tr>
                  ) : (
                    assignments.filter((a: TaskRecord) => a.dns === "LOAD").map((row: TaskRecord) => (
                      <tr key={row.taskId}>
                        <td>{row.taskId}</td>
                        <td>{row.customer}</td>
                        <td><span className="status picked">IN_PROGRESS</span></td>
                        <td><span className="status new">LOAD</span></td>
                        <td>
                          <select className="control-select" defaultValue={row.door}>
                            {doors.filter((d: DoorRecord) => d.status !== "Available").map((d: DoorRecord) => (
                              <option key={d.door} value={d.door}>{d.door}</option>
                            ))}
                          </select>
                        </td>
                        <td>-</td>
                        <td>
                          <select className="control-select" defaultValue={row.assignee}>
                            {assigneeSummaries.map((a: AssigneeSummaryType) => (
                              <option key={a.name} value={a.name}>{a.name}</option>
                            ))}
                          </select>
                        </td>
                        <td><button className="assign-button">Assign</button></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="sidebar">
          {/* Assigned Today */}
          <section className="panel assigned-panel">
            <div className="panel-header">
              <h2>Assigned Today</h2>
              <button>Refresh</button>
            </div>
            <p className="assigned-note"><strong>{assignments.length} tasks</strong> Dashboard assigned</p>
            <table>
              <thead><tr><th>Task</th><th>Assignee</th><th>Door</th></tr></thead>
              <tbody>
                {assignments.slice(0, 5).map((a: TaskRecord) => (
                  <tr key={a.taskId}>
                    <td>{a.taskId}</td>
                    <td>{a.assignee}</td>
                    <td>{a.door}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* Bay 4 Assignees */}
          <section className="panel">
            <div className="panel-header">
              <h2>Bay 4 Assignees</h2>
              <span>{assigneeSummaries.length} assignees</span>
            </div>
            <div className="assignee-list">
              {assigneeSummaries.map((a: AssigneeSummaryType) => (
                <div className="assignee-card" key={a.name}>
                  <span className="avatar">{a.name.split(" ").map((p: string) => p[0]).join("").slice(0, 2)}</span>
                  <strong>{a.name}</strong>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}
