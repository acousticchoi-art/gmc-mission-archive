const INDEX_HTML = `<!doctype html><html lang="ko"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>GMC Mission Archive</title>
<style>
:root{--n:#17344f;--a:#b18a55;--bg:#f5f7f9;--line:#e1e7ec;--muted:#6d7883;--white:#fff;--danger:#a33d3d}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:#1d2a35;font-family:Arial,"Noto Sans KR",sans-serif}button,input,select,textarea{font:inherit}button{cursor:pointer}
header{height:70px;background:#fff;border-bottom:1px solid var(--line);display:flex;align-items:center;justify-content:space-between;padding:0 5%;position:sticky;top:0;z-index:5}.logo{font-weight:800;letter-spacing:.08em;color:var(--n)}.logo span{font-weight:400;color:#77828d}nav button{border:0;background:transparent;margin-left:14px;color:#56616b}.primary{color:var(--n);font-weight:700}
.hero{background:linear-gradient(135deg,#17344f,#2a4e6b);color:#fff;padding:70px 7vw}.hero-inner,.container{max-width:1120px;margin:auto}.eyebrow{font-size:11px;letter-spacing:.2em;opacity:.7}.hero h1{font-size:48px;margin:12px 0}.hero p{max-width:650px;opacity:.8}.search{display:flex;max-width:850px;background:#fff;border-radius:12px;overflow:hidden;margin-top:28px}.search input{flex:1;border:0;padding:18px;outline:0}.search button{border:0;background:var(--a);color:#fff;padding:0 28px;font-weight:bold}
.container{padding:38px 20px}.title{display:flex;justify-content:space-between;align-items:center;margin-bottom:18px}.title h2{margin:0}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:14px}.cat,.card,.panel{background:#fff;border:1px solid var(--line);border-radius:13px}.cat{padding:20px;text-align:left}.cat b{display:block;margin-bottom:7px}.cat small,.meta{color:var(--muted);font-size:12px}.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:15px}.card{padding:20px}.card h3{margin:9px 0}.card p{color:var(--muted);font-size:14px;line-height:1.55}.tag{font-size:12px;color:var(--a);font-weight:bold}
.panel{padding:24px;margin-bottom:18px}.form{max-width:700px}.form label{display:block;font-size:13px;font-weight:bold;margin:13px 0 6px}.form input,.form select,.form textarea{width:100%;padding:11px;border:1px solid #ccd5dc;border-radius:8px}.form textarea{min-height:90px}.btn{border:0;border-radius:8px;background:var(--n);color:#fff;padding:11px 16px;font-weight:bold}.btn.light{background:#edf2f5;color:#27343e}.btn.danger{background:var(--danger)}.row{display:flex;gap:10px}.row>*{flex:1}.notice{padding:12px;border-radius:8px;background:#eef3f6;margin:12px 0}.error{background:#fff0f0;color:#8f3030}.ok{background:#edf8f0;color:#24653b}
table{width:100%;border-collapse:collapse}th,td{padding:10px;border-bottom:1px solid var(--line);text-align:left;font-size:13px}th{background:#f7f9fa}.statgrid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}.stat{background:#fff;border:1px solid var(--line);border-radius:12px;padding:20px}.stat b{display:block;font-size:28px;color:var(--n);margin-top:6px}
.login{min-height:calc(100vh - 70px);display:grid;place-items:center;padding:30px}.loginbox{background:#fff;border:1px solid var(--line);border-radius:15px;padding:34px;width:min(440px,100%);box-shadow:0 12px 35px #17344f12}footer{text-align:center;padding:45px;color:#8b959e}
@media(max-width:700px){.hero h1{font-size:36px}.hero{padding:52px 22px}.search{display:block}.search button{width:100%;padding:14px}.row{display:block}.row>*{margin-bottom:8px}.statgrid{grid-template-columns:repeat(2,1fr)}header{padding:0 16px}nav button{margin-left:5px}}
</style></head><body><header><div class="logo">GMC <span>MISSION ARCHIVE</span></div><nav id="nav"></nav></header><main id="app"></main><footer>GMC Mission Archive · Myanmar Mission Resources</footer>
<script>
let T=localStorage.getItem('gmc_token')||'',ME=null,CATS=[];
const A=async(action,args=[])=>{
  const r=await fetch('/api',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({action,args})
  });
  const text=await r.text();
  let data;
  try{data=JSON.parse(text)}catch(e){throw new Error('서버 응답을 읽을 수 없습니다.')}
  if(!r.ok || data.ok===false) throw new Error(data.message||'요청 처리 중 오류가 발생했습니다.');
  return data;
};
const E=x=>String(x??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
function nav(){let x=document.getElementById('nav');if(!ME){x.innerHTML='';return}x.innerHTML=\`<button class="primary" onclick="home()">자료실</button>\${ME.role==='관리자'?'<button onclick="admin()">관리자</button>':''}<button onclick="pw()">비밀번호</button><button onclick="logout()">로그아웃</button>\`}
function home(){nav();app.innerHTML=\`<section class="hero"><div class="hero-inner"><div class="eyebrow">GMC · MYANMAR MISSION</div><h1>Mission Archive</h1><p>미얀마 선교의 기록과 지식을 함께 보존하고 나누는 자료 아카이브입니다.</p><div class="search"><input id="q" placeholder="자료 제목, 내용, 작성자 검색" onkeydown="if(event.key==='Enter')search()"><button onclick="search()">검색</button></div></div></section><div class="container"><div class="title"><h2>검색 결과</h2></div><div class="cards" id="cards"></div><div class="title" style="margin-top:40px"><h2>자료 분야</h2></div><div class="grid" id="cats"></div></div>\`;loadCats();search()}
async function loadCats(){if(!CATS.length)CATS=(await A('categories',[T])).categories;cats.innerHTML=CATS.map(c=>\`<button class="cat" onclick="search('\${E(c)}')"><b>\${E(c)}</b><small>자료 찾아보기 →</small></button>\`).join('')}
async function search(cat=''){try{const r=await A('listMaterials',[T,{q:document.getElementById('q')?.value||'',category:cat}]);cards.innerHTML=r.materials.slice(0,12).map(m=>\`<article class="card" onclick="detail('\${E(m.id)}')"><div class="tag">\${E(m.category)} · \${E(m.fileType)}</div><h3>\${E(m.title)}</h3><p>\${E(m.description).slice(0,130)}</p><div class="meta">\${E(m.author)} · \${E(m.year)} · 조회 \${m.views}</div></article>\`).join('')||'<div class="panel">검색 결과가 없습니다.</div>'}catch(e){cards.innerHTML=\`<div class="notice error">\${E(e.message)}</div>\`}}
async function detail(id){const m=(await A('getMaterial',[T,id])).material;app.innerHTML=\`<div class="container"><button class="btn light" onclick="home()">← 자료실</button><div class="panel" style="margin-top:18px"><div class="tag">\${E(m.category)}</div><h1>\${E(m.title)}</h1><p>\${E(m.description)}</p><div class="meta">\${E(m.author)} · \${E(m.year)} · \${E(m.language)}</div><div class="row" style="margin-top:22px"><a class="btn" href="\${E(m.viewUrl)}" target="_blank">Google Drive에서 열람</a><a class="btn light" href="\${E(m.downloadUrl)}" target="_blank">다운로드</a></div></div></div>\`}
function loginView(){app.innerHTML=\`<div class="login"><div class="loginbox"><div class="eyebrow">GMC MISSION ARCHIVE</div><h1>로그인</h1><p class="meta">회원가입은 없으며 관리자가 발급한 계정으로 로그인합니다.</p><div id="lm"></div><div class="form"><label>아이디</label><input id="un" autocomplete="username"><label>비밀번호</label><input id="pw0" type="password" autocomplete="current-password" onkeydown="if(event.key==='Enter'){event.preventDefault();login();}"><button class="btn" style="width:100%;margin-top:18px" onclick="login()">로그인</button></div></div></div>\`}
async function login(){try{const r=await A('login',[un.value,pw0.value]);if(!r.ok){lm.innerHTML=\`<div class="notice error">\${E(r.message)}</div>\`;return}T=r.token;ME=r.user;localStorage.setItem('gmc_token',T);r.user.firstLogin?pw(true):home()}catch(e){lm.innerHTML=\`<div class="notice error">\${E(e.message)}</div>\`}}
function pw(first=false){app.innerHTML=\`<div class="login"><div class="loginbox"><h1>비밀번호 변경</h1>\${first?'<div class="notice">첫 로그인입니다. 새 비밀번호를 설정해야 합니다.</div>':''}<div id="pm"></div><div class="form"><label>새 비밀번호</label><input id="p1" type="password" placeholder="6자 이상"><label>확인</label><input id="p2" type="password"><button class="btn" style="width:100%;margin-top:18px" onclick="savepw()">변경</button></div></div></div>\`}
async function savepw(){if(p1.value!==p2.value){pm.innerHTML='<div class="notice error">비밀번호가 일치하지 않습니다.</div>';return}try{await A('changePassword',[T,p1.value]);home()}catch(e){pm.innerHTML=\`<div class="notice error">\${E(e.message)}</div>\`}}
function admin(){app.innerHTML=\`<div class="container"><div class="title"><h2>관리자 대시보드</h2></div><div class="statgrid" id="stats"></div><div class="grid" style="margin-top:20px"><button class="cat" onclick="users()">회원 관리</button><button class="cat" onclick="materialsAdmin()">자료 관리</button><button class="cat" onclick="uploadView()">자료 등록</button></div></div>\`;dashboard()}
async function dashboard(){const s=(await A('dashboard',[T])).stats;stats.innerHTML=[['전체 회원',s.users],['활성 회원',s.activeUsers],['공개 자료',s.materials],['자료 조회',s.views]].map(x=>\`<div class="stat"><small>\${x[0]}</small><b>\${x[1]}</b></div>\`).join('')}
function users(){app.innerHTML=\`<div class="container"><div class="title"><h2>회원 관리</h2><button class="btn light" onclick="admin()">← 관리자</button></div><div class="panel form"><h3>회원 등록</h3><div class="row"><div><label>이름</label><input id="a1"></div><div><label>아이디</label><input id="a2"></div></div><div class="row"><div><label>이메일</label><input id="a3"></div><div><label>소속 지부</label><input id="a4"></div></div><label>권한</label><select id="a5"><option>코디네이터</option><option>지역대표</option><option>지부장</option><option>지부원</option></select><label>초기 비밀번호</label><input id="a6" type="password"><button class="btn" style="margin-top:16px" onclick="addUser()">등록</button><div id="um"></div></div><div class="panel"><div id="ul"></div></div></div>\`;loadUsers()}
async function loadUsers(){const r=await A('listUsers',[T]);ul.innerHTML=\`<table><tr><th>이름</th><th>아이디</th><th>권한</th><th>지부</th><th>상태</th><th>작업</th></tr>\${r.users.map(u=>\`<tr><td>\${E(u.name)}</td><td>\${E(u.username)}</td><td>\${E(u.role)}</td><td>\${E(u.branch)}</td><td>\${E(u.status)}</td><td><button class="btn light" onclick="editUser('\${E(u.id)}')">수정</button> <button class="btn light" onclick="resetpw('\${E(u.id)}')">초기화</button></td></tr>\`).join('')}</table>\`}
async function addUser(){try{await A('createUser',[T,{name:a1.value,username:a2.value,email:a3.value,branch:a4.value,role:a5.value,initialPassword:a6.value}]);um.innerHTML='<div class="notice ok">등록되었습니다.</div>';loadUsers()}catch(e){um.innerHTML=\`<div class="notice error">\${E(e.message)}</div>\`}}
async function editUser(id){const r=await A('listUsers',[T]),u=r.users.find(x=>x.id===id);app.innerHTML=\`<div class="container"><div class="panel form"><h2>회원 수정</h2><label>이름</label><input id="e1" value="\${E(u.name)}"><label>아이디</label><input id="e2" value="\${E(u.username)}"><label>이메일</label><input id="e3" value="\${E(u.email)}"><label>소속 지부</label><input id="e4" value="\${E(u.branch)}"><label>권한</label><select id="e5">\${['코디네이터','지역대표','지부장','지부원'].map(x=>\`<option \${x===u.role?'selected':''}>\${x}</option>\`).join('')}</select><label>상태</label><select id="e6"><option \${u.status==='활성'?'selected':''}>활성</option><option \${u.status==='비활성'?'selected':''}>비활성</option></select><button class="btn" style="margin-top:16px" onclick="saveUser('\${E(id)}')">저장</button></div></div>\`}
async function saveUser(id){try{await A('updateUser',[T,{id:id,name:e1.value,username:e2.value,email:e3.value,branch:e4.value,role:e5.value,status:e6.value}]);users()}catch(e){alert(e.message)}}
async function resetpw(id){const p=prompt('새 초기 비밀번호를 입력하세요. (6자 이상)');if(!p)return;try{await A('resetUserPassword',[T,id,p]);alert('비밀번호가 초기화되었습니다. 다음 로그인 시 변경이 필요합니다.')}catch(e){alert(e.message)}}
async function materialsAdmin(){const r=await A('adminMaterials',[T]);app.innerHTML=\`<div class="container"><div class="title"><h2>자료 관리</h2><button class="btn light" onclick="admin()">← 관리자</button></div><div class="panel"><table><tr><th>제목</th><th>분야</th><th>작성자</th><th>상태</th><th>조회</th><th>작업</th></tr>\${r.materials.map(m=>\`<tr><td>\${E(m.title)}</td><td>\${E(m.category)}</td><td>\${E(m.author)}</td><td>\${E(m.status)}</td><td>\${m.views}</td><td><button class="btn light" onclick="editMaterial('\${E(m.id)}')">수정</button>\${['관리자','코디네이터'].includes(ME.role)?\` <button class="btn danger" onclick="delMaterial('\${E(m.id)}')">삭제</button>\`:''}</td></tr>\`).join('')}</table></div></div>\`}
async function editMaterial(id){const r=await A('adminMaterials',[T]),m=r.materials.find(x=>x.id===id);app.innerHTML=\`<div class="container"><div class="panel form"><h2>자료 수정</h2><label>제목</label><input id="x1" value="\${E(m.title)}"><label>설명</label><textarea id="x2"></textarea><label>카테고리</label><select id="x3">\${CATS.map(c=>\`<option \${c===m.category?'selected':''}>\${E(c)}</option>\`).join('')}</select><label>작성자</label><input id="x4" value="\${E(m.author)}"><label>연도</label><input id="x5" value="\${E(m.year)}"><label>자료형식</label><input id="x6" value="\${E(m.fileType)}"><label>상태</label><select id="x7"><option \${m.status==='공개'?'selected':''}>공개</option><option>비공개</option></select><button class="btn" style="margin-top:16px" onclick="saveMaterial('\${E(id)}')">저장</button></div></div>\`}
async function saveMaterial(id){try{await A('updateMaterial',[T,id,{title:x1.value,description:x2.value,category:x3.value,language:'한국어',author:x4.value,year:x5.value,fileType:x6.value,status:x7.value}]);materialsAdmin()}catch(e){alert(e.message)}}
async function delMaterial(id){if(!confirm('자료를 삭제 처리할까요? Google Drive 파일도 휴지통으로 이동합니다.'))return;try{await A('deleteMaterial',[T,id]);materialsAdmin()}catch(e){alert(e.message)}}
function uploadView(){app.innerHTML=\`<div class="container"><div class="panel form"><h2>자료 등록</h2><label>제목</label><input id="t1"><label>설명</label><textarea id="t2"></textarea><label>카테고리</label><select id="t3">\${CATS.map(c=>\`<option>\${E(c)}</option>\`).join('')}</select><div class="row"><div><label>언어</label><input id="t4" value="한국어"></div><div><label>작성자</label><input id="t5"></div></div><div class="row"><div><label>연도</label><input id="t6" value="\${new Date().getFullYear()}"></div><div><label>자료형식</label><input id="t7" placeholder="PDF / PPT / DOC / 사진 / 영상"></div></div><label>파일 (최대 \${45}MB)</label><input id="t8" type="file"><button class="btn" style="margin-top:16px" onclick="upload()">Google Drive에 저장하고 등록</button><div id="upm"></div></div></div>\`}
function b64(f){return new Promise((ok,no)=>{let r=new FileReader();r.onload=()=>ok(r.result.split(',')[1]);r.onerror=no;r.readAsDataURL(f)})}
async function upload(){const f=t8.files[0];if(!f){upm.innerHTML='<div class="notice error">파일을 선택하세요.</div>';return}upm.innerHTML='<div class="notice">업로드 중...</div>';try{await A('uploadMaterial',[T,{title:t1.value,description:t2.value,category:t3.value,language:t4.value,author:t5.value,year:t6.value,fileType:t7.value||f.type,fileName:f.name,mimeType:f.type,base64:await b64(f)}]);upm.innerHTML='<div class="notice ok">등록되었습니다.</div>'}catch(e){upm.innerHTML=\`<div class="notice error">\${E(e.message)}</div>\`}}
async function logout(){await A('logout',[T]);T='';ME=null;localStorage.removeItem('gmc_token');loginView()}
async function init(){if(T){try{let r=await A('me',[T]);if(r.ok){ME=r.user;nav();return ME.firstLogin?pw(true):home()}}catch(e){}}loginView()}init();
</script></body></html>`;

