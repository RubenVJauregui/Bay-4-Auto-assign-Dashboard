import {
  assigneeSummaries,
  plannedGurunandaOrderCount,
  type AssigneeSummary as AssigneeSummaryType,
} from "@/lib/data";
import {
  loadInYardFullEquipment,
  loadPlannedOrders,
  type InYardEquipmentRow,
  type PlannedOrderRow,
} from "@/lib/wms-loader";
import { AssignmentControls } from "@/components/AssignmentControls";

export const dynamic = "force-dynamic";

const staticAssigneeNames = assigneeSummaries.map((assignee: AssigneeSummaryType) => assignee.name);

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
  const sectionOneResult = await loadInYardFullEquipment();
  const sectionOneRows: InYardEquipmentRow[] = sectionOneResult.success ? sectionOneResult.rows : [];
  const plannedResult = await loadPlannedOrders();
  const plannedOrders: PlannedOrderRow[] = plannedResult.success ? plannedResult.rows : [];
  const plannedTotalCount = plannedResult.success ? plannedResult.totalCount : plannedGurunandaOrderCount;
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
                    <th>Recommended Assignee</th>
                    <th>Assignee</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {!sectionOneResult.success ? (
                    <tr><td colSpan={8} className="empty-state">WMS data unavailable — in-yard equipment cannot be displayed</td></tr>
                  ) : sectionOneRows.length === 0 ? (
                    <tr><td colSpan={8} className="empty-state">No in-yard full trailers</td></tr>
                  ) : (
                    sectionOneRows.map((row: InYardEquipmentRow) => (
                      <tr key={`${row.equipmentNo}-${row.entryTicket}`}>
                        <td>{row.equipmentNo}</td>
                        <td>{row.entryTicket}</td>
                        <td>{row.checkInPdt}</td>
                        <td>{row.timeInYard}</td>
                        <td>{row.customer}</td>
                        <td className="recommendation-cell">
                          {row.recommendedAssignee ? (
                            <div className="recommendation">
                              <strong>{row.recommendedAssignee.name}</strong>
                              <span>
                                <em className={`confidence ${row.recommendedAssignee.confidence}`}>
                                  {row.recommendedAssignee.confidence}
                                </em>
                                {row.recommendedAssignee.reason}
                              </span>
                            </div>
                          ) : (
                            <span className="recommendation-unavailable">Unavailable</span>
                          )}
                        </td>
                        <AssignmentControls
                          taskId={row.assignmentTaskId}
                          taskType={row.assignmentTaskType}
                          assigneeOptions={sectionOneResult.assigneeOptions}
                          staticAssigneeNames={staticAssigneeNames}
                          recommendedUserId={row.recommendedAssignee?.userId ?? ""}
                          recommendedName={row.recommendedAssignee?.name ?? ""}
                          noTaskMessage="No active task found for this equipment."
                          confirmationDetails={[
                            { label: "Equipment", value: row.equipmentNo },
                            { label: "Entry Ticket", value: row.entryTicket },
                            { label: "Customer", value: row.customer },
                            {
                              label: row.assignmentTaskType === "load" ? "Load Task" : "Receive Task",
                              value: row.assignmentTaskId,
                            },
                          ]}
                          confirmationNote="Confirm to assign the active warehouse task for this equipment."
                        />
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
                    <th>PO / Reference</th>
                    <th>Ship To</th>
                    <th>Appointment Time</th>
                    <th>Assignee</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {!plannedResult.success ? (
                    <tr><td colSpan={6} className="empty-state">WMS data unavailable — planned orders cannot be displayed</td></tr>
                  ) : plannedOrders.length === 0 ? (
                    <tr><td colSpan={6} className="empty-state">No planned orders</td></tr>
                  ) : (
                    plannedOrders.map((row: PlannedOrderRow) => (
                      <tr key={row.id}>
                        <td>{row.referenceNo || row.id}</td>
                        <td>{row.poNo}</td>
                        <td>{row.shipToName}</td>
                        <td>{row.appointmentTime}</td>
                        <AssignmentControls
                          taskId={row.assignmentTaskId}
                          taskType="pick"
                          assigneeOptions={plannedResult.assigneeOptions}
                          staticAssigneeNames={staticAssigneeNames}
                          recommendedUserId={row.recommendedAssignee?.userId ?? ""}
                          recommendedName={row.recommendedAssignee?.name ?? ""}
                          noTaskMessage="No active pick task found for this order."
                          confirmationDetails={[
                            { label: "Order", value: row.referenceNo || row.id },
                            { label: "Customer", value: row.customer },
                            { label: "Pick Task", value: row.assignmentTaskId },
                          ]}
                          confirmationNote="Confirm to assign the current pick task for this planned order."
                        />
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
