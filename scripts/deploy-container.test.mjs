import test from 'node:test';
import assert from 'node:assert/strict';
import { deploy } from './deploy-container.mjs';
const env = { TOWER_API_BASE_URL: 'https://api.example/service/container-instance', TOWER_API_TOKEN: 'test', TOWER_CONTAINER_NAME: 'portfolio', DEPLOY_IMAGE: 'registry/portfolio:abc' };
test('deploy sends exact image, polls operation, and checks health only after success', async () => {
  const calls = [];
  const replies = [{ data: { operation: { id: '123' } } }, { data: { operation: { status: 'in_progress' } } }, { data: { operation: { status: 'succeeded' } } }, { status: 'ok' }];
  await deploy(env, async (url, options) => { calls.push({ url, options }); return { ok: true, json: async () => replies.shift() }; }, async () => {});
  assert.deepEqual(JSON.parse(calls[0].options.body), { image: env.DEPLOY_IMAGE });
  assert.equal(calls[1].url, `${env.TOWER_API_BASE_URL}/operations/123`);
  assert.equal(calls[3].url, 'https://chetankrishna.in/api/health');
});
test('failed rollout fails deployment without declaring the old healthy site a success', async () => {
  let calls = 0;
  await assert.rejects(deploy(env, async () => ({ ok: true, json: async () => ({ data: { operation: ++calls === 1 ? { id: '123' } : { status: 'failed' } } }) }), async () => {}), /rollout failed/);
  assert.equal(calls, 2);
});
