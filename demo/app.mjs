import { clinic, roleOptions } from './sample-data.mjs';
import { addSyntheticReception, appointmentLabels, changeStatus, filterPatients, getPatient, initialState, metrics, statusLabels, toggleTask, views } from './model.mjs';

const root = document.getElementById('app');
const state = initialState();

const nav = [
  { id: 'overview', label: '대시보드', icon: '◫', subtitle: '오늘의 운영 현황' },
  { id: 'reception', label: '접수 · 대기', icon: '≋', subtitle: '가상 환자 대기열' },
  { id: 'schedule', label: '예약 · 일정', icon: '▦', subtitle: '진료실 예약 흐름' },
  { id: 'records', label: '진료 작업', icon: '▤', subtitle: '예시 차트 목록' },
  { id: 'operations', label: '운영 체크', icon: '✓', subtitle: '가상의 업무 점검' },
];

const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const action = (label, name, id = '', extraClass = '') => `<button type="button" class="button ${extraClass}" data-action="${name}" data-id="${escapeHTML(id)}">${escapeHTML(label)}</button>`;

function pill(label, kind = 'neutral') {
  return `<span class="pill pill--${kind}"><span class="pill-dot" aria-hidden="true"></span>${escapeHTML(label)}</span>`;
}

function statusPill(status) {
  return pill(statusLabels[status] ?? status, status);
}

function header(title, description, controls = '') {
  return `<div class="section-header"><div><p class="eyebrow">WORKSPACE / SYNTHETIC DATA</p><h2>${escapeHTML(title)}</h2><p class="section-copy">${escapeHTML(description)}</p></div><div class="section-actions">${controls}</div></div>`;
}

function patientCard(person, { compact = false } = {}) {
  const initials = person.name.at(-1);
  return `<article class="person-row ${compact ? 'person-row--compact' : ''}">
    <div class="avatar avatar--patient" aria-hidden="true">${escapeHTML(initials)}</div>
    <div class="person-main"><strong>${escapeHTML(person.name)}</strong><span>${escapeHTML(person.visit)} <span class="tiny-dot">·</span> ${escapeHTML(person.room)}</span></div>
    <div class="person-time">${escapeHTML(person.time)}</div>
    ${statusPill(person.status)}
    <button class="icon-button" type="button" aria-label="${escapeHTML(person.name)} 데모 상세 보기" data-action="details" data-id="${escapeHTML(person.id)}">↗</button>
  </article>`;
}

function appointmentRow(appointment) {
  const person = appointment.patientId ? getPatient(state, appointment.patientId) : null;
  return `<div class="appointment-row">
    <div class="timeline-time">${escapeHTML(appointment.time)}</div>
    <div class="timeline-track"><span></span></div>
    <div class="appointment-content"><strong>${escapeHTML(person?.name ?? '가상 예약 슬롯')}</strong><span>${escapeHTML(appointment.type)} · ${escapeHTML(appointment.room)}</span></div>
    ${pill(appointmentLabels[appointment.status], appointment.status === 'arrived' ? 'arrived' : 'neutral')}
  </div>`;
}

function summaryCard(label, value, hint, symbol, emphasis = false) {
  return `<article class="metric ${emphasis ? 'metric--emphasis' : ''}"><div class="metric-top"><span>${escapeHTML(label)}</span><span class="metric-symbol" aria-hidden="true">${symbol}</span></div><strong>${value}</strong><p>${escapeHTML(hint)}</p></article>`;
}

