/* Kitchen Pop film for Toasty the Toaster's Happy Hum.
   Picture is timed to Toast8. The played vocal keeps the sung lines only:
   the breakfast aside, "I've got Toasty. First two.", the "one more time"
   false start, and "Toast. One more outro." are cut. sourceTime() maps the
   edited clock back onto the master take. The track under the picture is
   that vocal plus the accompaniment from bed.py. */
(function () {
  const INK = '#141414';
  const CREAM = '#FFF7EA';
  const PALETTE = ['#FF4FA3', '#FFE23A', '#B6FF3A', '#3AE8FF', '#FF9A2E', '#C79BFF'];
  const W = 1664, H = 928, VW = 1920, VH = 1080;

  const clamp = u => Math.max(0, Math.min(1, u));
  const smooth = u => { u = clamp(u); return u * u * (3 - 2 * u); };
  const easeOut = u => 1 - Math.pow(1 - clamp(u), 3);
  const popIn = u => { u = clamp(u); const c = 1.9; return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2); };
  const squash = (t, t0, amp, dur = 0.34) => (t >= t0 && t <= t0 + dur) ? amp * Math.sin(Math.PI * (t - t0) / dur) : 0;
  const shake = (t, t0, a) => t >= t0 ? a * Math.exp(-(t - t0) * 13) * Math.cos((t - t0) * 55) : 0;
  const hex = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  function mix(a, b, u) {
    const pa = hex(a), pb = hex(b);
    u = clamp(u);
    return `rgb(${pa.map((v, i) => Math.round(v + (pb[i] - v) * u)).join(',')})`;
  }
  function hop(t, t0, dur, x0, y0, x1, y1, h) {
    const u = clamp((t - t0) / dur);
    return { x: x0 + (x1 - x0) * smooth(u), y: y0 + (y1 - y0) * smooth(u) - h * Math.sin(Math.PI * u), u };
  }
  function hopY(t, t0, dur, y0, y1, h) {
    const u = clamp((t - t0) / dur);
    return y0 + (y1 - y0) * smooth(u) - h * Math.sin(Math.PI * u);
  }

  const PULSE = [5.10,6.12,7.70,8.96,10.22,10.98,11.82,13.24,15.24,16.20,18.52,19.36,20.70,21.56,23.68,25.32,26.70,27.38,28.96,32.20,34.20,35.40,35.94,36.22,37.22,39.22,40.90,41.30,41.48,43.00,44.68,46.32,48.58,50.80,52.74,53.58,55.32,57.36,59.54,61.54,62.48,63.94,64.30,65.20,65.50,66.24,67.48,67.92,69.56,70.74,71.82,72.28,73.54,74.34,75.26,76.72,78.64,80.10,84.32,85.16,87.48,89.48,90.66,92.02,93.22,94.06,95.06,97.70,102.34,105.18,107.82,109.10,110.64,111.18,111.90,113.20,115.10,116.96,117.34,118.00,119.76,121.38,123.04,125.60,127.94,129.78,131.34,132.22,133.80,134.90,136.94,139.66,143.56,145.12,146.68,148.30,149.96,153.16,156.48,159.02,161.32,163.50,165.70,166.86];
  const BIG = [11.82,21.56,40.90,41.30,41.48,67.92,69.56,71.82,72.28,76.72,80.10,97.70,116.96,117.34,118.00,130.10,145.44,163.50,166.86];
  const SHAKES = [[11.82,12],[21.56,6],[40.90,6],[41.30,6],[41.48,6],[67.92,8],[69.56,6],[71.82,6],[76.72,8],[80.10,12],[97.70,12],[116.96,6],[117.34,6],[118.00,6],[130.10,8],[145.44,8],[163.50,12],[166.86,12]];

  const CAM = [
    {t:0, z:1, x:832, y:464},
    {t:9.4, z:1, x:832, y:464},
    {t:11.5, z:1.72, x:530, y:430},
    {t:20.0, z:1.42, x:660, y:450},
    {t:33.0, z:1.68, x:530, y:430},
    {t:49.0, z:1.28, x:740, y:455},
    {t:66.3, z:1.72, x:545, y:425},
    {t:79.4, z:1.95, x:530, y:400},
    {t:82.7, z:1.52, x:530, y:440},
    {t:96.3, z:1.88, x:520, y:395},
    {t:101.6, z:1.32, x:700, y:455},
    {t:126.5, z:1.58, x:780, y:470},
    {t:138.6, z:1.12, x:820, y:460},
    {t:162.7, z:1.48, x:580, y:440},
    {t:166.4, z:1.18, x:760, y:450},
    {t:172, z:1.18, x:760, y:450}
  ];

  const SHOUTS = [
    {t:11.82, text:'KA-CHUNK', color:'#3AE8FF'},
    {t:67.92, text:'CRUNCH', color:'#FF9A2E'},
    {t:69.56, text:'CRUNCH', color:'#FFE23A'},
    {t:71.82, text:'MUNCH', color:'#FF4FA3'},
    {t:76.72, text:'NO!', color:'#E8372C'},
    {t:80.10, text:'SPLAT', color:'#E02445'},
    {t:97.70, text:'POP!', color:'#3AE8FF'},
    {t:130.10, text:'GOT IT!', color:'#B6FF3A'},
    {t:145.44, text:'GOT IT!', color:'#FFE23A'},
    {t:163.50, text:'DING!', color:'#FFE23A'},
    {t:166.86, text:'YUM!', color:'#FF4FA3'}
  ];

  function L(c, words) { return {c, w: words}; }
  const LY = [
    L('#3AE8FF', [[5.10,5.94,'All'],[5.94,6.12,'right,'],[6.12,6.52,'everybody.']]),
    L('#3AE8FF', [[7.00,7.34,"Let's"],[7.34,7.46,'make'],[7.46,7.70,'some'],[7.70,8.20,'breakfast.']]),
    L('#3AE8FF', [[8.70,8.80,'Are'],[8.80,8.96,'you'],[8.96,9.30,'ready?']]),
    L('#3AE8FF', [[10.22,10.50,'One,'],[10.98,11.40,'two,']]),
    L('#FFE23A', [[13.24,13.86,'Silver'],[13.86,14.36,'and'],[14.36,14.90,'shiny,']]),
    L('#FFE23A', [[15.24,15.66,'sitting'],[15.66,16.02,'on'],[16.02,16.20,'the'],[16.20,17.10,'countertop.']]),
    L('#FFE23A', [[18.00,18.32,'Got'],[18.32,18.52,'a'],[18.52,18.88,'happy'],[18.88,19.36,'little'],[19.36,20.05,'slot,']]),
    L('#FFE23A', [[20.70,21.02,'ready'],[21.02,21.56,'to'],[21.56,21.95,'pop.']]),
    L('#FFE23A', [[22.96,23.28,"It's"],[23.28,23.68,'getting'],[23.68,24.22,'warm.']]),
    L('#FFE23A', [[24.22,24.94,"It's"],[24.94,25.32,'getting'],[25.32,25.96,'hot.']]),
    L('#FFE23A', [[26.70,26.88,'Warming'],[26.88,27.18,'up'],[27.18,27.38,'the'],[27.38,27.90,'bread.']]),
    L('#FFE23A', [[28.40,28.54,'Nice'],[28.54,28.96,'and'],[28.96,29.74,'toasty.']]),
    L('#FF4FA3', [[30.84,31.54,'Oh,'],[32.20,32.84,"Toasty's"],[32.84,33.18,'got'],[33.18,33.74,'the'],[33.74,34.20,'happy'],[34.20,34.70,'hum.']]),
    L('#FF4FA3', [[35.40,35.70,'Hum,'],[35.94,36.15,'hum,'],[36.22,36.60,'hum.']]),
    L('#FF4FA3', [[37.22,37.42,'Wiggle'],[37.42,37.72,'your'],[37.72,38.50,'fingers.']]),
    L('#FF4FA3', [[39.22,39.24,'Tap'],[39.24,39.60,'your'],[39.60,40.10,'thumb.']]),
    L('#FF4FA3', [[40.90,41.10,'Tap,'],[41.30,41.48,'tap,'],[41.48,41.90,'tap.']]),
    L('#FF4FA3', [[42.60,43.00,"It's"],[43.00,43.42,'shaking'],[43.42,44.10,'up.']]),
    L('#FF4FA3', [[44.54,44.68,"It's"],[44.68,45.06,'shaking'],[45.06,45.80,'down.']]),
    L('#FF4FA3', [[46.16,46.32,'The'],[46.32,46.94,'grooviest'],[46.94,47.55,'toaster']]),
    L('#FF4FA3', [[47.48,48.18,'in'],[48.18,48.42,'the'],[48.42,48.58,'whole'],[48.58,49.80,'town.']]),
    L('#FF9A2E', [[50.80,51.24,'Toasty'],[51.24,52.08,"doesn't"],[52.08,52.42,'just'],[52.42,52.74,'toast'],[52.74,53.20,'bread.']]),
    L('#FF9A2E', [[53.40,53.54,'Oh,'],[53.58,54.15,'no.']]),
    L('#FF9A2E', [[54.60,54.94,"I've"],[54.94,55.32,'got'],[55.32,56.36,'Toasty.'],[57.36,57.76,'First'],[57.76,58.30,'two.']]),
    L('#FF9A2E', [[59.54,60.06,'Toasty'],[60.06,60.94,"doesn't"],[60.94,61.20,'just'],[61.20,61.54,'toast'],[61.54,62.05,'bread.']]),
    L('#FF9A2E', [[62.16,62.46,'Oh,'],[62.48,63.05,'no.']]),
    L('#FF9A2E', [[63.54,63.76,'Got'],[63.76,63.94,'a'],[63.94,64.30,'funky'],[64.30,64.80,'rhythm']]),
    L('#FF9A2E', [[64.76,65.04,'and'],[65.04,65.20,'a'],[65.20,65.50,'silly'],[65.50,66.30,'flow.']]),
    L('#FF9A2E', [[66.98,67.28,'Toasted'],[67.28,67.48,'a'],[67.48,68.05,'waffle.']]),
    L('#FF9A2E', [[67.92,68.40,'Crunch,'],[69.56,70.05,'crunch.']]),
    L('#FF9A2E', [[70.24,70.54,'Toasted'],[70.54,70.74,'a'],[70.74,71.50,'bagel.']]),
    L('#FF9A2E', [[71.82,72.15,'Munch,'],[72.28,72.75,'munch.']]),
    L('#FF9A2E', [[73.32,73.40,'Tried'],[73.40,73.54,'to'],[73.54,73.86,'toast'],[73.86,74.00,'a'],[74.00,74.34,'jelly'],[74.34,74.85,'bean.']]),
    L('#FF9A2E', [[75.26,75.85,'Wait.']]),
    L('#FF9A2E', [[76.72,77.40,'No.']]),
    L('#FF9A2E', [[78.12,78.50,"That's"],[78.50,78.64,'a'],[78.64,78.90,'sticky'],[78.90,79.55,'mess.']]),
    L('#C79BFF', [[82.76,83.34,'Now'],[83.34,83.94,'the'],[83.94,84.32,'light'],[84.32,84.62,'is'],[84.62,85.16,'glowing'],[85.16,85.85,'red.']]),
    L('#C79BFF', [[86.38,87.18,"It's"],[87.18,87.48,'getting'],[87.48,88.15,'hot.']]),
    L('#C79BFF', [[88.74,88.80,'The'],[88.80,89.08,'coils'],[89.08,89.48,'are'],[89.48,90.08,'glowing'],[90.08,90.75,'orange.']]),
    L('#C79BFF', [[90.66,91.62,"Don't"],[91.62,91.78,'touch'],[91.78,92.02,'the'],[92.02,92.50,'top.']]),
    L('#C79BFF', [[93.08,93.22,"It's"],[93.22,93.75,'shaking.']]),
    L('#C79BFF', [[93.94,94.06,"It's"],[94.06,94.60,'shivering.']]),
    L('#C79BFF', [[94.88,95.06,"It's"],[95.06,95.38,'ready'],[95.38,96.90,'to'],[96.90,97.90,'pop.']]),
    L('#B6FF3A', [[102.34,102.58,'Oh,'],[102.98,103.42,"Toasty's"],[103.42,103.62,'got'],[103.62,103.82,'a'],[103.82,104.40,'happy.']]),
    L('#B6FF3A', [[105.18,105.74,'One'],[105.74,105.90,'more'],[105.90,106.40,'time.']]),
    L('#B6FF3A', [[107.30,107.50,'Oh,'],[107.82,108.22,"Toasty's"],[108.22,108.40,'got'],[108.40,108.62,'the'],[108.62,109.10,'happy'],[109.10,109.65,'hum.']]),
    L('#B6FF3A', [[110.64,110.95,'Hum,'],[111.18,111.45,'hum,'],[111.90,112.35,'hum.']]),
    L('#B6FF3A', [[113.20,113.66,'Wiggle'],[113.66,113.88,'your'],[113.88,114.70,'fingers.']]),
    L('#B6FF3A', [[115.10,115.18,'Tap'],[115.18,115.54,'your'],[115.54,116.10,'thumb.']]),
    L('#B6FF3A', [[116.96,117.20,'Tap,'],[117.34,117.68,'tap,'],[118.00,118.55,'tap.']]),
    L('#B6FF3A', [[119.30,119.76,"It's"],[119.76,120.20,'shaking'],[120.20,120.90,'up.']]),
    L('#B6FF3A', [[121.24,121.38,"It's"],[121.38,121.78,'shaking'],[121.78,122.55,'down.']]),
    L('#B6FF3A', [[122.88,123.04,'The'],[123.04,123.96,'grooviest'],[123.96,124.90,'toaster']]),
    L('#B6FF3A', [[124.86,125.22,'in'],[125.22,125.46,'the'],[125.46,125.60,'whole'],[125.60,126.15,'town.']]),
    L('#FF4FA3', [[127.94,128.52,'Catch'],[128.52,128.90,'the'],[128.90,129.50,'toast.']]),
    L('#FF4FA3', [[129.78,130.10,'Got'],[130.10,130.70,'it.']]),
    L('#FF4FA3', [[131.34,131.52,'Butter'],[131.52,131.88,'it'],[131.88,132.30,'up.']]),
    L('#FF4FA3', [[132.22,133.05,'Slip,'],[133.80,134.15,'slide.']]),
    L('#FF4FA3', [[134.90,135.28,'Toasty'],[135.28,135.56,'the'],[135.56,136.10,'toaster']]),
    L('#FF4FA3', [[135.98,136.22,'is'],[136.22,136.42,'the'],[136.42,136.94,'coolest'],[136.94,137.38,'friend'],[137.38,138.15,'around.']]),
    L('#FF4FA3', [[139.66,140.54,'Toast.'],[141.38,142.26,'One'],[142.26,142.42,'more'],[142.42,143.00,'outro.']]),
    L('#FF4FA3', [[143.56,143.94,'Catch'],[143.94,144.30,'the'],[144.30,144.90,'toast.']]),
    L('#FF4FA3', [[145.12,145.44,'Got'],[145.44,146.05,'it.']]),
    L('#FF4FA3', [[146.68,146.90,'Butter'],[146.90,147.26,'it'],[147.26,147.70,'up.']]),
    L('#FF4FA3', [[148.30,148.55,'Slip,'],[149.04,149.45,'slide.']]),
    L('#FF4FA3', [[149.96,150.32,'Toasty'],[150.32,150.56,'the'],[150.56,151.10,'toaster']]),
    L('#FF4FA3', [[150.96,151.28,'is'],[151.28,151.46,'the'],[151.46,151.94,'coolest'],[151.94,152.55,'friend.']]),
    L('#FF4FA3', [[153.16,154.02,'Toasty'],[154.02,154.34,'the'],[154.34,154.90,'toaster']]),
    L('#FF4FA3', [[154.78,155.42,'is'],[155.42,155.64,'the'],[155.64,156.08,'coolest'],[156.08,156.48,'friend'],[156.48,157.15,'around.']]),
    L('#FF4FA3', [[159.02,159.82,'Toasty'],[159.82,160.10,'the'],[160.10,160.60,'toaster']]),
    L('#FF4FA3', [[160.50,160.74,'is'],[160.74,160.94,'the'],[160.94,161.32,'coolest'],[161.32,161.64,'friend'],[161.64,162.45,'around.']])
  ];

  function pulseAmt(t) {
    let s = 0;
    for (let i = 0; i < PULSE.length; i++) s += squash(t, PULSE[i], 0.045, 0.30);
    for (let i = 0; i < BIG.length; i++) s += squash(t, BIG[i], 0.075, 0.36);
    return Math.min(0.16, s);
  }
  function wiggle(t) {
    const spans = [53.58, 62.48, 76.72];
    let r = 0;
    for (let i = 0; i < spans.length; i++) {
      const u = t - spans[i];
      if (u >= 0 && u <= 1) r += 17 * Math.PI / 180 * Math.sin(2 * Math.PI * 2.6 * u);
    }
    return r;
  }
  function shakeBody(t) {
    let y = 0;
    if (t >= 43 && t <= 43.98) y -= 64 * Math.sin(Math.PI * (t - 43) / 0.98);
    if (t >= 44.68 && t <= 45.68) y += 48 * Math.sin(Math.PI * (t - 44.68));
    if (t >= 119.76 && t <= 120.80) y -= 64 * Math.sin(Math.PI * (t - 119.76) / 1.04);
    if (t >= 121.38 && t <= 122.42) y += 48 * Math.sin(Math.PI * (t - 121.38) / 1.04);
    if (t >= 93.08 && t < 97.70) {
      const u = (t - 93.08) / (97.70 - 93.08);
      y += (4 + 16 * u) * Math.sin(u * 46);
    }
    return y;
  }
  function danceX(t) {
    const hops = [63.94, 64.30, 65.20, 65.50];
    let x = 0;
    for (let i = 0; i < hops.length; i++) {
      const u = t - hops[i];
      if (u >= 0 && u <= 0.36) x += (i % 2 ? 34 : -34) * Math.sin(Math.PI * u / 0.36);
    }
    return x;
  }
  function brownAt(t) {
    if (t < 23.68) return 0;
    if (t < 29.74) return smooth((t - 23.68) / (29.74 - 23.68));
    return 1;
  }
  function moodAt(t) {
    if (t >= 166.86) return 'yum';
    if (t >= 165.55) return 'giggle';
    if (t >= 80.10 && t < 83.6) return 'sticky';
    if (t >= 76.72 && t < 80.10) return 'no';
    if (t >= 75.26 && t < 76.72) return 'wait';
    if (t >= 53.40 && t < 59.6) return 'no';
    if (t >= 62.16 && t < 63.5) return 'no';
    if ((t >= 11.82 && t < 13.15) || (t >= 97.70 && t < 101.6)) return 'wow';
    if ((t >= 35.30 && t < 37.15) || (t >= 110.50 && t < 112.7)) return 'hum';
    if (t >= 93 && t < 97.70) return 'strain';
    if (t >= 8.70 && t < 9.55) return 'ready';
    return 'smile';
  }
  function leverAmt(t) {
    const down = t0 => smooth(clamp((t - t0) / 0.18));
    const up = t0 => 1 - smooth(clamp((t - t0) / 0.16));
    if (t < 11.82) return 0;
    if (t < 21.56) return down(11.82);
    if (t < 22.20) return 1 - 0.45 * Math.sin(Math.PI * clamp((t - 21.56) / 0.64));
    if (t < 50.80) return 1;
    if (t < 53.45) return up(50.80);
    if (t < 67.15) return down(53.45);
    if (t < 70.30) return up(67.15);
    if (t < 70.50) return down(70.30);
    if (t < 73.15) return up(70.50);
    if (t < 97.70) return down(73.15);
    return up(97.70);
  }
  function heatAmt(t) {
    if (t >= 84.32 && t < 98.4) return 1;
    if (t >= 23.68 && t < 80.10) return clamp((t - 23.68) / 5);
    return 0;
  }
  function toasterXform(t) {
    const wig = wiggle(t);
    const bob = (t >= 43 && t < 46) || (t >= 119.7 && t < 122.7) || (t >= 93 && t < 98.2) ? 0 : Math.min(0, Math.sin(t * 2 * Math.PI / 2.6) * 8);
    return {
      x: 500 + danceX(t),
      y: 612 + bob + shakeBody(t),
      rot: Math.abs(wig) > 0.001 ? wig : Math.sin(t * 2 * Math.PI / 2.8) * 3 * Math.PI / 180,
      sq: pulseAmt(t)
    };
  }

  function heroPose(t, feet) {
    const brown = brownAt(t);
    if (t < 26.70) return null;
    if (t < 27.55) {
      const p = hop(t, 26.70, 0.85, 990, 578, feet.x - 50, feet.y - 40, 150);
      return {space:'world', kind:'bread', x:p.x, y:p.y, rot:p.u * 0.5, brown, butter:0};
    }
    if (t < 50.80) return {space:'local', kind:'bread', x:-50, y:-40, rot:0, brown, butter:0};
    if (t < 51.65) return {space:'local', kind:'bread', x:-50, y:hopY(t, 50.80, 0.85, -40, -185, 40), rot:0, brown, butter:0};
    if (t < 53.45) return {space:'local', kind:'bread', x:-50, y:-185, rot:0, brown, butter:0};
    if (t < 54.35) return {space:'local', kind:'bread', x:-50, y:-185 + 145 * smooth((t - 53.45) / 0.9), rot:0, brown, butter:0};
    if (t < 97.70) return {space:'local', kind:'bread', x:-50, y:-45, rot:0, brown, butter:0};
    if (t < 98.55) return {space:'local', kind:'toast', x:-50, y:hopY(t, 97.70, 0.85, -45, -230, 170), rot:0, brown:1, butter:0};
    if (t < 127.94) return {space:'local', kind:'toast', x:-50, y:-230, rot:Math.sin(t * 5) * 0.04, brown:1, butter:0};
    if (t < 129.15) {
      const p = hop(t, 127.94, 0.85, 450, 392, 1000, 578, 180);
      return {space:'world', kind:'toast', x:p.x, y:p.y, rot:p.u * Math.PI * 2, brown:1, butter:0};
    }
    let x = 1000, y = 578, rot = 0, butter = 0;
    if (t < 143.56) {
      butter = t >= 131.90 ? 1 : 0;
      if (t < 132.22) x = 1000;
      else if (t < 133.20) x = 1000 + 120 * smooth((t - 132.22) / 0.98);
      else if (t < 133.80) x = 1120;
      else if (t < 134.75) x = 1120 + 110 * smooth((t - 133.80) / 0.95);
      else x = 1230;
    } else if (t < 144.95) {
      const p = hop(t, 143.56, 0.85, 1230, 578, 1000, 578, 190);
      return {space:'world', kind:'toast', x:p.x, y:p.y, rot:p.u * Math.PI * 2, brown:1, butter:1};
    } else {
      butter = 1;
      if (t < 148.30) x = 1000;
      else if (t < 149.20) x = 1000 + 130 * smooth((t - 148.30) / 0.9);
      else if (t < 150.05) x = 1130 - 60 * smooth((t - 149.20) / 0.85);
      else x = 1070;
    }
    return {space:'world', kind:'toast', x, y, rot, brown:1, butter};
  }

  function sidePose(t, feet) {
    const brown = brownAt(t);
    if (t < 26.70) return null;
    if (t < 27.55) {
      const p = hop(t, 26.70, 0.85, 1100, 590, feet.x + 48, feet.y - 40, 120);
      return {space:'world', kind:'bread', x:p.x, y:p.y, rot:-p.u * 0.4, brown, butter:0};
    }
    let y = -42;
    if (t >= 50.80 && t < 51.65) y = hopY(t, 50.80, 0.85, -42, -150, 24);
    else if (t >= 51.65 && t < 53.45) y = -150;
    else if (t >= 53.45 && t < 54.35) y = -150 + 108 * smooth((t - 53.45) / 0.9);
    else if (t >= 97.70 && t < 98.55) return {space:'local', kind:'toast', x:48, y:hopY(t, 97.70, 0.85, -42, -215, 150), rot:0, brown:1, butter:0};
    else if (t >= 98.55) return {space:'local', kind:'toast', x:48, y:-215, rot:0, brown:1, butter:0};
    return {space:'local', kind:'bread', x:48, y, rot:0, brown, butter:0};
  }

  function wafflePose(t, feet) {
    if (t < 67.15) return null;
    if (t < 67.95) return {space:'local', kind:'waffle', x:-50, y:hopY(t, 67.15, 0.8, -40, -235, 100), rot:0};
    if (t < 70.20) return {space:'local', kind:'waffle', x:-50, y:-235, rot:Math.sin(t * 6) * 0.05};
    if (t < 71.00) {
      const p = hop(t, 70.20, 0.8, feet.x - 50, feet.y - 235, 860, 582, 140);
      return {space:'world', kind:'waffle', x:p.x, y:p.y, rot:p.u * 0.8};
    }
    return {space:'world', kind:'waffle', x:860, y:582, rot:0};
  }
  function bagelPose(t, feet) {
    if (t < 70.45) return null;
    if (t < 71.25) return {space:'local', kind:'bagel', x:-8, y:hopY(t, 70.45, 0.8, -30, -230, 90), rot:0};
    if (t < 73.20) return {space:'local', kind:'bagel', x:-8, y:-230, rot:0};
    if (t < 74.00) {
      const p = hop(t, 73.20, 0.8, feet.x - 8, feet.y - 230, 1140, 586, 130);
      return {space:'world', kind:'bagel', x:p.x, y:p.y, rot:-p.u * 0.6};
    }
    return {space:'world', kind:'bagel', x:1140, y:586, rot:0};
  }
  function beanPose(t, feet) {
    if (t < 73.90 || t >= 80.10) return null;
    if (t < 74.65) {
      const u = smooth((t - 73.90) / 0.75);
      return {space:'world', kind:'bean', x:feet.x - 16, y:(feet.y - 460) + ((feet.y - 236) - (feet.y - 460)) * u, rot:u * 2};
    }
    return {space:'local', kind:'bean', x:-16, y:-236, rot:0};
  }
  function handPose(t) {
    const bands = [[37.00, 42.35, [40.90, 41.30, 41.48]], [112.85, 118.85, [116.96, 117.34, 118.00]]];
    for (let i = 0; i < bands.length; i++) {
      const a = bands[i][0], b = bands[i][1], taps = bands[i][2];
      if (t >= a && t < b) {
        const inn = popIn(clamp((t - a) / 0.28));
        const out = t > b - 0.32 ? 1 - smooth((t - (b - 0.32)) / 0.32) : 1;
        let y = 340;
        for (let k = 0; k < taps.length; k++) {
          const u = t - taps[k];
          if (u >= 0 && u <= 0.22) y += 34 * Math.sin(Math.PI * u / 0.22);
        }
        return {x: 690, y, sc: Math.max(0, inn * out), rot: -0.35};
      }
    }
    if (t >= 127.55 && t < 131.15) {
      const u = smooth(clamp((t - 127.55) / 0.7));
      return {x: 1460 + (1000 - 1460) * u, y: 300 + (500 - 300) * u, sc: popIn(clamp((t - 127.55) / 0.26)), rot: -0.5 + 0.35 * u};
    }
    if (t >= 143.15 && t < 146.15) {
      const u = smooth(clamp((t - 143.15) / 0.6));
      return {x: 1480 + (1000 - 1480) * u, y: 280 + (490 - 280) * u, sc: popIn(clamp((t - 143.15) / 0.24)), rot: -0.4 + 0.3 * u};
    }
    return null;
  }

  function camera(t) {
    let i = 0;
    while (i < CAM.length - 2 && t >= CAM[i + 1].t) i++;
    const a = CAM[i], b = CAM[i + 1];
    const u = smooth((t - a.t) / Math.max(0.001, b.t - a.t));
    return { z: a.z + (b.z - a.z) * u, x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u };
  }
  function camShake(t) {
    let x = 0, y = 0;
    for (let i = 0; i < SHAKES.length; i++) {
      const s = shake(t, SHAKES[i][0], SHAKES[i][1]);
      x += s;
      y += s * 0.62;
    }
    return [x, y];
  }

  function lwOf(s, extra) { return w => w / (s * (extra || 1)); }

  function fillStroke(ctx, fill, weight, lw) {
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.lineWidth = lw(weight);
    ctx.strokeStyle = INK;
    ctx.stroke();
  }
  function sparkle(ctx, s) {
    const q = s * 0.2;
    ctx.beginPath();
    ctx.moveTo(0, -s);
    ctx.quadraticCurveTo(q, -q, s, 0);
    ctx.quadraticCurveTo(q, q, 0, s);
    ctx.quadraticCurveTo(-q, q, -s, 0);
    ctx.quadraticCurveTo(-q, -q, 0, -s);
    ctx.closePath();
  }
  function burstPath(ctx, n, r1, r2) {
    ctx.beginPath();
    for (let i = 0; i < n * 2; i++) {
      const a = (i * Math.PI) / n - Math.PI / 2;
      const r = i % 2 ? r2 : r1;
      const x = r * Math.cos(a), y = r * Math.sin(a);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
  }
  function dome(ctx, w, h) {
    ctx.beginPath();
    ctx.moveTo(-w / 2, 0);
    ctx.lineTo(-w / 2, -h * 0.42);
    ctx.quadraticCurveTo(-w / 2, -h, -w * 0.16, -h);
    ctx.quadraticCurveTo(0, -h * 0.72, w * 0.16, -h);
    ctx.quadraticCurveTo(w / 2, -h, w / 2, -h * 0.42);
    ctx.lineTo(w / 2, 0);
    ctx.closePath();
  }
  function drawFace(ctx, x, y, mood, s, sc, look) {
    const lw = lwOf(s, sc);
    const closed = mood === 'yum' || mood === 'giggle';
    ctx.save();
    ctx.translate(x, y);
    if (mood === 'strain' || mood === 'wait' || mood === 'no') {
      ctx.beginPath();
      ctx.moveTo(-46, -28);
      ctx.quadraticCurveTo(-32, mood === 'no' ? -18 : -38, -18, -26);
      ctx.moveTo(18, -26);
      ctx.quadraticCurveTo(32, mood === 'no' ? -18 : -38, 46, -28);
      ctx.lineWidth = lw(4);
      ctx.strokeStyle = INK;
      ctx.stroke();
    }
    for (let i = 0; i < 2; i++) {
      const ex = i ? 28 : -28;
      if (closed) {
        ctx.beginPath();
        ctx.arc(ex, 0, 12, Math.PI * 0.1, Math.PI * 0.9, true);
        ctx.lineWidth = lw(4.5);
        ctx.strokeStyle = INK;
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.ellipse(ex, 0, 14, 17, 0, 0, 7);
        fillStroke(ctx, '#FFFFFF', 4, lw);
        ctx.beginPath();
        ctx.arc(ex + look * 4, 2, 6.5, 0, 7);
        ctx.fillStyle = INK;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(ex + look * 4 - 2.5, -2, 2.4, 0, 7);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
      }
    }
    ctx.beginPath();
    if (mood === 'hum' || mood === 'ready') {
      ctx.ellipse(0, 22, mood === 'ready' ? 10 : 14, mood === 'ready' ? 12 : 16, 0, 0, 7);
      fillStroke(ctx, '#E02445', 4, lw);
    } else if (mood === 'wow' || mood === 'yum') {
      ctx.ellipse(0, 24, 16, 18, 0, 0, 7);
      fillStroke(ctx, '#7A1024', 4, lw);
      ctx.beginPath();
      ctx.ellipse(0, 30, 10, 7, 0, 0, 7);
      ctx.fillStyle = '#FF4FA3';
      ctx.fill();
    } else if (mood === 'no' || mood === 'strain') {
      ctx.moveTo(-16, 28);
      ctx.quadraticCurveTo(0, 18, 16, 28);
      ctx.lineWidth = lw(4.5);
      ctx.strokeStyle = INK;
      ctx.stroke();
    } else if (mood === 'wait') {
      ctx.ellipse(0, 24, 8, 10, 0, 0, 7);
      fillStroke(ctx, '#E02445', 4, lw);
    } else if (mood === 'sticky') {
      ctx.moveTo(-18, 22);
      ctx.quadraticCurveTo(-8, 34, 0, 22);
      ctx.quadraticCurveTo(8, 10, 18, 24);
      ctx.lineWidth = lw(4.5);
      ctx.strokeStyle = INK;
      ctx.stroke();
    } else {
      ctx.moveTo(-20, 16);
      ctx.quadraticCurveTo(0, mood === 'giggle' ? 40 : 34, 20, 16);
      ctx.lineWidth = lw(4.5);
      ctx.strokeStyle = INK;
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawSlice(ctx, it, s) {
    const sc = it.sc || 1;
    const lw = lwOf(s, sc);
    const crust = it.kind === 'toast' ? '#A85A18' : mix('#C97B24', '#A85A18', it.brown || 0);
    const crumb = it.kind === 'toast' ? '#EFB055' : mix('#FBE6B4', '#EFB055', it.brown || 0);
    const hole = it.kind === 'toast' ? '#D48A32' : '#E9C679';
    ctx.save();
    ctx.translate(it.x, it.y);
    ctx.rotate(it.rot || 0);
    ctx.scale(sc, sc);
    dome(ctx, 108, 132);
    fillStroke(ctx, crust, 6.5, lw);
    ctx.save();
    ctx.clip();
    ctx.translate(0, -8);
    dome(ctx, 78, 96);
    ctx.fillStyle = crumb;
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(-16, -70, 7, 9, 0.2, 0, 7);
    ctx.ellipse(14, -78, 6, 8, -0.3, 0, 7);
    ctx.ellipse(6, -48, 5, 6, 0, 0, 7);
    ctx.fillStyle = hole;
    ctx.fill();
    ctx.restore();
    drawFace(ctx, 0, -78, it.kind === 'toast' ? 'smile' : 'smile', s, sc, 0);
    if (it.butter > 0) {
      const b = it.butter;
      ctx.save();
      ctx.translate(0, -108);
      ctx.scale(b, b);
      ctx.beginPath();
      ctx.roundRect(-28, -16, 56, 28, 8);
      fillStroke(ctx, '#FFE14D', 4, lw);
      ctx.beginPath();
      ctx.arc(0, -2, 8, 0.2, 2.4);
      ctx.strokeStyle = '#FFF6B0';
      ctx.lineWidth = lw(4);
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
  }
  function drawWaffle(ctx, it, s) {
    const lw = lwOf(s, 1);
    ctx.save();
    ctx.translate(it.x, it.y);
    ctx.rotate(it.rot || 0);
    ctx.beginPath();
    ctx.roundRect(-58, -110, 116, 100, 18);
    fillStroke(ctx, '#EFB055', 6.5, lw);
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(-58, -110, 116, 100, 18);
    ctx.clip();
    ctx.strokeStyle = '#C97B24';
    ctx.lineWidth = lw(4);
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(-50, -60 + i * 18);
      ctx.lineTo(50, -60 + i * 18);
      ctx.moveTo(i * 22, -100);
      ctx.lineTo(i * 22, -16);
      ctx.stroke();
    }
    ctx.restore();
    drawFace(ctx, 0, -62, 'smile', s, 1, 0);
    ctx.restore();
  }
  function drawBagel(ctx, it, s) {
    const lw = lwOf(s, 1);
    ctx.save();
    ctx.translate(it.x, it.y - 58);
    ctx.rotate(it.rot || 0);
    ctx.beginPath();
    ctx.arc(0, 0, 54, 0, 7);
    ctx.arc(0, 0, 20, 0, 7, true);
    ctx.fillStyle = '#E8C07A';
    ctx.fill('evenodd');
    ctx.beginPath();
    ctx.arc(0, 0, 54, 0, 7);
    ctx.lineWidth = lw(6.5);
    ctx.strokeStyle = INK;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, 20, 0, 7);
    ctx.stroke();
    drawFace(ctx, 0, -4, 'smile', s, 1, 0);
    ctx.restore();
  }
  function drawBean(ctx, it, s) {
    const lw = lwOf(s, 1);
    ctx.save();
    ctx.translate(it.x, it.y);
    ctx.rotate(it.rot || 0);
    ctx.beginPath();
    ctx.ellipse(0, -28, 26, 36, 0, 0, 7);
    fillStroke(ctx, '#FF4FA3', 6, lw);
    ctx.save();
    ctx.globalAlpha = 0.9;
    ctx.beginPath();
    ctx.ellipse(-8, -40, 8, 12, -0.5, 0, 7);
    ctx.fillStyle = '#FF8FA6';
    ctx.fill();
    ctx.restore();
    drawFace(ctx, 0, -30, 'smile', s, 1, 0);
    ctx.restore();
  }
  function drawItem(ctx, it, s) {
    if (!it) return;
    if (it.kind === 'waffle') drawWaffle(ctx, it, s);
    else if (it.kind === 'bagel') drawBagel(ctx, it, s);
    else if (it.kind === 'bean') drawBean(ctx, it, s);
    else drawSlice(ctx, it, s);
  }

  function drawSwirl(ctx, x, y, rot, color, s) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.beginPath();
    ctx.arc(0, 0, 118, 0.3, 5.4);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 78 / s;
    ctx.stroke();
    ctx.strokeStyle = color;
    ctx.lineWidth = 64 / s;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(16, 10, 62, 1.2, 5.6);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 40 / s;
    ctx.stroke();
    ctx.strokeStyle = color === '#FC7DC4' ? '#FF4FA3' : '#FF4FA3';
    ctx.strokeStyle = color === '#FC7DC4' ? '#FF9A2E' : '#FC7DC4';
    ctx.lineWidth = 26 / s;
    ctx.stroke();
    ctx.restore();
  }
  function drawDaisy(ctx, x, y, sc, s) {
    const lw = lwOf(s, sc);
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(sc, sc);
    ctx.strokeStyle = '#3A9A32';
    ctx.lineWidth = lw(6);
    ctx.beginPath();
    ctx.moveTo(0, 10);
    ctx.lineTo(0, 70);
    ctx.stroke();
    for (let i = 0; i < 8; i++) {
      ctx.save();
      ctx.rotate(i * Math.PI / 4);
      ctx.beginPath();
      ctx.ellipse(0, -26, 11, 18, 0, 0, 7);
      fillStroke(ctx, '#FFFFFF', 3.5, lw);
      ctx.restore();
    }
    ctx.beginPath();
    ctx.arc(0, 0, 14, 0, 7);
    fillStroke(ctx, '#FFE23A', 3.5, lw);
    ctx.restore();
  }
  function drawKitchen(ctx, t, s) {
    const lw = lwOf(s, 1);
    const propSq = 1 + pulseAmt(t) * 0.35;
    ctx.fillStyle = '#BEDA25';
    ctx.fillRect(-40, -40, W + 80, H + 80);
    drawSwirl(ctx, 170, 190, t * 0.05, '#FC7DC4', s);
    drawSwirl(ctx, 250, 80, 1.2, '#FF9A2E', s);
    drawSwirl(ctx, 1480, 160, -0.4 + t * 0.04, '#FF9A2E', s);
    drawSwirl(ctx, 1560, 300, 2.2, '#FC7DC4', s);

    const wx = 392, wy = 28, ww = 860, wh = 348;
    ctx.save();
    ctx.beginPath();
    ctx.rect(wx + 16, wy + 16, ww - 32, wh - 32);
    ctx.clip();
    ctx.fillStyle = '#FDE415';
    ctx.fillRect(wx, wy, ww, wh);
    ctx.save();
    ctx.translate(620, 150);
    ctx.rotate(t * 0.15);
    for (let i = 0; i < 14; i++) {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, 150, i * Math.PI / 7, (i + 0.5) * Math.PI / 7);
      ctx.closePath();
      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ctx.fill();
    }
    ctx.restore();
    ctx.beginPath();
    ctx.arc(620, 150, 48, 0, 7);
    fillStroke(ctx, '#FFE23A', 6, lw);
    drawFace(ctx, 620, 142, 'smile', s, 1, 0);
    ctx.beginPath();
    ctx.arc(980, 250, 150, Math.PI * 1.05, Math.PI * 1.95);
    ctx.lineWidth = 18 / s;
    const bands = ['#E02445', '#FF9A2E', '#FFE23A', '#B6FF3A', '#3AE8FF'];
    for (let i = 0; i < bands.length; i++) {
      ctx.beginPath();
      ctx.arc(980, 260, 150 - i * 16, Math.PI * 1.08, Math.PI * 1.92);
      ctx.strokeStyle = bands[i];
      ctx.stroke();
    }
    function cloud(x, y, sc) {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(sc, sc);
      ctx.beginPath();
      ctx.ellipse(0, 0, 46, 26, 0, 0, 7);
      ctx.ellipse(-28, 8, 28, 18, 0, 0, 7);
      ctx.ellipse(30, 10, 26, 16, 0, 0, 7);
      fillStroke(ctx, '#FFFFFF', 5, lw);
      ctx.beginPath();
      ctx.arc(-10, -2, 3, 0, 7);
      ctx.arc(12, -2, 3, 0, 7);
      ctx.fillStyle = INK;
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-8, 10);
      ctx.quadraticCurveTo(2, 18, 14, 10);
      ctx.lineWidth = lw(3.5);
      ctx.strokeStyle = INK;
      ctx.stroke();
      ctx.restore();
    }
    cloud(800, 120, 1);
    cloud(1040, 90, 0.8);
    drawDaisy(ctx, 500, 250, 0.7, s);
    drawDaisy(ctx, 700, 270, 0.85, s);
    ctx.restore();
    ctx.beginPath();
    ctx.roundRect(wx, wy, ww, wh, 8);
    ctx.lineWidth = lw(8);
    ctx.strokeStyle = '#FFF7EA';
    ctx.stroke();
    ctx.lineWidth = lw(6);
    ctx.strokeStyle = INK;
    ctx.stroke();

    ctx.fillStyle = '#FDE415';
    ctx.fillRect(0, 390, W, 222);
    ctx.strokeStyle = INK;
    ctx.lineWidth = lw(3.5);
    ctx.beginPath();
    for (let x = 0; x <= W; x += 92) { ctx.moveTo(x, 390); ctx.lineTo(x, 612); }
    for (let y = 390; y <= 612; y += 56) { ctx.moveTo(0, y); ctx.lineTo(W, y); }
    ctx.stroke();

    ctx.fillStyle = '#B0C61B';
    ctx.fillRect(0, 676, W, 280);
    ctx.strokeStyle = INK;
    ctx.lineWidth = lw(6);
    for (let i = 0; i < 4; i++) {
      const x = 30 + i * 400;
      ctx.beginPath();
      ctx.roundRect(x, 700, 360, 200, 10);
      ctx.fillStyle = i % 2 ? '#A6BE18' : '#B7CE20';
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x + 180, 800, 10, 0, 7);
      ctx.fillStyle = INK;
      ctx.fill();
    }

    ctx.fillStyle = '#FBF4EA';
    ctx.fillRect(0, 600, W, 76);
    ctx.fillStyle = '#E7D3B0';
    ctx.fillRect(0, 652, W, 28);
    ctx.beginPath();
    ctx.moveTo(0, 600);
    ctx.lineTo(W, 600);
    ctx.lineWidth = lw(7);
    ctx.strokeStyle = INK;
    ctx.stroke();

    drawDaisy(ctx, 250, 430, 1.05, s);
    drawDaisy(ctx, 1450, 400, 0.9, s);

    // knife
    ctx.save();
    ctx.translate(1210, 430);
    ctx.rotate(-0.85 + Math.sin(t * 1.4) * 3 * Math.PI / 180);
    ctx.beginPath();
    ctx.roundRect(-16, -150, 32, 150, 8);
    fillStroke(ctx, '#E8EEF3', 5, lw);
    ctx.beginPath();
    ctx.roundRect(-22, -10, 44, 78, 12);
    fillStroke(ctx, '#FFD21F', 5, lw);
    drawFace(ctx, 0, 24, 'smile', s, 1, 0);
    ctx.restore();

    // board + towel + loaf, beat squash from the counter line
    ctx.save();
    ctx.translate(980, 600);
    ctx.scale(1 - (propSq - 1) * 0.6, propSq);
    ctx.beginPath();
    ctx.ellipse(0, 8, 150, 16, 0, 0, 7);
    ctx.fillStyle = INK;
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(-210, -28, 400, 36, 10);
    fillStroke(ctx, '#2EC8D6', 6.5, lw);
    ctx.beginPath();
    ctx.arc(170, -10, 8, 0, 7);
    ctx.fillStyle = '#FBF4EA';
    ctx.fill();
    ctx.lineWidth = lw(4);
    ctx.strokeStyle = INK;
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.translate(900, 676);
    const tw = 28;
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 6; c++) {
        ctx.fillStyle = (r + c) % 2 ? '#3A66E8' : '#FFFFFF';
        ctx.fillRect(c * tw, r * tw, tw, tw);
      }
    }
    ctx.lineWidth = lw(5);
    ctx.strokeStyle = INK;
    ctx.strokeRect(0, 0, 6 * tw, 7 * tw);
    ctx.restore();

    ctx.save();
    ctx.translate(980, 586);
    ctx.scale(1, propSq);
    dome(ctx, 230, 118);
    fillStroke(ctx, '#C97B24', 6.5, lw);
    ctx.save();
    dome(ctx, 230, 118);
    ctx.clip();
    ctx.translate(0, -6);
    dome(ctx, 170, 78);
    ctx.fillStyle = '#FBE6B4';
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-40, -70);
    ctx.quadraticCurveTo(-20, -40, -10, -78);
    ctx.moveTo(10, -78);
    ctx.quadraticCurveTo(24, -46, 46, -70);
    ctx.strokeStyle = '#E9C679';
    ctx.lineWidth = lw(5);
    ctx.stroke();
    ctx.restore();
    drawFace(ctx, 0, -70, 'smile', s, 1, 0);
    ctx.restore();

    // jam
    ctx.save();
    ctx.translate(1470, 600);
    ctx.scale(1, propSq);
    ctx.beginPath();
    ctx.ellipse(0, 4, 48, 10, 0, 0, 7);
    ctx.fillStyle = INK;
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(-46, -120, 92, 120, 16);
    fillStroke(ctx, '#E02445', 6, lw);
    ctx.beginPath();
    ctx.roundRect(-50, -132, 100, 22, 6);
    fillStroke(ctx, '#F4F1EA', 5, lw);
    ctx.beginPath();
    ctx.ellipse(-16, -70, 8, 6, 0.4, 0, 7);
    ctx.ellipse(14, -84, 7, 5, -0.2, 0, 7);
    ctx.ellipse(8, -52, 6, 5, 0, 0, 7);
    ctx.fillStyle = '#FFD86B';
    ctx.fill();
    drawFace(ctx, 0, -78, 'smile', s, 1, 0);
    ctx.restore();

    // butter plate
    if (t < 131.34) {
      ctx.save();
      ctx.translate(1320, 586);
      ctx.beginPath();
      ctx.ellipse(0, 10, 54, 14, 0, 0, 7);
      fillStroke(ctx, '#E8EEF3', 4, lw);
      ctx.beginPath();
      ctx.roundRect(-26, -22, 52, 30, 8);
      fillStroke(ctx, '#FFE14D', 4, lw);
      ctx.beginPath();
      ctx.arc(0, -8, 8, 0.4, 2.2);
      ctx.strokeStyle = '#FFF6B0';
      ctx.lineWidth = lw(3.5);
      ctx.stroke();
      ctx.restore();
    }
  }

  function drawToaster(ctx, t, feet, localItems, s) {
    const sy = 1 + feet.sq;
    const sx = 1 - feet.sq * 0.45;
    const lw = lwOf(s, (sx + sy) / 2);
    ctx.save();
    ctx.translate(feet.x, 618);
    ctx.beginPath();
    ctx.ellipse(0, 0, 120, 16, 0, 0, 7);
    ctx.fillStyle = INK;
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.translate(feet.x, feet.y);
    ctx.rotate(feet.rot);
    ctx.scale(sx, sy);
    for (let i = 0; i < localItems.length; i++) drawItem(ctx, localItems[i], s * sy);

    ctx.beginPath();
    ctx.roundRect(-16, -18, 34, 16, 4);
    ctx.roundRect(-70, -18, 34, 16, 4);
    fillStroke(ctx, INK, 4, lw);

    ctx.beginPath();
    ctx.roundRect(-150, -250, 300, 230, 36);
    fillStroke(ctx, '#C9C9CB', 7, lw);
    ctx.save();
    ctx.globalAlpha = 0.9;
    ctx.beginPath();
    ctx.moveTo(-120, -230);
    ctx.quadraticCurveTo(-100, -140, -120, -40);
    ctx.strokeStyle = '#F4F6F8';
    ctx.lineWidth = lw(10);
    ctx.stroke();
    ctx.restore();

    ctx.beginPath();
    ctx.roundRect(-108, -262, 78, 30, 8);
    ctx.roundRect(8, -262, 78, 30, 8);
    fillStroke(ctx, '#2A2E33', 4.5, lw);

    const heat = heatAmt(t);
    if (heat > 0.25 && leverAmt(t) > 0.65) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(-108, -262, 78, 34);
      ctx.rect(8, -262, 78, 34);
      ctx.clip();
      ctx.strokeStyle = mix('#FF9A2E', '#E8372C', heat > 0.9 ? 1 : 0);
      ctx.lineWidth = lw(4);
      for (const ox of [-70, 46]) {
        ctx.beginPath();
        for (let i = 0; i < 4; i++) {
          const x = ox + (i % 2 ? 16 : -16);
          const y = -258 + i * 8;
          if (i === 0) ctx.moveTo(ox, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.restore();
    }

    ctx.beginPath();
    ctx.roundRect(-156, -248, 312, 36, 12);
    fillStroke(ctx, '#D5D8DC', 6, lw);

    if (t >= 80.10) {
      const sc = Math.min(1.05, popIn(clamp((t - 80.10) / 0.32)));
      ctx.save();
      ctx.translate(78, -130);
      ctx.scale(sc, sc * 0.9);
      ctx.beginPath();
      ctx.moveTo(-40, 0);
      ctx.quadraticCurveTo(-20, -50, 10, -20);
      ctx.quadraticCurveTo(40, 10, 20, 30);
      ctx.quadraticCurveTo(-10, 48, -36, 16);
      ctx.closePath();
      fillStroke(ctx, '#E02445', 5, lw);
      ctx.beginPath();
      ctx.arc(-8, -6, 4, 0, 7);
      ctx.arc(8, 8, 3, 0, 7);
      ctx.fillStyle = '#FFD86B';
      ctx.fill();
      ctx.restore();
    }

    const mood = moodAt(t);
    const look = (t >= 54.6 && t < 59.6) ? -1 : (t >= 139.6 && t < 143.2) ? 1 : 0;
    drawFace(ctx, -6, -145, mood, s, sy, look);

    const lamp = (t >= 84.32 && t < 102) ? '#E8372C' : (heat > 0.2 ? '#FF9A2E' : '#C9C9CB');
    ctx.beginPath();
    ctx.arc(-78, -70, 12, 0, 7);
    fillStroke(ctx, lamp, 4, lw);

    ctx.beginPath();
    ctx.arc(78, -78, 28, 0, 7);
    fillStroke(ctx, '#E6E8EB', 5, lw);
    const ang = -0.8 + heat * 2.2 + leverAmt(t) * 0.4;
    ctx.beginPath();
    ctx.moveTo(78, -78);
    ctx.lineTo(78 + Math.cos(ang) * 16, -78 + Math.sin(ang) * 16);
    ctx.lineWidth = lw(5);
    ctx.strokeStyle = INK;
    ctx.stroke();

    const lev = leverAmt(t);
    const ky = -230 + lev * 140;
    ctx.beginPath();
    ctx.roundRect(138, -240, 16, 160, 6);
    fillStroke(ctx, '#2A2E33', 4, lw);
    ctx.beginPath();
    ctx.roundRect(128, ky - 16, 36, 32, 8);
    fillStroke(ctx, INK, 4, lw);

    ctx.restore();
  }

  function drawHand(ctx, h, s) {
    if (!h || h.sc <= 0.02) return;
    const lw = lwOf(s, h.sc);
    ctx.save();
    ctx.translate(h.x, h.y);
    ctx.rotate(h.rot);
    ctx.scale(h.sc, h.sc);
    ctx.beginPath();
    ctx.roundRect(-70, -36, 150, 78, 30);
    fillStroke(ctx, '#F6C7A2', 6, lw);
    ctx.beginPath();
    ctx.roundRect(50, -18, 48, 36, 14);
    fillStroke(ctx, '#F6C7A2', 5, lw);
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.roundRect(-40 + i * 28, -58, 22, 36, 10);
      fillStroke(ctx, '#F6C7A2', 4, lw);
    }
    ctx.restore();
  }

  function drawRings(ctx, t, t0, x, y, color, s, scale) {
    const u = (t - t0) / 0.5;
    if (u <= 0 || u >= 1) return;
    const e = easeOut(u);
    const R = (18 + (168 - 18) * e) * scale;
    const lw = lwOf(s, 1);
    ctx.save();
    ctx.translate(x, y);
    ctx.globalAlpha = 1 - u;
    ctx.beginPath();
    ctx.arc(0, 0, R, 0, 7);
    ctx.strokeStyle = color;
    ctx.lineWidth = lw(14 - 12 * e);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, R * 0.6, 0, 7);
    ctx.strokeStyle = INK;
    ctx.lineWidth = lw(6 - 5 * e);
    ctx.stroke();
    ctx.restore();
  }
  function drawSparks(ctx, t, t0, x, y, s) {
    const u = (t - t0) / 0.5;
    if (u <= 0 || u >= 1) return;
    const e = easeOut(u);
    const lw = lwOf(s, 1);
    ctx.save();
    ctx.globalAlpha = 1 - u * u;
    for (let i = 0; i < 8; i++) {
      const ang = -Math.PI / 2 + i * (Math.PI * 2 / 8);
      const dist = 40 + (140 + i * 36) * e;
      const sz = 21 + (3 - 21) * e;
      ctx.save();
      ctx.translate(x + Math.cos(ang) * dist, y + Math.sin(ang) * dist);
      ctx.rotate(140 * Math.PI / 180 * e + i);
      sparkle(ctx, sz);
      ctx.fillStyle = PALETTE[i % 6];
      ctx.fill();
      ctx.lineWidth = lw(4);
      ctx.strokeStyle = INK;
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
  }
  function drawCrumbs(ctx, t, t0, x, y, s) {
    const u = t - t0;
    if (u < 0 || u > 1.5) return;
    const fade = u > 1.2 ? 1 - (u - 1.2) / 0.3 : 1;
    const lw = lwOf(s, 1);
    const cols = ['#F2B33D', '#FFD86B', '#E89A2B'];
    const trails = ['#FF4FA3', '#FFE23A', '#3AE8FF'];
    ctx.save();
    ctx.translate(x, y);
    ctx.globalAlpha = fade;
    for (let i = 0; i < 7; i++) {
      const ang = -Math.PI / 2 + (i - 3) * 0.32;
      const sp = 260 + i * 36;
      const px = Math.cos(ang) * sp * u;
      const py = Math.sin(ang) * sp * u + 0.5 * 900 * u * u;
      const pu = Math.max(0, u - 0.08);
      const px2 = Math.cos(ang) * sp * pu;
      const py2 = Math.sin(ang) * sp * pu + 0.5 * 900 * pu * pu;
      for (let k = 0; k < 3; k++) {
        ctx.beginPath();
        ctx.moveTo(px + (k - 1) * 5, py);
        ctx.lineTo(px2 + (k - 1) * 5, py2);
        ctx.strokeStyle = trails[k];
        ctx.lineWidth = lw(3.5);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(px, py, 7, 0, 7);
      ctx.fillStyle = cols[i % 3];
      ctx.fill();
      ctx.lineWidth = lw(3.5);
      ctx.strokeStyle = INK;
      ctx.stroke();
    }
    ctx.restore();
  }
  function drawBurst(ctx, t, t0, x, y, color, light, s) {
    const age = t - t0;
    if (age < 0 || age > 1.7) return;
    const sc = age < 0.34 ? popIn(age / 0.34) : 1;
    const lw = lwOf(s, sc);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(age * 14 * Math.PI / 180);
    ctx.scale(sc, sc);
    burstPath(ctx, 15, 200, 140);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.lineWidth = lw(7);
    ctx.strokeStyle = INK;
    ctx.stroke();
    burstPath(ctx, 15, 112, 78);
    ctx.fillStyle = light;
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
  function drawNotes(ctx, t, x, y, s) {
    const times = [35.40, 35.94, 36.22, 110.64, 111.18, 111.90];
    const lw = lwOf(s, 1);
    for (let i = 0; i < times.length; i++) {
      const age = t - times[i];
      if (age < 0 || age > 1.8) continue;
      const u = easeOut(age / 1.8);
      const alpha = age < 0.22 ? age / 0.22 : age > 1.35 ? (1.8 - age) / 0.45 : 1;
      ctx.save();
      ctx.translate(x + (i % 3 - 1) * 70, y - 250 * u);
      ctx.rotate(Math.sin(age * 4) * 14 * Math.PI / 180);
      ctx.scale(1.1 + 0.5 * u, 1.1 + 0.5 * u);
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.ellipse(-6, 10, 14, 10, -0.5, 0, 7);
      ctx.fillStyle = PALETTE[i % 6];
      ctx.fill();
      ctx.lineWidth = lw(3.5);
      ctx.strokeStyle = INK;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(6, 6);
      ctx.lineTo(6, -28);
      ctx.lineTo(20, -36);
      ctx.stroke();
      ctx.restore();
    }
  }
  function drawHearts(ctx, t, x, y, s) {
    const times = [136.94, 151.94, 156.48, 161.32];
    const lw = lwOf(s, 1);
    for (let i = 0; i < times.length; i++) {
      const age = t - times[i];
      if (age < 0 || age > 1.6) continue;
      const u = easeOut(age / 1.6);
      ctx.save();
      ctx.translate(x + (i - 1.5) * 36, y - 180 * u);
      ctx.rotate(Math.sin(age * 3) * 0.2);
      ctx.globalAlpha = age < 0.2 ? age / 0.2 : age > 1.2 ? (1.6 - age) / 0.4 : 1;
      ctx.beginPath();
      ctx.moveTo(0, 8);
      ctx.bezierCurveTo(-28, -18, -8, -28, 0, -12);
      ctx.bezierCurveTo(8, -28, 28, -18, 0, 8);
      ctx.fillStyle = '#FF4FA3';
      ctx.fill();
      ctx.lineWidth = lw(3.5);
      ctx.strokeStyle = INK;
      ctx.stroke();
      ctx.restore();
    }
  }
  function drawGiggle(ctx, t, x, y, s) {
    const age = t - 165.70;
    if (age < 0 || age > 1.25) return;
    const lw = lwOf(s, 1);
    ctx.save();
    ctx.translate(x + 170, y - 200 + Math.sin(age * 14) * 5);
    ctx.globalAlpha = age < 0.12 ? age / 0.12 : age > 1.0 ? (1.25 - age) / 0.25 : 1;
    ctx.lineWidth = lw(5);
    ctx.strokeStyle = INK;
    ctx.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 22, 8);
      ctx.quadraticCurveTo(12 + i * 22, -18 - i * 4, 26 + i * 22, 6);
      ctx.stroke();
    }
    ctx.restore();
  }
  function drawBell(ctx, t, x, y, s) {
    const age = t - 163.50;
    if (age < 0 || age > 1.25) return;
    const sc = age < 0.28 ? popIn(age / 0.28) : 1;
    const lw = lwOf(s, sc);
    ctx.save();
    ctx.translate(x, y);
    ctx.globalAlpha = age > 1.0 ? (1.25 - age) / 0.25 : 1;
    ctx.scale(sc, sc);
    ctx.beginPath();
    ctx.arc(0, 0, 34, Math.PI, 0);
    ctx.lineTo(30, 18);
    ctx.quadraticCurveTo(0, 34, -30, 18);
    ctx.closePath();
    fillStroke(ctx, '#FFE23A', 6, lw);
    ctx.beginPath();
    ctx.arc(0, 20, 7, 0, 7);
    ctx.fillStyle = INK;
    ctx.fill();
    ctx.restore();
  }
  function drawConfetti(ctx, t) {
    if (t < 166.86) return;
    const el = t - 166.86;
    for (let i = 0; i < 42; i++) {
      const delay = (i % 7) * 0.03;
      const age = el - delay;
      if (age < 0) continue;
      const x = (i * 137 + 40) % 1920;
      const y = -30 + age * (150 + (i % 5) * 28);
      const sway = Math.sin(age * 3 + i) * 26;
      ctx.save();
      ctx.translate(x + sway, y);
      ctx.rotate(age * 3 + i);
      ctx.fillStyle = PALETTE[i % 6];
      ctx.strokeStyle = INK;
      ctx.lineWidth = 3.5;
      if (i % 3 === 0) {
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, 7);
        ctx.fill(); ctx.stroke();
      } else if (i % 3 === 1) {
        sparkle(ctx, 12);
        ctx.fill(); ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.roundRect(-8, -12, 16, 24, 4);
        ctx.fill(); ctx.stroke();
      }
      ctx.restore();
    }
  }

  function worldPoint(feet, it) {
    if (!it) return null;
    if (it.space === 'world') return {x: it.x, y: it.y};
    return {x: feet.x + it.x, y: feet.y + it.y};
  }

  function drawLetter(ctx, ch, x, y, size, color, sc, rot) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.scale(sc, sc);
    ctx.font = size + 'px "Luckiest Guy"';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const ox = 9 * size / 250, oy = 11 * size / 250;
    const sw = Math.max(12, Math.min(20, 16 * size / 200));
    ctx.lineJoin = 'round';
    ctx.fillStyle = INK;
    ctx.fillText(ch, ox, oy);
    ctx.lineWidth = sw;
    ctx.strokeStyle = INK;
    ctx.strokeText(ch, 0, 0);
    ctx.fillStyle = color;
    ctx.fillText(ch, 0, 0);
    ctx.save();
    ctx.beginPath();
    ctx.rect(-size, -size, size * 2, size * 0.45);
    ctx.clip();
    ctx.lineWidth = Math.max(4, sw * 0.28);
    ctx.strokeStyle = '#FFFFFF';
    ctx.globalAlpha = 0.9;
    ctx.strokeText(ch, -3, -4);
    ctx.restore();
    ctx.restore();
  }
  function drawTitle(ctx, t) {
    if (t < 0.2 || t > 5.05) return;
    const text = 'HAPPY HUM!';
    const size = 150;
    ctx.save();
    ctx.font = size + 'px "Luckiest Guy"';
    const chars = text.split('');
    const widths = chars.map(ch => ctx.measureText(ch).width);
    const gap = 4;
    const total = widths.reduce((a, b) => a + b, 0) + gap * (chars.length - 1);
    let x = 960 - total / 2;
    ctx.globalAlpha = t > 4.45 ? clamp((5.05 - t) / 0.6) : 1;
    for (let i = 0; i < chars.length; i++) {
      const age = t - (0.35 + i * 0.08);
      if (age > 0 && chars[i] !== ' ') {
        const sc = age < 0.24 ? popIn(age / 0.24) : 1;
        const cx = x + widths[i] / 2;
        const bob = Math.sin(t * 2 + i) * 8;
        const rot = Math.sin(t * 1.4 + i) * 3 * Math.PI / 180;
        drawLetter(ctx, chars[i], cx, 250 + bob, size, PALETTE[i % 6], Math.max(0.001, sc), rot);
      }
      x += widths[i] + gap;
    }
    ctx.restore();
  }
  function drawShout(ctx, t) {
    let best = null;
    for (let i = 0; i < SHOUTS.length; i++) {
      const s = SHOUTS[i];
      const life = s.text.length * 0.08 + 1.05;
      if (t >= s.t && t <= s.t + life && (!best || s.t >= best.t)) best = s;
    }
    if (!best) return;
    const size = best.text.length <= 4 ? 210 : best.text.length <= 7 ? 164 : 128;
    const chars = best.text.split('');
    ctx.save();
    ctx.font = size + 'px "Luckiest Guy"';
    const widths = chars.map(ch => ctx.measureText(ch).width);
    const gap = size * 0.04;
    const total = widths.reduce((a, b) => a + b, 0) + gap * (chars.length - 1);
    let x = 960 - total / 2;
    const life = chars.length * 0.08 + 0.78;
    const fade = t > best.t + life ? clamp(1 - (t - best.t - life) / 0.16) : 1;
    ctx.globalAlpha = fade;
    for (let i = 0; i < chars.length; i++) {
      const age = t - (best.t + i * 0.08);
      if (age > 0 && chars[i] !== ' ') {
        const sc = age < 0.22 ? popIn(age / 0.22) : 1;
        const bob = Math.sin(t * 3 + i) * 7;
        const tilt = (i % 2 ? 5 : -6) * Math.PI / 180 * Math.sin(t * 3 + i);
        drawLetter(ctx, chars[i], x + widths[i] / 2, 300 + bob, size, best.color, Math.max(0.001, sc), age > 0.22 ? tilt : 0);
      }
      x += widths[i] + gap;
    }
    ctx.restore();
  }
  function drawLyrics(ctx, t) {
    let best = null, idx = 0;
    for (let i = 0; i < LY.length; i++) {
      const line = LY[i];
      const a = line.w[0][0];
      const b = line.w[line.w.length - 1][1];
      if (t >= a - 0.04 && t <= b + 0.5 && (!best || a >= best.w[0][0])) { best = line; idx = i; }
    }
    if (!best) return;
    const a0 = best.w[0][0];
    const b1 = best.w[best.w.length - 1][1];
    const inn = clamp((t - (a0 - 0.02)) / 0.12);
    const out = clamp((b1 + 0.42 - t) / 0.16);
    const alpha = Math.min(inn, out);
    if (alpha <= 0) return;
    const age = t - a0;
    let sc = 1;
    if (age < 0.16) sc = 0.84 + (1.05 - 0.84) * easeOut(age / 0.16);
    else if (age < 0.29) sc = 1.05 + (1 - 1.05) * smooth((age - 0.16) / 0.13);
    const tilt = (idx % 2 ? -1.6 : 1.6) * Math.PI / 180;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(960, 990);
    ctx.rotate(tilt);
    ctx.scale(sc, sc);
    ctx.translate(-960, -990);
    let size = 92;
    const words = best.w;
    const measure = () => {
      ctx.font = size + 'px Shrikhand';
      let total = 0;
      const ws = [];
      for (let i = 0; i < words.length; i++) {
        const w = ctx.measureText(words[i][2] + (i < words.length - 1 ? ' ' : '')).width;
        ws.push(w);
        total += w;
      }
      return {total, ws};
    };
    let m = measure();
    while (m.total > 1760 && size > 52) { size -= 4; m = measure(); }
    ctx.font = size + 'px Shrikhand';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.lineJoin = 'round';
    let x = 960 - m.total / 2;
    const y = 990;
    for (let i = 0; i < words.length; i++) {
      const word = words[i][2] + (i < words.length - 1 ? ' ' : '');
      const dur = Math.max(0.12, words[i][1] - words[i][0]);
      const u = clamp((t - words[i][0]) / dur);
      const shown = word.trimEnd();
      const ww = ctx.measureText(shown).width;
      ctx.fillStyle = 'rgba(56,24,36,0.5)';
      ctx.fillText(word, x + 4, y + 4);
      ctx.lineWidth = 7;
      ctx.strokeStyle = '#201014';
      ctx.strokeText(word, x, y);
      ctx.fillStyle = CREAM;
      ctx.fillText(word, x, y);
      if (u > 0) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(x, y - size, Math.max(1, ww * u), size * 1.4);
        ctx.clip();
        ctx.fillStyle = 'rgba(56,24,36,0.5)';
        ctx.fillText(word, x + 4, y + 4);
        ctx.strokeStyle = '#201014';
        ctx.strokeText(word, x, y);
        ctx.fillStyle = best.c;
        ctx.fillText(word, x, y);
        ctx.restore();
      }
      x += m.ws[i];
    }
    ctx.restore();
  }

  function draw(ctx, t) {
    const cam = camera(t);
    const cover = Math.max(VW / W, VH / H);
    const s = cover * cam.z;
    const [shx, shy] = camShake(t);
    const vw = VW / s, vh = VH / s;
    const cx = Math.max(vw / 2, Math.min(W - vw / 2, cam.x));
    const cy = Math.max(vh / 2, Math.min(H - vh / 2, cam.y));

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#BEDA25';
    ctx.fillRect(0, 0, VW, VH);
    ctx.setTransform(s, 0, 0, s, VW / 2 - cx * s + shx, VH / 2 - cy * s + shy);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    const feet = toasterXform(t);
    const hero = heroPose(t, feet);
    const side = sidePose(t, feet);
    const waffle = wafflePose(t, feet);
    const bagel = bagelPose(t, feet);
    const bean = beanPose(t, feet);
    const local = [side, hero, waffle, bagel, bean].filter(it => it && it.space === 'local');
    const world = [waffle, bagel, bean, hero].filter(it => it && it.space === 'world');

    drawKitchen(ctx, t, s);
    const top = {x: feet.x, y: feet.y - 250};
    if (t >= 11.82 && t < 13.4) drawBurst(ctx, t, 11.82, top.x, top.y + 40, '#3AE8FF', '#E8FCFF', s);
    if (t >= 80.10 && t < 81.8) drawBurst(ctx, t, 80.10, top.x + 40, top.y + 80, '#FF4FA3', '#FF8CC3', s);
    if (t >= 97.70 && t < 99.5) drawBurst(ctx, t, 97.70, top.x, top.y, '#FFE23A', '#FFF6B0', s);
    if (t >= 166.86) drawBurst(ctx, t, 166.86, 832, 480, '#FF4FA3', '#FF8CC3', s);

    drawToaster(ctx, t, feet, local, s);
    for (let i = 0; i < world.length; i++) drawItem(ctx, world[i], s);

    if (t >= 131.34 && t < 131.92 && hero && hero.space === 'world') {
      const p = hop(t, 131.34, 0.55, 1320, 560, hero.x, hero.y - 100, 80);
      const lw = lwOf(s, 1);
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.u * 2);
      ctx.beginPath();
      ctx.roundRect(-22, -14, 44, 26, 7);
      fillStroke(ctx, '#FFE14D', 4, lw);
      ctx.restore();
    }

    drawHand(ctx, handPose(t), s);

    const hits = [
      [11.82, top.x + 80, top.y, '#3AE8FF', 1, true],
      [21.56, top.x, top.y, '#FFE23A', 0.55, true],
      [40.90, top.x + 40, top.y + 20, '#FF4FA3', 0.45, false],
      [41.30, top.x + 10, top.y + 10, '#FFE23A', 0.4, false],
      [41.48, top.x - 20, top.y + 16, '#3AE8FF', 0.4, false],
      [67.92, top.x, top.y, '#FF9A2E', 0.7, true],
      [69.56, top.x + 20, top.y, '#FFE23A', 0.55, false],
      [71.82, top.x, top.y, '#FF4FA3', 0.6, false],
      [80.10, top.x + 60, top.y + 70, '#E02445', 1, true],
      [97.70, top.x, top.y - 20, '#3AE8FF', 1.15, true],
      [116.96, top.x, top.y, '#B6FF3A', 0.45, false],
      [117.34, top.x + 16, top.y, '#3AE8FF', 0.4, false],
      [118.00, top.x - 10, top.y, '#FF4FA3', 0.4, false],
      [130.10, 1000, 500, '#B6FF3A', 0.7, true],
      [145.44, 1000, 500, '#FFE23A', 0.7, true],
      [163.50, top.x + 150, top.y, '#FFE23A', 0.9, true],
      [166.86, 960, 460, '#FF4FA3', 1.2, true]
    ];
    for (let i = 0; i < hits.length; i++) {
      const h = hits[i];
      drawRings(ctx, t, h[0], h[1], h[2], h[3], s, h[4]);
      if (h[5]) drawSparks(ctx, t, h[0], h[1], h[2], s);
    }
    const wp = worldPoint(feet, waffle);
    const bp = worldPoint(feet, bagel);
    if (wp) { drawCrumbs(ctx, t, 67.92, wp.x, wp.y, s); drawCrumbs(ctx, t, 69.56, wp.x, wp.y, s); }
    if (bp) { drawCrumbs(ctx, t, 71.82, bp.x, bp.y, s); drawCrumbs(ctx, t, 72.28, bp.x, bp.y, s); }
    drawNotes(ctx, t, feet.x, feet.y - 40, s);
    drawHearts(ctx, t, feet.x, feet.y - 80, s);
    drawGiggle(ctx, t, feet.x, feet.y, s);
    drawBell(ctx, t, feet.x + 210, feet.y - 280, s);

    ctx.setTransform(1, 0, 0, 1, shx, shy);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    drawConfetti(ctx, t);
    drawTitle(ctx, t);
    drawShout(ctx, t);
    drawLyrics(ctx, t);
  }

  const KEEPS = [
    [0, 5.08],
    [10.12, 54.15],
    [59.42, 99.20],
    [107.18, 138.18],
    [143.45, 170.365333]
  ];
  function sourceTime(editT) {
    let acc = 0;
    const t = Math.max(0, editT || 0);
    for (let i = 0; i < KEEPS.length; i++) {
      const len = KEEPS[i][1] - KEEPS[i][0];
      if (t <= acc + len) return KEEPS[i][0] + (t - acc);
      acc += len;
    }
    return KEEPS[KEEPS.length - 1][1];
  }
  let editDuration = 0;
  for (let i = 0; i < KEEPS.length; i++) editDuration += KEEPS[i][1] - KEEPS[i][0];

  const api = { draw, sourceTime, keeps: KEEPS, DURATION: editDuration, FPS: 24 };
  const root = typeof window !== 'undefined' ? window : globalThis;
  root.ToastyFilm = api;
})();
