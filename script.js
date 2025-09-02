/* script.js: Vanilla JS implementation of the React/Tailwind demo UI
   - Basic routing between sections (feed, discover, profile, messages, settings)
   - Sidebar open/close, modal toggles, like buttons, tip amounts
   - Creator open sets profile data
*/

const AVATARS = [
    "https://i.pravatar.cc/150?img=1",
    "https://i.pravatar.cc/150?img=2",
    "https://i.pravatar.cc/150?img=3",
    "https://i.pravatar.cc/150?img=4",
    "https://i.pravatar.cc/150?img=5",
  ];
  const PHOTOS = Array.from({ length: 12 }).map((_, i) => `https://picsum.photos/seed/only${i}/800/600`);
  
  const state = {
    active: 'feed',
    sidebarOpen: false,
    subOpen: false,
    tipOpen: false,
    openCreator: null
  };
  
  /* ---- DOM refs ---- */
  const sidebar = document.getElementById('sidebar');
  const mobileOverlay = document.getElementById('mobile-overlay');
  const btnOpenSidebar = document.getElementById('btn-open-sidebar');
  const btnCloseSidebar = document.getElementById('btn-close-sidebar');
  const navItems = Array.from(document.querySelectorAll('.nav-item'));
  const bottomItems = Array.from(document.querySelectorAll('.bottom-item'));
  const pages = {
    feed: document.getElementById('page-feed'),
    discover: document.getElementById('page-discover'),
    profile: document.getElementById('page-profile'),
    messages: document.getElementById('page-messages'),
    settings: document.getElementById('page-settings')
  };
  const topAvatar = document.getElementById('top-avatar');
  const yearEl = document.getElementById('year');
  
  const subscribeModal = document.getElementById('subscribe-modal');
  const closeSubscribe = document.getElementById('close-subscribe');
  const confirmSub = document.getElementById('confirm-sub');
  
  const tipModal = document.getElementById('tip-modal');
  const closeTip = document.getElementById('close-tip');
  const tipAmounts = Array.from(document.querySelectorAll('.tip-amt'));
  const sendTip = document.getElementById('send-tip');
  
  /* init */
  topAvatar.src = AVATARS[2];
  yearEl.textContent = new Date().getFullYear();
  
  /* Sidebar open / close for mobile */
  btnOpenSidebar.addEventListener('click', () => {
    sidebar.classList.add('open');
    mobileOverlay.classList.remove('hidden');
  });
  if (btnCloseSidebar) btnCloseSidebar.addEventListener('click', closeSidebar);
  mobileOverlay.addEventListener('click', closeSidebar);
  function closeSidebar(){
    sidebar.classList.remove('open');
    mobileOverlay.classList.add('hidden');
  }
  
  /* Navigation click handlers */
  navItems.forEach(btn => btn.addEventListener('click', (e) => {
    const k = btn.getAttribute('data-key');
    setActive(k);
    closeSidebar();
  }));
  bottomItems.forEach(b => b.addEventListener('click', () => {
    const k = b.getAttribute('data-key');
    setActive(k);
  }));
  
  function setActive(key){
    state.active = key;
    // highlight nav
    navItems.forEach(n => n.classList.toggle('active', n.getAttribute('data-key') === key));
    bottomItems.forEach(b => b.classList.toggle('active', b.getAttribute('data-key') === key));
    // show/hide pages
    Object.keys(pages).forEach(k => {
      if (k === key) pages[k].classList.remove('hidden'); else pages[k].classList.add('hidden');
    });
    // render selected page (if needed)
    if (key === 'feed') renderFeed();
    if (key === 'discover') renderDiscover();
    if (key === 'profile') renderProfile();
    if (key === 'messages') renderMessages();
    if (key === 'settings') renderSettings();
  }
  
  /* ---------- Data and Renderers ---------- */
  
  /* Post sample data (mimicking React version) */
  const samplePosts = [
    { id: 1, type: "image", cover: PHOTOS[0], caption: "Sunset set sneak peek ☀️", locked: false, time: "2h ago", creator: { name: "Lina", avatar: AVATARS[0], verified: true }},
    { id: 2, type: "video", cover: PHOTOS[1], caption: "New vlog dropped!", locked: true, time: "5h ago", creator: { name: "Mika", avatar: AVATARS[1], verified: false }},
    { id: 3, type: "image", cover: PHOTOS[2], caption: "BTS from today’s shoot", locked: true, time: "1d ago", creator: { name: "Ava", avatar: AVATARS[3], verified: true }},
  ];
  
  function createEl(tag, cls, html){
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    if (html !== undefined) el.innerHTML = html;
    return el;
  }
  
  /* PostCard renderer */
  function createPostCard(post){
    const card = createEl('article', 'card');
    // meta
    const meta = createEl('div','meta');
    const avatar = createEl('img');
    avatar.src = post.creator.avatar;
    avatar.alt = post.creator.name;
    meta.appendChild(avatar);
    const creatorWrap = createEl('div','creator');
    const nameRow = createEl('div','name');
    nameRow.innerHTML = `<div style="display:flex;gap:8px;align-items:center"><strong>${post.creator.name}</strong>${post.creator.verified?'<span class="badge">Verified</span>':''}</div><div class="muted" style="font-size:12px">${post.time}</div>`;
    creatorWrap.appendChild(nameRow);
    meta.appendChild(creatorWrap);
    const moreBtn = createEl('button','icon-btn');
    moreBtn.innerHTML = `<svg viewBox="0 0 24 24" width="14" height="14"><circle cx="12" cy="6" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="12" cy="18" r="1.6"/></svg>`;
    meta.appendChild(moreBtn);
    card.appendChild(meta);
  
    // cover / media
    if (post.locked){
      const lockWrap = createEl('div','lock-overlay');
      lockWrap.innerHTML = `<svg viewBox="0 0 24 24" width="42" height="42" fill="none" style="color:#9ca3af"><path d="M12 17v0" stroke="currentColor"/><path d="M7 10V8a5 5 0 0110 0v2" stroke="currentColor"/></svg>`;
      const subscribeBtn = createEl('button','btn primary full');
      subscribeBtn.textContent = 'Subscribe to unlock';
      subscribeBtn.addEventListener('click', ()=> openSubscribe());
      lockWrap.appendChild(subscribeBtn);
      card.appendChild(lockWrap);
    } else if (post.type === 'video') {
      const vwrap = createEl('div','aspect-video');
      const img = createEl('img');
      img.src = post.cover;
      vwrap.appendChild(img);
      const playBtn = createEl('button','icon-btn');
      playBtn.style.position = 'absolute';
      playBtn.style.left = '50%';
      playBtn.style.top = '50%';
      playBtn.style.transform = 'translate(-50%,-50%)';
      playBtn.innerHTML = `<svg viewBox="0 0 24 24" width="30" height="30"><path d="M5 3v18l15-9z" fill="#fff"/></svg>`;
      vwrap.appendChild(playBtn);
      card.appendChild(vwrap);
    } else {
      const cover = createEl('div','cover');
      const img = createEl('img');
      img.src = post.cover;
      img.alt = post.caption;
      cover.appendChild(img);
      card.appendChild(cover);
    }
  
    // body
    const body = createEl('div','body');
    const p = createEl('p','','' + post.caption);
    body.appendChild(p);
  
    // actions
    const actions = createEl('div','actions');
    const likeBtn = createEl('button','btn');
    likeBtn.innerHTML = `<svg viewBox="0 0 24 24" width="14" height="14"><path d="M12 21s-7-4.35-9-7A5.5 5.5 0 013 8.5 5.5 5.5 0 018.5 3 5.5 5.5 0 0112 5.6 5.5 5.5 0 0115.5 3 5.5 5.5 0 0121 8.5c0 2.65-4 6.5-9 12z"/></svg> <span class="like-text">Like</span>`;
    likeBtn.addEventListener('click', () => {
      likeBtn.classList.toggle('liked');
      likeBtn.querySelector('.like-text').textContent = likeBtn.classList.contains('liked') ? 'Liked' : 'Like';
    });
    actions.appendChild(likeBtn);
  
    const commentBtn = createEl('button','btn');
    commentBtn.innerHTML = `<svg viewBox="0 0 24 24" width="14" height="14"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg> Comment`;
    actions.appendChild(commentBtn);
  
    const shareBtn = createEl('button','btn');
    shareBtn.innerHTML = `<svg viewBox="0 0 24 24" width="14" height="14"><path d="M4 12v7a1 1 0 001 1h14a1 1 0 001-1v-7"/><path d="M12 3v12"/></svg> Share`;
    actions.appendChild(shareBtn);
  
    const spacer = createEl('div','');
    spacer.style.flex = '1';
    actions.appendChild(spacer);
  
    const tipBtn = createEl('button','btn');
    tipBtn.textContent = 'Tip';
    tipBtn.addEventListener('click', ()=> openTip());
    actions.appendChild(tipBtn);
  
    body.appendChild(actions);
  
    card.appendChild(body);
    return card;
  }
  
  /* Feed render */
  function renderFeed(){
    const root = pages.feed;
    root.innerHTML = '';
    const grid = createEl('div','grid-feed');
    // left feed list
    const left = createEl('div','feed-list');
    samplePosts.forEach(p => left.appendChild(createPostCard(p)));
    grid.appendChild(left);
  
    // right column
    const right = createEl('div','right-column');
    // suggested creators
    const sug = createEl('div','card');
    sug.style.padding = '12px';
    sug.innerHTML = `<div style="font-weight:600;margin-bottom:8px">Suggested creators</div>`;
    const creatorsWrap = createEl('div','creator-grid');
    for(let i=0;i<4;i++){
      const c = {
        cover: PHOTOS[i+4],
        avatar: AVATARS[(i+1)%AVATARS.length],
        name: ["Luna","Kira","Nova","Aria"][i],
        verified: i%2===0,
        bio: "Daily sets • Behind the scenes • Q&A",
        price: (9.99 + i*3).toFixed(2)
      };
      const cc = createCreatorCard(c);
      creatorsWrap.appendChild(cc);
    }
    sug.appendChild(creatorsWrap);
    right.appendChild(sug);
  
    // trending tags
    const tags = createEl('div','card');
    tags.style.padding = '12px';
    tags.innerHTML = `<div style="font-weight:600;margin-bottom:8px">Trending tags</div>`;
    const tagWrap = createEl('div','');
    tagWrap.style.display = 'flex';
    tagWrap.style.flexWrap = 'wrap';
    tagWrap.style.gap = '8px';
    ['#bts','#fitness','#vlog','#travel','#studio'].forEach(t => {
      const s = createEl('span','');
      s.style.padding = '6px 8px';
      s.style.borderRadius = '10px';
      s.style.border = '1px solid var(--border)';
      s.style.background = '#f8fafc';
      s.style.fontSize = '12px';
      s.textContent = t;
      tagWrap.appendChild(s);
    });
    tags.appendChild(tagWrap);
    right.appendChild(tags);
  
    grid.appendChild(right);
    root.appendChild(grid);
  }
  
  /* CreatorCard (click to open profile) */
  function createCreatorCard(c){
    const btn = createEl('button','creator-card');
    btn.innerHTML = `<img src="${c.cover}" alt="${c.name}"><div class="info"><div class="row"><img src="${c.avatar}" style="height:34px;width:34px;border-radius:999px;object-fit:cover"/><div style="font-weight:600">${c.name}</div>${c.verified?'<span class="badge" style="margin-left:6px">Verified</span>':''}</div><div style="margin-top:8px;font-size:12px;color:var(--muted)">${c.bio}</div><div style="margin-top:8px;font-size:13px;display:flex;align-items:center;gap:8px"><svg viewBox="0 0 24 24" width="14" height="14"><path d="M3 12h18"/></svg><strong>$${c.price}/mo</strong></div></div>`;
    btn.addEventListener('click', ()=> {
      state.openCreator = {
        name: c.name, verified: c.verified, tagline: c.bio, price: c.price, avatar: c.avatar, banner: c.cover
      };
      setActive('profile');
    });
    return btn;
  }
  
  /* Discover render */
  function renderDiscover(){
    const root = pages.discover;
    root.innerHTML = '';
    const header = createEl('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.innerHTML = `<div style="font-weight:700;font-size:18px">Discover</div>`;
    root.appendChild(header);
  
    const grid = createEl('div');
    grid.style.display = 'grid';
    grid.style.gap = '12px';
    grid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(220px, 1fr))';
    grid.style.marginTop = '12px';
  
    for(let i=0;i<9;i++){
      const c = {
        cover: PHOTOS[(i+3)%PHOTOS.length],
        avatar: AVATARS[i%AVATARS.length],
        name: ["Jade","Ivy","Rin","Sia","Nori","Ari","Mila","Zoë","Yui"][i],
        verified: i%3===0,
        bio: "Exclusive shoots • Livestreams • Polls",
        price: (12.99 + (i%3)*4).toFixed(2)
      };
      grid.appendChild(createCreatorCard(c));
    }
    root.appendChild(grid);
  }
  
  /* Profile render */
  function renderProfile(){
    const root = pages.profile;
    root.innerHTML = '';
    const c = state.openCreator || {
      name: "Lina",
      verified: true,
      tagline: "Weekly sets • BTS • livestreams",
      price: "14.99",
      avatar: AVATARS[0],
      banner: PHOTOS[5]
    };
  
    // header
    const headerCard = createEl('div','profile-header card');
    headerCard.innerHTML = `<img src="${c.banner}" class="profile-banner" alt="banner"><img src="${c.avatar}" class="profile-avatar" alt="${c.name}">`;
    const info = createEl('div','profile-info');
    info.innerHTML = `<div style="flex:1"><div style="display:flex;align-items:center;gap:8px;font-weight:700;font-size:16px">${c.name}${c.verified?'<span class="badge" style="margin-left:8px">Verified</span>':''}</div><div class="muted">${c.tagline}</div></div><button id="subscribe-now" class="btn primary">Subscribe $${c.price}/mo</button>`;
    headerCard.appendChild(info);
    root.appendChild(headerCard);
  
    // paywall
    const payWrap = createEl('div','card');
    payWrap.style.padding = '12px';
    payWrap.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center"><div><div style="font-weight:600">Subscribe to unlock all content</div><div class="muted" style="font-size:13px">Full-resolution photos, videos, and DMs.</div></div><button id="pay-sub" class="btn primary">Subscribe $${c.price}/mo</button></div>`;
    root.appendChild(payWrap);
  
    // tabs + media grid
    const tabsCard = createEl('div','card');
    tabsCard.style.marginTop = '12px';
    tabsCard.style.padding = '12px';
    const tabs = createEl('div');
    tabs.innerHTML = `<div style="display:flex;gap:8px;margin-bottom:12px"><button class="btn" data-tab="posts">Posts</button><button class="btn" data-tab="videos">Videos</button><button class="btn" data-tab="likes">Likes</button></div>`;
    const content = createEl('div','profile-media');
    const mediaGrid = createEl('div','media-grid');
    PHOTOS.slice(0,9).forEach((s, i) => {
      const m = createEl('div');
      m.innerHTML = `<img src="${s}" alt="media-${i}">`;
      mediaGrid.appendChild(m);
    });
    content.appendChild(mediaGrid);
    tabsCard.appendChild(tabs);
    tabsCard.appendChild(content);
    root.appendChild(tabsCard);
  
    // attach subscribe handlers
    const subscribeNow = document.getElementById('subscribe-now');
    const paySub = document.getElementById('pay-sub');
    if (subscribeNow) subscribeNow.addEventListener('click', openSubscribe);
    if (paySub) paySub.addEventListener('click', openSubscribe);
  }
  
  /* Messages render */
  function renderMessages(){
    const root = pages.messages;
    root.innerHTML = '';
    const wrap = createEl('div','messages card');
    wrap.innerHTML = `<div class="header"><svg viewBox="0 0 24 24" width="16" height="16" style="margin-right:8px;"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg><strong>Messages</strong></div>`;
    const list = createEl('div','list');
    list.innerHTML = `<div style="display:flex;gap:8px;align-items:flex-end"><img src="${AVATARS[1]}" style="height:34px;width:34px;border-radius:999px"/><div style="background:#fff;padding:8px;border-radius:12px;border:1px solid var(--border);max-width:60%">Hey! Thanks for subscribing 💜</div></div>
    <div style="display:flex;gap:8px;align-items:flex-end;justify-content:flex-end;margin-top:14px"><div style="background:var(--indigo);color:#fff;padding:10px;border-radius:12px;max-width:60%">Loving the new set! When’s the next drop?</div><img src="${AVATARS[2]}" style="height:34px;width:34px;border-radius:999px"/></div>`;
    wrap.appendChild(list);
    const composer = createEl('div','composer');
    composer.innerHTML = `<input placeholder="Type a message…" class="input" style="flex:1;padding:8px;border-radius:18px;border:1px solid var(--border)"><button class="icon-btn" title="Attach"><svg viewBox="0 0 24 24" width="16" height="16"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg></button><button class="icon-btn" title="Send" style="background:var(--indigo);color:#fff"><svg viewBox="0 0 24 24" width="16" height="16"><path d="M22 2L11 13"/></svg></button>`;
    wrap.appendChild(composer);
  
    root.appendChild(wrap);
  }
  
  /* Settings render */
  function renderSettings(){
    const root = pages.settings;
    root.innerHTML = '';
    const acct = createEl('div','card settings');
    acct.style.padding = '12px';
    acct.innerHTML = `<div style="font-weight:600;margin-bottom:8px">Account</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
      <div><label class="small">Display name</label><input class="input" value="Lina"></div>
      <div><label class="small">Username</label><input class="input" value="@lina"></div>
      <div style="grid-column:1 / -1"><label class="small">Bio</label><textarea class="input" style="min-height:80px">Photographer & creator. New sets weekly.</textarea></div>
    </div>`;
    root.appendChild(acct);
  
    const sub = createEl('div','card settings');
    sub.style.padding = '12px';
    sub.style.marginTop = '12px';
    sub.innerHTML = `<div style="font-weight:600;margin-bottom:8px">Subscription</div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">
      <div style="border:1px solid var(--border);padding:8px;border-radius:10px"><div class="small">Monthly price</div><input class="input" value="$14.99"></div>
      <div style="border:1px solid var(--border);padding:8px;border-radius:10px"><div class="small">Auto-renew</div><select class="input"><option>Enabled</option><option>Disabled</option></select></div>
      <div style="border:1px solid var(--border);padding:8px;border-radius:10px"><div class="small">Promotions</div><button class="btn full">Create Discount</button></div>
    </div>`;
    root.appendChild(sub);
  }
  
  /* subscribe modal controls */
  function openSubscribe(){
    subscribeModal.classList.remove('hidden');
  }
  function closeSubscribeModal(){ subscribeModal.classList.add('hidden'); }
  closeSubscribe.addEventListener('click', closeSubscribeModal);
  confirmSub.addEventListener('click', () => { alert('This is a demo — subscription confirmed (not real).'); closeSubscribeModal(); });
  
  /* tip modal controls */
  function openTip(){ tipModal.classList.remove('hidden'); }
  function closeTipModal(){ tipModal.classList.add('hidden'); }
  closeTip.addEventListener('click', closeTipModal);
  tipAmounts.forEach(t => t.addEventListener('click', ()=> {
    tipAmounts.forEach(x=>x.classList.remove('active'));
    t.classList.add('active');
  }));
  sendTip.addEventListener('click', ()=> {
    const active = document.querySelector('.tip-amt.active');
    const custom = document.getElementById('tip-custom').value;
    const amount = (active && active.textContent) || (custom ? `$${custom}` : '$0');
    alert('Sent tip: ' + amount + ' (demo)');
    closeTipModal();
  });
  
  /* open tip via dynamic buttons: set event listeners globally */
  function openTipFromDom(){
    const tipButtons = document.querySelectorAll('.open-tip');
    tipButtons.forEach(b => b.addEventListener('click', openTip));
  }
  
  /* initial render */
  setActive('feed');
  
  /* helper: clicking Subscribe buttons created dynamically */
  document.addEventListener('click', (e) => {
    if (e.target.matches('#pay-sub') || e.target.matches('#subscribe-now') || e.target.closest('#pay-sub') || e.target.closest('#subscribe-now')) {
      openSubscribe();
    }
    // open tip if event target has class
    if (e.target.matches('.open-tip') || e.target.closest('.open-tip')) openTip();
  });
  