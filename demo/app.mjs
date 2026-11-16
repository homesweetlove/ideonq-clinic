import { clinic, roleOptions } from './sample-data.mjs';
import { icon } from './icons.mjs';
import { addSyntheticReception, appointmentLabels, changeStatus, filterPatients, getPatient, initialState, metrics, statusLabels, toggleTask, visibleViews } from './model.mjs';

const root = document.getElementById('app');
let state = initialState();
let toastTimer;
const navItems = [
  { id: 'overview', label: '대시보드', icon: 'layout-dashboard' },
  { id: 'reception', label: '접수 · 대기', icon: 'users-round' },
  { id: 'schedule', label: '예약 · 일정', icon: 'calendar-days' },
  { id: 'records', label: '진료 작업', icon: 'file-text' },
  { id: 'operations', label: '운영 체크', icon: 'list-check' },
];
const titles = {
  overview: ['오늘의 진료 현황', '접수부터 진료실까지, 중요한 흐름을 한눈에.'],
  reception: ['접수 및 대기 관리', '대기 환자를 선택해 다음 상태로 진행해 보세요.'],
  schedule: ['예약 · 진료실 일정', '시간에 따라 이어지는 진료 일정을 살펴보세요.'],
  records: ['진료 작업 공간', '가상 차트의 구성과 조회 흐름을 미리 살펴보세요.'],
  operations: ['운영 체크리스트', '하루의 작은 운영 업무도 한 흐름에서 관리합니다.'],
};
const tourSteps = [
  { title: '접수부터 시작해 볼까요?', copy: '시연용 환자 한 명을 대기열에 추가합니다.', button: '가상 접수 등록' },
  { title: '대기열에서 호출합니다', copy: '방금 등록한 환자의 상태가 바뀌는 걸 확인하세요.', button: '진료실 호출' },
  { title: '진료 작업으로 이어집니다', copy: '가상 차트 패널을 열어 업무 맥락을 확인합니다.', button: '가상 차트 열기' },
  { title: '진료 흐름을 마칩니다', copy: '모든 변경은 브라우저 안에서만 일어납니다.', button: '완료 처리' },
];
const e = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

function button(label, action, id = '', kind = 'text', iconName = '') {
  return `<button type="button" class="ui-button ui-button--${kind}" data-action="${action}" data-id="${e(id)}">${iconName ? icon(iconName) : ''}<span>${e(label)}</span></button>`;
}
function chip(label, tone = 'neutral', withDot = true) {
  return `<span class="chip chip--${tone}">${withDot ? '<span class="chip-dot"></span>' : ''}${e(label)}</span>`;
}
function statusChip(status) {
  const tone = { waiting: 'amber', called: 'blue', completed: 'green' }[status] ?? 'neutral';
  return chip(statusLabels[status] ?? status, tone);
}
function getNextStatus(person) {
  return person.status === 'waiting' ? 'called' : person.status === 'called' ? 'completed' : null;
}
function roomSummary(room) {
  const people = state.patients.filter(person => person.room === room && person.status !== 'completed');
  return { total: people.length, active: people.filter(person => person.status === 'called').length };
}
function smallPersonRow(person) {
  const next = getNextStatus(person);
  return `<div class="person-line ${state.lastUpdatedPatient === person.id ? 'is-updated' : ''}">
    <span class="person-avatar" aria-hidden="true">${e(person.name.at(-1))}</span>
    <div class="person-identity"><strong>${e(person.name)}</strong><small>${e(person.visit)} · ${e(person.room)}</small></div>
    <span class="person-clock">${e(person.time)}</span>${statusChip(person.status)}
    ${next ? button(next === 'called' ? '호출' : '완료', 'status', `${person.id}:${next}`, 'subtle') : ''}
    <button class="icon-only" type="button" data-action="details" data-id="${e(person.id)}" aria-label="${e(person.name)} 상세 보기">${icon('chevron-right')}</button>
  </div>`;
}
function appointmentLine(appointment) {
  const person = appointment.patientId ? getPatient(state, appointment.patientId) : null;
  return `<div class="schedule-line"><time>${e(appointment.time)}</time><span class="schedule-rail" aria-hidden="true"></span>
    <div class="schedule-details"><strong>${e(person?.name ?? '가상 예약 슬롯')}</strong><small>${e(appointment.type)} <span>·</span> ${e(appointment.room)}</small></div>
    ${chip(appointmentLabels[appointment.status], appointment.status === 'arrived' ? 'green' : 'neutral')}
  </div>`;
}
function sectionHeading(title, caption, trailing = '') {
  return `<div class="surface-heading"><div><h3>${e(title)}</h3><p>${e(caption)}</p></div>${trailing}</div>`;
}

