import { useState, useRef, useCallback, useEffect } from 'react';
import { assigneeNames, locationOptions } from './data';
import './style.css';

type KpiPopup = 'inyard' | 'inbounds' | 'planned' | 'older48h' | null;
type SortDir = 'asc' | 'desc' | null;

interface InYardRow { container: string; appointmentTime: string; inYard: boolean; condition: string; conditionColor: string; entryET: string; status: string; assignee: string; receipt: string; note: string; }
interface OrderRow { id: string; customer: string; status: string; baseQty: number; orderType: string; reference: string; retailerName?: string; shipToName: string; scheduleDate: string; createdTime: string; }
interface ShippingRow { id: string; customer: string; dnStatus: string; loadStatus: string; dock: string; et: string; assignee: string; }

interface LiveData {
  inYardRows: InYardRow[];
  orderRows: OrderRow[];
  shippingRows: ShippingRow[];
  containerMessage: string;
  loaded: boolean;
}

interface Assignment {
  task: string;
  assignee: string;
  time: string;
}

interface PendingAssign {
  taskId: string;
  locationSelectId: string;
  assigneeSelectId: string;
  assignee: string;
}

function SelectCell({ value, options, id }: { value: string; options: string[]; id: string }) {
  return (
    <select className="control-select" defaultValue={value} id={id}>
      {options.map((option) => <option key={option} value={option}>{option}</option>)}
    </select>
  );
}

function formatScheduleDate(value: string) {
  return new Date(value).toLocaleString('en-US', {
    timeZone: 'America/Los_Angeles',
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function nowTimeString() {
  return new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'America/Los_Angeles',
  });
}

function computeOlder48h(rows: OrderRow[]): OrderRow[] {
  const now = Date.now();
  return rows.filter(r => {
    if (!r.createdTime || r.createdTime === '-') return false;
    const created = new Date(r.createdTime).getTime();
    return (now - created) >= 48 * 3600000;
  });
}

function SortableHeader({ label, active, dir, onClick }: { label: string; active: boolean; dir: SortDir; onClick: () => void }) {
  const arrow = active ? (dir === 'asc' ? ' ▲' : ' ▼') : '';
  return <th onClick={onClick} style={{ cursor: 'pointer' }}>{label}{arrow}</th>;
}

function Toast({ message, visible }: { message: string; visible: boolean }) {
  if (!visible) return null;
  return <div className="toast">{message}</div>;
}

function ConfirmModal({ pending, onCancel, onConfirm }: { pending: PendingAssign; onCancel: () => void; onConfirm: () => void }) {
  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">Confirm Assignment</h3>
        <div className="modal-body">
          <p><span className="modal-label">Task:</span> {pending.taskId}</p>
          <p><span className="modal-label">Customer:</span> GURUNANDA, LLC</p>
          <p><span className="modal-label">Assign to:</span> <span className="modal-assignee">{pending.assignee}</span></p>
        </div>
        <p className="modal-hint">Press OK to confirm this dashboard assignment.</p>
        <div className="modal-actions">
          <button className="modal-btn" onClick={onCancel}>Cancel</button>
          <button className="modal-btn modal-btn-ok" onClick={onConfirm}>OK</button>
        </div>
      </div>
    </div>
  );
}