function overview() {
  const m = metrics(state);
  return `${header('좋은 하루예요.', '가상 운영 데이터로 확인하는 진료 업무 흐름입니다.')}
    <div class="welcome-panel"><div><span class="welcome-kicker">CLINIC OVERVIEW</span><h3>일상 업무에 집중할 수 있도록.</h3><p>접수부터 진료실 일정까지, 필요한 정보를 한눈에 확인하는 화면을 체험해 보세요.</p></div><div class="welcome-art" aria-hidden="true"><span></span><span></span><span></span></div></div>
    <div class="metrics-grid">
      ${summaryCard('전체 접수', String(m.total).padStart(2, '0'), '브라우저에 있는 가상 접수', '↗')}
      ${summaryCard('현재 대기', String(m.waiting).padStart(2, '0'), '호출을 기다리는 가상 인원', '⌁', true)}
      ${summaryCard('진료 진행', String(m.called).padStart(2, '0'), '가상 호출 상태', '◉')}
      ${summaryCard('완료', String(m.completed).padStart(2, '0'), '가상 업무 완료 상태', '✓')}
    </div>
    <div class="content-grid"><section class="panel"><div class="panel-heading"><div><h3>접수 현황</h3><p>가상의 환자 데이터만 표시</p></div>${action('전체 보기', 'view', 'reception', 'button--quiet')}</div><div class="person-list">${state.patients.slice(0, 4).map(person => patientCard(person, { compact: true })).join('')}</div></section>
    <section class="panel"><div class="panel-heading"><div><h3>오늘의 예약</h3><p>시간과 진료실 배정 예시</p></div>${action('일정 보기', 'view', 'schedule', 'button--quiet')}</div><div class="timeline">${state.appointments.slice(0, 4).map(appointmentRow).join('')}</div></section></div>
    <section class="panel activity-panel"><div class="panel-heading"><div><h3>최근 데모 활동</h3><p>실제 운영 기록이 아닙니다</p></div>${pill('LOCAL ONLY', 'outline')}</div><div class="activity-list">${state.activity.slice(0, 4).map((entry, index) => `<div class="activity-item"><span class="activity-marker ${index ? '' : 'activity-marker--fresh'}"></span><span class="activity-time">${escapeHTML(entry.time)}</span><div><strong>${escapeHTML(entry.title)}</strong><p>${escapeHTML(entry.detail)}</p></div></div>`).join('')}</div></section>`;
}

function reception() {
  const list = filterPatients(state);
  const items = [ ['all', '전체'], ['waiting', '대기'], ['called', '호출'], ['completed', '완료'] ];
  return `${header('접수 · 대기', '각 상태를 누르거나 가상 접수를 추가해 흐름을 체험할 수 있습니다.', action('+ 가상 접수 추가', 'add', '', 'button--primary'))}
    <div class="toolbar"><div class="segmented" role="group" aria-label="접수 상태 필터">${items.map(([id, label]) => `<button type="button" class="segment ${state.receptionFilter === id ? 'is-active' : ''}" data-action="filter" data-id="${id}" aria-pressed="${state.receptionFilter === id}">${label}</button>`).join('')}</div><label class="search"><span aria-hidden="true">⌕</span><input id="patient-search" type="search" placeholder="가상 환자 · 코드 검색" value="${escapeHTML(state.query)}" autocomplete="off" aria-label="가상 환자 검색" /></label></div>
    <section class="panel panel--table"><div class="table-title"><span>접수 목록</span><span>${list.length}건의 가상 데이터</span></div>
    ${list.length ? `<div class="reception-list">${list.map(person => `<div class="reception-item">${patientCard(person)}<div class="reception-next">${person.status === 'waiting' ? action('호출하기', 'status', `${person.id}:called`, 'button--soft') : person.status === 'called' ? action('완료 처리', 'status', `${person.id}:completed`, 'button--soft') : `<span class="small-muted">처리 종료</span>`}</div></div>`).join('')}</div>` : `<div class="empty-state">검색 조건과 일치하는 가상 접수가 없어요.</div>`}</section>
    <div class="info-callout"><span>ⓘ</span> 이 화면에는 환자 정보 저장·전송 기능이 없습니다. 모든 변경 사항은 새로고침하면 사라집니다.</div>`;
}

function schedule() {
  return `${header('예약 · 일정', '시간대별 예약과 진료실 배정 흐름을 살펴보세요.', pill('샘플 일정', 'outline'))}
    <div class="content-grid content-grid--schedule"><section class="panel"><div class="panel-heading"><div><h3>진료 예약 타임라인</h3><p>${escapeHTML(clinic.dayLabel)}</p></div><span class="count-label">${state.appointments.length}개 일정</span></div><div class="timeline timeline--large">${state.appointments.map(appointmentRow).join('')}</div></section>
    <div class="side-stack"><section class="panel"><div class="panel-heading"><div><h3>진료실 상태</h3><p>운영 흐름의 예시</p></div></div><div class="room-list">${[1,2,3].map((num, i) => `<div class="room-row"><div class="room-icon">${String(num).padStart(2, '0')}</div><div><strong>진료실 ${num}</strong><p>${i === 2 ? '다음 예약 준비' : '가상 일정 진행 중'}</p></div>${pill(i === 2 ? '준비' : '사용 중', i === 2 ? 'neutral' : 'arrived')}</div>`).join('')}</div></section><section class="aside-note"><div class="aside-note-symbol">◷</div><h3>간결한 일정 관리</h3><p>예약 흐름과 진료실 상태를 연결해 보는 화면입니다. 실제 예약은 생성되지 않습니다.</p></section></div></div>`;
}

