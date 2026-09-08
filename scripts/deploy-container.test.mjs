import test from 'node:test';
import assert from 'node:assert/strict';
import { deploy } from './deploy-container.mjs';
const env = { TOWER_USER: 'test', TOWER_PASSWORD: 'test', TOWER_ORG_ID: 'org', TOWER_OPERATION_ID: '123', DEPLOY_IMAGE: 'registry/portfolio:abc' };
test('monitor logs in, polls operation, and checks health only after success', async () => {
  const calls = [];
  const replies = [{ access_token: 'test-token' }, { data: { operation: { status: 'in_progress' } } }, { data: { operation: { status: 'succeeded' } } }, { status: 'ok' }];
  await deploy(env, async (url, options) => { calls.push({ url, options }); return { ok: true, json: async () => replies.shift() }; }, async () => {});
  assert.deepEqual(JSON.parse(calls[0].options.body), { username: 'test', password: 'test', organizationId: 'org' });
  assert.equal(calls[1].url, 'https://api.tower.cloud/service/container-instance/operations/123');
  assert.equal(calls[3].url, 'https://chetankrishna.in/api/health');
});
test('failed rollout fails deployment without declaring the old healthy site a success', async () => {
  let calls = 0;
  await assert.rejects(deploy(env, async () => ({ ok: true, json: async () => (++calls === 1 ? { access_token: 'test-token' } : { data: { operation: { status: 'failed' } } }) }), async () => {}), /rollout failed/);
  assert.equal(calls, 2);
});
