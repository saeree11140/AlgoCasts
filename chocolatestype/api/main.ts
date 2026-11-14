import { startChocolateApi } from './index';

function readPort(raw = '3000'): number {
  const port = Number(raw);
  if (!/^\d+$/.test(raw) || port > 65535) {
    throw new Error(`PORT must be an integer from 0 to 65535, got "${raw}"`);
  }
  return port;
}

async function main(): Promise<void> {
  const { baseUrl } = await startChocolateApi({ port: readPort(process.env.PORT) });
  console.log(`Chocolate Types mock API: ${baseUrl}/api/chocolate-types`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
