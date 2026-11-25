(() => {
  const get = selector => document.querySelector(selector);
  const all = selector => [...document.querySelectorAll(selector)];
  const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
  const nextFrame = () => new Promise(resolve => requestAnimationFrame(resolve));
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const isPhone = () => innerWidth <= 820;
  const { chapters } = window.VibeContent;
  const lab = window.VibeLab;
  const frame = get('.frame');
  const stage = get('.stage');
  const photo = get('.plate');
  const cutout = get('.cut');
  const movie = get('.trans');
  const laptop = get('.caseplate');
  const screen = get('.screen');
  const flash = get('.flash');
  const ticket = get('.ticket');
  const description = get('.desc');
  const desktopBadge = get('.frame > .badge');
  const mobileBadge = desktopBadge.cloneNode(true);
  const badgeBox = get('.m-badge');
  desktopBadge.querySelector('.ph').style.backgroundImage = `url("${cutout.src}")`;
  mobileBadge.querySelector('.ph').style.backgroundImage = `url("${cutout.src}")`;
  badgeBox.append(mobileBadge);

  let chapterIndex = 0;
  let scene = 'hero';
  let busy = false;
  let entered = false;
  let swipe;
  let lastWheel = 0;
  let take;
  let sways = [];
  const elementAnimations = new WeakMap();
  const ease = 'cubic-bezier(.2,.8,.2,1)';
  const badge = () => isPhone() ? mobileBadge : desktopBadge;
  const word = () => get(isPhone() ? '.m-wm' : '.wm');
  const script = () => get(isPhone() ? '.m-script' : '.script');

  function animate(element, frames, options = {}) {
    const previous = elementAnimations.get(element);
    previous?.cancel();
    const last = frames.at(-1);
    if (motion.matches) {
      Object.assign(element.style, last);
      return Promise.resolve();
    }
    const animation = element.animate(frames, {duration:600, easing:ease, fill:'both', ...options});
    elementAnimations.set(element, animation);
    return animation.finished.then(() => {
      if (elementAnimations.get(element) !== animation) return;
      Object.assign(element.style, last);
      animation.cancel();
    }, () => {});
  }

  function pose(target) {
    const width = innerWidth;
    const height = innerHeight;
    const mobile = isPhone();
    const cover = Math.max(width / 1440, height / 810);
    const unit = Math.min(width / 1440, height / 900);
    let scale;
    let x;
    let y;
    if (!mobile && target === 'hero') {
      scale = cover;
      x = (width - 1440 * scale) / 2;
      y = 0;
      const left = Math.max(0, -x / scale);
      const right = Math.min(1440, (width - x) / scale);
      const pad = 18 / scale;
      Object.assign(get('.wm').style, {left:`${left + .6 * pad}px`, width:`${right - left - 1.2 * pad}px`});
      Object.assign(desktopBadge.style, {left:`${Math.min(986, right - pad - 417)}px`, top:`${Math.min(-165, Math.min(810, height / scale) - 56 / scale - 935)}px`});
      get('.script').style.left = `${left + pad + 70}px`;
    } else if (!mobile) {
      const top = 66 * unit;
      const fit = (height - top - 28 * unit) / 683;
      scale = Math.min(cover, fit);
      y = fit >= cover ? Math.min(0, Math.max(height - 810 * scale, top - 79 * scale)) : top - 79 * scale;
      x = (width - 1440 * scale) / 2;
    } else if (target === 'hero') {
      scale = Math.min(width / 650, .62 * height / 810);
      x = width / 2 - 805 * scale;
      y = height - 790 * scale;
    } else {
      scale = Math.min((width - 18) / 905, Math.max(.1, (height - 280) / 683));
      x = width / 2 - 720 * scale;
      y = height - 132 - 762 * scale;
    }
    document.documentElement.style.setProperty('--mbs', width * .27 / 582);
    frame.classList.toggle('d-fade', !mobile);
    frame.classList.toggle('m-fade', mobile);
    frame.classList.toggle('m-case', target === 'case');
    stage.classList.toggle('m-case', target === 'case');
    frame.style.transform = `translate(${x}px,${y}px) scale(${scale})`;
  }

  function setBusy(value) {
    busy = value;
    document.body.classList.toggle('busy', value);
    if (!value) frame.classList.remove('glide');
  }

  function stopSway() {
    sways.forEach(animation => animation.cancel());
    sways = [];
  }

  function startSway() {
    stopSway();
    if (motion.matches || scene !== 'hero' || busy) return;
    sways = [desktopBadge,mobileBadge].map(element => element.animate(
      [{transform:'rotate(-1.1deg)'},{transform:'rotate(1.1deg)'}],
      {duration:3200, iterations:Infinity, direction:'alternate', easing:'ease-in-out'}
    ));
  }

  function heroIn(first) {
    entered = true;
    const rise = first ? 60 : 40;
    const tagAnimations = first ? all('.tag').map((tag, index) => animate(tag,
      [{opacity:0, transform:'translateY(-40px) rotate(-4deg)'},{opacity:1,transform:''}],
      {duration:700,delay:120+index*80,easing:'cubic-bezier(.3,1.5,.5,1)'}
    )) : [];
    const titleAnimations = all('.wm,.m-wm').map(element => animate(element,
      [{opacity:0,transform:`translateY(${rise}px)`,clipPath:'inset(100% 0 0)'},{opacity:1,transform:'',clipPath:'inset(0)'}],
      {duration:first ? 1100 : 700, delay:first ? 260 : 0}
    ));
    const handwriting = all('.script,.m-script').map(element => animate(element,
      [{opacity:0,clipPath:'inset(0 100% 0 0)'},{opacity:1,clipPath:'inset(0)'}],
      {duration:900,delay:first ? 1050 : 250}
    ));
    const drop = [desktopBadge,mobileBadge].map(element => animate(element,
      [{opacity:0,transform:'translateY(-110%) rotate(8deg)'},{opacity:1,transform:'translateY(0) rotate(-3deg)',offset:.65},{opacity:1,transform:''}],
      {duration:first ? 1500 : 1100, delay:first ? 700 : 0}
    ));
    animate(get('.hint'), [{opacity:0},{opacity:.94}], {duration:550, delay:first ? 1120 : 320});
    return Promise.all([...tagAnimations, ...titleAnimations, ...handwriting, ...drop]);
  }

  function chapterPresentation() {
    const chapter = chapters[chapterIndex];
    ticket.querySelector('h2').textContent = chapter.title;
    ticket.classList.toggle('long-title', chapterIndex === 2);
    all('.ticket .rows div').forEach((row, index) => row.textContent = chapter.rows[index]);
    get('.desc .k').textContent = `// ${chapter.name} · ${['Vibe Coding','网站设计','商业创意'][chapterIndex]}`;
    get('.desc p').textContent = chapter.intro;
    get('.desc .num').textContent = `0${chapterIndex + 1} / 03`;
    get('.prev > span:last-child').textContent = chapterIndex === 0 ? '返回开场' : '上一章';
    get('.next > span:last-child').textContent = chapterIndex === 2 ? '第一章' : '下一章';
    stage.style.setProperty('--chapter', chapter.color);
    get('.mobile-chapters').innerHTML = chapters.map((item, index) =>
      `<button data-scene="choose" data-chapter="${index}" aria-current="${index === chapterIndex ? 'true' : 'false'}">${item.name}</button>`
    ).join('');
    lab.renderDeck(chapterIndex);
  }

  function chapterIn(first) {
    const position = isPhone() ? 'translateX(-50%) ' : '';
    return Promise.all([
      animate(ticket, [
        {opacity:0,transform:position+'translateY(-60px) rotate(-6deg)'},
        {opacity:1,transform:position+'translateY(6px) rotate(1.2deg)',offset:.7},
        {opacity:1,transform:position || 'none'}
      ], {duration:800,delay:first ? 120 : 0}),
      animate(description,[{opacity:0,transform:'translateY(14px)'},{opacity:1,transform:'none'}],{duration:520,delay:first ? 210 : 80}),
      animate(get('#chapter-deck'),[{opacity:0,transform:'scale(1.04)'},{opacity:1,transform:'scale(1)'}],{duration:530}),
      animate(flash,[{opacity:0},{opacity:first ? .55 : .35},{opacity:0}],{duration:460})
    ]);
  }

  function chapterOut() {
    const position = isPhone() ? 'translateX(-50%) ' : '';
    return Promise.all([
      animate(ticket,[{opacity:1},{opacity:0,transform:position+'translateY(-40px) rotate(4deg)'}],{duration:380,easing:'cubic-bezier(.5,0,.75,0)'}),
      animate(description,[{opacity:1},{opacity:0,transform:'translateY(-10px)'}],{duration:300}),
      animate(get('#chapter-deck'),[{opacity:1},{opacity:0}],{duration:350})
    ]);
  }

  async function playDive() {
    if (motion.matches) return false;
    if (movie.readyState < 2) {
      await new Promise(resolve => {
        const done = () => {
          clearTimeout(timeout);
          movie.removeEventListener('loadeddata', done);
          movie.removeEventListener('error', done);
          resolve();
        };
        const timeout = setTimeout(done, 1600);
        movie.addEventListener('loadeddata', done);
        movie.addEventListener('error', done);
      });
    }
    if (movie.readyState < 2) return false;
    movie.currentTime = 0;
    movie.playbackRate = 1.8;
    try {
      await Promise.race([movie.play(), pause(850).then(() => {if (movie.paused) throw Error('Video unavailable');})]);
    } catch {
      return false;
    }
    movie.style.opacity = '1';
    await nextFrame();
    await nextFrame();
    photo.style.visibility = 'hidden';
    animate(cutout,[{opacity:1},{opacity:0}],{duration:260});
    frame.style.setProperty('--glide','1.6s');
    frame.classList.add('glide');
    pose('case');
    await new Promise(resolve => {
      let raf;
      const stop = () => { cancelAnimationFrame(raf); clearTimeout(timeout); resolve(); };
      const timeout = setTimeout(stop, 4200);
      const tick = () => {
        const progress = movie.currentTime / movie.duration;
        movie.playbackRate = Math.max(1.2,1.8 + 2.4*Math.sin(Math.PI*Math.min(progress*1.08,1)));
        if (progress >= .995 || movie.ended || movie.error) stop();
        else raf = requestAnimationFrame(tick);
      };
      tick();
    });
    movie.pause();
    return true;
  }

  async function dive(index = chapterIndex) {
    if (busy || lab.isOpen()) return false;
    if (scene === 'case') {
      if (index !== chapterIndex) return switchChapter(index);
      return true;
    }
    setBusy(true);
    if (!entered) heroIn(true);
    stopSway();
    chapterIndex = index;
    chapterPresentation();
    document.body.classList.add('is-diving');
    await Promise.all([
      animate(word(),[{opacity:1},{opacity:0,transform:'translateY(-40px)'}],{duration:380}),
      animate(script(),[{opacity:1},{opacity:0}],{duration:300}),
      animate(badge(),[{opacity:1},{opacity:0,transform:'translateY(-110%) rotate(-6deg)'}],{duration:380})
    ]);
    const played = await playDive();
    if (!played) {
      frame.style.setProperty('--glide','.72s');
      frame.classList.add('glide');
      pose('case');
      await Promise.all([
        animate(laptop,[{opacity:0,filter:'blur(4px)'},{opacity:1,filter:'blur(0)'}],{duration:650}),
        animate(photo,[{opacity:1},{opacity:0}],{duration:600}),
        animate(cutout,[{opacity:1},{opacity:0}],{duration:460})
      ]);
    }
    laptop.style.opacity = '1';
    movie.style.opacity = '0';
    photo.style.visibility = 'hidden';
    cutout.style.opacity = '0';
    screen.style.opacity = '1';
    screen.inert = isPhone();
    scene = 'case';
    document.body.classList.remove('is-diving');
    document.body.classList.add('is-case');
    get('.logo').tabIndex = 0;
    await chapterIn(true);
    setBusy(false);
    return true;
  }

  async function switchChapter(index) {
    if (busy || scene !== 'case' || index === chapterIndex) return false;
    setBusy(true);
    screen.inert = true;
    await chapterOut();
    chapterIndex = index;
    chapterPresentation();
    await chapterIn(false);
    screen.inert = isPhone();
    setBusy(false);
    return true;
  }

  async function returnToHero() {
    if (lab.isOpen()) lab.close();
    if (busy || scene === 'hero') return;
    setBusy(true);
    screen.inert = true;
    await Promise.all([chapterOut(),animate(screen,[{opacity:1},{opacity:0}],{duration:300})]);
    scene = 'hero';
    document.body.classList.remove('is-case');
    get('.logo').tabIndex = -1;
    frame.style.setProperty('--glide','.9s');
    frame.classList.add('glide');
    pose('hero');
    photo.style.visibility = 'visible';
    photo.style.opacity = '1';
    animate(cutout,[{opacity:0},{opacity:1}],{duration:700,delay:150});
    animate(laptop,[{opacity:1,filter:'blur(0)'},{opacity:0,filter:'blur(12px)'}],{duration:800});
    animate(photo,[{transform:'scale(1.12)',filter:'blur(8px)'},{transform:'scale(1)',filter:'blur(0)'}],{duration:900});
    if (!motion.matches) await pause(250);
    await heroIn(false);
    setBusy(false);
    startSway();
  }

  const next = () => scene === 'hero' ? dive() : switchChapter((chapterIndex + 1) % chapters.length);
  const previous = () => scene !== 'case' ? undefined : chapterIndex === 0 ? returnToHero() : switchChapter(chapterIndex - 1);
  const openChapter = () => lab.open(`lesson-${lab.nextLesson(chapterIndex)}`);

  document.addEventListener('click', async event => {
    const button = event.target.closest('[data-scene]');
    if (!button || busy) return;
    if (button.dataset.scene === 'home') returnToHero();
    if (button.dataset.scene === 'journey') {
      if (scene === 'hero') await dive(chapterIndex);
      else lab.open('journey');
    }
    if (button.dataset.scene === 'previous') previous();
    if (button.dataset.scene === 'next') next();
    if (button.dataset.scene === 'choose') switchChapter(Number(button.dataset.chapter));
    if (button.dataset.scene === 'chapter') openChapter();
    if (button.dataset.scene === 'start') {
      const lesson = lab.currentLesson();
      if (await dive(chapters.findIndex(chapter => lesson <= chapter.last))) lab.open(`lesson-${lesson}`);
    }
  });

  const ignoreGesture = event => lab.isOpen() || busy || event.target.closest?.('input, select, textarea, dialog, [contenteditable]');
  window.addEventListener('wheel', event => {
    if (ignoreGesture(event) || Math.abs(event.deltaY) < 18) return;
    event.preventDefault();
    if (performance.now() - lastWheel < 900) return;
    lastWheel = performance.now();
    if (event.deltaY > 0) next(); else previous();
  },{passive:false});
  window.addEventListener('keydown', event => {
    if (ignoreGesture(event) || event.target.closest('button,a,summary') && event.key === ' ') return;
    if (['ArrowDown','PageDown',' ','ArrowRight'].includes(event.key)) {event.preventDefault();next();}
    if (['ArrowUp','PageUp','ArrowLeft'].includes(event.key)) {event.preventDefault();previous();}
  });
  window.addEventListener('touchstart', event => {
    swipe = !ignoreGesture(event) && event.touches.length === 1 ? event.touches[0] : null;
  },{passive:true});
  window.addEventListener('touchend', event => {
    if (!swipe || ignoreGesture(event)) return;
    const x = event.changedTouches[0].clientX - swipe.clientX;
    const y = event.changedTouches[0].clientY - swipe.clientY;
    swipe = null;
    if (Math.max(Math.abs(x),Math.abs(y)) < 45) return;
    if ((Math.abs(x) > Math.abs(y) ? x : y) < 0) next(); else previous();
  },{passive:true});
  all('.badge .hit').forEach(element => element.addEventListener('pointerenter', () => {
    if (scene === 'hero' && !busy && !motion.matches) badge().animate(
      [{transform:'rotate(0)'},{transform:'rotate(-6deg)'},{transform:'rotate(4deg)'},{transform:'rotate(0)'}],
      {duration:1400,easing:'ease-out',composite:'add'}
    );
  }));

  window.addEventListener('resize', () => {
    pose(document.body.classList.contains('is-diving') && frame.classList.contains('m-case') ? 'case' : scene);
    if (!busy) screen.inert = scene !== 'case' || isPhone();
  });
  motion.addEventListener('change', () => {if (motion.matches) stopSway();else startSway();});
  const videoUrl = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20261111_001144_2b054228-95af-41d5-922d-b02979fe485b.mp4';
  if (!motion.matches) {
    const useDirectSource = () => {if (!movie.getAttribute('src')) movie.src = videoUrl;};
    const sourceTimer = setTimeout(useDirectSource,1400);
    fetch(videoUrl).then(response => {
      if (!response.ok) throw Error('Video could not preload');
      return response.blob();
    }).then(blob => {
      clearTimeout(sourceTimer);
      if ((busy && movie.getAttribute('src')) || scene !== 'hero' || movie.readyState >= 2 || !blob.size) return;
      take = URL.createObjectURL(blob);
      movie.src = take;
    }).catch(() => {
      clearTimeout(sourceTimer);
      useDirectSource();
    });
    window.addEventListener('pagehide', event => {if (take && !event.persisted) URL.revokeObjectURL(take);});
  }
  pose('hero');
  chapterPresentation();
  function startEntrance() {
    if (!entered && !busy) heroIn(true).then(startSway);
  }
  Promise.race([Promise.all([document.fonts.ready, photo.decode().catch(() => {})]), pause(1800)]).then(startEntrance);
  setTimeout(startEntrance,2500);
})();
