// 화면문구 탭 기반 표시 문구 적용기.
// 공유용 현황 시트 '화면문구' 탭(문구ID/표시 문구)을 읽어
// data-sheet-label가 붙은 요소의 문구를 시트 값으로 바꿉니다.
// 시트 조회 실패 시 HTML의 정적 사본이 그대로 유지됩니다.
window.AXSheetLabels=(()=>{
 const ESC={'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'};
 function escapeHtml(v){return String(v==null?'':v).replace(/[&<>"']/g,c=>ESC[c]);}
 function num(v){const n=parseInt(String(v==null?'':v).replace(/[^0-9]/g,''),10);return isNaN(n)?null:n;}
 function formatDate(s){const m=/^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(String(s||''));return m?m[1]+'년 '+Number(m[2])+'월 '+Number(m[3])+'일':String(s||'');}
 function kpi(data,title){const k=(data.kpis||[]).find(x=>String(x.title||'')===title);return k&&String(k.value??'')!==''?String(k.value):'';}
 function fill(t,data){
  const acc=kpi(data,'오픈랩 제안 접수'),sel=kpi(data,'오픈랩 적격 선정'),pen=kpi(data,'오픈랩 심사예정');
  const done=(num(acc)!=null&&num(pen)!=null)?String(num(acc)-num(pen)):'';
  const map={'{기준일}':data.asOf?formatDate(data.asOf):'','{접수}':acc,'{선정}':sel,'{심사예정}':pen,'{심사완료}':done,'{제안대상}':kpi(data,'협력 제안 대상'),'{미팅대학}':kpi(data,'협력 미팅 대학'),'{미팅교수}':kpi(data,'협력 미팅 교수'),'{콘텐츠}':kpi(data,'직원 AI 활용 콘텐츠')};
  let out=String(t);
  Object.keys(map).forEach(k=>{out=out.split(k).join(map[k]);});
  return out;
 }
 function rich(t){return escapeHtml(t).replace(/&lt;strong&gt;/g,'<strong>').replace(/&lt;\/strong&gt;/g,'</strong>').replace(/\n/g,'<br>');}
 function apply(data){
  const labels={};
  (data.labels||[]).forEach(r=>{const id=String(r['문구ID']||'').trim();if(id)labels[id]=String(r['표시 문구']??'');});
  document.querySelectorAll('[data-sheet-label]').forEach(el=>{
   const raw=labels[el.getAttribute('data-sheet-label')];
   if(raw===undefined||raw==='')return;
   const text=fill(raw,data);
   if(el.hasAttribute('data-sheet-rich'))el.innerHTML=rich(text);else el.textContent=text;
  });
  document.querySelectorAll('[data-sheet-aria]').forEach(el=>{
   const raw=labels[el.getAttribute('data-sheet-aria')];
   if(raw)el.setAttribute('aria-label',fill(raw,data));
  });
  // 학계협력 수치: 핵심지표 지표명과 연동
  document.querySelectorAll('[data-kpi-value]').forEach(el=>{
   const k=(data.kpis||[]).find(x=>String(x.title||'')===el.getAttribute('data-kpi-value'));
   if(k&&String(k.value??'')!=='')el.textContent=String(k.value)+(k.unit||'');
  });
  // 오픈랩 진행 바: 핵심지표 건수로 다시 그림
  const bar=document.getElementById('openlab-bar');
  if(bar){
   const total=num(kpi(data,'오픈랩 제안 접수')),sel=num(kpi(data,'오픈랩 적격 선정')),pen=num(kpi(data,'오픈랩 심사예정'));
   if(total&&sel!=null&&pen!=null&&total>=sel+pen){
    let html='';
    for(let i=0;i<sel;i++)html+='<span class="ax-selected"></span>';
    for(let i=0;i<pen;i++)html+='<span class="ax-pending"></span>';
    for(let i=sel+pen;i<total;i++)html+='<span></span>';
    bar.innerHTML=html;
   }
  }
 }
 return {apply};
})();