function overview() {
  const m = metrics(state);
  const pending = state.patients.filter(person => person.status !== 'completed').slice(0, 4);
  return `<div class="overview-layout">
    <section class="flow-hero">
      <div class="flow-top"><span>CLINIC PULSE</span>${chip('실시간 시뮬레이션', 'hero')}</div>
      <div class="flow-message"><span class="flow-kicker">CARE WORKFLOW</span><h2>대기부터 진료까지,<br>하나의 흐름으로.</h2><p>오늘의 업무를 단정하게 연결하는 클리닉 워크스페이스.</p></div>
      <div class="flow-track" aria-label="가상 업무 흐름">
        <div><span class="track-label">접수</span><strong>${String(m.total).padStart(2,'0')}</strong></div>
        <span class="track-arrow">${icon('arrow-right')}</span>
        <div class="is-focus"><span class="track-label">대기</span><strong>${String(m.waiting).padStart(2,'0')}</strong></div>
        <span class="track-arrow">${icon('arrow-right')}</span>
        <div><span class="track-label">진료 중</span><strong>${String(m.called).padStart(2,'0')}</strong></div>
        <span class="track-arrow">${icon('arrow-right')}</span>
        <div><span class="track-label">완료</span><strong>${String(m.completed).padStart(2,'0')}</strong></div>
      </div>
      <div class="flow-footer"><span>${icon('shield-check')} 모든 데이터는 가상입니다</span>${button('업무 흐름 체험하기', 'tour-start', '', 'light', 'play')}</div>
    </section>
    <aside class="today-panel"><div class="today-head"><span>LIVE SNAPSHOT</span>${icon('activity')}</div>
      <div class="today-number"><strong>${String(m.waiting).padStart(2,'0')}</strong><div><b>대기 중</b><span>가상 접수 기준</span></div></div>
      <div class="today-divider"></div><div class="today-rooms"><span class="small-label">진료실 현황</span>
        ${['진료실 1','진료실 2','진료실 3'].map(room => {
          const detail = roomSummary(room);
          return `<div class="room-mini"><span class="room-mini-icon">${icon('stethoscope')}</span><strong>${room}</strong><span>${detail.active ? '진료 중' : detail.total ? '대기 있음' : '준비 중'}</span><i class="${detail.active ? 'busy' : ''}"></i></div>`;
        }).join('')}
      </div></aside>
  </div>
  <div class="work-grid"><section class="surface">
    ${sectionHeading('현재 접수 현황','확인할 일이 먼저 보이도록 정리했어요.',button('전체 대기열', 'view', 'reception', 'text', 'arrow-up-right'))}
    <div class="person-lines">${pending.map(smallPersonRow).join('')}</div>
  </section><section class="surface">
    ${sectionHeading('다가오는 일정',clinic.dayLabel,button('예약 보기', 'view','schedule','text','arrow-up-right'))}
    <div class="schedule-list schedule-list--compact">${state.appointments.slice(0,4).map(appointmentLine).join('')}</div>
  </section></div>
  <div class="bottom-insight"><span>${icon('circle-check')} <strong>시연 환경</strong> · 이 페이지에는 실제 환자 정보나 의료기관 서버 연결이 없습니다.</span><span>LOCAL STATE ONLY ${icon('arrow-up-right')}</span></div>`;
}

