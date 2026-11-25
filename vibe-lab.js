(() => {
  const C = window.VibeContent;
  const dialog = document.querySelector('#lab');
  const main = dialog.querySelector('.lab-main');
  const aside = dialog.querySelector('.lab-aside');
  const deck = document.querySelector('#chapter-deck');
  const key = 'vibe-lab.v1';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const id = () => globalThis.crypto?.randomUUID?.() ?? `vibe-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const chapterOf = number => C.chapters.findIndex(chapter => number <= chapter.last);
  const numbered = number => String(number).padStart(2,'0');
  const list = (length,value) => Array.from({length},() => value);
  const selected = value => value ? ' aria-pressed="true" class="picked"' : ' aria-pressed="false"';
  const attr = esc;
  const textLines = values => values.map(([label,value]) => `${label}：${String(value ?? '').trim() || '待确认'}`).join('\n');
  const bullets = values => values.filter(Boolean).map(value => `- ${value}`).join('\n') || '待确认';
  const read = (object,path) => path.split('.').reduce((value,part) => value?.[part],object);
  const write = (object,path,value) => {
    const parts = path.split('.');
    const leaf = parts.pop();
    const parent = parts.reduce((current,part) => current[part],object);
    parent[leaf] = value;
  };
  const safePath = path => /^((?!__proto__|constructor|prototype)[a-z\d]+)(\.(?!__proto__|constructor|prototype)[a-z\d]+)*$/i.test(path);
  const blankBrief = () => ({type:'品牌网站',idea:'',audience:'',need:'',context:'',goal:'',value:'',cta:'',features:'',copy:'',limits:'',accept:''});
  const blankDesign = () => ({style:0,bg:'#f4f3ee',ink:'#222222',accent:'#222222',support:'#ddd8cb',highlight:'#d9f477',font:'serif',size:50,weight:700,bodySize:15,leading:1.6,tracking:-3,layout:'split',space:28,width:100,ratio:64,gap:18,radius:2,align:'left',motion:'slide',duration:500,delay:0,ease:'ease-out',ref:'',why:''});
  const newProject = (name = '我的第一个项目') => ({
    id:id(), name, starter:0, os:'macOS', setup:list(5,false), firstChecks:list(3,false), firstNote:'', firstUrl:'', firstPrompt:'',
    draft:blankBrief(), draftCustom:'', demoFavorites:[], demoMoodNotes:[], remix:list(4,false), remixTheme:false, remixFavorite:false, remixTitle:false, remixFixed:false,
    feedback:{position:'',problem:'',expect:'',preserve:'',verify:''}, iterationResult:'', iterationRecords:[],
    brief:blankBrief(), sections:['首屏主张','关于项目','核心内容','行动引导'], design:blankDesign(), designTouched:[], designSaved:false,
    interactions:[], flows:['进入网站','理解价值','探索内容','完成行动'], flowDetail:{}, qa:list(5,false), scores:list(8,0),
    concept:{background:'',audience:'',goal:'',insight:'',advantage:'',limit:'',pick:'',big:'',value:'',journey:'',mechanism:'',spread:'',resource:'',measure:'',visual:''},
    ideas:C.ideas.map(([name,detail]) => ({name,detail,scores:list(5,3)})), weights:list(5,1), story:['开场','商业背景','用户洞察','核心创意','参与体验','活动机制','合作价值','执行与验证'], storyForms:list(8,'图文排版'),
    final:{kind:'原创网站',url:'',version:'',notes:'',ready:false}, assessment:list(8,false), reflections:list(8,''), saved:[], media:[]
  });
  const initial = () => {
    const project = newProject();
    return {version:1, completed:[], current:1, quiz:{team:{},safety:{}}, active:project.id, projects:[project], favorites:[]};
  };
  function normalizeProject(project) {
    if (!project || typeof project !== 'object' || typeof project.name !== 'string') throw Error('项目资料格式不正确');
    const base = newProject();
    const shape = (value,defaults) => {
      if (Array.isArray(defaults)) return Array.isArray(value) ? value.slice(0,200) : defaults;
      if (typeof defaults === 'object') return Object.fromEntries(Object.entries(defaults).map(([name,item]) => [name,shape(value?.[name],item)]));
      return typeof value === typeof defaults ? value : defaults;
    };
    const result = shape(project,base);
    if (!/^[a-z0-9-]{1,70}$/i.test(result.id)) result.id = id();
    for (const field of ['sections','flows','story','storyForms','designTouched']) {
      result[field] = result[field].filter(value => typeof value === 'string');
    }
    for (const [field,length] of Object.entries({setup:5,firstChecks:3,remix:4,qa:5,assessment:8})) {
      result[field] = Array.from({length},(_,index) => result[field][index] === true);
    }
    result.reflections = Array.from({length:8},(_,i) => typeof result.reflections[i] === 'string' ? result.reflections[i] : '');
    result.scores = Array.from({length:8},(_,i) => Math.max(0,Math.min(5,Number(result.scores[i]) || 0)));
    result.weights = Array.from({length:5},(_,i) => Math.max(0,Math.min(5,Number(result.weights[i]) || 0)));
    result.interactions = [...new Set(result.interactions.filter(value => Number.isInteger(value) && value >= 0 && value < C.interactions.length))];
    result.ideas = result.ideas.filter(idea => idea && typeof idea.name === 'string').map(idea => ({
      name:idea.name, detail:typeof idea.detail === 'string' ? idea.detail : '',
      scores:Array.from({length:5},(_,i) => Math.max(1,Math.min(5,Number(idea.scores?.[i]) || 3)))
    }));
    result.saved = result.saved.filter(item => item && typeof item.title === 'string' && typeof item.text === 'string').map(item => ({id:typeof item.id==='string'?item.id:id(),title:item.title,text:item.text,category:String(item.category ?? ''),date:String(item.date ?? '')}));
    result.iterationRecords = result.iterationRecords.filter(item => item && typeof item.text === 'string').map(item => ({text:item.text,result:String(item.result ?? ''),date:String(item.date ?? '')}));
    result.media = result.media.filter(item => item && /^[a-z0-9-]{1,70}$/i.test(item.id) && ['first','reference','iteration','final'].includes(item.group)).map(item => ({id:item.id,group:item.group,name:String(item.name ?? '图片'),note:String(item.note ?? ''),marks:Array.isArray(item.marks) ? item.marks.filter(mark => mark && Number.isFinite(mark.x) && Number.isFinite(mark.y)).slice(0,20) : []}));
    result.flowDetail = Object.fromEntries(Object.entries(project.flowDetail ?? {}).filter(([name,value]) => /^\d+$/.test(name) && typeof value === 'string'));
    for (const field of ['bg','ink','accent','support','highlight']) {
      if (!/^#[\da-f]{6}$/i.test(result.design[field])) result.design[field] = base.design[field];
    }
    result.design.style = C.styles[result.design.style] ? result.design.style : 0;
    result.starter = C.first[result.starter] ? result.starter : 0;
    return result;
  }
  function normalize(value) {
    if (value?.version !== 1 || !Array.isArray(value.projects) || !value.projects.length || value.projects.length > 100) throw Error('请选择 VIBE LAB 导出的有效备份');
    const projects = value.projects.map(normalizeProject);
    if (new Set(projects.map(item=>item.id)).size !== projects.length) throw Error('备份中存在重复项目');
    const quiz = (answers,length,max) => Object.fromEntries(Object.entries(answers ?? {}).filter(([index,pick]) => /^\d+$/.test(index) && Number(index)<length && Number.isInteger(pick) && pick>=0 && pick<=max));
    return {
      version:1, projects, active:projects.some(item => item.id === value.active) ? value.active : projects[0].id,
      current:C.lessons[value.current-1] ? Number(value.current) : 1,
      completed:[...new Set((Array.isArray(value.completed) ? value.completed : []).filter(n => Number.isInteger(n) && n>=1 && n<=12))],
      quiz:{team:quiz(value.quiz?.team,6,2),safety:quiz(value.quiz?.safety,3,1)},
      favorites:[...new Set((Array.isArray(value.favorites) ? value.favorites : []).filter(n => Number.isInteger(n) && C.prompts[n]))]
    };
  }
  let state;
  try {const saved = localStorage.getItem(key);state = saved ? normalize(JSON.parse(saved)) : initial();}
  catch {state = initial();}
  const project = () => state.projects.find(item => item.id === state.active);
  const nextLesson = index => {
    const chapter = C.chapters[index];
    return Array.from({length:chapter.last-chapter.first+1},(_,i) => chapter.first+i).find(n => !state.completed.includes(n)) ?? chapter.first;
  };
  let route = '';
  let currentDeck = 0;
  let toastTimer;
  let demoMotion;
  let storageOK = true;
  let lastFocus;
  let imageURLs = [];
  let outputs = new Map();
  let refreshers = [];
  const view = {demo:0,flowers:[],dark:false,cardIndex:-1,mood:'平静',loop:0,structure:0,promptLevel:0,remixTab:0,designTab:'风格',device:'desktop',compare:0,after:false,interaction:0,clicks:0,tab:0,card:false,chart:0,flow:0,pitch:false,pitchStep:0,scene:0,ideaStep:0,ideaDemo:0,stamps:0,inspo:0,search:'',category:'全部',favoritesOnly:false,debugIssue:0,debug:{page:'',steps:'',actual:'',expected:'',error:'',preserve:''}};

  function toast(message) {
    const display = dialog.querySelector('.lab-toast');
    clearTimeout(toastTimer);
    display.textContent = message;
    display.classList.add('show');
    toastTimer = setTimeout(() => display.classList.remove('show'),2500);
  }
  function save() {
    const changed = storageOK;
    try {localStorage.setItem(key,JSON.stringify(state));storageOK = true;}
    catch {storageOK = false;}
    if (changed && !storageOK) toast('浏览器存储不可用。请在关闭前导出备份。');
    dialog.querySelector('.lab-shell').dataset.storage = storageOK ? 'saved' : 'unavailable';
  }
  function updateProgress() {
    dialog.querySelector('.lab-overall').textContent = `${state.completed.length} / 12 已完成`;
    const start = document.querySelector('.hero-start');
    const started = state.current > 1 || state.completed.length || project().firstChecks.some(Boolean) || project().setup.some(Boolean);
    start.firstChild.textContent = started ? '继续我的创作 ' : '开始第一次创作 ';
    renderDeck(currentDeck);
  }
  function renderDeck(index) {
    currentDeck = index;
    const chapter = C.chapters[index];
    const numbers = Array.from({length:chapter.last-chapter.first+1},(_,i) => chapter.first+i);
    deck.innerHTML = `
      <section class="deck-chapter" style="--accent:${chapter.color}">
        <div class="deck-intro"><span>VIBE LAB. / 0${index+1}</span>
          <h2>${chapter.title}</h2><p>${chapter.subject}</p>
          <div class="deck-mark" aria-hidden="true">✳</div>
          <progress value="${numbers.filter(n=>state.completed.includes(n)).length}" max="${numbers.length}" aria-label="篇章进度"></progress>
          <small>${numbers.filter(n=>state.completed.includes(n)).length} / ${numbers.length} 节已完成</small>
        </div>
        <div class="deck-lessons"><header>LEARNING JOURNEY <span>选择一课</span></header>
        ${numbers.map(n => `<button data-route="lesson-${n}"><span>${numbered(n)}</span><strong>${C.lessons[n-1][1]}</strong><span>${state.completed.includes(n) ? '✓' : '↗'}</span></button>`).join('')}
        <button class="deck-start" data-route="lesson-${nextLesson(index)}">进入篇章 <span aria-hidden="true">↗</span></button></div>
      </section>`;
  }
  const routeOK = value => /^(lesson-(?:[1-9]|1[0-2])|journey|workspace|resources|rescue|portfolio|try|inspiration)$/.test(value);
  const lessonNumber = () => route.startsWith('lesson-') ? Number(route.slice(7)) : 0;
  function show(value, updateURL) {
    if (!routeOK(value)) return;
    route = value;
    const number = lessonNumber();
    if (number) {state.current = number;save();}
    if (!dialog.open) {
      lastFocus = document.activeElement;
      dialog.showModal();
    }
    if (updateURL && location.hash !== '#'+route) history.pushState(null,'','#'+route);
    render(false);
    main.focus({preventScroll:true});
  }
  function close(updateURL = true) {
    if (!dialog.open) return;
    dialog.close();
    clearImages();
    if (updateURL && routeOK(location.hash.slice(1))) history.replaceState(null,'',location.pathname+location.search);
    const fallback = document.querySelector(document.body.classList.contains('is-case') ? '.mobile-enter' : '.hero-start');
    const focusTarget = lastFocus?.isConnected && lastFocus.getClientRects().length ? lastFocus : fallback;
    focusTarget?.focus({preventScroll:true});
  }
  dialog.addEventListener('cancel',event => {event.preventDefault();close();});
  window.addEventListener('hashchange',() => {
    const hash = location.hash.slice(1);
    if (routeOK(hash)) show(hash,false); else close(false);
  });
  window.addEventListener('popstate',() => {
    const hash = location.hash.slice(1);
    if (routeOK(hash) && (hash!==route || !dialog.open)) show(hash,false);
    else if (!routeOK(hash)) close(false);
  });

  const btn = (label,action,value='',classes='') => `<button type="button" class="${classes}" data-action="${action}" data-value="${attr(value)}">${label}</button>`;
  const link = (label,target,classes='') => `<a class="${classes}" href="#${target}" data-route="${target}">${label}</a>`;
  const field = (label,path,options={}) => {
    const {type='text', choices=[], placeholder='', min, max, step, ephemeral=false} = options;
    const value = read(ephemeral ? view : project(),path);
    const bind = `data-bind="${path}"${ephemeral ? ' data-ephemeral' : ''}`;
    const hint = placeholder ? ` placeholder="${attr(placeholder)}"` : '';
    let input;
    if (type==='textarea') input = `<textarea ${bind}${hint} rows="3" maxlength="8000">${esc(value)}</textarea>`;
    else if (type==='select') input = `<select ${bind}>${choices.map(choice => {
      const [code,name] = Array.isArray(choice) ? choice : [choice,choice];
      return `<option value="${attr(code)}"${code===value ? ' selected' : ''}>${esc(name)}</option>`;
    }).join('')}</select>`;
    else if (type==='range') input = `<input ${bind} type="range" min="${min}" max="${max}" step="${step??1}" value="${attr(value)}"><output data-num="${path}">${esc(value)}</output>`;
    else if (type==='color') input = `<span class="color-pair"><input aria-label="${attr(label)}选择器" ${bind} type="color" value="${attr(value)}"><input aria-label="${attr(label)} HEX 色值" ${bind} type="text" data-hex pattern="#[0-9a-fA-F]{6}" maxlength="7" value="${attr(value)}"></span>`;
    else input = `<input ${bind} type="${type}"${hint} value="${attr(value)}" maxlength="500">`;
    return `<label class="field"><span>${label}</span>${input}</label>`;
  };
  const check = (label,path) => `<label class="tick"><input data-bind="${path}" type="checkbox"${read(project(),path) ? ' checked' : ''}><span>${esc(label)}</span></label>`;
  const checks = (items,path) => `<div class="checks">${items.map((item,index) => check(item,`${path}.${index}`)).join('')}</div>`;
  const group = (title,content,copy='') => `<section class="lab-section"><h2>${title}</h2>${copy ? `<p class="section-intro">${copy}</p>` : ''}${content}</section>`;
  const header = (eyebrow,title,desc) => `<header class="page-head"><p class="lab-kicker">${eyebrow}</p><h1 id="lab-heading">${title}</h1><p>${desc}</p></header>`;
  const choices = (items,active,action) => `<div class="choices">${items.map((label,index) => `<button type="button" data-action="${action}" data-value="${index}"${selected(index===active)}>${esc(label)}</button>`).join('')}</div>`;
  const platformLinks = (target='both') => `<div class="lab-actions">${target!=='codex' ? '<a href="https://chatgpt.com/" target="_blank" rel="noopener">打开 ChatGPT ↗</a>' : ''}${target!=='chat' ? '<a href="https://chatgpt.com/codex" target="_blank" rel="noopener">打开 Codex ↗</a>' : ''}</div>`;
  function box(name,title,getText,options={}) {
    outputs.set(name,{title,getText,category:options.category??'课程'});
    return `<div class="prompt-box"><div class="prompt-bar"><strong>${esc(title)}</strong><div>${btn('复制指令','copy',name)} ${options.save===false ? '' : btn('保存至工作台','save-prompt',name)}</div></div>
      <textarea aria-label="${attr(title)}" data-output="${name}"${options.edit ? '' : ' readonly'} rows="${options.rows??6}">${esc(getText())}</textarea></div>`;
  }
  function refresh() {
    for (const area of main.querySelectorAll('[data-output]')) {
      if (area !== document.activeElement) area.value = outputs.get(area.dataset.output).getText();
    }
    for (const num of main.querySelectorAll('[data-num]')) num.value = read(project(),num.dataset.num);
    refreshers.forEach(update => update());
    const complete = main.querySelector('[data-action="complete"]');
    if (complete) {
      const rule = mastery(lessonNumber());
      complete.disabled = !rule.pass;
      const message = main.querySelector('.rule-message');
      const text = rule.pass ? '已满足本课通关条件。' : rule.message;
      if (message.textContent!==text) message.textContent = text;
    }
  }
  function render(keep=true) {
    const scroller = main;
    const scroll = keep ? scroller.scrollTop : 0;
    const active = document.activeElement;
    const focusAction = keep && main.contains(active) ? active.dataset.action : '';
    const focusValue = focusAction ? active.dataset.value : '';
    const openDetails = keep ? [...main.querySelectorAll('details')].map(item=>item.open) : [];
    clearImages();
    outputs = new Map();
    refreshers = [];
    const number = lessonNumber();
    const index = number ? chapterOf(number) : -1;
    dialog.style.setProperty('--accent',index>=0 ? C.chapters[index].color : '#d9f477');
    aside.innerHTML = navMarkup(number);
    main.innerHTML = number ? lessonMarkup(number) : views[route]();
    main.querySelectorAll('details').forEach((item,index)=>{if (openDetails[index]) item.open=true;});
    main.scrollTop = scroll;
    if (focusAction) {
      [...main.querySelectorAll('[data-action]')].find(element => element.dataset.action===focusAction && element.dataset.value===focusValue)?.focus({preventScroll:true});
    }
    syncImages();
    refresh();
    updateProgress();
  }

  function navMarkup(number) {
    return `<details class="lab-directory"${matchMedia('(min-width: 860px)').matches ? ' open' : ''}><summary>课程目录 <span>${state.completed.length} / 12</span></summary>
      ${C.chapters.map((chapter,index) => {
        const numbers = Array.from({length:chapter.last-chapter.first+1},(_,i) => chapter.first+i);
        return `<section class="nav-chapter" style="--chapter-color:${chapter.color}"><p>0${index+1} · ${chapter.name}<span>${numbers.filter(n => state.completed.includes(n)).length}/${numbers.length}</span></p>
          ${numbers.map(n => `<a href="#lesson-${n}" data-route="lesson-${n}"${number===n ? ' aria-current="page"' : ''}><span>${numbered(n)}</span>${C.lessons[n-1][1]}<i aria-label="${state.completed.includes(n)?'已完成':'未完成'}">${state.completed.includes(n)?'✓':''}</i></a>`).join('')}</section>`;
      }).join('')}
      <div class="lab-aside-foot"><span>当前项目</span><strong>${esc(project().name)}</strong>${link('查看工作台','workspace')}</div>
      </details>`;
  }
  function lessonMarkup(number) {
    const [english,title,learn,task] = C.lessons[number-1];
    const chapter = C.chapters[chapterOf(number)];
    return `${header(`CHAPTER 0${chapterOf(number)+1} / LESSON ${numbered(number)} OF 12 · ${chapter.name}`,title,english)}
      <div class="lesson-learn"><strong>这一课学什么</strong><p>${learn}</p></div>
      ${lessons[number]()}
      <section class="lesson-task"><span class="lab-kicker">CREATE & REFLECT</span><h2>实际任务</h2><p>${task}</p>
        <div class="rule-message" role="status"></div>
        <div class="lab-actions">${number>1 ? link('上一课',`lesson-${number-1}`) : link('学习路线','journey')}
          ${btn('保存至我的工作台','save-project')} ${btn(state.completed.includes(number) ? '已完成 · 继续' : '完成并继续','complete',number,'primary')}</div>
      </section>`;
  }

  const firstSteps = ['打开官方支持 Codex 的客户端','新建 Vibe-First-Project 文件夹','打开该文件夹并新建对话','阅读指令并把它发给 Codex','打开 Codex 给出的实际预览地址'];
  const firstChecks = ['我已把指令发给 Codex','我已打开自己的网站','我亲手操作过网站里的功能'];
  const briefFields = [
    ['想做什么','idea'],['给谁看','audience'],['用户需要什么','need'],['在哪个场景使用','context'],['我想达成的目标','goal'],['访客应该理解什么','value'],['希望访客做什么','cta'],['需要哪些功能','features'],['要保留什么','limits'],['怎样算完成','accept']
  ];
  const draftFields = [['我想创造什么','idea'],['谁会使用','audience'],['为什么做','goal'],['希望是什么风格','value'],['需要什么内容','copy'],['需要什么功能','features'],['保留项或约束','limits'],['怎样算完成','accept']];
  const feedbackFields = [['要改哪里','position'],['现在的问题','problem'],['期望的效果','expect'],['应该保留什么','preserve'],['怎么知道改好了','verify']];
  const conceptFields = [['项目背景','background'],['目标用户','audience'],['商业目标','goal'],['用户痛点 / 洞察','insight'],['品牌优势','advantage'],['资源约束','limit'],['核心创意','big'],['价值主张','value'],['参与步骤','journey'],['活动机制','mechanism'],['传播策略','spread'],['执行资源','resource'],['如何验证','measure'],['视觉方向','visual']];
  const flowForms = ['大标题叙事','图文排版','交互卡片','用户旅程图','流程图','动态时间轴','数据图表','模拟器','对比图','产品展示'];
  const skills = `<details class="help-detail"><summary>可选 Skill 怎么用？</summary><p>Skill 是可复用的操作流程。在有该 Skill 的 Codex 会话里点选或点名，例如 <code>$motionsites-web-builder</code>，再附上参考和保留项。缺首图时用图像生成，验收时可以让浏览器工具按步骤点击和截图。没有安装 Skill 时，直接发送完整指令也可以继续。</p><a href="https://learn.chatgpt.com/docs/build-skills" target="_blank" rel="noopener">OpenAI 官方 Skill 指南 ↗</a></details>`;
  const modelSetup = `在独立项目文件夹内完成，使用简单前端技术，无需登录或后端。实现可点击的核心功能，适配桌面和手机。完成后启动预览，实际打开并测试核心操作，然后给我完整地址和运行方式。`;
  const critique = () => textLines(feedbackFields.map(([label,name])=>[label,project().feedback[name]]));
  const remixPrompt = () => `请先复现下列问题，再在最小范围内修改并按验收条件重测。\n\n${critique()}\n\n附上同尺寸的修改前后截图，并说明改了哪些文件。`;
  const goalPrompt = object => textLines(draftFields.map(([label,name])=>[label,object[name]]));
  const briefText = () => textLines([['项目名称',project().name],['项目类型',project().brief.type],...briefFields.map(([label,name])=>[label,project().brief[name]])]);
  const sectionText = () => bullets(project().sections);
  const designText = () => {
    const d = project().design;
    const refs = project().media.filter(item=>item.group==='reference');
    return textLines([
      ['风格',C.styles[d.style][0]], ['背景 / 正文 / 主色',`${d.bg} / ${d.ink} / ${d.accent}`], ['辅助色 / 强调色',`${d.support} / ${d.highlight}`],
      ['字体',`${d.font==='serif'?'衬线':'无衬线'}标题，${d.size}px / ${d.weight}，字距 ${d.tracking}px；正文 ${d.bodySize}px / ${d.leading}`],
      ['布局',`${{center:'居中',split:'左文右图',offset:'不对称'}[d.layout]}，${d.align==='left'?'左对齐':'居中对齐'}，内容宽 ${d.width}%，边距 ${d.space}px，文字比例 ${d.ratio}%，区块间距 ${d.gap}px，圆角 ${d.radius}px`],
      ['动效',`${motionTypes.find(([code])=>code===d.motion)?.[1] ?? '轻量动效'}，${d.duration}ms，延迟 ${d.delay}ms，${d.ease}。提供减少动效选项。`],
      ['参考的保留/改动',d.ref],['选择理由',d.why], ...refs.map(item=>[`参考图 ${item.name}`,item.note])
    ]);
  };
  const flowText = () => project().flows.filter(Boolean).map((step,index)=>`${index+1}. ${step}${project().flowDetail[index] ? '（'+project().flowDetail[index]+'）' : ''}`).join('\n');
  const interactionsText = () => bullets(project().interactions.map(i=>C.interactions[i].slice(0,1)+'：'+C.interactions[i][2]));
  const master = () => `# 网站开发需求\n你是一位创意开发者与 UI/UX 设计师。\n\n## 项目背景与目标\n${briefText()}\n\n## 网站信息架构\n${sectionText()}\n内容方案：${project().brief.copy || '由我确认后再使用'}\n\n## 视觉设计规范\n${designText()}\n参考图由我另行上传。\n\n## 功能与交互\n${interactionsText()}\n\n用户路径：\n${flowText()}\n\n## 开发约束与计划\n先检查项目、复述需求与范围，说明会涉及的文件、预览方式和修改计划，等我确认后执行。保护已确认的内容、外观和交互。未知事实标注待确认，机密不进网页代码。\n\n## 验收\n${bullets(C.qa)}\n实际运行测试，给出可访问的预览、交付说明和已知限制。`;
  const conceptText = () => textLines([['选定方向',project().concept.pick],...conceptFields.map(([label,name])=>[label,project().concept[name]])]);
  const creativeMaster = () => `# 交互式创意方案\n你是一位商业叙事设计师、创意总监和前端开发者。将「${project().name}」做成可实际操作的数字提案。\n\n## 背景、洞察、创意与执行\n${conceptText()}\n\n## 叙事与各部分呈现\n${bullets(project().story.map((item,i)=>item+' · '+(project().storyForms[i]||'图文排版')))}\n\n## 设计与反馈\n${designText()}\n${interactionsText()}\n\n区分已确认事实与假设；预算、参与量、转化率等未知数据标注待验证。不同区块根据内容选择版式，先给开发计划。实际测试核心交互、可读性与手机访问，再记录交付、限制和后续验证方法。`;
  const motionTypes = [['fade','淡入'],['slide','向上出现'],['scale','缩放出现'],['lift','悬停上浮'],['scroll','滚动出现'],['none','无动效']];
  const layoutTypes = [['center','居中式'],['split','左文右图'],['offset','不对称杂志式']];
  const assessmentText = () => `已确认 ${project().assessment.filter(Boolean).length} / 8 项能力`;
  const firstChat = () => `我第一次用 AI 做网站，想做一个「${C.first[project().starter][0]}」。请先帮我写清楚它给谁用、页面放什么，以及访客最重要的一个动作。如果信息不足，每次只问一个问题。最后给我一份可以交给 Codex 执行的简短需求，这轮先整理内容。`;
  const draftExample = {idea:'咖啡品牌网站',audience:'年轻咖啡消费者',goal:'让访客认识品牌并查看门店',value:'复古杂志风，暖棕与奶油白',copy:'品牌故事、咖啡产品、门店信息',features:'产品标签切换',limits:'保留实际店名，不编造营业数据',accept:'手机和桌面都能从首屏进入门店信息'};
  const operationCards = ['改视觉风格','增加收藏','改大标题','修复无效按钮'];
  const ideaDeck = ['为每天的第一杯水设计一个交互提醒','把三种咖啡烘焙程度做成滑块','做一张会变颜色的个人名片','把一张课程表变成可切换视图','为朋友做一个可抽取的周末计划','把一项习惯做成可点击的进度条','让来访者挑选你推荐的三首歌','做一个寻找本周好事的小网站','做一页可折叠的旅行清单','为宠物设计数字领养卡','记录一周每天的天空','做一个三步的路线选择器','用标签筛选你最近读过的书','把做饭步骤做成可打勾清单','用图表对比三种通勤方式','给展览做可切换的导览','做一个可以复制祝福的小站','用滑块分配一小时的活动时间','给每次散步留一句笔记','设计一张会随着点按改变的海报'];
  function starterPreview() {
    const active = project().starter;
    if (active===0) return `<div class="starter-demo garden" role="group" aria-label="数字花园"><b>Grow a tiny garden.</b><small>点按空地，种一朵花</small><button class="garden-soil" data-action="plant" aria-label="在花园种花">${view.flowers.map(({x,y,n})=>`<i class="plant plant-${n}" style="left:${x}%;top:${y}%"></i>`).join('')}</button>${btn('清空花园','clear-garden')}</div>`;
    if (active===1) return `<div class="starter-demo identity ${view.dark?'is-dark':''}"><small>DESIGNER / SAMPLE</small><b>Lin.\nCreator</b><p>我用插画和网站记录日常。</p>${btn(view.dark?'切换浅色':'切换深色','identity')}</div>`;
    if (active===2) return `<div class="starter-demo idea-machine"><small>IDEA MACHINE</small><b>${view.cardIndex<0?'下一张是什么？':ideaDeck[view.cardIndex]}</b><div class="lab-actions">${btn('抽一张','draw')}${view.cardIndex<0?'':btn(project().demoFavorites.includes(view.cardIndex)?'取消收藏':'收藏这张','favorite-idea')}</div><small>已收藏 ${project().demoFavorites.length} 张</small></div>`;
    return `<div class="starter-demo mood-journal"><small>MOOD DIARY</small><b>你今天感觉如何？</b>${choices(['平静','兴奋','疲惫'],['平静','兴奋','疲惫'].indexOf(view.mood),'pick-mood')}<form data-form="mood"><label class="sr-only" for="mood-input">一句感想</label><input id="mood-input" name="note" required maxlength="100" placeholder="写下一句感想"><button>保存记录</button></form>${project().demoMoodNotes.map((item,i)=>`<p>${esc(item?.mood)} · ${esc(item?.note)} ${btn('移除','remove-mood',i)}</p>`).join('')}</div>`;
  }
  function quiz(type,questions) {
    const answers = state.quiz[type];
    const results = questions.map((question,index)=>type==='team' ? answers[index]===question[1] : answers[index]===0);
    return `<div class="quiz">${questions.map((question,index)=>{
      const pick = answers[index];
      const options = type==='team' ? C.roles : index%2 ? [question[1],question[2]] : [question[2],question[1]];
      return `<section><h3>${index+1}. ${question[0]}</h3><div class="choices">${options.map((label,i)=>{
        const answer = type==='team' || index%2 ? i : 1-i;
        return `<button data-action="answer" data-value="${type}:${index}:${answer}"${selected(pick===answer)}>${label}</button>`;
      }).join('')}</div>${pick===undefined?'':`<p class="${results[index]?'success':'notice'}">${results[index]?'答对了。':'再想一步。'}${type==='team'?question[2]:question[1]+'。'}</p>`}</section>`;
    }).join('')}<div class="lab-actions"><strong>${results.filter(Boolean).length} / ${questions.length} 正确</strong>${btn('重新挑战','reset-quiz',type)}</div></div>`;
  }
  function orderEditor(property, addText, {flow=false,story=false}={}) {
    const items = project()[property];
    return `<div class="order-editor">${items.map((item,index)=>`<div class="order-row" data-order-row>
      <span>${numbered(index+1)}</span>${field(`步骤 ${index+1}`,`${property}.${index}`)}
      ${story?field('呈现方式',`storyForms.${index}`,{type:'select',choices:flowForms}):''}
      ${flow?btn('详情','flow-detail',index):''}
      <div class="order-buttons"><button type="button" aria-label="上移第 ${index+1} 项" data-action="order" data-value="${property}:${index}:-1"${index===0?' disabled':''}>↑</button>
        <button type="button" aria-label="下移第 ${index+1} 项" data-action="order" data-value="${property}:${index}:1"${index===items.length-1?' disabled':''}>↓</button>
        <button type="button" aria-label="移除第 ${index+1} 项" data-action="order" data-value="${property}:${index}:0">×</button></div></div>`).join('')}
      ${btn(addText,'add-order',property)}
      ${flow && items.length ? field('该步骤的用户目标、所需信息、操作和反馈',`flowDetail.${Math.min(view.flow,items.length-1)}`,{type:'textarea',placeholder:items[view.flow]}) : ''}
      <div class="flow-strip" data-flow-preview="${property}"></div></div>`;
  }
  function addFlowRefresh(property) {
    refreshers.push(() => {
      const target = main.querySelector(`[data-flow-preview="${property}"]`);
      if (target) target.innerHTML = project()[property].filter(Boolean).map(item=>`<span>${esc(item)}</span>`).join('<b aria-hidden="true">→</b>');
    });
  }
  function basicForm(entries,root) {
    return `<div class="fields">${entries.map(([label,name])=>field(label,`${root}.${name}`)).join('')}</div>`;
  }
  function fieldNotes(label,path,placeholder='') {return field(label,path,{type:'textarea',placeholder});}
  const lessons = {
    1() {
      const [name,english,prompt] = C.first[project().starter];
      refreshers.push(() => {main.querySelector('[data-setup-count]').textContent = `${project().setup.filter(Boolean).length} / 5 已完成`;});
      return group('挑一个你想做的作品',`<div class="first-grid">${C.first.map(([cn,en],i)=>`<button data-action="starter" data-value="${i}"${selected(i===project().starter)}><span>${en}</span><strong>${cn}</strong></button>`).join('')}</div>${starterPreview()}<p class="fine-print">交互示例 · 这里的操作用浏览器规则演示。</p>`) +
        group('打开 Codex，准备自己的项目',`${choices(['macOS','Windows'],project().os==='macOS'?0:1,'os')}<p>${project().os==='macOS'?'在 Finder「访达」中新建文件夹，接着在 Codex 中选择这个文件夹。':'在 Windows 文件资源管理器里新建文件夹，接着在 Codex 中选择这个文件夹。'}</p>${checks(firstSteps,'setup')}<p class="fine-print" data-setup-count></p>${platformLinks('codex')}${skills}`) +
        group('发出你的第一条指令',box('first',name+' · '+english,()=>project().firstPrompt || prompt+'\n\n'+modelSetup,{edit:true})+'<p class="fine-print">可先编辑这条指令，再复制或保存。</p>'+
          `<details class="help-detail"><summary>还没有想清楚？先打开 ChatGPT</summary><p>点「打开 ChatGPT」，新建对话，粘贴下方这段。把它给你的简短需求带到 Codex，就能开始做。</p>${box('first-chat','在 ChatGPT 里的第一条消息',firstChat)}${platformLinks('chat')}</details>`) +
        group('留下第一次创作的记录',checks(firstChecks,'firstChecks')+`<div class="fields">${field('预览地址（选填）','firstUrl',{placeholder:'例如 http://localhost:5173/'})}${fieldNotes('第一次创作感想','firstNote')}</div>`+media('first','上传作品截图'));
    },
    2() {
      return group('AI 团队挑战',`<div class="role-strip"><div><b>YOU</b><span>确定方向与验收</span></div><div><b>CHATGPT</b><span>讨论、策划、整理</span></div><div><b>CODEX</b><span>开发、测试、修复</span></div></div>`+quiz('team',C.team),'按推荐分工给六个真实情景找到合适的人。') +
        group('第一次交接',box('handoff','把聊天的结论交给 Codex',()=> '请把我们已确认的目标、受众、内容、视觉、功能和验收条件整理成一条 Codex 开发指令。用具体例子说明交互，列出保留项和待确认项。')+platformLinks());
    },
    3() {
      const examples = ['我想做一个咖啡品牌网站。','为<mark>年轻消费者</mark>做咖啡品牌网站，采用<mark>复古杂志风与暖棕、奶油白</mark>。','为年轻消费者做咖啡品牌网站。包含<mark>品牌故事、产品和门店</mark>，用复古暖色，支持<mark>产品标签切换</mark>。<mark>手机上也能看清门店地址</mark>。'];
      return group('看同一句话怎么进化',choices(['一句想法','加受众与风格','加内容与验收'],view.promptLevel,'prompt-level')+`<blockquote>${examples[view.promptLevel]}</blockquote>`) +
        group('实时生成自己的指令',`<div class="lab-actions">${btn('填入咖啡示例','draft-example')}${btn('清空输入','draft-clear')}</div>${basicForm(draftFields,'draft')}${box('draft','我的创作指令',()=> project().draftCustom || '请根据以下需求设计网站。先写页面结构，列出待确认项，等我确认后实现。\n\n'+goalPrompt(project().draft),{edit:true})}<p class="fine-print">可以直接编辑指令。更改上方字段会重新生成，已保存的版本会保留。</p>`) +
        group('卡住时，让 ChatGPT 先问你',box('clarify','需求澄清',()=> '我只有初步想法。请每次只问我一个影响方向的问题，帮我明确目标、受众、场景、内容、风格与功能。最后整理成可以给 Codex 的开发指令。')+platformLinks('chat'));
    },
    4() {
      const [retro,favorite,large,fixed] = ['remixTheme','remixFavorite','remixTitle','remixFixed'].map(name=>project()[name]);
      return group('改动前先选范围',choices(operationCards,view.remixTab,'remix-tab')+`
        <div class="remix-demo ${retro?'retro':''}"><div><small>WEEKEND ROAST</small><h3 class="${large?'larger':''}">A Good Day<br>for Coffee.</h3><p>两种烘焙，找到今天的一杯。</p>
        ${btn(fixed?'查看今日咖啡':'点我 · 问题示例','simulate-remix')}${favorite?btn('✓ 已收藏','remix-favorite'):''}</div><div class="demo-shape" aria-hidden="true"></div></div>
        <p class="fine-print">预设模拟。已试 ${project().remix.filter(Boolean).length} / 4 个修改。</p>
        ${btn(['切换复古风','加入收藏按钮','放大主标题','修复无效按钮'][view.remixTab],'apply-remix',view.remixTab,'primary')}`) +
        group('用截图定位问题',basicForm(feedbackFields,'feedback')+media('iteration','上传前后对比截图，可编号标注')+box('feedback','局部修改指令',remixPrompt)+fieldNotes('真实修改结果','iterationResult','例如：手机端按钮变大，桌面布局与转场保持。')+btn('记录这次迭代','iteration-add','', 'primary'));
    },
    5() {
      const [file,title,copy] = C.files[view.structure];
      return group('点开网站的文件树',`<div class="file-demo">${choices(C.files.map(item=>item[0]),view.structure,'structure')}<article><code>${file}</code><h3>${title}</h3><p>${copy}</p></article></div><p class="fine-print">这是简单静态站的示意。项目可能把多个部分写在同一个文件里。</p>`) +
        group('掌控修改范围和版本',`<p>上下文是 AI 理解作品需要的背景。版本是一个可以找回的状态，Git 是常见的版本记录工具。把运行方法、重要决定和改动写进 README，换对话时可以交接。</p>`+box('control','先解释计划，再修改',()=> '先阅读当前项目和 README，用新手能懂的话解释你要做什么、影响哪些文件、如何预览和恢复。等我确认范围再修改。')) +
        group('三道权限与预览判断题',quiz('safety',C.safety));
    },
    6() {
      addFlowRefresh('sections');
      return group('写清楚谁来、为什么来',`<div class="fields">${field('项目名称','name')}${field('项目类型','brief.type',{type:'select',choices:['个人作品集','品牌网站','主题创意网站','数字工具','自定义']})}</div>${basicForm(briefFields.slice(0,8),'brief')}${btn('从第 3 课带入已有想法','reuse-draft')}`) +
        group('排出内容的阅读顺序',orderEditor('sections','添加内容模块'),'用上下箭头换顺序。示意会随你的修改更新。') +
        group('请 ChatGPT 写每个区块',box('brief','内容架构指令',()=> `为以下需求完善网站信息架构。为每个区块写目标、标题、实际文案和与下一块的关系。未知事实写待确认。先输出内容方案。\n\n${briefText()}\n\n${sectionText()}`)+platformLinks('chat')+fieldNotes('把确认好的内容方案粘回来','brief.copy'));
    },
    7() {return designLesson();},
    8() {return interactionLesson();},
    9() {
      refreshers.push(() => {
        const values = project().scores;
        const count = values.filter(Boolean).length;
        main.querySelector('[data-review-score]').textContent = count ? `教学自评 ${Math.round(values.reduce((a,b)=>a+b,0)/40*100)} / 100 · 已评 ${count} / 8` : '选分后查看自评';
      });
      return group('汇总前面几课的内容',box('master','网站开发总指令',master)+platformLinks('codex')+skills+`<p class="fine-print">修改前面的需求或视觉参数后，这里的指令会一起更新。保存的版本可在工作台回看。</p>`) +
        group('实际打开并检查',checks(C.qa,'qa')+field('项目地址','final.url',{placeholder:'粘贴实际已打开的地址'})+field('交付版本','final.version',{placeholder:'例如 v0.1 · 核心流程完成'})) +
        group('用八个维度自评',`<div class="fields score-fields">${C.review.map((item,i)=>field(item,`scores.${i}`,{type:'range',min:0,max:5})).join('')}</div><p data-review-score></p>${box('review','生成下一次优化指令',()=> '请优先改这三个我评分较低的维度，并发同尺寸截图验证：'+C.review.map((label,i)=>[label,project().scores[i]]).filter(([,score])=>score>0).sort((a,b)=>a[1]-b[1]).slice(0,3).map(([label,score])=>`${label} ${score}/5`).join('；'))}`,'0 表示未评。分数用于记录自己的判断。');
    },
    10() {return proposalLesson();},
    11() {return conceptLesson();},
    12() {
      return group('选一个交付方向',field('毕业作品类型','final.kind',{type:'select',choices:['原创网站','商业创意方案','现有工作数字化']})+
        box('graduation','最终创作指令',()=>project().final.kind==='原创网站'?master():creativeMaster())+platformLinks('codex')) +
        group('按八项能力做一个回顾',`<div class="assessment">${C.abilities.map((ability,i)=>`<div>${check(ability,`assessment.${i}`)}${field('一句反思',`reflections.${i}`,{placeholder:'这件事我是怎么做的？'})}</div>`).join('')}</div>`) +
        group('把作品留在自己的档案',`<div class="fields">${field('作品地址','final.url')}${field('交付版本','final.version')}${fieldNotes('作品说明与创作心得','final.notes')}</div>${media('final','上传毕业作品截图')}${check('我已打开最终作品，并测试核心路径','final.ready')}${link('查看毕业作品档案','portfolio','button-link')}`);
    }
  };
  function mastery(number) {
    if (state.completed.includes(number)) return {pass:true};
    const p = project();
    const values = {
      1:[p.firstChecks.every(Boolean),'请先确认已发送、打开并操作自己的作品。'],
      2:[Object.keys(state.quiz.team).length===6 && C.team.filter((item,i)=>state.quiz.team[i]===item[1]).length>=5,'完成六道情景题，并至少答对五题。'],
      3:[p.draft.idea.trim() && p.draft.audience.trim() && p.saved.some(item=>item.title==='我的创作指令' && item.text.includes(p.draft.idea)),'填写创作内容与受众，并保存自己的指令。'],
      4:[p.remix.every(Boolean) && p.iterationRecords.length>0,'试过四种修改，并记录一次在真实作品上的迭代。'],
      5:[view.structure>=0 && Object.values(state.quiz.safety).filter(value=>value===0).length===3,'完成三道权限与预览判断。'],
      6:[p.brief.idea.trim() && p.brief.audience.trim() && p.brief.goal.trim() && p.sections.filter(item=>item.trim()).length>=3,'填项目、受众与目标，并留下至少三个内容模块。'],
      7:[p.designTouched.length>=2 && p.designSaved,'操作至少两组视觉参数，再保存设计规范。'],
      8:[p.interactions.length>0 && p.flows.filter(item=>item.trim()).length>=2,'加入一个交互，写出至少两个用户操作步骤。'],
      9:[p.qa.every(Boolean) && p.final.url.trim() && p.final.version.trim(),'打开实际作品，完成五项检查，记录地址和版本。'],
      10:[p.saved.some(item=>item.title==='数字表达起始指令'),'比较两种表达，再保存一个场景的起始指令。'],
      11:[p.concept.pick.trim() && p.concept.big.trim() && p.concept.journey.trim() && p.story.filter(item=>item.trim()).length>=3 && p.saved.some(item=>item.title==='创意概念说明'),'选定创意，写核心创意与参与体验，保存概念，并排出至少三个叙事模块。'],
      12:[p.final.ready && p.final.url.trim() && p.final.version.trim() && p.assessment.every(Boolean),'记录可访问地址、版本，确认实测并完成八项自评。']
    };
    const [pass,message] = values[number] ?? [false,''];
    return {pass:Boolean(pass),message};
  }
  function luminance(color) {
    const values = color.slice(1).match(/../g).map(hex => parseInt(hex,16)/255);
    const linear = values.map(value=>value<=.04045 ? value/12.92 : ((value+.055)/1.055)**2.4);
    return .2126*linear[0]+.7152*linear[1]+.0722*linear[2];
  }
  function paintDesign() {
    const sample = main.querySelector('.design-sample');
    if (!sample) return;
    const d = project().design;
    sample.dataset.layout = d.layout;
    sample.dataset.style = d.style;
    sample.dataset.motion = matchMedia('(prefers-reduced-motion: reduce)').matches ? 'none' : d.motion;
    sample.dataset.device = view.device;
    const values = {
      bg:d.bg,ink:d.ink,primary:d.accent,support:d.support,highlight:d.highlight,font:d.font==='serif'?'Georgia,serif':'Inter Tight,system-ui,sans-serif',
      size:`${d.size}px`,weight:d.weight,body:`${d.bodySize}px`,leading:d.leading,tracking:`${d.tracking}px`,
      space:`${d.space}px`,width:`${d.width}%`,ratio:`${d.ratio/(100-d.ratio)}fr`, gap:`${d.gap}px`,radius:`${d.radius}px`,align:d.align,
      duration:`${d.duration}ms`,timing:d.ease
    };
    Object.entries(values).forEach(([name,value])=>sample.style.setProperty('--sample-'+name,value));
    const scores = [luminance(d.bg),luminance(d.ink)].sort((a,b)=>b-a);
    const contrast = (scores[0]+.05)/(scores[1]+.05);
    const label = main.querySelector('[data-contrast]');
    if (label) {
      label.textContent = `文字对比度 ${contrast.toFixed(2)} : 1 · ${contrast>=4.5?'普通正文达到 4.5:1':'建议调深正文色或调浅背景色'}`;
      label.className = contrast>=4.5?'success':'notice';
    }
  }
  function playSample() {
    const d = project().design;
    const element = main.querySelector('.sample-copy');
    if (!element || matchMedia('(prefers-reduced-motion: reduce)').matches || d.motion==='none') return;
    demoMotion?.cancel();
    const frames = {fade:[{opacity:0},{opacity:1}],slide:[{opacity:0,transform:'translateY(22px)'},{opacity:1,transform:'none'}],scale:[{opacity:0,transform:'scale(.86)'},{opacity:1,transform:'scale(1)'}],lift:[{transform:'none'},{transform:'translateY(-8px)'},{transform:'none'}],scroll:[{opacity:0,transform:'translateY(32px)'},{opacity:1,transform:'none'}]};
    demoMotion = element.animate(frames[d.motion] ?? frames.fade,{duration:d.duration,delay:d.delay,easing:d.ease,fill:'backwards'});
  }
  function designLesson() {
    const tabs = ['风格','色彩','字体','布局','动效','参考','前后对比'];
    const panels = {
      风格:()=> choices(C.styles.map(item=>item[0]),project().design.style,'pick-style')+'<p class="fine-print">同一份内容，比较五种字体、色彩、留白和构图。</p>',
      色彩:()=> `<div class="fields">${[['背景色','bg'],['正文色','ink'],['主色','accent'],['辅助色','support'],['强调色','highlight']].map(([label,name])=>field(label,'design.'+name,{type:'color'})).join('')}</div><p data-contrast></p>`,
      字体:()=> `<div class="fields">${field('标题字体','design.font',{type:'select',choices:[['serif','衬线'],['sans','无衬线']]})}${field('标题字号','design.size',{type:'range',min:24,max:72})}${field('标题字重','design.weight',{type:'range',min:400,max:900,step:100})}${field('正文字号','design.bodySize',{type:'range',min:12,max:22})}${field('正文行距','design.leading',{type:'range',min:1,max:2.4,step:.1})}${field('标题字距','design.tracking',{type:'range',min:-7,max:3})}</div>`,
      布局:()=> `<div class="fields">${field('首屏布局','design.layout',{type:'select',choices:layoutTypes})}${field('对齐方式','design.align',{type:'select',choices:[['left','左对齐'],['center','居中']]})}${field('四周留白','design.space',{type:'range',min:12,max:60})}${field('最大内容宽度','design.width',{type:'range',min:55,max:100})}${field('文字占比','design.ratio',{type:'range',min:32,max:76})}${field('区块间距','design.gap',{type:'range',min:4,max:42})}${field('圆角','design.radius',{type:'range',min:0,max:26})}</div>`,
      动效:()=> `<div class="fields">${field('动画类型','design.motion',{type:'select',choices:motionTypes})}${field('时长（毫秒）','design.duration',{type:'range',min:150,max:1400,step:50})}${field('延迟（毫秒）','design.delay',{type:'range',min:0,max:700,step:50})}${field('速度变化','design.ease',{type:'select',choices:[['ease-out','先快后慢'],['linear','匀速'],['ease-in-out','慢起慢停']]})}</div>${btn('重播动效','play-sample')}<p class="fine-print">滚动出现可在示例底部的滚动区触发。系统开启减少动态效果时展示静态内容。</p><div class="motion-scroll" tabindex="0" aria-label="滚动出现练习"><span>向下滚动查看</span><strong>内容在这里出现。</strong></div>`,
      参考:()=> fieldNotes('喜欢什么、保留什么、改哪里','design.ref','例如：保留笔记本镜头和票据，替换屏幕上的课程内容。')+
        `<div class="lab-actions reference-links">${[['Awwwards','https://www.awwwards.com/'],['Behance','https://www.behance.net/'],['Dribbble','https://dribbble.com/'],['Pinterest','https://www.pinterest.com/'],['Mobbin','https://mobbin.com/']].map(([name,url])=>`<a href="${url}" target="_blank" rel="noopener">${name} ↗</a>`).join('')}</div>`+media('reference','添加 Moodboard 参考图'),
      前后对比:()=> choices(['标题层级','颜色与留白','模块布局'],view.compare,'compare')+choices(['修改前','修改后'],view.after?1:0,'compare-after')+
        `<div class="comparison compare-${view.compare} ${view.after?'improved':'before'}"><small>STUDIO 01.</small><strong>Make Ideas Come Alive.</strong><p>让每个创意都成为可以体验的作品。</p><div><span>选择一个作品</span><span>写一句任务</span><span>打开预览</span></div></div><p class="fine-print">${['强化标题与正文的字号差异，引导从主张读到说明。','减少竞争色，把留白放在组与组之间。','让主要动作更突出，次要步骤保持轻量。'][view.compare]}</p>`
    };
    refreshers.push(paintDesign);
    return group('同一页，换一种感觉',`
      <div class="design-toolbar">${choices(tabs,tabs.indexOf(view.designTab),'design-tab')}${btn(view.device==='desktop'?'切换手机预览':'切换桌面预览','design-device')}</div>
      <div class="design-lab"><div class="design-controls">${panels[view.designTab]()}</div><div class="sample-frame"><div>STUDIO 01. <span>实时视觉预览</span></div>
      <div class="design-sample"><div class="sample-inner"><div class="sample-copy"><small>INDIE CREATIVE STUDIO</small><strong>Make Ideas Come Alive.</strong><p>让每一个创意，都成为可以感知的体验。</p>${btn('Start Creating','sample-button')}</div><div class="sample-art" aria-hidden="true"><i></i><i></i><i></i></div></div></div></div></div>`) +
      group('保存一套可以复用的视觉规则',fieldNotes('为什么选这套视觉？','design.why')+box('design','设计规范 Design Brief',designText));
  }
  function diagram() {
    const values = view.chart===0 ? [32,65,48] : [74,45,58];
    return `<div class="mini-chart" aria-label="示例数据柱状图">${values.map((value,index)=>`<span><b>${value}</b><i style="--height:${value}%"></i><small>${['A','B','C'][index]}</small></span>`).join('')}</div>`;
  }
  function interactionDemo(index) {
    const demos = [
      () => btn(`点我确认 · ${view.clicks}`,'demo-click','','primary'),
      () => '<details class="help-detail"><summary>单页网站是什么？</summary><p>从首屏到行动入口，内容都在一个地址里，通过滚动或锚点访问。</p></details>',
      () => choices(['品牌','产品','故事'],view.tab,'demo-tab')+`<p>${['我们做清晰易懂的网页。','我们的第一个产品是一套可跟做课程。','这套课程从一次真实的 Laptop Dive 改版开始。'][view.tab]}</p>`,
      () => btn(view.card?'创作流程：想法 → 指令 → 预览 → 测试。点击收起':'查看「第一个网站」的详情','demo-card','','interactive-example'),
      () => '<label class="field">调整数值 <input data-demo-slider type="range" min="0" max="100" value="45"></label><progress data-demo-fill value="45" max="100"></progress> <output data-demo-value>45</output>',
      () => '<label class="field">搜索资源 <input data-demo-search type="search" placeholder="试试输入：视觉"></label><label class="field">分类 <select data-demo-filter><option>全部</option><option>设计</option><option>开发</option></select></label><ul data-demo-results><li>视觉参考 · 设计</li><li>布局练习 · 设计</li><li>启动预览 · 开发</li></ul>',
      () => btn('打开详情','demo-modal')+'<dialog class="example-dialog" aria-label="组件详情"><strong>这是详情弹窗</strong><p>关闭后会回到刚才的按钮。也可以按 Escape。</p><form method="dialog"><button>关闭详情</button></form></dialog>',
      () => choices(['访问量','完成量'],view.chart,'demo-chart')+diagram()+'<p class="fine-print">示例数据，用于比较切换效果。</p>',
      () => '<div class="story-scroll" tabindex="0" aria-label="滚动体验"><p>01 / 先看见网站价值</p><p>02 / 探索主要内容</p><p>03 / 决定下一步行动</p></div>',
      () => '<form data-form="interaction" class="demo-form" novalidate><label class="field">项目标题 <input name="title" required placeholder="至少写两个字"></label><button>提交示例</button><p role="status" data-form-response></p></form>'
    ];
    return demos[index]();
  }
  function interactionLesson() {
    const [title,info,prompt] = C.interactions[view.interaction];
    addFlowRefresh('flows');
    return group('试用真实网页组件',choices(C.interactions.map(item=>item[0]),view.interaction,'interaction')+
      `<div class="interaction-bench"><h3>${title}</h3><p>${info}</p>${interactionDemo(view.interaction)}</div><div class="lab-actions">${btn(project().interactions.includes(view.interaction)?'已加入 · 移除':'加入我的项目','toggle-interaction',view.interaction,'primary')}${btn('复制组件实现指令','copy', 'interaction')}</div>`+
      box('interaction','组件实现指令',()=>`请实现「${title}」。${prompt}在桌面与手机上实际操作一次。给输入、空结果和失败提供可见反馈。`))+
      group('排出用户操作顺序',orderEditor('flows','添加操作步骤',{flow:true}),'先试默认路径。填写每个步骤的目标和系统反馈。')+
      group('检查已选交互',`<p>${project().interactions.length ? project().interactions.map(i=>C.interactions[i][0]).join(' · ') : '先加入一个能帮助访客完成任务的交互。'}</p>`);
  }
  const pitchFacts = ['先在周末到店。','选好口味后取得一个印章。','集齐 3 枚印章后查看礼遇。'];
  function proposalLesson() {
    const [issue,traditional,digital,example,limit] = C.scenes[view.scene];
    return group('同一个项目，两种表达',choices(['线性演示','交互提案'],view.pitch?1:0,'pitch')+
      `<div class="pitch-demo ${view.pitch?'pitch-interactive':''}"><small>虚构教学案例 / WEEKEND COFFEE</small><h3>周末咖啡护照</h3><p>邀请年轻人周末到店探索，用打卡体验建立参与感。</p>
      ${view.pitch ? choices(['到店','盖章','解锁'],view.pitchStep,'pitch-step')+`<p>${pitchFacts[view.pitchStep]}</p>` : `<ol>${pitchFacts.map(item=>'<li>'+item+'</li>').join('')}</ol>`}
      <p class="fine-print">示例数值，仅演示流程。</p>${view.pitch?'<label class="field">试试积累印章 <input data-demo-slider type="range" min="0" max="3" value="0"></label><progress data-demo-fill value="0" max="3"></progress> <output data-demo-value>0</output>':'<p>任务目标：3 枚印章。</p>'}</div>`)+
      group('换成你自己的工作场景',choices(C.scenes.map(item=>item[0]),view.scene,'scene')+
        `<div class="compare-grid"><article><b>常见表达</b><p>${traditional}</p></article><article><b>交互表达</b><p>${digital} · ${example}</p></article></div><p>${limit}</p>`+
        box('expression','数字表达起始指令',()=>`把我的「${issue}」做成${digital}。保留已确认的${traditional}，用「${example}」让用户亲手体验。列出所需素材。原始数据不全时标为待确认。`))+
      group('这座网站就是一个案例','<p>VIBE LAB 把一份静态培训 SOP 变成可操作的实验、实时指令、保存进度和作品档案。Laptop Dive 是进实验室的开场，课内的操作和反馈承担教学。</p>');
  }
  const ideationSteps = [
    ['Brief · 任务','说清背景、目标和约束。'],['Insight · 洞察','找到用户实际遇到的问题。'],['Ideation · 发散','试不同的参与机制。'],['Selection · 筛选','比较价值、风险和资源。'],['Concept · 概念','形成一条明确的创意主张。'],['Prototype · 原型','做出可以被体验的关键环节。'],['Validation · 验证','收集反馈，确认哪项假设成立。']
  ];
  const ideaMetrics = ['创新性','用户价值','品牌匹配','执行可行','传播潜力'];
  function conceptLesson() {
    addFlowRefresh('story');
    refreshers.push(() => {
      project().ideas.forEach((idea,i)=>{
        const weightTotal = project().weights.reduce((acc,value)=>acc+value,0);
        const score = main.querySelector(`[data-idea-score="${i}"]`);
        const weighted = weightTotal ? idea.scores.reduce((acc,value,j)=>acc+value*project().weights[j],0)/weightTotal : 0;
        if (score) score.textContent = weightTotal ? weighted.toFixed(1)+' / 5' : '请设置至少一项权重';
        const bar = main.querySelector(`[data-idea-bar="${i}"]`);
        if (bar) bar.value = weighted;
      });
    });
    const demonstration = [
      `<strong>咖啡城市护照</strong><p>每次到店盖一枚章。集齐三枚后查看礼遇。</p><progress max="3" value="${view.stamps}"></progress><p>${view.stamps}/3 · ${view.stamps===3?'已解锁示例礼遇':'等待下一次打卡'}</p>${btn(view.stamps===3?'重新开始':'到店盖章','stamp', '', 'primary')}`,
      '<strong>陌生人咖啡桌</strong><p>用刚好够轻松的问题开始聊天。</p>'+btn('抽一张话题卡','draw-topic')+`<p>${['你会给今天的咖啡起什么名字？','周末只留一小时，你会怎么安排？','最近有什么小事值得庆祝？'][Math.max(0,view.tab%3)]}</p>`,
      '<strong>周末情绪咖啡实验室</strong><p>从心情试选一杯。</p>'+choices(['放松','专注','兴奋'],view.tab%3,'demo-tab')+`<p>${['建议试低咖啡因燕麦拿铁，口感柔和。','建议试干净明亮的手冲，适合慢慢喝。','建议试加冰浓缩气泡饮，清爽有层次。'][view.tab%3]}</p>`
    ];
    return group('从任务走到验证',choices(ideationSteps.map(item=>item[0]),view.ideaStep,'idea-step')+
      `<blockquote>${ideationSteps[view.ideaStep][1]}</blockquote><p>虚构练习：一家咖啡品牌希望增加年轻人周末到访，预算有限。哪些人会参加，为什么愿意分享？</p>${btn('填入咖啡挑战','coffee-example')}`+
      choices(C.ideas.map(item=>item[0]),view.ideaDemo,'idea-demo')+`<div class="interaction-bench">${demonstration[view.ideaDemo]}</div>`)+
      group('请 ChatGPT 发散，再由你选择',basicForm(conceptFields.slice(0,6),'concept')+
        box('ideate','商业创意发散指令',()=> `为下面的商业任务提出五种有明显区别的创意。分别写参与机制、用户价值、品牌价值、资源、风险和可以验证的数字原型。请区分事实与假设。\n\n${textLines(conceptFields.slice(0,6).map(([label,name])=>[label,project().concept[name]]))}`)+platformLinks('chat')+
        '<p class="fine-print">把 ChatGPT 的结果填进下方创意卡。权重和分数用于团队讨论。</p>'+
        `<details class="help-detail"><summary>调整评分权重</summary><div class="fields">${ideaMetrics.map((label,i)=>field(label,`weights.${i}`,{type:'range',min:0,max:5})).join('')}</div></details>
        <div class="idea-matrix">${project().ideas.map((idea,i)=>`<details class="help-detail"><summary>${esc(idea.name || '未命名创意')} <span data-idea-score="${i}"></span></summary><progress aria-label="创意评分" max="5" data-idea-bar="${i}"></progress>
        <div class="fields">${field('创意名称',`ideas.${i}.name`)}${fieldNotes('创意机制',`ideas.${i}.detail`)}</div><div class="fields">${ideaMetrics.map((label,j)=>field(label,`ideas.${i}.scores.${j}`,{type:'range',min:1,max:5})).join('')}</div>
        <div class="lab-actions">${btn('选择这个创意','select-idea',i,'primary')}${btn('移除','remove-idea',i)}</div></details>`).join('')}</div>${btn('添加一个创意','add-idea')}`)+
      group('把创意写成可讲、可体验的方案',field('选定方向','concept.pick')+basicForm(conceptFields.slice(6),'concept')+
        orderEditor('story','添加叙事模块',{story:true})+box('concept','创意概念说明',conceptText));
  }

  const vibe = [
    ['V','Vision / 构想','我想让刚接触 AI 的人，亲手完成第一个网页。','先帮我把目标用户、核心任务和成功标准写清楚。'],
    ['I','Instruction / 表达','把「保留开场动效」「更换课程内容」分别写清，让 AI 知道哪些决策已经确定。','先读附件，列出要保留的镜头、要替换的内容和实现限制。'],
    ['B','Build / 创造','先做一条可以操作的路径，再接完整界面。','先实现从首页进入第一课、完成一个操作并返回。请实际打开预览。'],
    ['E','Evaluate & Evolve / 评估迭代','在手机上亲手走一次，把最明显的障碍拍下来，再改一处并重测。','按截图检查该按钮，在不影响其他流程的范围内修改，再发同尺寸截图。']
  ];
  const moods = [['更温暖','warm'],['更有未来感','future'],['像时尚杂志','editorial'],['更大胆','bold']];
  const debugFields = [['出现在哪个页面','page'],['怎么重现','steps'],['实际发生什么','actual'],['期望发生什么','expected'],['报错信息（选填）','error'],['需要保留什么','preserve']];
  const debugText = () => `请先复现下面的问题，定位原因，再在最小范围内修改并按步骤重测。\n\n问题：${C.rescue[view.debugIssue][0]}\n${textLines(debugFields.map(([label,name])=>[label,view.debug[name]]))}\n\n请说明根因、验证结果和受影响文件。保留其它内容、设计和功能。`;
  const views = {
    journey() {
      return header('LEARNING JOURNEY','你的创作路线','先掌握 Vibe Coding，再把同一套方法用在网站和商业创意上。') +
        `<div class="journey-list">${C.chapters.map((chapter,i)=>{
          const numbers = Array.from({length:chapter.last-chapter.first+1},(_,index)=>chapter.first+index);
          const complete = numbers.filter(n=>state.completed.includes(n)).length;
          return `<article class="journey-row" style="--row-accent:${chapter.color}"><div class="journey-number">0${i+1}</div><div><span>${chapter.subject}</span><h2>${chapter.title} <small>${chapter.name}</small></h2><p>${chapter.intro}</p><progress value="${complete}" max="${numbers.length}" aria-label="${chapter.name}篇章进度"></progress><span>${complete} / ${numbers.length} 节完成</span></div>${link('进入篇章',`lesson-${nextLesson(i)}`,'button-link')}</article>`;
        }).join('')}</div>` +
        group('先看看你能做什么',`<div class="lab-actions">${link('试一次创作演示','try','button-link')}${link('打开作品灵感墙','inspiration','button-link')}</div>`) +
        group('你的第一个作品，从一句话开始。',link('继续我的创作',`lesson-${state.current}`,'button-link primary'));
    },
    try() {
      return header('INTERACTIVE DEMO','一句话改变网页','点一句描述，观察字体、颜色、构图和按钮如何一起变化。模拟演示使用预设规则。')+
        `<div class="mini-vibe"><div class="mini-instructions"><span class="lab-kicker">描述你想要的变化</span>${choices(moods.map(item=>item[0]),view.demo,'try-mood')}<p>已应用：让作品${moods[view.demo][0]}。</p></div>
        <div class="mini-website vibe-${moods[view.demo][1]}"><span>STUDIO 01</span><strong>Make Ideas<br>Come Alive.</strong><p>让创意成为可以感知的体验。</p>${link('开始第一次创作','lesson-1','button-link')}<i aria-hidden="true"></i></div></div>`+
        group('重新理解数字创作',choices(['传统制作','Vibe Coding'],view.structure%2,'coding-type')+
          `<div class="flow-strip">${(view.structure%2 ? ['想法','描述需求','AI 协助实现','体验与迭代','作品'] : ['想法','学习编程','编写代码','测试','作品']).map(item=>'<span>'+item+'</span>').join('<b aria-hidden="true">→</b>')}</div>`)+
        group('V.I.B.E. 创作循环',choices(vibe.map(item=>item[0]),view.loop,'loop')+
          `<div class="callout"><h3>${vibe[view.loop][1]}</h3><p>${vibe[view.loop][2]}</p></div>`+
          box('loop',vibe[view.loop][1]+'示范指令',()=>vibe[view.loop][3],{save:false}), '这四步是本课程采用的框架。每次实测之后，你都可以回头重新描述和修改。')+
        `<div class="lab-actions">${link('开始第一次创作','lesson-1','button-link primary')}${link('探索学习路线','journey','button-link')}</div>`;
    },
    workspace() {
      const p = project();
      return header('MY CREATIVE WORKSPACE','我的工作台','需求、设计和交互会自动保存到当前浏览器。清理浏览器数据前，记得导出备份。') +
        `<div class="lab-actions project-picker"><label>切换项目 <select data-project-select>${state.projects.map(item=>`<option value="${attr(item.id)}"${item.id===p.id?' selected':''}>${esc(item.name)}</option>`).join('')}</select></label>
        ${btn('新建项目','new-project','','primary')}${btn('复制项目','clone-project')}${btn('删除项目','delete-project','','danger')}</div>
        <div class="fields">${field('当前项目名称','name')}</div><div class="lab-actions">${link('继续学习',`lesson-${state.current}`,'button-link')}${link('我的毕业作品','portfolio','button-link')}</div>`+
        group('当前项目的开发资料',`
          <details class="help-detail"><summary>网站需求和内容架构</summary>${basicForm(briefFields,'brief')}${orderEditor('sections','添加内容模块')}${fieldNotes('已确认的内容方案','brief.copy')}</details>
          <details class="help-detail"><summary>设计规范和参考图</summary>${fieldNotes('参考的保留和改动点','design.ref')}${media('reference','添加设计参考')}${box('ws-design','实时设计规范',designText)}${link('编辑全部视觉参数','lesson-7','button-link')}</details>
          <details class="help-detail"><summary>交互清单和用户路径</summary><p>${p.interactions.length?p.interactions.map(i=>C.interactions[i][0]).join(' / '):'还没有加入交互'}</p>${orderEditor('flows','添加用户步骤',{flow:true})}${link('进入交互实验室','lesson-8','button-link')}</details>
          <details class="help-detail"><summary>实时生成的网站开发总指令</summary>${box('ws-master','网站开发总指令',master)}</details>
          <details class="help-detail"><summary>创意方案与叙事</summary>${box('ws-creative','创意方案开发指令',creativeMaster)}${link('编辑创意概念','lesson-11','button-link')}</details>`) +
        group('已保存的指令版本',p.saved.length ? `<div class="saved-list">${p.saved.map((item,i)=>`<details class="help-detail"><summary>${esc(item.title)} <span>${esc(item.category)} · ${esc(item.date)}</span></summary>${field('指令名称',`saved.${i}.title`)}${field('分类',`saved.${i}.category`)}${fieldNotes('指令正文',`saved.${i}.text`)}<div class="lab-actions">${btn('复制这条','copy-saved',i)}${btn('移除指令','remove-saved',i)}</div></details>`).join('')}</div>` : '<p>现在还没有保存的指令。在任一课点击「保存至工作台」，就能在这里找到它。</p>') +
        group('迭代和交付',`${p.iterationRecords.length ? '<ol class="records">'+p.iterationRecords.map(item=>`<li><strong>${esc(item.date)}</strong><p>${esc(item.result)}</p><details><summary>查看修改指令</summary><pre>${esc(item.text)}</pre></details></li>`).join('')+'</ol>':'<p>还没有迭代记录。完成一次真实修改后，记下改前和改后的结果。</p>'}${media('iteration','添加迭代截图')}${check('最终作品已实测','final.ready')}${field('作品地址','final.url')}${field('交付版本','final.version')}${fieldNotes('交付说明','final.notes')}${checks(C.qa,'qa')}`) +
        group('备份和恢复',`<div class="lab-actions">${btn('导出项目和学习数据','export')}${btn('导入备份','import-launch')}${btn('重置学习记录','reset-progress','','danger')}<input class="sr-only" tabindex="-1" type="file" accept=".json,application/json" data-import></div>`);
    },
    resources() {
      return header('CREATOR RESOURCES','创作资源','遇到下一步不知道怎么说时，找一条能立即用的指令。')+
        `<div class="lab-actions">${link('AI 急救室','rescue','button-link')}${link('作品灵感墙','inspiration','button-link')}</div>
        <div class="resource-tools">${field('搜索指令','search',{ephemeral:true,placeholder:'例如：截图、交付、配色',type:'search'})}
          ${field('分类','category',{ephemeral:true,type:'select',choices:['全部',...new Set(C.prompts.map(item=>item[1]))]})}
          ${btn(view.favoritesOnly?'显示全部':'只看收藏','filter-favorites')}</div><div class="resource-list" data-library-list></div>`;
    },
    rescue() {
      return header('AI RESCUE CENTER','Stuck? Let’s Fix It.','先复现，再按范围修。把现象、步骤和预期一起发给 Codex。')+
        `<div class="rescue-issues">${C.rescue.map(([name,advice],i)=>`<details class="help-detail"><summary>${name}</summary><p>${advice}</p>${btn('用这个问题生成指令','debug-choose',i)}</details>`).join('')}</div>`+
        group('生成修复指令',`<p>当前问题 <strong>${C.rescue[view.debugIssue][0]}</strong></p><div class="fields">${debugFields.map(([label,name])=>field(label,'debug.'+name,{ephemeral:true})).join('')}</div>${box('debug','修复指令',debugText)}${platformLinks('codex')}`);
    },
    inspiration() {
      const [name,value,scenario,difficulty] = C.inspiration[view.inspo];
      return header('WHAT CAN YOU CREATE?','作品灵感墙','选一个你真想做的作品，先跑一个能体验的动作。')+
        `<div class="inspiration-wall">${C.inspiration.map(([title],i)=>`<button data-action="inspo" data-value="${i}"${selected(i===view.inspo)}><div class="inspo-mini type-${i}" aria-hidden="true"><i></i><span></span><em></em></div><strong>${title}</strong></button>`).join('')}</div>`+
        group(name,`<p>${value}。适用场景：${scenario}。难度：${difficulty}。</p>`+box('inspiration','起始创作指令',()=>`请帮我做一个「${name}」的最小可用原型，目标是${value}。先梳理受众、一个核心流程和验收标准，再做可点击的第一版。`));
    },
    portfolio() {
      const p = project();
      const url = previewURL(p.final.url || p.firstUrl);
      return header('CREATOR PORTFOLIO',p.final.ready?'You Are a Creator.':'我的创作档案','这里的数字来自你的学习和项目记录。')+
        `<div class="stats-strip"><div><b>${state.completed.length}/12</b><span>完成课程</span></div><div><b>${state.projects.length}</b><span>项目</span></div><div><b>${state.projects.reduce((a,item)=>a+item.saved.length,0)}</b><span>保存指令</span></div><div><b>${state.projects.reduce((a,item)=>a+item.iterationRecords.length,0)}</b><span>迭代记录</span></div></div>`+
        group(esc(p.name),`<p>${esc(p.final.notes || p.firstNote || '完成作品后，在第 12 课记录你的创作心得。')}</p><p>${esc(p.final.kind)} · ${esc(p.final.version || '版本待记录')}</p>${url?`<a class="button-link primary" href="${attr(url)}" target="_blank" rel="noopener">查看我的作品 ↗</a>`:link('填写交付资料','lesson-12','button-link')}${media('final','添加作品截图')}${media('first','第一次创作截图')}`)+
        group('能力记录',`<p>${assessmentText()}</p><div class="ability-list">${C.abilities.map((label,i)=>`<div><span>${label}</span><progress aria-label="${label}" value="${p.assessment[i]?1:0}" max="1"></progress><b>${p.assessment[i]?'已确认':'待确认'}</b><p>${esc(p.reflections[i])}</p></div>`).join('')}</div>`)+
        `<div class="lab-actions">${btn('导出我的创作档案','export')}${btn('开始新项目','new-project')}${link('回顾学习路线','journey','button-link')}${p.final.ready?btn('下载创作纪念卡','certificate'):''}</div>`;
    }
  };
  function previewURL(value) {
    try {const url = new URL(value);return ['https:','http:'].includes(url.protocol) ? url.href : '';}
    catch {return '';}
  }
  function libraryResults() {
    const target = main.querySelector('[data-library-list]');
    if (!target) return;
    const pattern = view.search.trim().toLocaleLowerCase();
    const filtered = C.prompts.map((item,i)=>[...item,i]).filter(([name,category,text,index]) =>
      (view.category==='全部'||category===view.category) && (!view.favoritesOnly||state.favorites.includes(index)) && [name,category,text].some(word=>word.toLocaleLowerCase().includes(pattern))
    );
    target.innerHTML = filtered.length ? filtered.map(([title,category,text,index])=>`<details class="help-detail resource-prompt"><summary>${title} <span>${category}</span></summary><label class="field"><span>编辑后再使用</span><textarea data-library-text="${index}" rows="4" maxlength="8000">${esc(text)}</textarea></label>
      <div class="lab-actions">${btn('复制','library-copy',index)}${btn('加入当前项目','library-save',index)}${btn(state.favorites.includes(index)?'取消收藏':'收藏','favorite-prompt',index)}</div></details>`).join('') : '<p>没有找到符合条件的指令。试试换个词或切换分类。</p>';
  }

  let dbPromise;
  function database() {
    dbPromise ??= new Promise((resolve,reject)=>{
      const request = indexedDB.open('vibe-lab-media',1);
      request.onupgradeneeded = () => request.result.createObjectStore('images');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    return dbPromise;
  }
  async function imageStore(mode,action) {
    const db = await database();
    return new Promise((resolve,reject)=>{
      const transaction = db.transaction('images',mode);
      const request = action(transaction.objectStore('images'));
      transaction.oncomplete = () => resolve(request.result);
      transaction.onerror = transaction.onabort = () => reject(transaction.error);
    });
  }
  const getImage = key => imageStore('readonly',store=>store.get(key));
  const putImage = (key,blob) => imageStore('readwrite',store=>store.put(blob,key));
  const removeImage = key => imageStore('readwrite',store=>store.delete(key));
  function media(groupName, label) {
    const p = project();
    return `<div class="media-section"><label class="media-upload">${label}<input data-upload="${groupName}" type="file" accept="image/png,image/jpeg,image/webp,image/gif"></label>
      <div class="media-grid">${p.media.map((item,index)=>({item,index})).filter(({item})=>item.group===groupName).map(({item,index})=>`<figure>
        <div class="media-picture" data-image-id="${attr(item.id)}" data-media-index="${index}">
          <img alt="${attr(item.name)}" hidden><span class="image-placeholder">正在读取本地图片…</span>
          ${item.group==='iteration'?item.marks.map(({x,y},i)=>`<i class="image-mark" style="left:${x}%;top:${y}%">${i+1}</i>`).join(''):''}</div>
        <figcaption><strong>${esc(item.name)}</strong>${field('备注',`media.${index}.note`)}
        <div class="lab-actions">${item.group==='iteration'?`${btn('添加中心标记','mark-center',index)}${item.marks.length?btn('移除末尾标记','remove-mark',index)+btn('导出标注图','export-marked',index):''}`:`${btn('向前','move-image',index+':-1')}${btn('向后','move-image',index+':1')}`}${btn('移除图片','remove-image',index)}</div></figcaption></figure>`).join('')}</div>
      <p class="fine-print">图片保存在当前浏览器。${groupName==='iteration'?'点击图片可添加编号。':''}</p></div>`;
  }
  function clearImages() {
    imageURLs.forEach(url=>URL.revokeObjectURL(url));
    imageURLs = [];
  }
  function syncImages() {
    for (const holder of main.querySelectorAll('[data-image-id]')) {
      getImage(holder.dataset.imageId).then(blob=>{
        if (!holder.isConnected || !dialog.open) return;
        if (!blob) {holder.querySelector('.image-placeholder').textContent='当前浏览器找不到这张图片。';return;}
        const url = URL.createObjectURL(blob);
        imageURLs.push(url);
        const image = holder.querySelector('img');
        image.src = url;
        image.hidden = false;
        holder.querySelector('.image-placeholder').hidden = true;
      }).catch(()=>{holder.querySelector('.image-placeholder').textContent='浏览器无法读取本地图片。';});
    }
    if (route==='resources') libraryResults();
    if (route==='workspace') ['sections','flows'].forEach(addFlowRefresh);
  }
  function fileData(file) {
    return new Promise((resolve,reject)=>{
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }
  function download(name,body,type) {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(body instanceof Blob ? body : new Blob([body],{type}));
    link.download = name;
    link.click();
    setTimeout(()=>URL.revokeObjectURL(link.href),1000);
  }
  async function exportData() {
    const snapshot = JSON.parse(JSON.stringify(state));
    const pictures = {};
    for (const image of snapshot.projects.flatMap(item=>item.media)) {
      try {const blob = await getImage(image.id); if (blob) pictures[image.id] = await fileData(blob);} catch {}
    }
    download('vibe-lab-backup.json',JSON.stringify({data:snapshot,pictures},null,2),'application/json');
    toast('已导出项目、进度与可读取的图片。');
  }
  async function importData(file) {
    if (!file || file.size>70_000_000) throw Error('请选择小于 70 MB 的备份');
    const raw = JSON.parse(await file.text());
    const incoming = normalize(raw.data ?? raw);
    if (!confirm('导入会替换当前浏览器中的工作台数据。确认恢复此备份？')) return;
    const written = [];
    try {
      for (const image of incoming.projects.flatMap(item=>item.media)) {
        const encoded = raw.pictures?.[image.id];
        if (typeof encoded !== 'string' || encoded.length>7_100_000 || !/^data:image\/(png|jpeg|webp|gif);base64,[a-z0-9+/=]+$/i.test(encoded)) continue;
        const blob = await (await fetch(encoded)).blob();
        image.id = id();
        await putImage(image.id,blob);
        written.push(image.id);
      }
    } catch {
      for (const imageId of written) await removeImage(imageId).catch(()=>{});
      throw Error('图片恢复失败，当前项目未更改');
    }
    const previous = state;
    state = incoming;
    save();
    if (!storageOK) {state=previous;for (const imageId of written) await removeImage(imageId).catch(()=>{});throw Error('本地空间不足，备份尚未恢复');}
    render();
    toast('备份已恢复。');
  }

  function localDate() {
    return new Intl.DateTimeFormat('zh-CN',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  }
  async function copyText(text,area) {
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(text);
      else throw Error();
    } catch {
      const temporary = area ?? document.createElement('textarea');
      if (!area) {
        temporary.value = text;
        temporary.className = 'sr-only';
        dialog.append(temporary);
      }
      temporary.focus();
      temporary.select();
      let done = false;
      try {done = document.execCommand('copy');} catch {}
      if (!area) temporary.remove();
      if (!done) {toast(area?'请按 Ctrl/Cmd + C 复制已选文字。':'浏览器拒绝复制。');return;}
    }
    toast('指令已复制。');
  }
  function keepPrompt(title,text,category) {
    if (!text.trim()) {toast('先写一条可以保存的指令。');return;}
    const p = project();
    if (!p.saved.some(item=>item.title===title && item.text===text)) p.saved.unshift({id:id(),title,text,category,date:localDate()});
    save();
    refresh();
    toast('已保存到当前项目的指令版本。');
  }
  function updateProject() {
    save();
    render();
  }
  function markDesign(property) {
    if (!project().designTouched.includes(property)) project().designTouched.push(property);
    project().designSaved = false;
  }
  function addMark(index,x,y) {
    const item = project().media[index];
    if (!item || item.group!=='iteration') return;
    if (item.marks.length>=20) {toast('一张图最多添加 20 个标记。');return;}
    item.marks.push({x:Math.max(0,Math.min(100,x)),y:Math.max(0,Math.min(100,y))});
    updateProject();
  }
  async function exportMarked(index) {
    const item = project().media[index];
    const source = item && await getImage(item.id);
    if (!source) throw Error('没有找到原始图片。');
    const bitmap = await createImageBitmap(source);
    const canvas = document.createElement('canvas');
    const scale = Math.min(1,3200/Math.max(bitmap.width,bitmap.height));
    canvas.width = Math.max(1,Math.round(bitmap.width*scale));
    canvas.height = Math.max(1,Math.round(bitmap.height*scale));
    const painter = canvas.getContext('2d');
    painter.drawImage(bitmap,0,0,canvas.width,canvas.height);
    bitmap.close();
    const radius = Math.max(10,Math.min(canvas.width,canvas.height)*.023);
    item.marks.forEach(({x,y},i)=>{
      const cx=Math.max(radius,Math.min(canvas.width-radius,x*canvas.width/100));
      const cy=Math.max(radius,Math.min(canvas.height-radius,y*canvas.height/100));
      painter.beginPath();
      painter.arc(cx,cy,radius,0,2*Math.PI);
      painter.fillStyle='#ff7139';
      painter.fill();
      painter.strokeStyle='#fff';
      painter.lineWidth=Math.max(2,radius*.13);
      painter.stroke();
      painter.fillStyle='#191919';
      painter.font=`700 ${Math.round(radius)}px system-ui`;
      painter.textAlign='center';
      painter.textBaseline='middle';
      painter.fillText(i+1,cx,cy);
    });
    const result=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
    if (!result) throw Error('浏览器无法导出这张标注图。');
    download('vibe-lab-feedback.png',result,'image/png');
    toast('已导出带编号的截图。');
  }
  function moveItem(values,index,delta) {
    if (delta===0) return values.splice(index,1);
    if (index+delta<0 || index+delta>=values.length) return;
    [values[index],values[index+delta]] = [values[index+delta],values[index]];
  }
  function setView(name) {return value => {view[name]=Number(value);render();};}
  function toggleView(name) {return () => {view[name]=!view[name];render();};}
  const actions = {
    close:()=>close(),
    'save-project':()=>{save();toast(storageOK?'项目资料已保存在当前浏览器。':'本地保存失败，请导出备份。');},
    complete(value) {
      const number = Number(value);
      if (!mastery(number).pass) return;
      const firstCompletion = !state.completed.includes(number);
      if (firstCompletion) state.completed.push(number);
      save();
      show(number<12 ? 'lesson-'+(number+1) : 'portfolio',true);
      if (firstCompletion) toast(number===1?'恭喜，你完成了自己的第一个 AI 作品。':number===12?'毕业作品已记录。':`第 ${number} 课已完成。`);
    },
    copy(name) {
      const area = main.querySelector(`[data-output="${name}"]`);
      return copyText(area?.value ?? outputs.get(name).getText(),area);
    },
    'save-prompt'(name) {
      const entry = outputs.get(name);
      if (name==='design') project().designSaved = true;
      const area = main.querySelector(`[data-output="${name}"]`);
      keepPrompt(entry.title,area?.value ?? entry.getText(),entry.category);
    },
    starter(value) {
      if (project().starter===Number(value)) return;
      project().starter=Number(value);
      project().firstPrompt='';
      updateProject();
    },
    os(value) {project().os=Number(value)?'Windows':'macOS';updateProject();},
    plant(_,event,button) {
      const box = button.getBoundingClientRect();
      const position = (point,start,length)=>Math.min(95,Math.max(5,(point-start)/length*100));
      const center = event.detail===0;
      const flower = {x:center?20+Math.random()*60:position(event.clientX,box.left,box.width),y:center?20+Math.random()*60:position(event.clientY,box.top,box.height),n:view.flowers.length%4};
      view.flowers = [...view.flowers.slice(-39),flower];
      const plant = document.createElement('i');
      plant.className = 'plant plant-'+flower.n;
      plant.style.left=flower.x+'%';
      plant.style.top=flower.y+'%';
      button.append(plant);
      if (button.children.length>40) button.firstElementChild.remove();
    },
    'clear-garden':()=>{view.flowers=[];render();},
    identity:toggleView('dark'),
    draw:()=>{view.cardIndex=(view.cardIndex+1+Math.floor(Math.random()*(ideaDeck.length-1)))%ideaDeck.length;render();},
    'favorite-idea':()=>{const index=view.cardIndex;const p=project();p.demoFavorites=p.demoFavorites.includes(index)?p.demoFavorites.filter(i=>i!==index):[...p.demoFavorites,index];updateProject();},
    'pick-mood':value=>{view.mood=['平静','兴奋','疲惫'][Number(value)];render();},
    'remove-mood':value=>{project().demoMoodNotes.splice(Number(value),1);updateProject();},
    answer(value) {
      const [type,index,answer] = value.split(':');
      state.quiz[type][index]=Number(answer);
      updateProject();
    },
    'reset-quiz'(value) {state.quiz[value]={};updateProject();},
    'prompt-level':setView('promptLevel'),
    'draft-example':()=>{project().draft={...blankBrief(),...draftExample};project().draftCustom='';updateProject();},
    'draft-clear':()=>{project().draft=blankBrief();project().draftCustom='';updateProject();},
    'remix-tab':setView('remixTab'),
    'apply-remix'(value) {
      const index = Number(value);
      const fields = ['remixTheme','remixFavorite','remixTitle','remixFixed'];
      project()[fields[index]] = true;
      project().remix[index] = true;
      updateProject();
    },
    'simulate-remix':()=>toast(project().remixFixed?'已打开示例：今天推荐浅焙咖啡。':'示例中的按钮没有连接目标。试试「修复无效按钮」。'),
    'remix-favorite':()=>{project().remixFavorite=false;updateProject();},
    'iteration-add'() {
      const p = project();
      if (!p.feedback.position.trim() || !p.feedback.problem.trim() || !p.iterationResult.trim()) {
        toast('请写清位置、问题和实际修改结果。');return;
      }
      p.iterationRecords.unshift({text:remixPrompt(),result:p.iterationResult,date:localDate()});
      p.iterationResult='';
      updateProject();
      toast('已记录这次迭代。');
    },
    structure:setView('structure'),
    'add-order'(property) {
      const p = project();
      if (p[property].length>=30) {toast('最多保留 30 项。');return;}
      p[property].push('新'+({sections:'模块',flows:'步骤',story:'叙事模块'}[property]));
      if (property==='story') p.storyForms.push('图文排版');
      updateProject();
    },
    'reuse-draft'() {
      const p=project();
      if (!p.draft.idea && !p.draft.audience) {
        toast('第 3 课还没有填过自己的想法。');
        return;
      }
      for(const name of ['idea','audience','goal','features','limits','accept','copy']) {
        if(!p.brief[name].trim()) p.brief[name]=p.draft[name];
      }
      if (!p.design.ref.trim()) p.design.ref=p.draft.value;
      updateProject();
      toast('已带入空白字段，保留当前项目已有内容。');
    },
    order(value) {
      const [property,indexText,deltaText] = value.split(':');
      const index = Number(indexText);
      const delta = Number(deltaText);
      const p = project();
      if (property==='story') moveItem(p.storyForms,index,delta);
      if (property==='flows') {
        const notes = p.flows.map((_,i)=>p.flowDetail[i]??'');
        moveItem(notes,index,delta);
        p.flowDetail = Object.fromEntries(notes.entries());
      }
      moveItem(p[property],index,delta);
      view.flow = Math.max(0,Math.min(view.flow,p.flows.length-1));
      updateProject();
    },
    'flow-detail':setView('flow'),
    'design-tab'(value) {
      view.designTab=['风格','色彩','字体','布局','动效','参考','前后对比'][Number(value)];
      render();
    },
    'pick-style'(value) {
      const style = Number(value);
      const [,bg,ink,accent,font,layout,size] = C.styles[style];
      Object.assign(project().design,{style,bg,ink,accent,font,layout,size,support:['#ddd8cb','#ebc9b0','#c5cdf0','#cab6ff','#e4e8ed'][style],highlight:['#d9f477','#f4cfaa','#d9e0ff','#e9d8ff','#f5e4e5'][style],space:[32,24,32,26,27][style],radius:[0,19,5,2,8][style],align:style===1?'center':'left'});
      markDesign('风格');
      updateProject();
    },
    'design-device':()=>{view.device=view.device==='desktop'?'phone':'desktop';render();},
    'play-sample':()=>playSample(),
    'sample-button':()=>toast('这是视觉预览。课程按钮在真正的项目中应链接到第一步。'),
    compare:setView('compare'),
    'compare-after':value=>{view.after=Boolean(Number(value));render();},
    interaction:setView('interaction'),
    'demo-click':()=>{view.clicks++;render();},
    'demo-tab':setView('tab'),
    'demo-card':toggleView('card'),
    'demo-chart':setView('chart'),
    'demo-modal':()=>main.querySelector('.example-dialog').showModal(),
    'toggle-interaction'(value) {
      const index=Number(value);
      const p=project();
      p.interactions=p.interactions.includes(index)?p.interactions.filter(i=>i!==index):[...p.interactions,index];
      updateProject();
      toast(p.interactions.includes(index)?'组件已加入当前项目。':'组件已从项目中移除。');
    },
    pitch:value=>{view.pitch=Boolean(Number(value));render();},
    'pitch-step':setView('pitchStep'),
    scene:setView('scene'),
    'idea-step':setView('ideaStep'),
    'idea-demo':setView('ideaDemo'),
    stamp:()=>{view.stamps=(view.stamps+1)%4;render();},
    'draw-topic':()=>{view.tab=(view.tab+1)%3;render();},
    'coffee-example'() {
      Object.assign(project().concept,{background:'虚构咖啡品牌希望增加周末门店到访',audience:'有周末社交需求的年轻消费者',goal:'增加到店并鼓励自然分享',insight:'待验证：年轻人想找在地社交活动，但参与门槛过高',advantage:'拥有多家可供探索的门店',limit:'预算有限，所有经营数字均待确认'});
      updateProject();
    },
    'add-idea'() {project().ideas.push({name:'新创意',detail:'',scores:list(5,3)});updateProject();},
    'remove-idea'(value) {project().ideas.splice(Number(value),1);updateProject();},
    'select-idea'(value) {
      const idea=project().ideas[Number(value)];
      project().concept.pick=idea.name;
      project().concept.big=idea.name;
      project().concept.mechanism=idea.detail;
      updateProject();
      toast('选定方向已填入创意概念。');
    },
    'try-mood':setView('demo'),
    'coding-type':setView('structure'),
    loop:setView('loop'),
    inspo:setView('inspo'),
    'debug-choose'(value) {
      view.debugIssue=Number(value);
      render();
      const field=main.querySelector('[data-bind="debug.page"]');
      field.scrollIntoView({block:'center'});
      field.focus({preventScroll:true});
    },
    'filter-favorites':toggleView('favoritesOnly'),
    'library-copy'(value) {
      const area=main.querySelector(`[data-library-text="${value}"]`);
      return copyText(area.value,area);
    },
    'library-save'(value) {
      const [title,category] = C.prompts[Number(value)];
      keepPrompt(title,main.querySelector(`[data-library-text="${value}"]`).value,category);
    },
    'favorite-prompt'(value,_,button) {
      const index=Number(value);
      state.favorites=state.favorites.includes(index)?state.favorites.filter(i=>i!==index):[...state.favorites,index];
      save();
      if (view.favoritesOnly) libraryResults();
      else button.textContent=state.favorites.includes(index)?'取消收藏':'收藏';
      toast(state.favorites.includes(index)?'已收藏。':'已取消收藏。');
    },
    'copy-saved'(value) {return copyText(project().saved[Number(value)].text);},
    'remove-saved'(value) {project().saved.splice(Number(value),1);updateProject();},
    'new-project'() {
      const item=newProject(`新项目 ${state.projects.length+1}`);
      state.projects.push(item);
      state.active=item.id;
      save();
      show('workspace',true);
      main.querySelector('[data-bind="name"]').focus();
      toast('项目已创建。请填写名称。');
    },
    async 'clone-project'() {
      const source=structuredClone(project());
      const copied=[];
      try {
        for (const picture of source.media) {
          const blob=await getImage(picture.id);
          if (!blob) continue;
          picture.id=id();
          await putImage(picture.id,blob);
          copied.push(picture.id);
        }
      } catch {
        for (const item of copied) await removeImage(item).catch(()=>{});
        throw Error('未能复制项目图片');
      }
      source.id=id();
      source.name+='（副本）';
      state.projects.push(source);
      state.active=source.id;
      updateProject();
      toast('已复制为独立项目。');
    },
    'delete-project'() {
      if (state.projects.length<2) {toast('请至少保留一个项目。');return;}
      const item=project();
      if (!confirm(`确认删除「${item.name}」及其本地资料？`)) return;
      const retained=new Set(state.projects.filter(project=>project.id!==item.id).flatMap(project=>project.media.map(image=>image.id)));
      item.media.forEach(image=>{if(!retained.has(image.id)) removeImage(image.id).catch(()=>{});});
      state.projects=state.projects.filter(p=>p.id!==item.id);
      state.active=state.projects[0].id;
      updateProject();
    },
    export:()=>exportData(),
    'import-launch':()=>main.querySelector('[data-import]').click(),
    'reset-progress'() {
      if(!confirm('重置课程完成、当前位置和测验记录？已保存的项目资料会保留。')) return;
      state.completed=[];
      state.current=1;
      state.quiz={team:{},safety:{}};
      updateProject();
    },
    'mark-center':value=>addMark(Number(value),50,50),
    'export-marked':value=>exportMarked(Number(value)),
    'remove-mark'(value) {project().media[Number(value)].marks.pop();updateProject();},
    'move-image'(value) {
      const [i,d]=value.split(':').map(Number);
      const items=project().media;
      const positions=items.map((item,index)=>item.group===items[i].group?index:-1).filter(index=>index>=0);
      const next=positions[positions.indexOf(i)+d];
      if(next===undefined) return;
      [items[i],items[next]]=[items[next],items[i]];
      updateProject();
    },
    'remove-image'(value) {
      const item=project().media.splice(Number(value),1)[0];
      if (!state.projects.some(p=>p.media.some(image=>image.id===item.id))) removeImage(item.id).catch(()=>{});
      updateProject();
    },
    certificate() {
      const p=project();
      download('vibe-lab-creator.svg',`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 600"><rect width="1000" height="600" fill="#0b2f20"/><path d="M32 32H968V568H32Z" fill="none" stroke="#d9f477"/><text x="75" y="120" fill="#d9f477" font-size="32" font-family="sans-serif">VIBE LAB. / CREATOR RECORD</text><text x="75" y="265" fill="#fff" font-size="72" font-family="sans-serif">You Are a Creator.</text><text x="75" y="360" fill="#fff" font-size="34" font-family="sans-serif">${esc(p.name).slice(0,150)}</text><text x="75" y="475" fill="#d9f477" font-size="25" font-family="sans-serif">${state.completed.length} / 12 lessons · ${localDate()}</text><text x="75" y="526" fill="#fff" font-size="21" font-family="sans-serif">Personal course record</text></svg>`,'image/svg+xml');
    }
  };
  document.addEventListener('click',event=>{
    const routeElement=event.target.closest('[data-route]');
    if (routeElement) {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      show(routeElement.dataset.route,true);
      return;
    }
    const button=event.target.closest('[data-action]');
    if (!button || button.disabled) return;
    const handler=actions[button.dataset.action];
    if (handler) Promise.resolve().then(()=>handler(button.dataset.value, event, button)).catch(error=>toast(error.message || '这次操作没有完成。'));
  });
  main.addEventListener('click',event=>{
    const image=event.target.closest('.media-picture img');
    if (!image) return;
    const bounds=image.getBoundingClientRect();
    addMark(Number(image.parentElement.dataset.mediaIndex),(event.clientX-bounds.left)/bounds.width*100,(event.clientY-bounds.top)/bounds.height*100);
  });
  function bindInput(input) {
    const path=input.dataset.bind;
    if (!safePath(path)) return;
    const data=input.hasAttribute('data-ephemeral')?view:project();
    const value=input.type==='checkbox'?input.checked:input.type==='range'?Number(input.value):input.value;
    if (input.hasAttribute('data-hex') && !/^#[\da-f]{6}$/i.test(value)) {
      input.setCustomValidity('输入 # 加六位十六进制数字，例如 #F7F5EF。');return;
    }
    input.setCustomValidity('');
    write(data,path,value);
    if (input.type==='color' || input.hasAttribute('data-hex')) {
      for(const pair of input.parentElement.querySelectorAll('[data-bind]')) if(pair!==input) pair.value=value;
    }
    if (data===project()) {
      if (path.startsWith('design.')) markDesign(view.designTab);
      if (path.startsWith('draft.')) project().draftCustom='';
      save();
      if(path==='name') {
        const option=main.querySelector('[data-project-select]')?.selectedOptions[0];
        if(option) option.textContent=value || '未命名项目';
        const projectLabel=aside.querySelector('.lab-aside-foot strong');
        if(projectLabel) projectLabel.textContent=value || '未命名项目';
      }
    }
    if (path==='search' || path==='category') libraryResults();
    refresh();
  }
  main.addEventListener('input',event=>{
    const input=event.target;
    if(input.dataset.bind) bindInput(input);
    if(input.dataset.output==='first' && !input.readOnly) {project().firstPrompt=input.value;save();}
    if(input.dataset.output==='draft' && !input.readOnly) {project().draftCustom=input.value;save();}
    if(input.hasAttribute('data-demo-slider')) {
      const section=input.closest('.interaction-bench,.pitch-demo');
      section.querySelector('[data-demo-fill]').value=input.value;
      section.querySelector('[data-demo-value]').value=input.value;
    }
    if(input.hasAttribute('data-demo-filter') || input.hasAttribute('data-demo-search')) {
      const bench=input.closest('.interaction-bench');
      const term=bench.querySelector('[data-demo-search]').value.trim();
      const category=bench.querySelector('[data-demo-filter]').value;
      const results=[['视觉参考','设计'],['布局练习','设计'],['启动预览','开发']].filter(([label,type])=>label.includes(term)&&(category==='全部'||category===type));
      bench.querySelector('[data-demo-results]').innerHTML=results.length?results.map(([label,type])=>`<li>${label} · ${type}</li>`).join(''):'<li>没有匹配结果</li>';
    }
  });
  main.addEventListener('change',async event=>{
    const input=event.target;
    try {
      if(input.hasAttribute('data-project-select')) {
        if(state.projects.some(p=>p.id===input.value)) {state.active=input.value;updateProject();}
      }
      if(input.hasAttribute('data-import')) {
        const file=input.files[0];
        if(file) await importData(file);
        input.value='';
      }
      if(input.hasAttribute('data-upload')) {
        const blob=input.files[0];
        if(!blob) return;
        if(!/^image\/(png|jpeg|webp|gif)$/.test(blob.type) || blob.size>5_000_000) throw Error('请选择小于 5 MB 的 JPG、PNG、WebP 或 GIF。');
        const p=project();
        const picture={id:id(),group:input.dataset.upload,name:blob.name,note:'',marks:[]};
        await putImage(picture.id,blob);
        if(!state.projects.includes(p)) {await removeImage(picture.id);return;}
        p.media.push(picture);
        updateProject();
        toast('图片已保存到当前浏览器。');
      }
    } catch(error) {input.value='';toast(error.message || '无法读取该文件。');}
  });
  main.addEventListener('submit',event=>{
    const type=event.target.dataset.form;
    if(!type) return;
    event.preventDefault();
    const data=new FormData(event.target);
    if(type==='mood') {
      const note=String(data.get('note')??'').trim();
      if(note) {project().demoMoodNotes.unshift({mood:view.mood,note});updateProject();toast('演示记录已保存。');}
    }
    if(type==='interaction') {
      const title=String(data.get('title')??'').trim();
      const status=event.target.querySelector('[data-form-response]');
      status.textContent=title.length<2?'至少写两个字再提交。':`提交成功：${title}`;
      status.className=title.length<2?'notice':'success';
    }
  });
  main.addEventListener('scroll',event=>{
    if(event.target.matches('.motion-scroll') && event.target.scrollTop>24 && project().design.motion==='scroll' && !event.target.classList.contains('revealed')) {
      event.target.classList.add('revealed');
      playSample();
    }
  },true);
  // INPUT AND ACTIONS

  window.VibeLab = {renderDeck,nextLesson,currentLesson:()=>state.current,open:value=>show(value,true),close,isOpen:()=>dialog.open};
  updateProgress();
  if (routeOK(location.hash.slice(1))) show(location.hash.slice(1),false);
})();
