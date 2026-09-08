import { pathToFileURL } from 'node:url';

export async function deploy(env = process.env, request = fetch, wait = ms => new Promise(r => setTimeout(r, ms))) {
  for (const key of ['TOWER_API_BASE_URL', 'TOWER_API_TOKEN', 'TOWER_CONTAINER_NAME', 'DEPLOY_IMAGE']) {
    if (!env[key]) throw new Error(`Missing ${key}`);
  }
  const base = new URL(env.TOWER_API_BASE_URL);
  if (base.protocol !== 'https:' || base.username || base.password || base.search || base.hash) throw new Error('API base must be a plain HTTPS URL');
  const root = base.href.replace(/\/$/, '');
  async function api(path, body) {
    const response = await request(`${root}/${path}`, {
      method: body ? 'PATCH' : 'GET',
      headers: { Authorization: `Bearer ${env.TOWER_API_TOKEN}`, 'Content-Type': 'application/json' },
      ...(body ? { body: JSON.stringify(body) } : {}),
      redirect: 'error', signal: AbortSignal.timeout(30000),
    });
    if (!response.ok) throw new Error(`Tower API returned HTTP ${response.status}`);
    return (await response.json()).data?.operation;
  }
  const accepted = await api(`containers/${encodeURIComponent(env.TOWER_CONTAINER_NAME)}/image`, { image: env.DEPLOY_IMAGE });
  if (!accepted?.id) throw new Error('Tower did not return an operation ID');
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
