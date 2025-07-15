import axios from 'axios';
import { performance } from 'perf_hooks';

const COUNT = 1000;
const GATEWAY_HTTP = 'http://localhost:3000';

function now() {
  return performance.now();
}

async function testHttpParallelSubscribe() {
  const requests = Array.from({ length: COUNT }, (_, i) => {
    return axios
      .post(`${GATEWAY_HTTP}/subscription/subscribe`, {
        email: `http_parallel_test${i}@example.com`,
        city: 'Kyiv',
        frequency: 'daily',
      })
      .catch(() => {});
  });

  const start = now();
  await Promise.all(requests);
  const end = now();

  const total = end - start;
  const avg = total / COUNT;

  return { total, avg };
}

async function testHttpSendWeatherToSubscribers() {
  const start = now();
  try {
    await axios.get(`${GATEWAY_HTTP}/subscription/test`);
  } catch (e) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    console.error('Failed to call /subscription/test:', e.message);
  }
  const end = now();

  return { total: end - start };
}

async function test() {
  console.log(`Running ${COUNT} parallel subscriptions...\n`);

  console.log('HTTP Subscription Benchmark...');
  const http = await testHttpParallelSubscribe();
  console.log(`⏱ Total time: ${http.total.toFixed(2)}ms`);
  console.log(`⏱ Avg time/request: ${http.avg.toFixed(2)}ms`);

  console.log('\n Cron Job Simulation Benchmark (/subscription/test)...');
  const cron = await testHttpSendWeatherToSubscribers();
  console.log(`⏱ Total time: ${cron.total.toFixed(2)}ms`);
}

test().catch(console.error);