let CFG = null;
function config(env){
  return {
    SHEET_ID: env.GMC_SHEET_ID || '',
    ROOT_FOLDER_ID: env.GMC_ROOT_FOLDER_ID || '',
    SA_EMAIL: env.GMC_SA_EMAIL || '',
    SA_PRIVATE_KEY: env.GMC_SA_PRIVATE_KEY || '',
    SESSION_SECRET: env.GMC_SESSION_SECRET || '',
    GOOGLE_CLIENT_ID: env.GMC_GOOGLE_CLIENT_ID || '',
    GOOGLE_CLIENT_SECRET: env.GMC_GOOGLE_CLIENT_SECRET || '',
    DRIVE_REFRESH_TOKEN: env.GMC_DRIVE_REFRESH_TOKEN || ''
  };
}

const ROLES = ['관리자','일반회원'];
const MANAGE_ROLES = ['관리자'];
const CATEGORIES = ['미얀마 이해','선교','교회개척','신학교·지도자','교육','어린이·청소년','NGO·개발','문화·사회','GMC 자료','사진·영상','기타'];
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024 * 1024 * 1024; // Google Drive single-file maximum (5 TB)
const SESSION_TTL = 6 * 60 * 60;

let accessTokenCache = {token:'', exp:0};

function jsonResponse(data, status=200){
  return new Response(JSON.stringify(data), {status, headers:{'content-type':'application/json; charset=UTF-8','cache-control':'no-store','access-control-allow-origin':'https://gmc-mission-archive-mm.netlify.app','access-control-allow-methods':'POST, OPTIONS','access-control-allow-headers':'Content-Type'}});
}
function b64u(bytes){
  let s='';
  for(const b of bytes) s+=String.fromCharCode(b);
  return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
function b64uText(s){return b64u(new TextEncoder().encode(s));}
function fromB64u(s){
  s=s.replace(/-/g,'+').replace(/_/g,'/');
  while(s.length%4)s+='=';
  const bin=atob(s); const out=new Uint8Array(bin.length);
  for(let i=0;i<bin.length;i++)out[i]=bin.charCodeAt(i);
  return out;
}
function pemToDer(pem){
  let s=String(pem||'').trim();
  // Cloudflare Secret may contain the JSON key's literal \n sequences rather than real line breaks.
  s=s.replace(/\\n/g,'\n').replace(/\r\n/g,'\n').replace(/\r/g,'\n');
  s=s.replace(/^\"|\"$/g,'').trim();
  const begin='-----BEGIN PRIVATE KEY-----';
  const end='-----END PRIVATE KEY-----';
  const bi=s.indexOf(begin), ei=s.indexOf(end);
  if(bi>=0 && ei>bi) s=s.slice(bi+begin.length,ei);
  s=s.replace(/\s/g,'');
  if(!/^[A-Za-z0-9+/]*={0,2}$/.test(s) || s.length%4!==0) throw new Error('GMC_SA_PRIVATE_KEY 형식이 올바르지 않습니다. JSON 파일의 private_key 전체 값을 그대로 Secret에 넣었는지 확인하세요.');
  try{
    const bin=atob(s); const out=new Uint8Array(bin.length);
    for(let i=0;i<bin.length;i++)out[i]=bin.charCodeAt(i);
    return out;
  }catch(e){throw new Error('GMC_SA_PRIVATE_KEY를 읽을 수 없습니다. private_key 값을 다시 확인하세요.');}
}
async function importPrivateKey(){
  return crypto.subtle.importKey('pkcs8',pemToDer(CFG.SA_PRIVATE_KEY),{name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['sign']);
}
async function getGoogleAccessToken(){
  const now=Math.floor(Date.now()/1000);
  if(accessTokenCache.token && accessTokenCache.exp>now+60)return accessTokenCache.token;
  const header=b64uText(JSON.stringify({alg:'RS256',typ:'JWT'}));
  const claim=b64uText(JSON.stringify({iss:CFG.SA_EMAIL,scope:'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive',aud:'https://oauth2.googleapis.com/token',iat:now,exp:now+3600}));
  const input=header+'.'+claim;
  const key=await importPrivateKey();
  const sig=await crypto.subtle.sign('RSASSA-PKCS1-v1_5',key,new TextEncoder().encode(input));
  const assertion=input+'.'+b64u(new Uint8Array(sig));
  const r=await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:new URLSearchParams({grant_type:'urn:ietf:params:oauth:grant-type:jwt-bearer',assertion})});
  const d=await r.json();
  if(!r.ok)throw new Error('Google 인증 토큰 발급 실패: '+(d.error_description||d.error||'unknown'));
  accessTokenCache={token:d.access_token,exp:now+Number(d.expires_in||3600)};
  return d.access_token;
}
function oauthRedirectUri(request){return 'https://gmc-mission-archive.tyzm.workers.dev/oauth/callback';}
function parseCookies(request){const h=request.headers.get('Cookie')||'';const out={};for(const part of h.split(';')){const i=part.indexOf('=');if(i>0)out[part.slice(0,i).trim()]=decodeURIComponent(part.slice(i+1).trim());}return out;}
function escHtml(x){return String(x??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));}
function htmlResponse(body,status=200,extra={}){return new Response('<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>GMC Google 연결</title><style>body{font-family:Arial,"Noto Sans KR",sans-serif;background:#f5f7f9;color:#1d2a35;padding:32px;line-height:1.6}.box{max-width:720px;margin:40px auto;background:#fff;border:1px solid #e1e7ec;border-radius:14px;padding:28px}code{word-break:break-all;background:#f2f4f6;padding:2px 5px;border-radius:4px}.ok{color:#24653b}.err{color:#8f3030}</style><div class="box">'+body+'</div></html>',{status,headers:{'content-type':'text/html; charset=UTF-8','cache-control':'no-store',...extra}});}
function oauthStart(request){
  try{
    if(!CFG.GOOGLE_CLIENT_ID)return htmlResponse('<h2>Google OAuth 설정 필요</h2><p>먼저 Cloudflare에 <code>GMC_GOOGLE_CLIENT_ID</code>를 설정하세요.</p>',500);
    const state=randomHex(16);
    const redirect='https://gmc-mission-archive.tyzm.workers.dev/oauth/callback';
    const u=new URL('https://accounts.google.com/o/oauth2/v2/auth');
    u.searchParams.set('client_id',String(CFG.GOOGLE_CLIENT_ID).trim());
    u.searchParams.set('redirect_uri',redirect);
    u.searchParams.set('response_type','code');
    u.searchParams.set('scope','https://www.googleapis.com/auth/drive');
    u.searchParams.set('access_type','offline');
    u.searchParams.set('prompt','consent');
    u.searchParams.set('state',state);
    return new Response(null,{status:302,headers:{'Location':u.href,'Set-Cookie':`gmc_oauth_state=${state}; Max-Age=600; Path=/oauth; HttpOnly; Secure; SameSite=Lax`,'Cache-Control':'no-store'}});
  }catch(e){
    return htmlResponse('<h2 class="err">OAuth 시작 오류</h2><pre>'+escHtml(String(e&&e.stack||e))+'</pre>',500);
  }
}
async function oauthCallback(request){
  if(!CFG.GOOGLE_CLIENT_ID||!CFG.GOOGLE_CLIENT_SECRET)return htmlResponse('<h2>Google OAuth 설정 필요</h2><p>Cloudflare에 <code>GMC_GOOGLE_CLIENT_ID</code>와 <code>GMC_GOOGLE_CLIENT_SECRET</code>를 설정하세요.</p>',500);
  const url=new URL(request.url),code=url.searchParams.get('code')||'',state=url.searchParams.get('state')||'',cookie=parseCookies(request).gmc_oauth_state||'';
  if(!state||!cookie||state!==cookie)return htmlResponse('<h2 class="err">인증 상태가 일치하지 않습니다.</h2><p>처음부터 다시 시작하세요.</p>',400);
  if(!code)return htmlResponse('<h2 class="err">Google 인증이 취소되었거나 실패했습니다.</h2>',400);
  const body=new URLSearchParams({code,client_id:CFG.GOOGLE_CLIENT_ID,client_secret:CFG.GOOGLE_CLIENT_SECRET,redirect_uri:oauthRedirectUri(request),grant_type:'authorization_code'});
  const r=await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body});
  const d=await r.json();
  if(!r.ok)return htmlResponse('<h2 class="err">토큰 발급 실패</h2><pre>'+escHtml(String(d.error_description||d.error||'unknown'))+'</pre>',400);
  if(!d.refresh_token)return htmlResponse('<h2 class="err">Refresh Token을 받지 못했습니다.</h2><p>Google 인증 화면에서 동의를 다시 진행해 주세요.</p>',400);
  return htmlResponse('<h2 class="ok">Google Drive 연결 성공</h2><p>아래 Refresh Token을 복사해서 Cloudflare Worker의 <code>GMC_DRIVE_REFRESH_TOKEN</code> Secret에 저장하세요.</p><p><code>'+escHtml(d.refresh_token)+'</code></p><p>이 토큰은 공개해서는 안 됩니다. 이 화면을 다른 사람에게 공유하지 마세요.</p>');
}
async function getDriveAccessToken(){
  if(!CFG.GOOGLE_CLIENT_ID||!CFG.GOOGLE_CLIENT_SECRET||!CFG.DRIVE_REFRESH_TOKEN)throw new Error('Google Drive OAuth 설정이 필요합니다.');
  const body=new URLSearchParams({client_id:CFG.GOOGLE_CLIENT_ID,client_secret:CFG.GOOGLE_CLIENT_SECRET,refresh_token:CFG.DRIVE_REFRESH_TOKEN,grant_type:'refresh_token'});
  const r=await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body});
  const d=await r.json();if(!r.ok)throw new Error('Google Drive OAuth 토큰 갱신 실패: '+(d.error_description||d.error||'unknown'));return d.access_token;
}
async function driveJson(url,opts={}){const token=await getDriveAccessToken();const headers=new Headers(opts.headers||{});headers.set('Authorization','Bearer '+token);const r=await fetch(url,{...opts,headers});const text=await r.text();let d=null;try{d=JSON.parse(text)}catch(_){}if(!r.ok)throw new Error((d&&d.error&&d.error.message)||('Google Drive API 오류 HTTP '+r.status));return d;}
async function googleFetch(url,opts={}){
  const token=await getGoogleAccessToken();
  const headers=new Headers(opts.headers||{}); headers.set('Authorization','Bearer '+token);
  const r=await fetch(url,{...opts,headers});
  if(r.status===401){accessTokenCache={token:'',exp:0};const t=await getGoogleAccessToken();headers.set('Authorization','Bearer '+t);return fetch(url,{...opts,headers});}
  return r;
}
async function googleJson(url,opts={}){
  const r=await googleFetch(url,opts); const text=await r.text(); let d=null; try{d=JSON.parse(text)}catch(_){ }
  if(!r.ok)throw new Error((d&&d.error&&d.error.message)||('Google API 오류 HTTP '+r.status));
  return d;
}
function sheetUrl(range){return 'https://sheets.googleapis.com/v4/spreadsheets/'+encodeURIComponent(CFG.SHEET_ID)+'/values/'+encodeURIComponent(range);}
async function sheetGet(range){return (await googleJson(sheetUrl(range)+'?valueRenderOption=FORMATTED_VALUE')).values||[];}
async function sheetAppend(sheet,values){
  return googleJson(sheetUrl(sheet+'!A:Z')+':append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({values:[values]})});
}
async function sheetUpdate(range,values){return googleJson(sheetUrl(range)+'?valueInputOption=USER_ENTERED',{method:'PUT',headers:{'content-type':'application/json'},body:JSON.stringify({range,majorDimension:'ROWS',values})});}
function normalizeRole(v){return String(v||'')==='관리자'?'관리자':'일반회원';}
function rowObj(r,row){return {id:String(r[0]||''),name:String(r[1]||''),username:String(r[2]||''),email:String(r[3]||''),phone:String(r[4]||''),branch:String(r[5]||''),role:normalizeRole(r[6]),hash:String(r[7]||''),salt:String(r[8]||''),firstLogin:String(r[9]).toLowerCase()==='true',status:String(r[10]||''),created:String(r[11]||''),lastLogin:String(r[12]||''),row};}
async function ensureFavoritesSheet(){
  const d=await googleJson('https://sheets.googleapis.com/v4/spreadsheets/'+encodeURIComponent(CFG.SHEET_ID)+'?fields=sheets.properties.title');
  const exists=(d.sheets||[]).some(s=>s.properties?.title==='즐겨찾기');
  if(exists)return;
  await googleJson('https://sheets.googleapis.com/v4/spreadsheets/'+encodeURIComponent(CFG.SHEET_ID)+':batchUpdate',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({requests:[{addSheet:{properties:{title:'즐겨찾기'}}}]})});
  await sheetAppend('즐겨찾기',['ID','자료ID','사용자ID','등록일']);
}
async function favoritesRows(){await ensureFavoritesSheet();return await sheetGet('즐겨찾기!A:D');}