function records() {
  return `${header('진료 작업', '가상의 차트 목록과 진료 초안 UI를 확인할 수 있습니다.')}
    <div class="record-banner"><span class="record-banner-icon">▤</span><div><strong>데모 기록만 제공됩니다</strong><p>실제 임상 자료, 진단 정보, 의학적 판단 내용은 포함하지 않습니다.</p></div></div>
    <section class="panel"><div class="panel-heading"><div><h3>가상 방문 목록</h3><p>예시 정보 보기 버튼으로 초안 화면을 열어보세요</p></div>${pill(`${state.patients.length}건`, 'outline')}</div><div class="record-list">${state.patients.map(person => `<div class="record-row"><div class="avatar avatar--record">${escapeHTML(person.name.at(-1))}</div><div><strong>${escapeHTML(person.name)}</strong><span>${escapeHTML(person.id)} · ${escapeHTML(person.visit)}</span></div><span class="record-room">${escapeHTML(person.room)}</span>${action('예시 보기', 'details', person.id, 'button--soft')}</div>`).join('')}</div></section>`;
}

function operations() {
  const completed = state.tasks.filter(task => task.done).length;
  const pct = Math.round(100 * completed / state.tasks.length);
  return `${header('운영 체크', '완료 상태를 선택해 직원 인수인계 화면을 체험할 수 있습니다.')}
    <div class="operations-head"><div><span>WORKFLOW PROGRESS</span><h3>오늘의 가상 업무 체크</h3><p>${completed} / ${state.tasks.length} 항목 완료</p></div><div class="progress-number">${pct}<span>%</span></div><progress class="progress-track" max="100" value="${pct}" aria-label="체크리스트 완료율 ${pct}퍼센트"></progress></div>
    <section class="panel"><div class="panel-heading"><div><h3>업무 목록</h3><p>상태는 브라우저 메모리에만 남습니다</p></div>${pill('데모 체크리스트', 'outline')}</div><div class="task-list">${state.tasks.map(task => `<label class="task-row"><input type="checkbox" data-task="${escapeHTML(task.id)}" ${task.done ? 'checked' : ''} /><span class="task-checkbox" aria-hidden="true">${task.done ? '✓' : ''}</span><span class="task-copy"><strong class="${task.done ? 'is-done' : ''}">${escapeHTML(task.title)}</strong><small>${escapeHTML(task.group)}</small></span><span class="task-state">${task.done ? '완료' : '대기'}</span></label>`).join('')}</div></section><div class="info-callout"><span>ⓘ</span> 체크를 바꾸면 진행률이 바뀌지만 서버나 다른 기기에는 반영되지 않습니다.</div>`;
}

function detailsModal() {
  const person = getPatient(state, state.selectedPatient);
  if (!person) return '';
  return `<div class="modal-backdrop" data-action="dismiss"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div class="modal-top"><div><p class="eyebrow">SYNTHETIC / CHART PREVIEW</p><h2 id="modal-title">${escapeHTML(person.name)}</h2></div><button type="button" class="close-button" data-action="close" aria-label="상세 화면 닫기">×</button></div><div class="modal-meta">${pill('가상 데이터', 'outline')} ${statusPill(person.status)} <span>${escapeHTML(person.id)}</span></div><div class="modal-section"><h3>방문 요약</h3><div class="modal-facts"><div><span>방문 유형</span><strong>${escapeHTML(person.visit)}</strong></div><div><span>진료실</span><strong>${escapeHTML(person.room)}</strong></div><div><span>등록 시각</span><strong>${escapeHTML(person.time)}</strong></div></div><p>${escapeHTML(person.summary)}</p></div><div class="modal-section"><h3>진료 초안 미리보기</h3><div class="draft-note"><span>가상 텍스트</span><p>${escapeHTML(person.note)}</p><p>여기에는 실제 진료 내역을 입력하거나 저장할 수 없습니다.</p></div></div><div class="modal-footer">${action('닫기', 'close', '', 'button--primary')}</div></section></div>`;
}