function KpiDetailPopup({ type, onClose, live }: { type: KpiPopup; onClose: () => void; live: LiveData }) {
  if (!type) return null;

  const older48h = computeOlder48h(live.orderRows);
  let title = '';
  let content: React.ReactNode = null;

  if (type === 'inyard') {
    title = `In-Yard Containers (${live.inYardRows.filter(r => r.inYard).length})`;
    content = (
      <div className="table-wrap kpi-popup-scroll">
        <table>
          <thead><tr><th>Container</th><th>Appointment Time</th><th>En yarda</th><th>Condition</th><th>Entry / ET</th><th>Status</th><th>RN / Receipt</th></tr></thead>
          <tbody>
            {live.inYardRows.filter(r => r.inYard).length === 0
              ? <tr><td colSpan={7} style={{ textAlign: 'center', color: '#64748b' }}>No in-yard containers</td></tr>
              : live.inYardRows.filter(r => r.inYard).map((row) => (
                <tr key={row.container || row.entryET}><td>{row.container}</td><td>{row.appointmentTime}</td><td>Yes</td><td>{row.condition}</td><td>{row.entryET}</td><td>{row.status}</td><td>{row.receipt}</td></tr>
              ))
            }
          </tbody>
        </table>
      </div>
    );
  } else if (type === 'inbounds') {
    title = `All Containers (${live.inYardRows.length})`;
    content = (
      <div className="table-wrap kpi-popup-scroll">
        <table>
          <thead><tr><th>Container</th><th>Appointment Time</th><th>En yarda</th><th>Condition</th><th>Entry / ET</th><th>Status</th><th>Assignee</th><th>RN / Receipt</th><th>Note</th></tr></thead>
          <tbody>
            {live.inYardRows.length === 0
              ? <tr><td colSpan={9} style={{ textAlign: 'center', color: '#64748b' }}>No containers available</td></tr>
              : live.inYardRows.map((row) => (
                <tr key={row.container || row.entryET}><td>{row.container}</td><td>{row.appointmentTime}</td><td>{row.inYard ? 'Yes' : 'No'}</td><td>{row.condition}</td><td>{row.entryET}</td><td>{row.status}</td><td>{row.assignee}</td><td>{row.receipt}</td><td>{row.note}</td></tr>
              ))
            }
          </tbody>
        </table>
      </div>
    );
  } else if (type === 'planned') {
    title = `Planned Orders Detail (${live.orderRows.length})`;
    content = (
      <div className="table-wrap kpi-popup-scroll">
        <table>
          <thead><tr><th>Order #</th><th>Customer</th><th>Status</th><th>BASE QTY</th><th>Order Type</th><th>PO / Reference</th><th>Ship To Name</th><th>Appointment Time</th></tr></thead>
          <tbody>
            {live.orderRows.length === 0
              ? <tr><td colSpan={8} style={{ textAlign: 'center', color: '#64748b' }}>No planned orders for GURUNANDA, LLC</td></tr>
              : live.orderRows.map((row) => (
                <tr key={row.id}><td>{row.id}</td><td>{row.customer}</td><td><span className="status planned">{row.status}</span></td><td>{row.baseQty}</td><td>{row.orderType}</td><td>{row.reference}</td><td>{row.shipToName}</td><td>{formatScheduleDate(row.scheduleDate)}</td></tr>
              ))
            }
          </tbody>
        </table>
      </div>
    );
  } else if (type === 'older48h') {
    title = `Older than 48h (${older48h.length})`;
    content = (
      <div className="table-wrap kpi-popup-scroll">
        <table>
          <thead><tr><th>Order #</th><th>Customer</th><th>Status</th><th>BASE QTY</th><th>Age</th><th>PO / Reference</th><th>Ship To Name</th><th>Created</th></tr></thead>
          <tbody>
            {older48h.length === 0
              ? <tr><td colSpan={8} style={{ textAlign: 'center', color: '#64748b' }}>No orders older than 48h</td></tr>
              : older48h.map((row) => {
                const age = Math.floor((Date.now() - new Date(row.createdTime).getTime()) / 86400000);
                return (
                  <tr key={row.id}><td>{row.id}</td><td>{row.customer}</td><td><span className="status planned">{row.status}</span></td><td>{row.baseQty}</td><td>{age}d</td><td>{row.reference}</td><td>{row.shipToName}</td><td>{formatScheduleDate(row.createdTime)}</td></tr>
                );
              })
            }
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="kpi-popup" onClick={(e) => e.stopPropagation()}>
        <div className="kpi-popup-header">
          <h3>{title}</h3>
          <button className="kpi-popup-close" onClick={onClose}>Close</button>
        </div>
        {content}
      </div>
    </div>
  );
}

function App() {
  const [kpiPopup, setKpiPopup] = useState<KpiPopup>(null);
  const [assignedRows, setAssignedRows] = useState<Set<string>>(new Set());
  const [assignments, setAssignments] = useState<Assignment[]>([
    { task: 'RN-5008131', assignee: 'GONZALO RANGEL', time: '8:16 AM' },
  ]);
  const [toast, setToast] = useState({ message: '', visible: false });
  const [pending, setPending] = useState<PendingAssign | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>();

  const [s1SortCol, setS1SortCol] = useState<string | null>(null);
  const [s1SortDir, setS1SortDir] = useState<SortDir>(null);
  const [s2SortCol, setS2SortCol] = useState<string | null>(null);
  const [s2SortDir, setS2SortDir] = useState<SortDir>(null);

  const [live, setLive] = useState<LiveData>({ inYardRows: [], orderRows: [], shippingRows: [], containerMessage: '', loaded: false });

  useEffect(() => {
    fetch('/api/dashboard')
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setLive({
            inYardRows: data.inYardRows || [],
            orderRows: data.orderRows || [],
            shippingRows: data.shippingRows || [],
            containerMessage: data.containerMessage || '',
            loaded: true,
          });
        } else {
          setLive({ inYardRows: [], orderRows: [], shippingRows: [], containerMessage: data.error || '', loaded: true });
        }
      })
      .catch(() => {
        setLive({ inYardRows: [], orderRows: [], shippingRows: [], containerMessage: 'Dashboard unavailable', loaded: true });
      });
  }, []);

  const toggleSort = (current: string | null, dir: SortDir, col: string, setCol: (c: string | null) => void, setDir: (d: SortDir) => void) => {
    if (current === col) {
      if (dir === 'asc') setDir('desc');
      else if (dir === 'desc') { setCol(null); setDir(null); }
      else setDir('asc');
    } else {
      setCol(col);
      setDir('asc');
    }
  };

  const sortedYardRows = [...live.inYardRows].sort((a, b) => {
    if (!s1SortCol || !s1SortDir) return 0;
    const av = String((a as Record<string, unknown>)[s1SortCol] ?? '');
    const bv = String((b as Record<string, unknown>)[s1SortCol] ?? '');
    return s1SortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
  });

  const sortedOrderRows = [...live.orderRows].sort((a, b) => {
    if (!s2SortCol || !s2SortDir) return 0;
    const av = String((a as Record<string, unknown>)[s2SortCol] ?? '');
    const bv = String((b as Record<string, unknown>)[s2SortCol] ?? '');
    if (s2SortCol === 'baseQty') return s2SortDir === 'asc' ? a.baseQty - b.baseQty : b.baseQty - a.baseQty;
    return s2SortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
  });

  const showToast = useCallback((msg: string) => {
    setToast({ message: msg, visible: true });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast({ message: '', visible: false }), 3000);
  }, []);

  const busyAssignees = useCallback(() => new Set(assignments.map(a => a.assignee).filter(a => a && a !== '-')), [assignments]);

  const firstAvailableAssignee = useCallback((ranked: string[], fallback?: string) => {
    const busy = busyAssignees();
    const cleanRanked = [...ranked, fallback || '', ...assigneeNames]
      .map(name => name.trim())
      .filter((name, idx, arr) => name && name !== '-' && assigneeNames.includes(name) && arr.indexOf(name) === idx);
    return cleanRanked.find(name => !busy.has(name)) || cleanRanked[0] || '-';
  }, [busyAssignees]);

  const historicalAssigneeForSection1 = useCallback((row: InYardRow) => {
    const ranked = live.inYardRows
      .filter(r => r.assignee && assigneeNames.includes(r.assignee))
      .map(r => ({
        assignee: r.assignee,
        score: (r.condition === row.condition ? 4 : 0) + (r.inYard === row.inYard ? 2 : 0) + (Boolean(r.receipt) === Boolean(row.receipt) ? 1 : 0),
      }))
      .sort((a, b) => b.score - a.score)
      .map(r => r.assignee);
    return firstAvailableAssignee(ranked, row.assignee);
  }, [firstAvailableAssignee, live.inYardRows]);

  const historicalAssigneeForOrder = useCallback((row: OrderRow, fallback: string) => {
    const ranked = live.orderRows
      .filter(r => r.orderType === row.orderType || r.shipToName === row.shipToName || r.status === row.status)
      .map((_, i) => assigneeNames[i % assigneeNames.length]);
    return firstAvailableAssignee(ranked, fallback);
  }, [firstAvailableAssignee, live.orderRows]);

  const historicalAssigneeForShipping = useCallback((row: ShippingRow) => {
    const ranked = live.shippingRows
      .filter(r => r.assignee && assigneeNames.includes(r.assignee))
      .map(r => ({
        assignee: r.assignee,
        score: (r.customer === row.customer ? 3 : 0) + (r.dock === row.dock ? 2 : 0) + (r.dnStatus === row.dnStatus ? 1 : 0) + (r.loadStatus === row.loadStatus ? 1 : 0),
      }))
      .sort((a, b) => b.score - a.score)
      .map(r => r.assignee);
    return firstAvailableAssignee(ranked, row.assignee);
  }, [firstAvailableAssignee, live.shippingRows]);

  const requestAssign = useCallback((taskId: string, locationSelectId: string, assigneeSelectId: string, recommendedAssignee?: string) => {
    const assEl = document.getElementById(assigneeSelectId) as HTMLSelectElement | null;
    const assignee = recommendedAssignee || assEl?.value || '-';
    if (assEl && recommendedAssignee) assEl.value = recommendedAssignee;
    setPending({ taskId, locationSelectId, assigneeSelectId, assignee });
  }, []);

  const confirmAssign = useCallback(() => {
    if (!pending) return;
    const locEl = document.getElementById(pending.locationSelectId) as HTMLSelectElement | null;
    const location = locEl?.value || '-';

    setAssignedRows(prev => new Set(prev).add(pending.taskId));
    setAssignments(prev => {
      const filtered = prev.filter(a => a.task !== pending.taskId);
      return [{ task: pending.taskId, assignee: pending.assignee, time: nowTimeString() }, ...filtered];
    });
    showToast(`Assigned ${pending.taskId} to ${pending.assignee} at ${location}`);
    setPending(null);
  }, [pending, showToast]);

  const cancelAssign = useCallback(() => {
    setPending(null);
  }, []);

  const handleAutoSuggest = useCallback(() => {
    const unassignedShip = live.shippingRows.filter(r => !assignedRows.has(r.id));
    if (unassignedShip.length === 0) {
      showToast('All tasks already assigned');
      return;
    }
    const first = unassignedShip[0];
    if (first) {
      requestAssign(first.id, `loc-${first.id}`, `asg-${first.id}`);
    }
  }, [assignedRows, live, requestAssign, showToast]);

  return (
    <main className="dashboard-shell">
      <Toast message={toast.message} visible={toast.visible} />
      {pending && <ConfirmModal pending={pending} onCancel={cancelAssign} onConfirm={confirmAssign} />}
      <KpiDetailPopup type={kpiPopup} onClose={() => setKpiPopup(null)} live={live} />

      <div className="top-actions">
        <div className="action-left">
          <button onClick={handleAutoSuggest}>Auto Suggest</button>
          <button>Auto Assign All</button>
          <button>Autonomous</button>
        </div>
        <div className="action-right">
          <button>Refresh</button>
          <button>Download CSV</button>
        </div>
      </div>

      <header className="page-header">
        <div>
          <h1>Bay 4 Dashboard</h1>
          <p>Valley View (LT_F1)</p>
        </div>
        <div className="refresh-time">
          <strong>Last refreshed 6/22/2026, 09:27 AM</strong>
          <span>refreshing in 3:38</span>
        </div>
      </header>

      <div className="info-strip">
        <span>Fresh WISE data every 5 minutes</span>
        <span>Auto Suggest holds RNs and orders until Auto Assign is confirmed</span>
        <span>Auto Assign assigns new tasks only after confirmation</span>
      </div>

      <section className="kpi-grid">
        <button type="button" onClick={() => setKpiPopup('inyard')}><strong>{live.inYardRows.filter(r => r.inYard).length}</strong><span>In-Yard FULL</span></button>
        <button type="button" onClick={() => setKpiPopup('inbounds')}><strong>{live.inYardRows.length}</strong><span>Inbound Containers</span></button>
        <button type="button" onClick={() => setKpiPopup('planned')}><strong>{live.orderRows.length}</strong><span>Planned Orders</span></button>
        <button type="button" onClick={() => setKpiPopup('older48h')}><strong>{computeOlder48h(live.orderRows).length}</strong><span>Older than 48h</span></button>
      </section>

      <div className="content-grid">
        <div className="content-left">
          <section id="section-1" className="panel section-one">
            <div className="panel-header"><h2>Section 1 - IN-YARD Containers</h2><span>{live.inYardRows.length} containers</span></div>
            <div className="chip-row"><span>All ({live.inYardRows.length})</span><span>In Yard ({live.inYardRows.filter(r => r.inYard).length})</span></div>
            <div className="table-wrap">
              <table>
                <thead><tr>
                  <SortableHeader label="Container" active={s1SortCol === 'container'} dir={s1SortCol === 'container' ? s1SortDir : null} onClick={() => toggleSort(s1SortCol, s1SortDir, 'container', setS1SortCol, setS1SortDir)} />
                  <SortableHeader label="Appointment Time" active={s1SortCol === 'appointmentTime'} dir={s1SortCol === 'appointmentTime' ? s1SortDir : null} onClick={() => toggleSort(s1SortCol, s1SortDir, 'appointmentTime', setS1SortCol, setS1SortDir)} />
                  <th>En yarda</th>
                  <SortableHeader label="Condition" active={s1SortCol === 'condition'} dir={s1SortCol === 'condition' ? s1SortDir : null} onClick={() => toggleSort(s1SortCol, s1SortDir, 'condition', setS1SortCol, setS1SortDir)} />
                  <th>Entry / ET</th><th>Status</th><th>Assignee</th><th>Dock Door</th><th>RN / Receipt</th><th>Note</th><th>Action</th>
                </tr></thead>
                <tbody>
                  {sortedYardRows.length === 0
                    ? <tr><td colSpan={11} style={{ textAlign: 'center', color: '#64748b', height: 60 }}>{live.containerMessage || 'No containers available'}</td></tr>
                    : sortedYardRows.map((row) => {
                      const key = row.container || row.entryET;
                      const isAssigned = assignedRows.has(key);
                      const historicalAssignee = historicalAssigneeForSection1(row);
                      return (
                        <tr key={key} className={`${row.conditionColor === 'yellow' ? 'row-yellow' : ''} ${isAssigned ? 'row-assigned' : ''}`}>
                          <td>{row.container}</td>
                          <td>{row.appointmentTime}</td>
                          <td>{row.inYard ? 'Yes' : 'No'}</td>
                          <td><span className={`status ${row.conditionColor === 'yellow' ? 'planned' : row.conditionColor === 'green' ? 'picked' : 'new'}`}>{row.condition}</span></td>
                          <td>{row.entryET}</td>
                          <td>{row.status}</td>
                          <td><SelectCell value={historicalAssignee} options={['-', ...assigneeNames]} id={`asg-s1-${key}`} /></td>
                          <td><SelectCell value={'-'} options={locationOptions} id={`dock-s1-${key}`} /></td>
                          <td>{row.receipt}</td>
                          <td>{row.note}</td>
                          <td>
                            {isAssigned
                              ? <button className="assign-button assigned" disabled>Assigned</button>
                              : <button className="assign-button" onClick={() => requestAssign(key, `dock-s1-${key}`, `asg-s1-${key}`, historicalAssignee)}>Assign</button>
                            }
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </section>

          <section id="section-2" className="panel section-two">
            <div className="panel-header"><h2>Section 2 - PLANNED Outbound Orders</h2><span>{live.orderRows.length} of {live.orderRows.length}</span></div>
            <div className="section-tools"><div className="chip-row"><span>All ({live.orderRows.length})</span><span>GURUNANDA, LLC ({live.orderRows.length})</span></div><input aria-label="Search orders" placeholder="Search order, PO, carrier..." /></div>
            <div className="table-wrap orders-scroll">
              <table>
                <thead><tr>
                  <SortableHeader label="Order #" active={s2SortCol === 'id'} dir={s2SortCol === 'id' ? s2SortDir : null} onClick={() => toggleSort(s2SortCol, s2SortDir, 'id', setS2SortCol, setS2SortDir)} />
                  <th>Customer</th>
                  <SortableHeader label="Status" active={s2SortCol === 'status'} dir={s2SortCol === 'status' ? s2SortDir : null} onClick={() => toggleSort(s2SortCol, s2SortDir, 'status', setS2SortCol, setS2SortDir)} />
                  <SortableHeader label="BASE QTY" active={s2SortCol === 'baseQty'} dir={s2SortCol === 'baseQty' ? s2SortDir : null} onClick={() => toggleSort(s2SortCol, s2SortDir, 'baseQty', setS2SortCol, setS2SortDir)} />
                  <SortableHeader label="Order Type" active={s2SortCol === 'orderType'} dir={s2SortCol === 'orderType' ? s2SortDir : null} onClick={() => toggleSort(s2SortCol, s2SortDir, 'orderType', setS2SortCol, setS2SortDir)} />
                  <th>PO / Reference</th>
                  <SortableHeader label="Ship To Name" active={s2SortCol === 'shipToName'} dir={s2SortCol === 'shipToName' ? s2SortDir : null} onClick={() => toggleSort(s2SortCol, s2SortDir, 'shipToName', setS2SortCol, setS2SortDir)} />
                  <SortableHeader label="Appointment Time" active={s2SortCol === 'scheduleDate'} dir={s2SortCol === 'scheduleDate' ? s2SortDir : null} onClick={() => toggleSort(s2SortCol, s2SortDir, 'scheduleDate', setS2SortCol, setS2SortDir)} />
                  <th>Assignee</th><th>Action</th>
                </tr></thead>
                <tbody>
                  {sortedOrderRows.length === 0
                    ? <tr><td colSpan={10} style={{ textAlign: 'center', color: '#64748b', height: 60 }}>No planned orders for GURUNANDA, LLC</td></tr>
                    : sortedOrderRows.map((row, i) => {
                    const isAssigned = assignedRows.has(row.id);
                    const defaultAssignee = historicalAssigneeForOrder(row, assigneeNames[i % assigneeNames.length]);
                    return (
                      <tr key={row.id} className={isAssigned ? 'row-assigned' : ''}>
                        <td>{row.id}</td><td>{row.customer}</td><td><span className="status planned">{row.status}</span></td><td>{row.baseQty}</td><td>{row.orderType}</td><td>{row.reference}</td><td>{row.shipToName}</td><td>{formatScheduleDate(row.scheduleDate)}</td>
                        <td><SelectCell value={defaultAssignee} options={assigneeNames} id={`asg-${row.id}`} /></td>
                        <td>
                          {isAssigned
                            ? <button className="assign-button assigned" disabled>Assigned</button>
                            : <button className="assign-button" onClick={() => requestAssign(row.id, `asg-${row.id}`, `asg-${row.id}`, defaultAssignee)}>Assign</button>
                          }
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <section className="panel section-three">
            <div className="panel-header"><h2>Section 3 - Outbound Shipping</h2><span>{live.shippingRows.length} rows</span></div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>DN / Order</th><th>Customer</th><th>DN Status</th><th>Load Status</th><th>Dock</th><th>ET</th><th>Assignee</th><th>Action</th></tr></thead>
                <tbody>
                  {live.shippingRows.length === 0
                    ? <tr><td colSpan={8} style={{ textAlign: 'center', color: '#64748b', height: 60 }}>No outbound shipping for GURUNANDA, LLC</td></tr>
                    : live.shippingRows.map((row) => {
                    const isAssigned = assignedRows.has(row.id);
                    const historicalAssignee = historicalAssigneeForShipping(row);
                    return (
                      <tr key={row.id} className={isAssigned ? 'row-assigned' : ''}>
                        <td>{row.id}</td><td>{row.customer}</td><td><span className="status picked">{row.dnStatus}</span></td><td><span className="status new">{row.loadStatus}</span></td>
                        <td><SelectCell value={row.dock} options={locationOptions} id={`loc-${row.id}`} /></td><td>{row.et}</td>
                        <td><SelectCell value={historicalAssignee} options={assigneeNames} id={`asg-${row.id}`} /></td>
                        <td>
                          {isAssigned
                            ? <button className="assign-button assigned" disabled>Assigned</button>
                            : <button className="assign-button" onClick={() => requestAssign(row.id, `loc-${row.id}`, `asg-${row.id}`, historicalAssignee)}>Assign</button>
                          }
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <aside className="sidebar">
          <section className="panel assigned-panel">
            <div className="panel-header"><h2>Assigned Today</h2><button>Refresh</button></div>
            <p className="assigned-note"><strong>{assignments.length} task{assignments.length !== 1 ? 's' : ''}</strong> Dashboard assigned only</p>
            <table>
              <thead><tr><th>Task</th><th>Assignee</th><th>Time</th></tr></thead>
              <tbody>
                {assignments.map((a) => (
                  <tr key={a.task}>
                    <td>{a.task}</td><td>{a.assignee}</td><td>{a.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </aside>
      </div>

      <section className="panel assignee-panel assignee-panel-bottom">
        <div className="panel-header"><h2>Bay 4 Assignees</h2><span>22 assignees</span></div>
        <div className="assignee-list">
          {assigneeNames.map((name) => <div className="assignee-card" key={name}><span>{name.split(' ').map((part) => part[0]).join('').slice(0, 2)}</span><strong>{name}</strong></div>)}
        </div>
      </section>
    </main>
  );
}

export default App;