async function ensureCommentsSheet(){
  const d=await googleJson('https://sheets.googleapis.com/v4/spreadsheets/'+encodeURIComponent(CFG.SHEET_ID)+'?fields=sheets.properties.title');
  const exists=(d.sheets||[]).some(s=>s.properties?.title==='댓글');
  if(exists)return;
  await googleJson('https://sheets.googleapis.com/v4/spreadsheets/'+encodeURIComponent(CFG.SHEET_ID)+':batchUpdate',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({requests:[{addSheet:{properties:{title:'댓글'}}}]})});
  await sheetAppend('댓글',['ID','자료ID','작성자ID','작성자','댓글','작성일','수정일']);
}
async function commentsRows(){await ensureCommentsSheet();return await sheetGet('댓글!A:G');}
let RECENT_VIEWS_READY=false;
async function ensureRecentViewsSheet(){
  if(RECENT_VIEWS_READY)return;
  const d=await googleJson('https://sheets.googleapis.com/v4/spreadsheets/'+encodeURIComponent(CFG.SHEET_ID)+'?fields=sheets.properties.title');
  const exists=(d.sheets||[]).some(s=>s.properties?.title==='최근본자료');
  if(!exists){
    await googleJson('https://sheets.googleapis.com/v4/spreadsheets/'+encodeURIComponent(CFG.SHEET_ID)+':batchUpdate',{
      method:'POST',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({requests:[{addSheet:{properties:{title:'최근본자료'}}}]})
    });
    await sheetAppend('최근본자료',['ID','사용자ID','자료ID','본시간']);
  }
  RECENT_VIEWS_READY=true;
}
async function recentViewsRows(){await ensureRecentViewsSheet();return await sheetGet('최근본자료!A:D');}

