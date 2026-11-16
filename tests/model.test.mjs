import test from 'node:test';
import assert from 'node:assert/strict';
import { addSyntheticReception, changeStatus, filterPatients, getPatient, initialState, metrics, toggleTask, visibleViews } from '../demo/model.mjs';
import { clinic, sampleAppointments, samplePatients } from '../demo/sample-data.mjs';

test('fixtures are obviously synthetic, not imported patient records', () => {
  assert.equal(clinic.name, '샘플 클리닉');
  assert.ok(samplePatients.every(person => person.id.startsWith('DEMO-P-') && person.name.startsWith('가상 환자')));
  assert.ok(sampleAppointments.every(appointment => appointment.id.startsWith('DEMO-A-')));
  assert.ok(samplePatients.every(person => !('phone' in person) && !('birthDate' in person)));
});

test('initial counters represent the in-memory sample only', () => {
  const state = initialState();
  assert.deepEqual(metrics(state), { total: 5, waiting: 3, called: 1, completed: 1, pendingTasks: 2 });
});

test('registering a demo patient adds an in-memory, synthetic-only record', () => {
  const state = initialState();
  const created = addSyntheticReception(state);
  assert.equal(created.name, '가상 환자 06');
  assert.equal(metrics(state).total, 6);
  assert.equal(metrics(initialState()).total, 5, 'a fresh state has no previous changes');
  assert.ok(!('birthDate' in created) && !('phone' in created));
});

test('reception workflow and status transitions', () => {
  const state = initialState();
  assert.equal(changeStatus(state, 'DEMO-P-001', 'called'), true);
  assert.equal(changeStatus(state, 'DEMO-P-001', 'completed'), true);
  assert.equal(changeStatus(state, 'DEMO-P-001', 'waiting'), false, 'completed record cannot be reopened through this demo action');
  assert.equal(changeStatus(state, 'DEMO-P-001', 'unknown'), false);
  assert.equal(changeStatus(state, 'UNLISTED', 'waiting'), false);
  assert.equal(getPatient(state, 'DEMO-P-001').status, 'completed');
});

test('search and filter compose correctly', () => {
  const state = initialState();
  state.receptionFilter = 'waiting';
  state.query = '가상 환자 c';
  assert.deepEqual(filterPatients(state).map(person => person.id), ['DEMO-P-003']);
  state.query = 'DEMO-P-004';
  assert.deepEqual(filterPatients(state), []);
});

test('operational checklist toggles only a synthetic task', () => {
  const state = initialState();
  assert.equal(toggleTask(state, 'DEMO-T-002'), true);
  assert.equal(metrics(state).pendingTasks, 1);
  assert.equal(toggleTask(state, 'DEMO-T-002'), true);
  assert.equal(metrics(state).pendingTasks, 2);
  assert.equal(toggleTask(state, 'NOT-FOUND'), false);
});

test('role-specific demo navigation is explicitly a presentation subset', () => {
  assert.deepEqual(visibleViews('doctor'), ['overview', 'schedule', 'records']);
  assert.deepEqual(visibleViews('staff'), ['overview', 'reception', 'schedule', 'operations']);
  assert.equal(visibleViews('admin').length, 5);
  assert.equal(visibleViews('unknown').length, 5);
});