function render() {
  const active = nav.find(item => item.id === state.view) ?? nav[0];
  const role = roleOptions.find(option => option.id === state.role) ?? roleOptions[0];
  const pages = { overview, reception, schedule, records, operations };
  root.innerHTML = `<div class="app-shell"><aside class="sidebar"><div class="brand"><div class="brand-mark" aria-hidden="true">i<span>q</span></div><div class="brand-name"><strong>IDEONQ</strong><span>CLINIC SHOWCASE</span></div></div><div class="workplace"><div class="workplace-icon">✳</div><div><strong>${escapeHTML(clinic.name)}</strong><span>퍼블릭 인터랙티브 데모</span></div><span class="workplace-chevron">⌄</span></div><div class="nav-caption">WORKSPACE</div><nav class="nav-list" aria-label="주요 메뉴">${nav.map(item => `<button type="button" class="nav-link ${state.view === item.id ? 'is-active' : ''}" data-action="view" data-id="${item.id}" ${state.view === item.id ? 'aria-current="page"' : ''}><span class="nav-icon" aria-hidden="true">${item.icon}</span><span>${item.label}</span>${state.view === item.id ? '<span class="nav-indicator"></span>' : ''}</button>`).join('')}</nav><div class="sidebar-bottom"><span class="sidebar-label">DEMO ENVIRONMENT</span><p>가상의 데이터만 표시됩니다.<br />실제 환자 정보가 없습니다.</p><div class="sidebar-version"><span class="version-dot"></span> Public Showcase v1.0</div></div></aside>
  <div class="main-shell"><header class="topbar"><div class="breadcrumb"><span>Workspace</span><span class="breadcrumb-chevron">/</span><strong>${escapeHTML(active.label)}</strong></div><div class="topbar-actions"><span class="demo-chip"><span class="demo-chip-dot"></span>DEMO MODE</span><label class="role-switcher"><span class="role-avatar">${escapeHTML(role.initial)}</span><span class="role-label">${escapeHTML(role.label)} <small>화면 시뮬레이션</small></span><select id="role-select" aria-label="시뮬레이션 역할 선택">${roleOptions.map(option => `<option value="${option.id}" ${state.role === option.id ? 'selected' : ''}>${escapeHTML(option.label)}</option>`).join('')}</select><span aria-hidden="true">⌄</span></label></div></header><main class="main-content"><div class="mobile-title">IDEONQ <span>CLINIC</span></div>${pages[active.id]()}</main><footer class="page-footer"><span>© 2026 IDEONQ · Synthetic showcase</span><span>Offline demo · No real records · No backend</span></footer></div></div>
  <nav class="mobile-nav" aria-label="모바일 메뉴">${nav.map(item => `<button class="${state.view === item.id ? 'is-active' : ''}" data-action="view" data-id="${item.id}" type="button"><span aria-hidden="true">${item.icon}</span><small>${item.label.split(' ')[0]}</small></button>`).join('')}</nav>
  <div class="sr-only" role="status" aria-live="polite">${escapeHTML(state.notice)}</div>${detailsModal()}`;
}

root.addEventListener('click', event => {
  const button = event.target.closest('[data-action]');
  if (!button || !root.contains(button)) return;
  const { action: name, id } = button.dataset;
  if (name === 'dismiss' && event.target !== button) return;
  if (name === 'view' && views.includes(id)) { state.view = id; state.selectedPatient = null; }
  if (name === 'filter' && ['all', ...Object.keys(statusLabels)].includes(id)) state.receptionFilter = id;
  if (name === 'add') { const person = addSyntheticReception(state); state.notice = `${person.name} 접수가 가상으로 추가되었습니다.`; state.view = 'reception'; state.receptionFilter = 'all'; state.query = ''; }
  if (name === 'details') state.selectedPatient = id;
  if (name === 'close' || name === 'dismiss') state.selectedPatient = null;
  if (name === 'status') { const [patientId, status] = id.split(':'); if (changeStatus(state, patientId, status)) state.notice = '가상 상태가 변경되었습니다.'; }
  render();
  if (name === 'details') root.querySelector('.close-button')?.focus();
});

root.addEventListener('input', event => {
  if (event.target.id !== 'patient-search') return;
  const cursor = event.target.selectionStart;
  state.query = event.target.value;
  render();
  const replacement = root.querySelector('#patient-search');
  replacement?.focus();
  replacement?.setSelectionRange(cursor, cursor);
});

root.addEventListener('change', event => {
  if (event.target.id === 'role-select') {
    if (roleOptions.some(option => option.id === event.target.value)) state.role = event.target.value;
    state.notice = '역할 선택은 화면 표시 전용이며 인증 또는 권한 확인이 아닙니다.';
    render();
  }
  if (event.target.matches('[data-task]')) {
    toggleTask(state, event.target.dataset.task);
    state.notice = '가상 체크리스트가 변경되었습니다.';
    render();
  }
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && state.selectedPatient) { state.selectedPatient = null; render(); }
});

render();
