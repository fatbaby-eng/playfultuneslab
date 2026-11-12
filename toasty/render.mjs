import puppeteer from 'puppeteer-core';
import { spawn } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const root = path.dirname(fileURLToPath(import.meta.url));
const chrome = process.env.CHROME || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const master = path.join(root, 'audio', 'Toast8.m4a');
const lyricsAudio = path.join(root, 'audio', 'toast8-lyrics.m4a');
const mixAudio = path.join(root, 'audio', 'happy-hum-mix.m4a');
const out = path.join(root, '..', 'assets', 'toasty_happy_hum.mp4');
const test = process.argv.includes('--test');
const FPS = 24;
const DURATION = 170.365333;

const testTimes = [0.8, 12.0, 36.3, 68.3, 80.35, 98.05, 131.7, 167.3];

const url = pathToFileURL(path.join(root, 'index.html')).href + '?render=1';
let browser;
let page;

async function launch() {
  if (browser) {
    try { await browser.close(); } catch { /* already gone */ }
  }
  browser = await puppeteer.launch({
    executablePath: chrome,
    headless: true,
    args: ['--allow-file-access-from-files', '--disable-web-security', '--font-render-hinting=none', '--hide-scrollbars', '--mute-audio']
  });
  page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
  page.on('pageerror', err => console.error('PAGE', err));
  await page.goto(url, { waitUntil: 'load' });
  await page.evaluate(async () => {
    await document.fonts.ready;
    await document.fonts.load('92px Shrikhand');
    await document.fonts.load('200px "Luckiest Guy"');
  });
}

async function grab(t) {
  let last;
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const err = await page.evaluate(time => window.renderAt(time), t);
      if (err) throw new Error(err);
      const b64 = await page.evaluate(() => document.getElementById('c').toDataURL('image/jpeg', 0.86).split(',')[1]);
      return Buffer.from(b64, 'base64');
    } catch (e) {
      last = e;
      console.error('relaunch', attempt, e.message);
      await launch();
    }
  }
  throw last;
}

await launch();

if (process.argv.includes('--bench')) {
  const n = 12;
  const t1 = Date.now();
  for (let i = 0; i < n; i++) await grab(10 + i * 3);
  console.log('ms/frame', Math.round((Date.now() - t1) / n));
  await browser.close();
  process.exit(0);
}

if (test) {
  const dir = path.join(root, 'frames');
  fs.mkdirSync(dir, { recursive: true });
  for (const t of testTimes) {
    const buf = await grab(t);
    const name = path.join(dir, `t${t.toFixed(2).replace('.', '_')}.jpg`);
    fs.writeFileSync(name, buf);
    console.log('wrote', name, buf.length);
  }
  await browser.close();
  process.exit(0);
}

function sourceTime(editT, keeps) {
  let acc = 0;
  const t = Math.max(0, editT);
  for (const [a, b] of keeps) {
    const len = b - a;
    if (t <= acc + len) return a + (t - acc);
    acc += len;
  }
  return keeps[keeps.length - 1][1];
}

function buildLyrics(keeps) {
  const chains = keeps.map((k, i) => {
    const len = k[1] - k[0];
    const fade = 0.012;
    return `[0:a]atrim=start=${k[0]}:end=${k[1]},asetpts=PTS-STARTPTS,afade=t=in:st=0:d=${fade},afade=t=out:st=${(len - fade).toFixed(3)}:d=${fade}[a${i}]`;
  }).join(';');
  const mix = keeps.map((_, i) => `[a${i}]`).join('') + `concat=n=${keeps.length}:v=0:a=1[out]`;
  return new Promise((resolve, reject) => {
    const ff = spawn('ffmpeg', [
      '-y', '-loglevel', 'error', '-i', master,
      '-filter_complex', chains + ';' + mix,
      '-map', '[out]', '-c:a', 'aac', '-b:a', '192k', lyricsAudio
    ], { stdio: 'inherit' });
    ff.on('close', code => code === 0 ? resolve(lyricsAudio) : reject(new Error('lyrics ffmpeg ' + code)));
  });
}

const keeps = await page.evaluate(() => ToastyFilm.keeps);
const duration = await page.evaluate(() => ToastyFilm.DURATION);
await buildLyrics(keeps);
console.log('lyrics', duration.toFixed(3), 's', keeps.map(k => k.join('-')).join(' '));

const filmDir = path.join(root, 'frames', 'film');
fs.mkdirSync(filmDir, { recursive: true });
fs.mkdirSync(path.dirname(out), { recursive: true });
const frames = Math.round(duration * FPS);
const t0 = Date.now();
let fresh = 0;
for (let i = 0; i < frames; i++) {
  const dest = path.join(filmDir, String(i).padStart(5, '0') + '.jpg');
  let size = 0;
  try { size = fs.statSync(dest).size; } catch { size = 0; }
  if (size < 8000) {
    const buf = await grab(sourceTime(i / FPS, keeps));
    fs.writeFileSync(dest, buf);
    fresh++;
  }
  if (i % 120 === 0) {
    const sec = (Date.now() - t0) / 1000;
    console.log(`frame ${i}/${frames}  fresh ${fresh}  ${sec.toFixed(1)}s`);
  }
}
await browser.close();
await new Promise((resolve, reject) => {
  const py = spawn('py', ['-3', path.join(root, 'bed.py')], { stdio: 'inherit' });
  py.on('close', code => code === 0 ? resolve() : reject(new Error('bed ' + code)));
});
await new Promise((resolve, reject) => {
  const ff = spawn('ffmpeg', [
    '-y', '-loglevel', 'error',
    '-framerate', String(FPS), '-i', path.join(filmDir, '%05d.jpg'),
    '-i', mixAudio,
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '22', '-preset', 'veryfast', '-tune', 'animation',
    '-c:a', 'aac', '-b:a', '192k',
    '-shortest', '-movflags', '+faststart',
    out
  ], { stdio: 'inherit' });
  ff.on('close', code => code === 0 ? resolve() : reject(new Error('ffmpeg ' + code)));
});
console.log('done', out, fs.statSync(out).size);