async function ensureLoginHistorySheet(){
  const d=await googleJson('https://sheets.googleapis.com/v4/spreadsheets/'+encodeURIComponent(CFG.SHEET_ID)+'?fields=sheets.properties.title');
  const exists=(d.sheets||[]).some(s=>s.properties?.title==='로그인이력');
  if(exists)return;
  await googleJson('https://sheets.googleapis.com/v4/spreadsheets/'+encodeURIComponent(CFG.SHEET_ID)+':batchUpdate',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({requests:[{addSheet:{properties:{title:'로그인이력'}}}]})});
  await sheetAppend('로그인이력',['ID','사용자ID','이름','아이디','권한','지부','로그인시간']);
}
async function loginHistoryRows(){await ensureLoginHistorySheet();return await sheetGet('로그인이력!A:G');}
async function usersRows(){return await sheetGet('회원!A:M');}
async function materialsRows(){return await sheetGet('자료!A:O');}
async function findUserByUsername(x){const rows=await usersRows(),q=String(x||'').trim().toLowerCase();for(let i=1;i<rows.length;i++)if(String(rows[i][2]||'').toLowerCase()===q)return rowObj(rows[i],i+1);return null;}
async function findUserById(id){const rows=await usersRows();for(let i=1;i<rows.length;i++)if(String(rows[i][0]||'')===String(id))return rowObj(rows[i],i+1);return null;}
function publicUser(u){return {id:u.id,name:u.name,username:u.username,email:u.email,branch:u.branch,role:u.role,firstLogin:u.firstLogin};}
function maxNextId(rows,prefix){let n=0;for(let i=1;i<rows.length;i++){const m=String(rows[i][0]||'').match(new RegExp('^'+prefix+'(\\d+)$'));if(m)n=Math.max(n,Number(m[1]));}return prefix+String(n+1).padStart(4,'0');}
async function hashPassword(p,salt){const d=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(String(salt)+String(p)));return Array.from(new Uint8Array(d)).map(b=>b.toString(16).padStart(2,'0')).join('');}
function safe(v){const s=String(v??'');return /^[=+\-@]/.test(s)?"'"+s:s;}
function validatePassword(p){if(typeof p!=='string'||p.length<6)throw new Error('비밀번호는 6자 이상이어야 합니다.');}
function nowText(){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Yangon',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(new Date()).replace(', ',' ');}
function constEq(a,b){if(a.length!==b.length)return false;let x=0;for(let i=0;i<a.length;i++)x|=a.charCodeAt(i)^b.charCodeAt(i);return x===0;}
function randomBytes(n){const x=new Uint8Array(n);crypto.getRandomValues(x);return x;}
function randomHex(n){return Array.from(randomBytes(n)).map(b=>b.toString(16).padStart(2,'0')).join('');}
async function hmac(data){const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(CFG.SESSION_SECRET),{name:'HMAC',hash:'SHA-256'},false,['sign']);return new Uint8Array(await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(data)));}
async function makeSession(u){const payload={uid:u.id,role:u.role,username:u.username,exp:Math.floor(Date.now()/1000)+SESSION_TTL};const p=b64uText(JSON.stringify(payload));return p+'.'+b64u(await hmac(p));}
async function session(token){if(!token)throw new Error('로그인이 필요합니다.');const parts=String(token).split('.');if(parts.length!==2)throw new Error('세션이 올바르지 않습니다.');const expected=b64u(await hmac(parts[0]));if(!constEq(expected,parts[1]))throw new Error('세션이 올바르지 않습니다.');let p;try{p=JSON.parse(new TextDecoder().decode(fromB64u(parts[0])))}catch(_){throw new Error('세션이 올바르지 않습니다.')}if(Number(p.exp)<Math.floor(Date.now()/1000))throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');return p;}
async function requireRole(token,roles){const s=await session(token);if(!roles.includes(s.role))throw new Error('권한이 없습니다.');return s;}
async function ensurePublic(fileId){
  if(!fileId||!CFG.DRIVE_REFRESH_TOKEN)return;
  const base='https://www.googleapis.com/drive/v3/files/'+encodeURIComponent(fileId);
  let p={};try{p=await driveJson(base+'/permissions?fields=permissions(id,type,role)&pageSize=100',{method:'GET'});}catch(e){return;}
  const exists=(p.permissions||[]).some(x=>x.type==='anyone'&&x.role==='reader');if(exists)return;
  await driveJson(base+'/permissions?sendNotificationEmail=false',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({type:'anyone',role:'reader'})});
}

