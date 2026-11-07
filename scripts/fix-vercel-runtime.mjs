import fs from 'fs';
import path from 'path';

function fixVcConfigs(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      fixVcConfigs(fullPath);
    } else if (entry.name === '.vc-config.json') {
      try {
        const raw = fs.readFileSync(fullPath, 'utf-8');
        const config = JSON.parse(raw);
        // If runtime is nodejs18.x or any outdated version, update to nodejs26.x (or nodejs24.x)
        if (config.runtime && config.runtime.startsWith('nodejs')) {
          console.log(`[fix-vercel-runtime] Updating ${fullPath} from ${config.runtime} to nodejs26.x`);
          config.runtime = 'nodejs26.x';
          fs.writeFileSync(fullPath, JSON.stringify(config, null, 2), 'utf-8');
        }
      } catch (err) {
        console.error(`[fix-vercel-runtime] Failed to update ${fullPath}:`, err);
      }
    }
  }
}

const vercelOutputDir = path.resolve('.vercel/output');
if (fs.existsSync(vercelOutputDir)) {
  fixVcConfigs(vercelOutputDir);
  console.log('[fix-vercel-runtime] Successfully verified and updated Vercel function runtimes.');
} else {
  console.log('[fix-vercel-runtime] .vercel/output directory not found, skipping.');
}
