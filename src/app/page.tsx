import {
  doors,
  assigneeSummaries,
  inYardFullEquipment,
  type DoorRecord,
  type AssigneeSummary as AssigneeSummaryType,
  type InYardEquipmentRecord,
} from "@/lib/data";
import { loadPlannedOrders, type PlannedOrderRow } from "@/lib/wms-loader";

export const dynamic = "force-dynamic";

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

export default async function DashboardPage() {
  const sectionOneRows = inYardFullEquipment.filter((row: InYardEquipmentRecord) => row.equipmentType === "TRAILER");
  const plannedResult = await loadPlannedOrders();
  const plannedOrders: PlannedOrderRow[] = plannedResult.success ? plannedResult.rows : [];
  const plannedTotalCount = plannedResult.success ? plannedResult.totalCount : 0;
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
        <div className="kpi-card"><strong>{sectionOneRows.length}</strong><span>In Yard Full Trailers</span></div>
        <div className="kpi-card"><strong>{plannedTotalCount}</strong><span>Planned Orders</span></div>
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
                    <th>Assignee</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sectionOneRows.length === 0 ? (
                    <tr><td colSpan={7} className="empty-state">No in-yard full trailers</td></tr>
                  ) : (
                    sectionOneRows.map((row: InYardEquipmentRecord) => (
                      <tr key={`${row.equipmentNo}-${row.entryTicket}`}>
                        <td>{row.equipmentNo}</td>
                        <td>{row.entryTicket}</td>
                        <td>{row.checkInPdt}</td>
                        <td>{row.timeInYard}</td>
                        <td>{row.customer}</td>
                        <td>
                          <select className="control-select" defaultValue="">
                            <option value="">Select assignee</option>
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
              <span>{plannedOrders.length} rows</span>
            </div>
            <div className="section-tools">
              <div className="chip-row">
                <span>All ({plannedOrders.length})</span>
                <span>GURUNANDA, LLC ({plannedOrders.length})</span>
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
                    <th>Order Type</th>
                    <th>PO / Reference</th>
                    <th>Ship To</th>
                    <th>Appointment Time</th>
                    <th>Assignee</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {!plannedResult.success ? (
                    <tr><td colSpan={9} className="empty-state">WMS data unavailable — planned orders cannot be displayed</td></tr>
                  ) : plannedOrders.length === 0 ? (
                    <tr><td colSpan={9} className="empty-state">No planned orders</td></tr>
                  ) : (
                    plannedOrders.map((row: PlannedOrderRow) => (
                      <tr key={row.id}>
                        <td>{row.referenceNo || row.id}</td>
                        <td>{row.customer}</td>
                        <td><span className="status planned">{row.status}</span></td>
                        <td>{row.orderType}</td>
                        <td>{row.poNo}</td>
                        <td>{row.shipToName}</td>
                        <td>{row.appointmentTime}</td>
                        <td>
                          <select className="control-select" defaultValue="">
                            <option value="">Select assignee</option>
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
            <p className="assigned-note"><strong>{plannedOrders.length} tasks</strong> Dashboard assigned</p>
            <table>
              <thead><tr><th>Task</th><th>Assignee</th><th>Door</th></tr></thead>
              <tbody>
                {plannedOrders.slice(0, 5).map((row: PlannedOrderRow) => (
                  <tr key={row.id}>
                    <td>{row.referenceNo || row.id}</td>
                    <td>—</td>
                    <td>—</td>
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
