import { build, context } from 'esbuild';
import { mkdir, copyFile, cp, writeFile } from 'node:fs/promises';
import { createServer } from 'vite';

// IIFE output deliberately works with file:// as well as any static web server.
const options = {
  entryPoints: ['scene.js'], bundle: true, outfile: 'scene.bundle.js',
  format: 'iife', target: ['es2020'], minify: true, legalComments: 'eof',
};
if (process.argv.includes('--dev')) {
  const ctx = await context(options);
  await ctx.watch();
  const server = await createServer({ configFile: 'vite.static.config.js' });
  await server.listen();
  server.printUrls();
  const stop = async () => { await server.close(); await ctx.dispose(); process.exit(0); };
  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);
} else {
  await build(options);
  await mkdir('out', { recursive: true });
  for (const name of ['index.html', 'styles.css', 'scene.bundle.js']) {
    await copyFile(name, `out/${name}`);
  }
  await cp('public', 'out', { recursive: true });
  // Also keep root assets beside index.html for a direct double-click launch.
  await cp('public/assets', 'assets', { recursive: true });
  await copyFile('public/favicon.svg', 'favicon.svg');
  await writeFile('out/_headers', '/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n');
  console.log('Built standalone Lalish experience in out/.');
}
