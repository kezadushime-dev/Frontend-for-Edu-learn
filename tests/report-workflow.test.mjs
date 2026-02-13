import assert from 'node:assert/strict';
import test from 'node:test';

const canLearnerDownload = (status) => status === 'APPROVED';

const applyDecision = (request, actor, nextStatus, timestamp = '2026-02-12T00:00:00.000Z') => {
  if (request.status !== 'PENDING') return request;
  return {
    ...request,
    status: nextStatus,
    approvedBy: actor.id,
    approvedByName: actor.name,
    approvedByRole: actor.role,
    updatedAt: timestamp
  };
};

test('learner cannot download when status is pending or rejected', () => {
  assert.equal(canLearnerDownload('PENDING'), false);
  assert.equal(canLearnerDownload('REJECTED'), false);
});

test('learner can download only when status is approved', () => {
  assert.equal(canLearnerDownload('APPROVED'), true);
});

test('decision made by instructor is reflected globally', () => {
  const request = {
    id: 'req-1',
    status: 'PENDING',
    approvedBy: null,
    approvedByName: null,
    approvedByRole: null,
    updatedAt: null
  };
  const instructor = { id: 'u-100', name: 'Jane Tutor', role: 'INSTRUCTOR' };

  const approved = applyDecision(request, instructor, 'APPROVED');
  assert.equal(approved.status, 'APPROVED');
  assert.equal(approved.approvedByName, 'Jane Tutor');
  assert.equal(approved.approvedByRole, 'INSTRUCTOR');
});

test('finalized request does not return to pending for another role', () => {
  const approvedRequest = {
    id: 'req-2',
    status: 'APPROVED',
    approvedBy: 'u-100',
    approvedByName: 'Jane Tutor',
    approvedByRole: 'INSTRUCTOR',
    updatedAt: '2026-02-12T00:00:00.000Z'
  };
  const admin = { id: 'a-1', name: 'Admin User', role: 'ADMIN' };

  const afterAdminAction = applyDecision(approvedRequest, admin, 'REJECTED');
  assert.equal(afterAdminAction.status, 'APPROVED');
  assert.equal(afterAdminAction.approvedByRole, 'INSTRUCTOR');
});
