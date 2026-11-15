// Post covers and other repo-root assets live in /assets/images/posts so that
// Grove's release flow (which writes there) keeps working unchanged. This
// integration serves them in dev and copies them into the build output at the
// same URLs.
import { cpSync, existsSync, createReadStream, statSync } from 'node:fs';
import { join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const URL_PREFIX = '/assets/images/posts/';

export default function copyPostCovers() {
  let root;
  return {
    name: 'copy-post-covers',
    hooks: {
      'astro:config:setup': ({ config }) => {
        root = fileURLToPath(config.root);
      },
      'astro:server:setup': ({ server }) => {
        server.middlewares.use((req, res, next) => {
          const url = (req.url ?? '').split('?')[0];
          if (!url.startsWith(URL_PREFIX)) return next();
          const file = normalize(join(root, decodeURIComponent(url)));
          if (!file.startsWith(join(root, URL_PREFIX)) || !existsSync(file) || !statSync(file).isFile()) {
            return next();
          }
          res.setHeader('Content-Type', 'image/png');
          createReadStream(file).pipe(res);
        });
      },
      'astro:build:done': ({ dir }) => {
        const out = fileURLToPath(dir);
        cpSync(join(root, 'assets/images/posts'), join(out, 'assets/images/posts'), { recursive: true });
      },
    },
  };
}
