import { sampleActivity, sampleAppointments, samplePatients, sampleTasks } from './sample-data.mjs';

export const statusLabels = Object.freeze({
  waiting: '대기 중',
  called: '호출',
  completed: '완료',
});

export const appointmentLabels = Object.freeze({
  arrived: '도착',
  reserved: '예약',
});

export const views = Object.freeze(['overview', 'reception', 'schedule', 'records', 'operations']);

export function initialState() {
  return {
    view: 'overview',
    role: 'admin',
    query: '',
    receptionFilter: 'all',
    selectedPatient: null,
    patients: samplePatients.map(person => ({ ...person })),
    appointments: sampleAppointments.map(appointment => ({ ...appointment })),
    tasks: sampleTasks.map(task => ({ ...task })),
    activity: sampleActivity.map(entry => ({ ...entry })),
    notice: '',
  };
}

export function metrics(state) {
  return {
    total: state.patients.length,
    waiting: state.patients.filter(person => person.status === 'waiting').length,
    called: state.patients.filter(person => person.status === 'called').length,
    completed: state.patients.filter(person => person.status === 'completed').length,
    pendingTasks: state.tasks.filter(task => !task.done).length,
  };
}

export function filterPatients(state) {
  const query = state.query.trim().toLocaleLowerCase('ko');
  return state.patients.filter(person =>
    (state.receptionFilter === 'all' || person.status === state.receptionFilter)
      && (!query || `${person.name} ${person.id} ${person.room}`.toLocaleLowerCase('ko').includes(query)),
  );
}

export function getPatient(state, id) {
  return state.patients.find(person => person.id === id) ?? null;
}

export function changeStatus(state, id, nextStatus) {
  if (!Object.hasOwn(statusLabels, nextStatus)) return false;
  const person = getPatient(state, id);
  if (!person) return false;
  if (person.status === 'completed' && nextStatus !== 'completed') return false;
  person.status = nextStatus;
  state.activity.unshift({ time: '방금', title: `${person.name} · ${statusLabels[nextStatus]}`, detail: '브라우저 안에서만 변경됨' });
  return true;
}

export function addSyntheticReception(state) {
  const next = state.patients.reduce((max, person) => {
    const number = Number(person.id.split('-').at(-1));
    return Number.isFinite(number) ? Math.max(max, number) : max;
  }, 0) + 1;
  const patient = {
    id: `DEMO-P-${String(next).padStart(3, '0')}`,
    name: `가상 환자 ${String(next).padStart(2, '0')}`,
    age: '가상 정보',
    visit: '초진',
    time: '방금',
    status: 'waiting',
    room: '진료실 1',
    summary: '데모에서 생성한 새 접수',
    note: '브라우저 메모리에만 저장된 가상 정보입니다.',
  };
  state.patients.unshift(patient);
  state.activity.unshift({ time: '방금', title: `${patient.name} 가상 접수 추가`, detail: '서버로 전송되지 않음' });
  return patient;
}

export function toggleTask(state, id) {
  const task = state.tasks.find(item => item.id === id);
  if (!task) return false;
  task.done = !task.done;
  return true;
}
