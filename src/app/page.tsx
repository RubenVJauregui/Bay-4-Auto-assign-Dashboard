import {
  doors,
  kpiMetrics,
  assigneeSummaries,
  assignments,
  inYardFullEquipment,
  type DoorRecord,
  type AssigneeSummary as AssigneeSummaryType,
  type TaskRecord,
  type KpiMetric,
  type InYardEquipmentRecord,
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
  const sectionOneRows = inYardFullEquipment.filter((row: InYardEquipmentRecord) => row.equipmentType === "TRAILER");
  const occupiedDoors = doors.filter((d: DoorRecord) => d.status === "Occupied").length;
  const refreshed = formatRefreshed();

  return (
    <main className="dashboard-shell">
      {/* Top action buttons */}
      <div className="top-actions">
        <div className="action-left">
          <button>Autonomous</button>
        </div>
        <div className="action-right">
          <button>Refresh</button>
          <button>Download CSV</button>
        </div>
      </div>

      {/* Top KPI Cards */}
      <section className="kpi-grid" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
        <div className="kpi-card"><strong>{occupiedDoors}</strong><span>In Yard Full Trailers</span></div>
        <div className="kpi-card"><strong>{assignments.length}</strong><span>Planned order</span></div>
      </section>

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
              <span>{sectionOneRows.length} rows</span>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Equipment #</th>
                    <th>Entry Ticket</th>
                    <th>Check-in (PDT)</th>
                    <th>Time in Yard</th>
                    <th>Customer</th>
                  </tr>
                </thead>
                <tbody>
                  {sectionOneRows.length === 0 ? (
                    <tr><td colSpan={5} className="empty-state">No in-yard full trailers</td></tr>
                  ) : (
                    sectionOneRows.map((row: InYardEquipmentRecord) => (
                      <tr key={`${row.equipmentNo}-${row.entryTicket}`}>
                        <td>{row.equipmentNo}</td>
                        <td>{row.entryTicket}</td>
                        <td>{row.checkInPdt}</td>
                        <td>{row.timeInYard}</td>
                        <td>{row.customer}</td>
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
