import { pathToFileURL } from 'node:url';

export async function deploy(env = process.env, request = fetch, wait = ms => new Promise(r => setTimeout(r, ms))) {
  for (const key of ['TOWER_USER', 'TOWER_PASSWORD', 'TOWER_ORG_ID', 'TOWER_OPERATION_ID', 'DEPLOY_IMAGE']) {
    if (!env[key]) throw new Error(`Missing ${key}`);
  }
  const login = await request('https://api.tower.cloud/public?action=login', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: env.TOWER_USER, password: env.TOWER_PASSWORD, organizationId: env.TOWER_ORG_ID }),
    redirect: 'error', signal: AbortSignal.timeout(30000),
  });
  if (!login.ok) throw new Error(`Tower login returned HTTP ${login.status}`);
  const token = (await login.json()).access_token;
  if (!token) throw new Error('Tower login returned no token');
  async function api(path) {
    const response = await request(`https://api.tower.cloud/service/container-instance/${path}`, {
      headers: { Authorization: `Bearer ${token}` },
      redirect: 'error', signal: AbortSignal.timeout(30000),
    });
    if (!response.ok) throw new Error(`Tower API returned HTTP ${response.status}`);
    return (await response.json()).data?.operation;
  }
  const accepted = { id: env.TOWER_OPERATION_ID };
  for (let i = 0; i < 60; i++) {
    const operation = await api(`operations/${encodeURIComponent(accepted.id)}`);
    if (operation?.status === 'failed') throw new Error('Tower image rollout failed; inspect the operation in Tower');
    if (operation?.status === 'succeeded') {
      const health = await request('https://chetankrishna.in/api/health', { signal: AbortSignal.timeout(30000), cache: 'no-store' });
      if (!health.ok || (await health.json()).status !== 'ok') throw new Error('Portfolio health check failed');
      console.log(`Deployed ${env.DEPLOY_IMAGE}; operation ${accepted.id} succeeded and portfolio is healthy.`);
      return;
    }
    if (!['pending', 'in_progress'].includes(operation?.status)) throw new Error('Unexpected Tower operation response');
    await wait(10000);
  }
  throw new Error('Tower rollout did not finish within 10 minutes; inspect it before retrying');
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  deploy().catch(error => { console.error(error.message); process.exitCode = 1; });
}