function queueCard(person) {
  const next = getNextStatus(person);
  return `<article class="queue-card ${state.lastUpdatedPatient === person.id ? 'queue-card--updated' : ''}">
    <div class="queue-card-head"><span class="queue-number">${e(person.id.slice(-3))}</span>${statusChip(person.status)}</div>
    <div class="queue-card-body"><div class="queue-avatar">${e(person.name.at(-1))}</div><div><strong>${e(person.name)}</strong><span>${e(person.visit)} · ${e(person.room)}</span></div></div>
    <div class="queue-card-foot"><span>${icon('clock-3')} ${e(person.time)}</span><div>
      <button type="button" data-action="details" data-id="${e(person.id)}" aria-label="${e(person.name)} 상세 보기">${icon('arrow-up-right')}</button>
      ${next ? button(next === 'called' ? '호출' : '완료 처리', 'status', `${person.id}:${next}`, 'tiny') : ''}
    </div></div>
  </article>`;
}
function reception() {
  const count = metrics(state);
  const all = filterPatients(state);
  const columns = [
    { id: 'waiting', label: '대기 중', iconName:'clock-3', desc: '호출을 기다리는 접수', count:count.waiting },
    { id: 'called', label: '진료 중', iconName:'stethoscope', desc: '진료실로 안내됨', count:count.called },
    { id: 'completed', label: '완료', iconName:'circle-check', desc: '업무 흐름이 종료됨', count:count.completed },
  ];
  return `<div class="reception-toolbar"><label class="search-field">${icon('search')}<input id="patient-search" type="search" autocomplete="off" value="${e(state.query)}" placeholder="환자명 또는 접수 코드 검색" aria-label="가상 환자 검색"/></label>
    <div class="reception-count">${icon('users-round')} 가상 접수 <strong>${count.total}건</strong></div></div>
  <div class="queue-board">${columns.map(col => `<section class="queue-column queue-column--${col.id}"><div class="queue-column-head"><div><span class="queue-column-icon">${icon(col.iconName)}</span><div><h3>${col.label} <em>${col.count}</em></h3><p>${col.desc}</p></div></div></div>
    <div class="queue-column-body">${all.filter(person=>person.status===col.id).map(queueCard).join('') || '<div class="queue-empty">해당하는 접수가 없습니다.</div>'}</div></section>`).join('')}</div>
  <div class="board-hint">${icon('info')} 환자를 호출하거나 완료 처리하면 카드가 다음 단계로 이동합니다. 새로고침 시 초기화됩니다.</div>`;
}
function schedule() {
  return `<div class="schedule-grid"><section class="surface surface--large">${sectionHeading('진료 타임라인','예시 일정 · 읽기 전용',chip(`${state.appointments.length}개 예약`,'outline',false))}
      <div class="day-head"><div><span class="calendar-month">OCT</span><strong>20</strong></div><div><b>시연용 일정</b><span>실제 날짜·예약과 무관합니다.</span></div>${icon('calendar-days')}</div>
      <div class="schedule-list schedule-list--large">${state.appointments.map(appointmentLine).join('')}</div></section>
    <aside class="schedule-side"><section class="surface">${sectionHeading('진료실 배정','일정과 대기 상태 확인')}
      <div class="room-rows">${['진료실 1','진료실 2','진료실 3'].map((room,i) => {const detail=roomSummary(room);return `<div class="room-row"><span class="room-index">0${i+1}</span><div><strong>${room}</strong><small>${detail.total}건의 가상 진행 항목</small></div>${chip(detail.active?'진료 중':'준비','neutral')}</div>`;}).join('')}</div>
      </section><div class="calm-note">${icon('calendar-check-2')}<h3>한눈에 확인하는 일정</h3><p>예약과 진료실의 관계를 보여주는 시연 화면입니다. 실제 예약을 생성하지 않습니다.</p></div></aside></div>`;
}
function records() {
  return `<div class="workspace-note">${icon('shield-check')} <div><strong>가상 차트만 표시됩니다</strong><span>개인정보·진단·처방·실제 진료기록은 포함되지 않습니다.</span></div></div>
    <div class="records-grid"><section class="surface">${sectionHeading('방문 목록','조회할 가상 환자를 선택해 보세요')}
    <div class="record-list">${state.patients.map(person => `<button type="button" data-action="details" data-id="${e(person.id)}" class="record-entry"><span class="person-avatar">${e(person.name.at(-1))}</span><span><strong>${e(person.name)}</strong><small>${e(person.id)} · ${e(person.visit)}</small></span>${statusChip(person.status)}${icon('chevron-right')}</button>`).join('')}</div></section>
    <section class="record-preview"><div class="record-illustration">${icon('file-text')}<span class="illus-line"></span><span class="illus-line short"></span><span class="illus-line"></span></div>
      <span>DOCUMENT PREVIEW</span><h3>필요한 기록을<br>안전하게 살펴보세요.</h3><p>왼쪽에서 방문을 선택하면 읽기 전용 샘플 차트가 열립니다.</p>
    </section></div>`;
}
function operations() {
  const complete = state.tasks.filter(task=>task.done).length;
  const pct = Math.round(100*complete/state.tasks.length);
  return `<div class="operations-summary"><div><span class="small-label">DAILY CHECKLIST</span><h2>오늘의 운영 준비</h2><p>체크박스를 누르면 가상 진행률이 갱신됩니다.</p></div><div class="operations-percentage"><strong>${pct}<small>%</small></strong><span>${complete} / ${state.tasks.length} 완료</span></div><progress value="${pct}" max="100" aria-label="진행률 ${pct}퍼센트"></progress></div>
    <section class="surface operation-surface">${sectionHeading('업무 점검','가상 운영 항목 4개',chip('DEMO','outline',false))}
      <div class="task-list">${state.tasks.map(task => `<label class="task-item"><input type="checkbox" data-task="${e(task.id)}" ${task.done?'checked':''}/><span class="task-mark">${task.done?icon('check'):''}</span><span class="task-copy"><strong class="${task.done?'is-done':''}">${e(task.title)}</strong><small>${e(task.group)}</small></span><span class="task-state">${task.done?'완료':'대기'}</span></label>`).join('')}</div></section>`;
}
function tourBanner() {
  if (state.tourStep < 0) return '';
  const item=tourSteps[state.tourStep];
  return `<section class="tour-banner" aria-label="가이드 데모"><div class="tour-track">${tourSteps.map((_,i)=>`<span class="${i<=state.tourStep?'is-complete':''}"></span>`).join('')}</div>
    <div class="tour-copy"><span>GUIDED DEMO · ${state.tourStep+1} / ${tourSteps.length}</span><strong>${item.title}</strong><p>${item.copy}</p></div>
    <div class="tour-actions">${button('종료', 'tour-stop','','text')}${button(item.button, 'tour-next','','primary','arrow-right')}</div></section>`;
}
function drawer() {
  const person=getPatient(state,state.selectedPatient);
  if(!person)return '';
  return `<div class="drawer-shade" data-action="dismiss"><aside class="detail-drawer" role="dialog" aria-modal="true" aria-labelledby="drawer-title">
    <header class="drawer-header"><span>CHART PREVIEW / SYNTHETIC</span><button type="button" class="icon-only" data-action="close" aria-label="차트 닫기">${icon('x')}</button></header>
    <div class="drawer-person"><span class="drawer-avatar">${e(person.name.at(-1))}</span><div><h2 id="drawer-title">${e(person.name)}</h2><p>${e(person.id)}</p></div>${statusChip(person.status)}</div>
    <div class="drawer-section"><span class="drawer-label">방문 정보</span><div class="drawer-facts"><div><span>방문 구분</span><strong>${e(person.visit)}</strong></div><div><span>배정</span><strong>${e(person.room)}</strong></div><div><span>접수 시각</span><strong>${e(person.time)}</strong></div><div><span>기록 상태</span><strong>시연 전용</strong></div></div></div>
    <div class="drawer-section"><span class="drawer-label">예시 작성 영역</span><div class="draft-placeholder"><div><span></span><span></span></div><strong>실제 의학 정보는 없습니다.</strong><p>${e(person.note)}</p><p>시연 화면에서는 데이터를 입력하거나 서버에 저장할 수 없습니다.</p></div></div>
    <div class="drawer-footer">${state.tourStep===3?button('완료 처리하고 돌아가기','tour-next','','primary','circle-check'):button('닫기','close','','primary')}</div>
  </aside></div>`;
}
function toast() {
  return state.notice?`<div class="toast" role="status">${icon('circle-check')}<span>${e(state.notice)}</span><button type="button" data-action="toast-close" aria-label="알림 닫기">${icon('x')}</button></div>`:'';
}
function displayNotice(message) {
  state.notice=message;
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>{state.notice='';render();},3600);
}
function render() {
  const role=roleOptions.find(item=>item.id===state.role)??roleOptions[0];
  const allowed=visibleViews(state.role);
  const current=navItems.find(item=>item.id===state.view)??navItems[0];
  const heading=titles[current.id];
  const content={overview,reception,schedule,records,operations}[current.id]();
  const primary=current.id==='overview'?button('가이드 데모 시작','tour-start','','primary','play'):current.id==='reception'?button('가상 접수 추가','add','','primary','plus'):'';
  root.innerHTML=`<div class="app-frame">
    <aside class="side-nav ${state.mobileMenuOpen?'is-open':''}"><div class="wordmark"><strong>IDEONQ</strong><span>CLINIC</span></div>
      <div class="clinic-selector"><div class="clinic-symbol">${icon('building-2')}</div><div><strong>${e(clinic.name)}</strong><span>Workspace Demo</span></div>${icon('chevron-down','chevron')}</div>
      <span class="sidebar-caption">WORKSPACE</span><nav aria-label="주요 메뉴">${navItems.filter(item=>allowed.includes(item.id)).map(item=>`<button class="side-link ${state.view===item.id?'is-current':''}" type="button" data-action="view" data-id="${item.id}" ${state.view===item.id?'aria-current="page"':''}>${icon(item.icon)}<span>${item.label}</span>${state.view===item.id?'<span class="side-current"></span>':''}</button>`).join('')}</nav>
      <div class="side-nav-bottom"><div class="side-demo-stamp">${icon('shield-check')}<div><strong>Preview Environment</strong><span>실제 정보 없이 실행 중</span></div></div><span class="side-footer">© IDEONQ · Showcase 2.0</span></div>
    </aside>${state.mobileMenuOpen?'<button type="button" class="nav-shade" data-action="toggle-menu" aria-label="메뉴 닫기"></button>':''}
    <div class="app-main"><header class="app-topbar"><div class="topbar-start"><button class="menu-button icon-only" type="button" data-action="toggle-menu" aria-label="메뉴 열기">${icon('menu')}</button><span>Clinic Workspace</span>${icon('chevron-right')}<strong>${current.label}</strong></div>
      <div class="topbar-end"><span class="simulation-tag"><i></i> DEMO ONLY</span><label class="role-picker"><span class="role-initial">${e(role.initial)}</span><span class="role-name"><strong>${e(role.label)}</strong><small>보기 전용 역할</small></span>${icon('chevron-down')}<select id="role-select" aria-label="가상 역할 전환">${roleOptions.map(option=>`<option value="${option.id}" ${state.role===option.id?'selected':''}>${e(option.label)}</option>`).join('')}</select></label></div></header>
      <main class="page"><div class="page-heading"><div><div class="eyebrow"><span class="eyebrow-dash"></span>OPERATIONS / ${e(current.label)}</div><h1>${heading[0]}</h1><p>${heading[1]}</p></div><div class="heading-tools">${button('초기화','reset','','outline','rotate-ccw')}${primary}</div></div>${tourBanner()}${content}</main>
      <footer class="app-footer"><span>Synthetic clinic workspace · Nothing is stored or transmitted</span><span>IDEONQ / Public Demo</span></footer>
    </div></div>
    <nav class="mobile-bottom" aria-label="모바일 빠른 메뉴">${navItems.filter(item=>allowed.includes(item.id)).slice(0,4).map(item=>`<button type="button" data-action="view" data-id="${item.id}" class="${state.view===item.id?'is-current':''}">${icon(item.icon)}<span>${item.label.split(' ')[0]}</span></button>`).join('')}</nav>
    ${drawer()}${toast()}`;
}
function redrawFocus(targetId, position) {
  render();
  if(!targetId)return;
  const next=root.querySelector('#'+targetId);
  next?.focus();
  if(Number.isInteger(position) && typeof next?.setSelectionRange==='function')next.setSelectionRange(position,position);
}
function startTour() {
  state=initialState(); state.view='reception';state.tourStep=0;state.tourPatientId=null;
  displayNotice('가상 데이터로 네 단계의 업무 흐름을 체험합니다.');
}
function advanceTour() {
  if(state.tourStep===0){const person=addSyntheticReception(state);state.tourPatientId=person.id;state.tourStep=1;state.view='reception';}
  else if(state.tourStep===1){changeStatus(state,state.tourPatientId,'called');state.lastUpdatedPatient=state.tourPatientId;state.tourStep=2;}
  else if(state.tourStep===2){state.view='records';state.selectedPatient=state.tourPatientId;state.tourStep=3;}
  else if(state.tourStep===3){changeStatus(state,state.tourPatientId,'completed');state.lastUpdatedPatient=state.tourPatientId;state.selectedPatient=null;state.tourStep=-1;state.view='overview';displayNotice('체험 완료! 모든 변경은 메모리에만 남아 있습니다.');}
}
root.addEventListener('click',event=>{
  const el=event.target.closest('[data-action]');
  if(!el || !root.contains(el))return;
  const {action,id}=el.dataset;
  if(action==='dismiss' && event.target!==el)return;
  if(action==='view' && visibleViews(state.role).includes(id)){state.view=id;state.selectedPatient=null;state.mobileMenuOpen=false;}
  if(action==='toggle-menu')state.mobileMenuOpen=!state.mobileMenuOpen;
  if(action==='add'){const p=addSyntheticReception(state);state.view='reception';state.query='';state.lastUpdatedPatient=p.id;displayNotice(p.name+' 접수 추가됨 · 가상 데이터');}
  if(action==='status'){const [patientId,status]=id.split(':');if(changeStatus(state,patientId,status)){state.lastUpdatedPatient=patientId;displayNotice('가상 접수 상태가 변경되었습니다.');}}
  if(action==='details')state.selectedPatient=id;
  if(action==='close'||action==='dismiss')state.selectedPatient=null;
  if(action==='tour-start')startTour();
  if(action==='tour-next')advanceTour();
  if(action==='tour-stop'){state.tourStep=-1;state.selectedPatient=null;displayNotice('가이드 데모가 종료되었습니다.');}
  if(action==='reset'){state=initialState();displayNotice('가상 데이터가 초기화되었습니다.');}
  if(action==='toast-close'){clearTimeout(toastTimer);state.notice='';}
  render();
  if(action==='details')root.querySelector('.drawer-header button')?.focus();
});
root.addEventListener('input',event=>{
  if(event.target.id!=='patient-search')return;
  const position=event.target.selectionStart;
  state.query=event.target.value;
  redrawFocus('patient-search',position);
});
root.addEventListener('change',event=>{
  if(event.target.id==='role-select'){
    if(roleOptions.some(option=>option.id===event.target.value)){state.role=event.target.value;if(!visibleViews(state.role).includes(state.view))state.view='overview';}
    state.mobileMenuOpen=false;displayNotice('역할 전환은 UI 시뮬레이션이며 접근 권한 기능이 아닙니다.');render();
  }
  if(event.target.matches('[data-task]')){toggleTask(state,event.target.dataset.task);render();}
});
document.addEventListener('keydown',event=>{
  if(event.key==='Escape' && (state.selectedPatient||state.mobileMenuOpen)){state.selectedPatient=null;state.mobileMenuOpen=false;render();}
  if(event.key==='/' && state.view==='reception' && !state.selectedPatient && !['INPUT','TEXTAREA'].includes(document.activeElement.tagName)){event.preventDefault();root.querySelector('#patient-search')?.focus();}
});
render();
