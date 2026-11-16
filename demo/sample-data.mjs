// Every identifier and person below is an invented demonstration fixture.
// Do not replace these fixtures with real patient or employee information.
export const clinic = Object.freeze({
  name: '샘플 클리닉',
  subtitle: '독립형 업무 흐름 데모',
  dayLabel: '시연용 일정 · 가상 진료일',
});

export const roleOptions = Object.freeze([
  { id: 'admin', label: '관리자', initial: '관' },
  { id: 'doctor', label: '의사', initial: '의' },
  { id: 'staff', label: '접수 직원', initial: '접' },
]);

export const samplePatients = Object.freeze([
  { id: 'DEMO-P-001', name: '가상 환자 A', age: '가상 정보', visit: '초진', time: '09:10', status: 'waiting', room: '진료실 1', summary: '상담 목적의 예시 접수', note: '진료 전 확인 사항 예시. 실제 의학 정보가 아닙니다.' },
  { id: 'DEMO-P-002', name: '가상 환자 B', age: '가상 정보', visit: '재진', time: '09:20', status: 'called', room: '진료실 2', summary: '일정 확인을 위한 예시', note: '가상의 방문 기록만 표시됩니다.' },
  { id: 'DEMO-P-003', name: '가상 환자 C', age: '가상 정보', visit: '초진', time: '09:35', status: 'waiting', room: '진료실 1', summary: '방문 안내 예시', note: '실제 환자 정보가 없습니다.' },
  { id: 'DEMO-P-004', name: '가상 환자 D', age: '가상 정보', visit: '재진', time: '08:50', status: 'completed', room: '진료실 3', summary: '완료 처리 예시', note: '진료 내용은 비워져 있습니다.' },
  { id: 'DEMO-P-005', name: '가상 환자 E', age: '가상 정보', visit: '초진', time: '09:45', status: 'waiting', room: '진료실 2', summary: '예약 후 도착 예시', note: '샘플 차트 화면입니다.' },
]);

export const sampleAppointments = Object.freeze([
  { id: 'DEMO-A-001', patientId: 'DEMO-P-001', time: '09:10', room: '진료실 1', type: '첫 방문', status: 'arrived' },
  { id: 'DEMO-A-002', patientId: 'DEMO-P-002', time: '09:20', room: '진료실 2', type: '재방문', status: 'arrived' },
  { id: 'DEMO-A-003', patientId: 'DEMO-P-003', time: '09:35', room: '진료실 1', type: '첫 방문', status: 'arrived' },
  { id: 'DEMO-A-004', patientId: 'DEMO-P-005', time: '09:45', room: '진료실 2', type: '첫 방문', status: 'arrived' },
  { id: 'DEMO-A-005', patientId: null, time: '10:10', room: '진료실 3', type: '가상 예약', status: 'reserved' },
  { id: 'DEMO-A-006', patientId: null, time: '10:30', room: '진료실 1', type: '가상 예약', status: 'reserved' },
]);

export const sampleTasks = Object.freeze([
  { id: 'DEMO-T-001', title: '진료실 준비 상태 확인', group: '운영 점검', done: true },
  { id: 'DEMO-T-002', title: '대기 안내 화면 점검', group: '서비스 관리', done: false },
  { id: 'DEMO-T-003', title: '가상 재고 현황 검토', group: '재고 관리', done: false },
  { id: 'DEMO-T-004', title: '업무 인수인계 항목 확인', group: '인수인계', done: true },
]);

export const sampleActivity = Object.freeze([
  { time: '09:45', title: '가상 환자 E 도착 처리', detail: '데모 접수 데이터' },
  { time: '09:35', title: '가상 환자 C 접수 등록', detail: '데모 대기열 데이터' },
  { time: '09:20', title: '가상 환자 B 호출', detail: '데모 진료실 데이터' },
]);
