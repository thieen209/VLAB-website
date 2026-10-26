const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const pages = fs.readdirSync(root).filter(file => file.endsWith('.html'));

test('all pages retain working local links, images and bilingual download controls', () => {
  for (const page of pages) {
    const html = fs.readFileSync(path.join(root, page), 'utf8');
    assert.doesNotMatch(html, /Tải Android|Get Android/, page);
    assert.match(html, /data-vi="Tải VLAB" data-en="Get VLAB"/, page);
    assert.match(html, /class="text-link motion-toggle"/, page);
    const urls = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map(match => match[1]);
    for (const [, value] of html.matchAll(/srcset="([^"]+)"/g)) urls.push(...value.split(',').map(entry => entry.trim().split(/\s+/)[0]));
    for (const url of urls) {
      if (/^(?:https?:|mailto:|tel:|data:)/.test(url)) continue;
      const [file, fragment] = url.split('#');
      const target = path.join(root, file.split('?')[0] || page);
      assert.ok(fs.existsSync(target), `${page}: missing ${url}`);
      if (fragment && target.endsWith('.html')) {
        assert.ok(fs.readFileSync(target, 'utf8').includes(`id="${fragment}"`), `${page}: missing anchor ${url}`);
      }
    }
  }
});

test('download points to the named APK and identifies its test-build requirements', () => {
  const html = fs.readFileSync(path.join(root, 'download.html'), 'utf8');
  const [, tag, filename] = html.match(/https:\/\/github.com\/thieen209\/VLAB\/releases\/download\/([^/]+)\/(VLAB-[^"]+\.apk)/);
  const version = filename.match(/^VLAB-([\d.]+)-/)[1];
  assert.equal(tag, `v${filename.slice(5, -4)}`);
  assert.ok(html.includes(`VLAB ${version}</h2>`));
  assert.match(html, /Android 8\.0\+/);
  assert.match(html, /data-en="TEST BUILD"/);
  assert.match(html, /<code>[A-F0-9]{64}<\/code>/);
  assert.doesNotMatch(html, /drive.google.com\/drive\/folders/);
});

test('motion and theme initialize from preferences, including unavailable storage', () => {
  const script = fs.readFileSync(path.join(root, 'assets/scripts/theme.js'), 'utf8');
  for (const reduced of [false, true]) {
    for (const motion of [null, 'on', 'off', 'invalid', 'blocked']) {
      const dataset = {};
      vm.runInNewContext(script, {
        document: { documentElement: { dataset } },
        localStorage: { getItem(key) { if (motion === 'blocked') throw Error('blocked'); return key === 'vlab-motion' ? motion : 'dark'; } },
        matchMedia: query => ({ matches: query.includes('reduced-motion') ? reduced : false })
      });
      assert.equal(dataset.motion, ['on', 'off'].includes(motion) ? motion : reduced ? 'off' : 'on');
      assert.equal(dataset.theme, motion === 'blocked' ? 'light' : 'dark');
    }
  }
});
