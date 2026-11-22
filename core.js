(function(root){
'use strict';
const courses=['컴퓨터네트워크','확률통계','클라우드컴퓨팅'];
const catalog=courses.flatMap((course,c)=>[11,12,13].map((week,i)=>({id:`c${c}-w${week}`,course,week,date:`2026-11-${String(9+i*7).padStart(2,'0')}`,title:`${course} ${week}주차 강의노트`,type:'TXT',content:`한 번만 가상 캠퍼스 | 학습용 샘플\n과목: ${course}\n주차: ${week}\n학습 목표: ${['패킷 전달과 라우팅','표본평균과 추정','가상화와 자원 관리'][c]}\n이 자료는 시연을 위해 직접 생성한 예제이며 실제 대학 자료가 아닙니다.\n`})));
const sequence=['course','date','search','open','download'];
function similarity(a,b){let d=Array.from({length:a.length+1},(_,i)=>[i]);for(let j=0;j<=b.length;j++)d[0][j]=j;for(let i=1;i<=a.length;i++)for(let j=1;j<=b.length;j++)d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1));return 1-d[a.length][b.length]/Math.max(a.length,b.length,1);}
const taskTypes={
 'lecture.download':{label:'강의자료 모으기',goal:'새 강의자료를 찾아 내려받기',targets:courses},
 'job.collect':{label:'관심 공고 정리',goal:'조건에 맞는 채용공고를 찾아 정리하기',targets:['네트워크 직무','클라우드 직무','데이터 직무']},
 'receipt.download':{label:'영수증 모으기',goal:'필요한 영수증을 찾아 내려받기',targets:['교통비','도서 구입비','사무용품비']}
};
for(const [kind,t] of Object.entries(taskTypes)){if(kind==='lecture.download')continue;t.targets.forEach((course,c)=>[11,12,13].forEach((week,i)=>catalog.push({id:`${kind.split('.')[0]}${c}-w${week}`,kind,course,week,date:`2026-11-${String(9+i*7).padStart(2,'0')}`,title:kind==='job.collect'?`${course} · ${['공고 A','공고 B','공고 C'][i]}`:`${course} · ${['결제내역 A','결제내역 B','결제내역 C'][i]}`,type:'TXT',content:`한 번만 직접 생성한 시연 데이터\n분류: ${course}\n기준일: 2026-11-${String(9+i*7).padStart(2,'0')}\n${kind==='job.collect'?'가상 채용공고 · 실제 기업의 채용 정보가 아닙니다.':'가상 영수증 · 실제 결제 또는 증빙이 아닙니다.'}\n${kind==='job.collect'?'근무지역: 서울 / 고용형태: 신입 정규직':`금액: ${(c+1)*12000}원 / 상태: 결제완료`}\n`})));}
function taskKind(doc){return doc.kind||'lecture.download';}
function analyze(sessions,muted=false){
 if(muted)return null;
 const norm=s=>s.steps.filter(x=>!['course','date'].includes(x));
 const valid=sessions.filter(s=>taskTypes[s.goal]&&s.steps.includes('search')&&s.steps.includes('open')&&s.steps.at(-1)==='download');
 let best=[];
 for(const seed of [...valid].reverse()){
  const group=valid.filter(s=>s.goal===seed.goal&&similarity(norm(seed),norm(s))>=.7);
  if(group.length>=3){best=group;break;}
 }
 if(best.length<3)return null;
 const kind=best.at(-1).goal,t=taskTypes[kind];
 const vars=['course','date','filename'].filter(k=>new Set(best.map(s=>s[k])).size>1);
 return {goal:t.goal,task_kind:kind,targets:t.targets,count:best.length,similarity:Math.round(100*best.reduce((n,s)=>n+similarity(norm(best[0]),norm(s)),0)/best.length),variables:vars,constants:['조건으로 검색','내용 확인','결과 모으기'],evidence:best.map(s=>({course:s.course,date:s.date,steps:s.steps})),manualSteps:Math.round(best.reduce((n,s)=>n+s.steps.length,0)/best.length)};
}
function search(course,date,empty=false){return empty?[]:catalog.filter(d=>d.course===course&&d.date>=date);}
function plan(candidate,course,date){if(!candidate||!(candidate.targets||courses).includes(course)||!/^2026-11-\d{2}$/.test(date))throw Error('계획 입력을 확인해 주세요.');return {goal:candidate.goal,course,date,scope:'동의한 시연 공간만',steps:['검색 조건 적용','검색 버튼 탐색','자료 내용 확인','결과 파일 생성·검증'],success:'과목·기준일 일치, 본문 존재, 결과 파일 재검증',approved:false};}
function verify(docs,course,date){return docs.length>0&&new Set(docs.map(d=>d.id)).size===docs.length&&docs.every(d=>d.course===course&&d.date>=date&&typeof d.content==='string'&&['과목','분류'].some(label=>d.content.includes(`${label}: ${course}`)));}
function csv(docs){const q=s=>'"'+String(s).replaceAll('"','""')+'"';return '\ufeff'+[['id','course','date','title','content'],...docs.map(d=>[d.id,d.course,d.date,d.title,d.content])].map(r=>r.map(q).join(',')).join('\r\n');}
const api={courses,catalog,taskTypes,taskKind,sequence,similarity,analyze,search,plan,verify,csv};if(typeof module!=='undefined')module.exports=api;root.Hanbeon=api;
})(typeof globalThis==='undefined'?this:globalThis);