async function findMaterial(id){const rows=await materialsRows();for(let i=1;i<rows.length;i++)if(String(rows[i][0]||'')===String(id))return {row:i+1,id:String(rows[i][0]),title:String(rows[i][1]||''),description:String(rows[i][2]||''),category:String(rows[i][3]||''),language:String(rows[i][4]||''),author:String(rows[i][5]||''),year:String(rows[i][6]||''),driveId:String(rows[i][7]||''),fileName:String(rows[i][8]||''),fileType:String(rows[i][9]||''),date:String(rows[i][10]||''),status:String(rows[i][12]||''),views:Number(rows[i][14]||0)};return null;}
async function subfolder(name){const q=encodeURIComponent("'"+CFG.ROOT_FOLDER_ID+"' in parents and name='"+name.replace(/'/g,"\\'")+"' and mimeType='application/vnd.google-apps.folder' and trashed=false");const d=await driveJson('https://www.googleapis.com/drive/v3/files?q='+q+'&fields=files(id,name)&pageSize=10');if(!d.files?.length)throw new Error('Drive 폴더를 찾을 수 없습니다: '+name);return d.files[0].id;}
async function driveUpload(data){const bytes=Uint8Array.from(atob(data.base64),c=>c.charCodeAt(0));if(bytes.length>MAX_UPLOAD_BYTES)throw new Error('Google Drive가 허용하는 최대 파일 크기를 초과했습니다.');const folder=await subfolder(/사진|영상/i.test(data.fileType||'')?'사진·영상':'자료');const boundary='gmc_'+randomHex(12);const meta=JSON.stringify({name:data.fileName,mimeType:data.mimeType||'application/octet-stream',parents:[folder]});const pre='--'+boundary+'\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n'+meta+'\r\n--'+boundary+'\r\nContent-Type: '+(data.mimeType||'application/octet-stream')+'\r\n\r\n';const enc=new TextEncoder(),a=enc.encode(pre),b=bytes,c=enc.encode('\r\n--'+boundary+'--\r\n');const body=new Uint8Array(a.length+b.length+c.length);body.set(a,0);body.set(b,a.length);body.set(c,a.length+b.length);return driveJson('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink',{method:'POST',headers:{'content-type':'multipart/related; boundary='+boundary},body});}

async function prepareDriveUpload(data){
  const folder=await subfolder(/사진|영상/i.test(data.fileType||'')?'사진·영상':'자료');
  const uploadId=randomHex(16);
  const meta={name:String(data.fileName||'').slice(0,1000),mimeType:data.mimeType||'application/octet-stream',parents:[folder],appProperties:{gmcUploadId:uploadId}};
  const token=await getDriveAccessToken();
  const r=await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&fields=id,name,mimeType,size,webViewLink',{method:'POST',headers:{'Authorization':'Bearer '+token,'Content-Type':'application/json; charset=UTF-8','X-Upload-Content-Type':meta.mimeType,'X-Upload-Content-Length':String(data.size||0)},body:JSON.stringify(meta)});
  const text=await r.text();
  if(!r.ok) {let d=null;try{d=JSON.parse(text)}catch(_){} throw new Error((d&&d.error&&d.error.message)||('Google Drive 업로드 세션 생성 실패 HTTP '+r.status));}
  const loc=r.headers.get('Location');
  if(!loc) throw new Error('Google Drive 업로드 세션 주소를 받지 못했습니다.');
  return {uploadUrl:loc,uploadId};
}


async function api(action,args,ctx=null){
  switch(action){
    case 'login':{const u=await findUserByUsername(args[0]);if(!u||u.status!=='활성')return {ok:false,message:'아이디 또는 비밀번호가 올바르지 않습니다.'};const h=await hashPassword(args[1],u.salt);if(!constEq(h,u.hash))return {ok:false,message:'아이디 또는 비밀번호가 올바르지 않습니다.'};const loginAt=nowText();await sheetUpdate('회원!M'+u.row+':M'+u.row,[[loginAt]]);const lrows=await loginHistoryRows();const lid=maxNextId(lrows,'L');await sheetAppend('로그인이력',[lid,u.id,safe(u.name),safe(u.username),u.role,safe(u.branch),loginAt]);return {ok:true,token:await makeSession(u),user:publicUser(u)};}
    case 'logout':return {ok:true};
    case 'me':{const s=await session(args[0]),u=await findUserById(s.uid);if(!u)throw new Error('회원 정보를 찾을 수 없습니다.');return {ok:true,user:publicUser(u)};}
    case 'changePassword':{const s=await session(args[0]);const u=await findUserById(s.uid);if(!u)throw new Error('회원 정보를 찾을 수 없습니다.');validatePassword(args[1]);validatePassword(args[2]);const oldHash=await hashPassword(args[1],u.salt);if(!constEq(oldHash,u.hash))throw new Error('현재 비밀번호가 올바르지 않습니다.');const salt=randomHex(16),hash=await hashPassword(args[2],salt);await sheetUpdate('회원!H'+u.row+':J'+u.row,[[hash,salt,false]]);return {ok:true};}
    case 'categories':{await session(args[0]);const rows=await sheetGet('카테고리!A:D');return {ok:true,categories:rows.slice(1).filter(r=>r[0]&&String(r[3]).toLowerCase()==='true').map(r=>String(r[1]))};}
    case 'listMaterials':{
      await session(args[0]);
      const f=args[1]||{};
      const norm=v=>String(v??'').normalize('NFKC').toLowerCase().replace(/[\u00a0\s]+/g,' ').trim();
      const compact=v=>norm(v).replace(/[\s\-_/.,:;|()[\]{}]+/g,'');
      const q=norm(f.q), qCompact=compact(q);
      const terms=q?q.split(' ').filter(Boolean):[];
      const cat=norm(f.category), lang=norm(f.language);
      const rows=await materialsRows(), commentRows=await commentsRows(), counts={};
      for(let i=1;i<commentRows.length;i++){
        const mid=String(commentRows[i][1]||'');
        if(mid)counts[mid]=(counts[mid]||0)+1;
      }
      const out=[];
      for(let i=1;i<rows.length;i++){
        const r=rows[i];
        if(!r[0]) continue;
        const status=norm(r[12]);
        if(status==='삭제'||status==='비공개'||status==='private'||status==='deleted') continue;
        const fields=[r[1],r[2],r[3],r[4],r[5],r[6],r[8],r[9]].map(norm);
        const hay=fields.join(' ');
        const hayCompact=fields.map(compact).join('');
        if(q && !(terms.every(t=>hay.includes(t)) || (qCompact && hayCompact.includes(qCompact)))) continue;
        if(cat && norm(r[3])!==cat) continue;
        if(lang && norm(r[4])!==lang) continue;
        const id=String(r[0]);
        out.push({id,title:String(r[1]||''),description:String(r[2]||''),category:String(r[3]||''),language:String(r[4]||''),author:String(r[5]||''),year:String(r[6]||''),fileName:String(r[8]||''),fileType:String(r[9]||''),date:String(r[10]||''),views:Number(r[14]||0),commentCount:counts[id]||0});
      }
      out.reverse();
      return {ok:true,materials:out};
    }
    case 'getMaterial':{const s=await session(args[0]),m=await findMaterial(args[1]);if(!m||m.status!=='공개')throw new Error('자료를 찾을 수 없습니다.');const material={...m,date:m.date,viewUrl:'https://drive.google.com/file/d/'+encodeURIComponent(m.driveId)+'/view',downloadUrl:'https://drive.google.com/uc?export=download&id='+encodeURIComponent(m.driveId)};const log=async()=>{try{await sheetUpdate('자료!O'+m.row+':O'+m.row,[[m.views+1]]);const rv=await recentViewsRows(),rid=maxNextId(rv,'R');await sheetAppend('최근본자료',[rid,s.uid,m.id,nowText()]);}catch(e){}};if(ctx?.waitUntil)ctx.waitUntil(log());else await log();return {ok:true,material};}
    case 'listRecentViews':{
      const s=await session(args[0]),rows=await recentViewsRows(),materials=await materialsRows(),latest=new Map();
      for(let i=1;i<rows.length;i++){const r=rows[i],materialId=String(r[2]||''),viewedAt=String(r[3]||'');if(!materialId||!viewedAt)continue;latest.set(materialId,{viewedAt,row:i});}
      const out=[];
      for(const [materialId,v] of latest){const m=await findMaterial(materialId);if(!m||m.status!=='공개')continue;out.push({id:m.id,title:m.title,description:m.description,category:m.category,language:m.language,author:m.author,year:m.year,fileName:m.fileName,fileType:m.fileType,date:m.date,views:m.views,viewedAt:v.viewedAt});}
      out.sort((a,b)=>String(b.viewedAt).localeCompare(String(a.viewedAt)));
      return {ok:true,materials:out.slice(0,30)};
    }
    case 'listFavorites':{
      const s=await session(args[0]),rows=await favoritesRows(),materials=await materialsRows(),ids=new Set();
      for(let i=1;i<rows.length;i++)if(String(rows[i][2]||'')===String(s.uid)&&rows[i][1])ids.add(String(rows[i][1]));
      const out=[];
      for(let i=1;i<materials.length;i++){
        const r=materials[i],id=String(r[0]||'');
        if(!id||!ids.has(id))continue;
        const status=String(r[12]||'').trim();
        if(status!=='공개')continue;
        out.push({id,title:String(r[1]||''),description:String(r[2]||''),category:String(r[3]||''),language:String(r[4]||''),author:String(r[5]||''),year:String(r[6]||''),fileName:String(r[8]||''),fileType:String(r[9]||''),date:String(r[10]||''),views:Number(r[14]||0)});
      }
      return {ok:true,materials:out.reverse(),ids:[...ids]};
    }
    case 'addFavorite':{
      const s=await session(args[0]),materialId=String(args[1]||'');
      if(!materialId)throw new Error('자료 정보가 없습니다.');
      const m=await findMaterial(materialId);if(!m||m.status!=='공개')throw new Error('자료를 찾을 수 없습니다.');
      const rows=await favoritesRows();
      const exists=rows.slice(1).some(r=>String(r[1]||'')===materialId&&String(r[2]||'')===String(s.uid));
      if(exists)return {ok:true,exists:true};
      const id=maxNextId(rows,'F');
      await sheetAppend('즐겨찾기',[id,materialId,s.uid,nowText()]);
      return {ok:true,exists:false,id};
    }
    case 'removeFavorite':{
      const s=await session(args[0]),materialId=String(args[1]||'');
      if(!materialId)throw new Error('자료 정보가 없습니다.');
      const rows=await favoritesRows();
      for(let i=1;i<rows.length;i++){
        if(String(rows[i][1]||'')===materialId&&String(rows[i][2]||'')===String(s.uid)){
          await sheetUpdate('즐겨찾기!A'+(i+1)+':D'+(i+1),[['','','','']]);
          break;
        }
      }
      return {ok:true};
    }
    case 'listComments':{
      const s=await session(args[0]),materialId=String(args[1]||'');
      if(!materialId)throw new Error('자료 정보가 없습니다.');
      const rows=await commentsRows(),out=[];
      for(let i=1;i<rows.length;i++){
        const r=rows[i];
        if(String(r[1]||'')!==materialId)continue;
        out.push({id:String(r[0]||''),materialId:String(r[1]||''),userId:String(r[2]||''),author:String(r[3]||''),text:String(r[4]||''),createdAt:String(r[5]||''),updatedAt:String(r[6]||'')});
      }
      out.reverse();
      return {ok:true,comments:out};
    }
    case 'addComment':{
      const s=await session(args[0]),materialId=String(args[1]||''),text=String(args[2]||'').trim();
      if(!materialId||!text)throw new Error('댓글 내용을 입력하세요.');
      if(text.length>2000)throw new Error('댓글은 2,000자 이하로 입력하세요.');
      const m=await findMaterial(materialId);if(!m||m.status!=='공개')throw new Error('자료를 찾을 수 없습니다.');
      const u=await findUserById(s.uid);if(!u)throw new Error('회원 정보를 찾을 수 없습니다.');
      const rows=await commentsRows(),id=maxNextId(rows,'C');
      const now=nowText();
      await sheetAppend('댓글',[id,materialId,s.uid,safe(u.name),safe(text),now,'']);
      return {ok:true,comment:{id,materialId,userId:s.uid,author:u.name,text,createdAt:now,updatedAt:''}};
    }
    case 'updateComment':{
      const s=await session(args[0]),id=String(args[1]||''),text=String(args[2]||'').trim();
      if(!id||!text)throw new Error('댓글 내용을 입력하세요.');
      if(text.length>2000)throw new Error('댓글은 2,000자 이하로 입력하세요.');
      const rows=await commentsRows();let row=0,owner='';
      for(let i=1;i<rows.length;i++)if(String(rows[i][0]||'')===id){row=i+1;owner=String(rows[i][2]||'');break;}
      if(!row)throw new Error('댓글을 찾을 수 없습니다.');
      if(owner!==s.uid)throw new Error('본인이 작성한 댓글만 수정할 수 있습니다.');
      const updated=nowText();
      await sheetUpdate('댓글!E'+row+':G'+row,[[safe(text),String(rows[row-1][5]||''),updated]]);
      return {ok:true,comment:{id,text,updatedAt:updated}};
    }
    case 'deleteComment':{
      const s=await session(args[0]),id=String(args[1]||'');
      if(!id)throw new Error('댓글 정보가 없습니다.');
      const rows=await commentsRows();let row=0,owner='';
      for(let i=1;i<rows.length;i++)if(String(rows[i][0]||'')===id){row=i+1;owner=String(rows[i][2]||'');break;}
      if(!row)throw new Error('댓글을 찾을 수 없습니다.');
      if(owner!==s.uid && s.role!=='관리자')throw new Error('본인이 작성한 댓글이거나 관리자여야 삭제할 수 있습니다.');
      await sheetUpdate('댓글!A'+row+':G'+row,[['','','','','','', '']]);
      return {ok:true};
    }
    case 'prepareUpload':{const s=await requireRole(args[0],['관리자']),data=args[1]||{};if(!data.fileName||!data.size)throw new Error('파일 정보가 없습니다.');if(Number(data.size)>MAX_UPLOAD_BYTES)throw new Error('Google Drive가 허용하는 최대 파일 크기를 초과했습니다.');return {ok:true,...await prepareDriveUpload(data)};}
    case 'findUploadedFile':{
      const s=await requireRole(args[0],['관리자']),data=args[1]||{};
      if(!data.fileName && !data.uploadId)throw new Error('파일 정보가 없습니다.');
      let target=null;
      if(data.uploadId){
        const esc=String(data.uploadId).replace(/'/g,"\'");
        const q=encodeURIComponent("appProperties has { key='gmcUploadId' and value='"+esc+"' } and trashed=false");
        const d=await driveJson('https://www.googleapis.com/drive/v3/files?q='+q+'&orderBy=modifiedTime desc&fields=files(id,name,mimeType,size,webViewLink,modifiedTime,parents,appProperties)&pageSize=10');
        target=(d.files||[])[0]||null;
      }
      if(!target && data.fileName){
        const name=String(data.fileName).replace(/'/g,"\'");
        const q=encodeURIComponent("name='"+name+"' and trashed=false");
        const d=await driveJson('https://www.googleapis.com/drive/v3/files?q='+q+'&orderBy=modifiedTime desc&fields=files(id,name,mimeType,size,webViewLink,modifiedTime,parents,appProperties)&pageSize=50');
        let files=d.files||[];
        if(data.size!=null) files=files.filter(f=>Number(f.size||-1)===Number(data.size));
        target=files[0]||null;
      }
      if(!target)throw new Error('Drive에서 업로드된 파일을 찾지 못했습니다.');
      return {ok:true,file:target};
    }
    case 'finalizeUpload':{
      const s=await requireRole(args[0],['관리자']),data=args[1]||{};
      let driveId=data.driveId||'', fileName=data.fileName||'';
      if(!driveId && data.uploadId){
        let found=null;
        for(let i=0;i<20 && !found;i++){
          try{found=(await api('findUploadedFile',[args[0],{uploadId:data.uploadId,fileName:data.fileName,size:data.size}])).file}catch(_){}
          if(!found)await new Promise(r=>setTimeout(r,1000));
        }
        if(!found)throw new Error('Drive 업로드는 완료되었지만 등록할 파일을 확인하지 못했습니다. 잠시 후 다시 시도해 주세요.');
        driveId=found.id; fileName=found.name||fileName;
      }
      if(!driveId||!fileName)throw new Error('업로드된 파일 정보가 없습니다.');
      await ensurePublic(driveId);
      const rows=await materialsRows(),id=maxNextId(rows,'D');
      await sheetAppend('자료',[id,safe(data.title),safe(data.description),safe(data.category),safe(data.language),safe(data.author),safe(data.year),driveId,safe(fileName),safe(data.fileType),nowText(),s.uid,'공개',nowText(),0]);
      return {ok:true,id};
    }
    case 'uploadMaterial':{const s=await requireRole(args[0],['관리자']),data=args[1]||{};if(!data.fileName||!data.base64)throw new Error('파일이 없습니다.');const f=await driveUpload(data);await ensurePublic(f.id);const rows=await materialsRows(),id=maxNextId(rows,'D');await sheetAppend('자료',[id,safe(data.title),safe(data.description),safe(data.category),safe(data.language),safe(data.author),safe(data.year),f.id,f.name,safe(data.fileType),nowText(),s.uid,'공개',nowText(),0]);return {ok:true,id};}
    case 'updateMaterial':{const s=await requireRole(args[0],MANAGE_ROLES),id=args[1],data=args[2]||{},m=await findMaterial(id);if(!m)throw new Error('자료가 없습니다.');await sheetUpdate('자료!B'+m.row+':G'+m.row,[[safe(data.title),safe(data.description),safe(data.category),safe(data.language),safe(data.author),safe(data.year)]]);await sheetUpdate('자료!J'+m.row+':J'+m.row,[[safe(data.fileType)]]);await sheetUpdate('자료!M'+m.row+':N'+m.row,[[data.status==='비공개'?'비공개':'공개',nowText()]]);return {ok:true};}
    case 'deleteMaterial':{await requireRole(args[0],['관리자']);const m=await findMaterial(args[1]);if(!m)throw new Error('자료가 없습니다.');await driveJson('https://www.googleapis.com/drive/v3/files/'+encodeURIComponent(m.driveId),{method:'PATCH',headers:{'content-type':'application/json'},body:JSON.stringify({trashed:true})});await sheetUpdate('자료!M'+m.row+':M'+m.row,[['삭제']]);return {ok:true};}
    case 'adminMaterials':{await requireRole(args[0],['관리자']);const rows=await materialsRows();return {ok:true,materials:rows.slice(1).filter(r=>r[0] && r[12]!=='삭제').map(r=>({id:r[0],title:r[1],description:r[2],category:r[3],language:r[4],author:r[5],year:r[6],driveId:r[7],fileName:r[8],fileType:r[9],status:r[12],date:r[10],views:Number(r[14]||0)})).reverse()};}
    case 'createUser':{const s=await requireRole(args[0],['관리자']),data=args[1]||{};if(!data.name||!data.username||!data.initialPassword||!ROLES.includes(data.role)||data.role==='관리자')throw new Error('필수 정보를 확인하세요.');validatePassword(data.initialPassword);if(await findUserByUsername(data.username))throw new Error('이미 존재하는 아이디입니다.');const salt=randomHex(16),hash=await hashPassword(data.initialPassword,salt),rows=await usersRows(),id=maxNextId(rows,'M');await sheetAppend('회원',[id,safe(data.name),safe(data.username),safe(data.email),safe(data.phone||''),safe(data.branch),data.role,hash,salt,true,'활성',nowText(),'']);return {ok:true,id};}
    case 'listUsers':{await requireRole(args[0],['관리자']);const rows=await usersRows();return {ok:true,users:rows.slice(1).filter(r=>r[0]).map((r,i)=>({id:r[0],name:r[1],username:r[2],email:r[3],phone:r[4],branch:r[5],role:r[6],firstLogin:String(r[9]).toLowerCase()==='true',status:r[10],created:r[11],lastLogin:r[12]}))};}case 'loginHistory':{await requireRole(args[0],['관리자']);const rows=await loginHistoryRows();return {ok:true,history:rows.slice(1).filter(r=>r[0]).map(r=>({id:r[0],userId:r[1],name:r[2],username:r[3],role:r[4],branch:r[5],loginAt:r[6]})).reverse().slice(0,200)};}
    case 'updateUser':{const s=await requireRole(args[0],['관리자']),data=args[1]||{},u=await findUserById(data.id);if(!u)throw new Error('회원이 없습니다.');const nextName=data.name!==undefined?data.name:u.name,nextUsername=data.username!==undefined?data.username:u.username,nextEmail=data.email!==undefined?data.email:u.email,nextPhone=data.phone!==undefined?data.phone:u.phone,nextBranch=data.branch!==undefined?data.branch:u.branch,nextRole=data.role!==undefined?data.role:u.role,nextStatus=data.status!==undefined?data.status:u.status;if(!ROLES.includes(nextRole))throw new Error('권한은 관리자 또는 일반회원만 선택할 수 있습니다.');if(data.id===s.uid&&nextStatus==='비활성')throw new Error('현재 로그인한 관리자 계정은 비활성화할 수 없습니다.');await sheetUpdate('회원!B'+u.row+':G'+u.row,[[safe(nextName),safe(nextUsername),safe(nextEmail),safe(nextPhone),safe(nextBranch),nextRole]]);await sheetUpdate('회원!K'+u.row+':K'+u.row,[[nextStatus==='비활성'?'비활성':'활성']]);return {ok:true};}
    case 'resetUserPassword':{const s=await requireRole(args[0],['관리자']);validatePassword(args[2]);const u=await findUserById(args[1]);if(!u)throw new Error('회원이 없습니다.');const salt=randomHex(16),hash=await hashPassword(args[2],salt);await sheetUpdate('회원!H'+u.row+':J'+u.row,[[hash,salt,true]]);return {ok:true};}
    case 'makeAllMaterialsPublic':{await requireRole(args[0],['관리자']);const rows=await materialsRows();let count=0,fail=0;for(let i=1;i<rows.length;i++){const driveId=String(rows[i][7]||'');if(!driveId||String(rows[i][12]||'')==='삭제')continue;try{await ensurePublic(driveId);count++;}catch(e){fail++;}}return {ok:true,count,fail};}
    case 'dashboard':{await requireRole(args[0],['관리자']);const us=await usersRows(),ms=await materialsRows();return {ok:true,stats:{users:Math.max(0,us.length-1),activeUsers:us.slice(1).filter(r=>r[10]==='활성').length,materials:ms.slice(1).filter(r=>r[12]==='공개').length,views:ms.slice(1).reduce((a,r)=>a+Number(r[14]||0),0)}};}
    default:throw new Error('지원하지 않는 요청입니다.');
  }
}

async function handleApi(request,env,ctx){
  try{
    config(env);
    if(!CFG.SHEET_ID||!CFG.ROOT_FOLDER_ID||!CFG.SA_EMAIL||!CFG.SA_PRIVATE_KEY||!CFG.SESSION_SECRET)return jsonResponse({ok:false,message:'Cloudflare Worker Secret/Variable 설정이 아직 완료되지 않았습니다.'},500);
    const body=await request.json();const result=await api(String(body.action||''),Array.isArray(body.args)?body.args:[],ctx);return jsonResponse(result);
  }catch(e){return jsonResponse({ok:false,message:String(e?.message||e)},400);}
}

export default {
  async fetch(request,env,ctx){
    CFG=config(env);
    const url=new URL(request.url);
    if(url.pathname==='/'||url.pathname==='/index.html')return new Response(INDEX_HTML,{headers:{'content-type':'text/html; charset=UTF-8','cache-control':'no-store'}});
    if(url.pathname==='/oauth/start')return oauthStart(request);
    if(url.pathname==='/oauth/callback')return oauthCallback(request);
    if(url.pathname==='/api/health')return jsonResponse({ok:true,service:'gmc-worker',version:'v33-direct-drive-upload'});
    if(url.pathname==='/api'){if(request.method==='OPTIONS')return new Response(null,{status:204,headers:{'access-control-allow-origin':'https://gmc-mission-archive-mm.netlify.app','access-control-allow-methods':'POST, OPTIONS','access-control-allow-headers':'Content-Type'}});if(request.method!=='POST')return jsonResponse({ok:false,message:'POST only'},405);return handleApi(request,env,ctx);}
    return new Response('Not Found',{status:404});
  }
};

// GitHub Actions deployment test marker - keep vars
