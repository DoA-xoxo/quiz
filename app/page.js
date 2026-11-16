"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Clock3, Ticket, Sparkles, LockKeyhole } from "lucide-react";

export default function HomePage() {
  const [data,setData]=useState(null);
  const [answer,setAnswer]=useState("");
  const [selected,setSelected]=useState("");
  const [loading,setLoading]=useState(true);
  const [sending,setSending]=useState(false);
  const [notice,setNotice]=useState(null);
  const solvedStorageKey="film-archive-solved-quizzes";
  const loadQuiz=useCallback(async(silent=false)=>{
    if(!silent)setLoading(true);
    try {
      const response=await fetch("/api/quiz",{cache:"no-store"});
      const result=await response.json();
      if(!response.ok)throw new Error(result.error||"퀴즈를 불러오지 못했어요.");
      let solvedIds=[];
      try{solvedIds=JSON.parse(localStorage.getItem(solvedStorageKey)||"[]");}catch{}
      const alreadySolved=Boolean(result.quiz?.id&&solvedIds.includes(String(result.quiz.id)));
      setData(old=>{
        const sameQuiz=old?.quiz?.id&&old.quiz.id===result.quiz?.id;
        return {...result,progress:{...(sameQuiz?old.progress:{}),solved:alreadySolved||(sameQuiz&&Boolean(old.progress?.solved))}};
      });
    } catch(error){setNotice({type:"error",title:"잠시 문제가 생겼어요",message:error.message});}
    finally{if(!silent)setLoading(false);}
  },[]);
  useEffect(()=>{loadQuiz();},[loadQuiz]);
  useEffect(()=>{const timer=setInterval(()=>loadQuiz(true),30000);return()=>clearInterval(timer);},[loadQuiz]);
  async function submitAnswer(event){
    event.preventDefault();
    const value=data?.quiz?.answer_type==="choice"?selected:answer;
    if(!value.trim()||!data?.quiz||sending)return;
    setSending(true);
    try{
      const response=await fetch("/api/quiz/answer",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({quizId:data.quiz.id,answer:value,wrongCount:data.progress?.wrongCount??0})});
      const result=await response.json();if(!response.ok)throw new Error(result.error||"답안을 제출하지 못했어요.");
      if(result.status==="correct"){
        try{
          const solvedIds=JSON.parse(localStorage.getItem(solvedStorageKey)||"[]");
          if(!solvedIds.includes(String(data.quiz.id)))solvedIds.push(String(data.quiz.id));
          localStorage.setItem(solvedStorageKey,JSON.stringify(solvedIds));
        }catch{}
        setData(old=>old?{...old,progress:{...old.progress,solved:true}}:old);
        const reward=data.quiz.slot===3?20:10;
        setNotice({type:"success",title:"정답이에요!",message:`퀴즈를 풀었어요. ${reward} 포인트 획득!\n다음 상영 시간에 새로운 문제가 공개됩니다.`});
      } else if(result.status==="wrong"){
        setData(old=>old?{...old,progress:{...old.progress,wrongCount:result.wrongCount}}:old);
        setNotice({type:"wrong",title:"아쉽지만 오답이에요",message:result.wrongCount>=2?"힌트를 확인하고 다시 도전해 보세요.":"다시 한 번 생각해 보세요!",hint:result.wrongCount>=2?result.hint:""});
      } else if(result.status==="inactive"){
        await loadQuiz();
        setNotice({type:"info",title:"다음 상영 시간이에요",message:"새로운 퀴즈를 불러왔어요."});
      }
      setAnswer("");setSelected("");
    }catch(error){setNotice({type:"error",title:"제출에 실패했어요",message:error.message});}
    finally{setSending(false);}
  }
  const quiz=data?.quiz;const solved=Boolean(data?.progress?.solved);
  return <main className="site-shell">
    <header className="topbar"><Link href="/" className="brand-mark">THE FILM ARCH!VE</Link></header>
    <section className="hero"><p className="eyebrow">THE CHRISTMAS SPECIAL</p><h1>TODAY'S QUIZ</h1><p className="hero-copy">오늘의 필름을 열람하시겠습니까?</p><div className="hero-rule"/></section>
    <section className="quiz-wrap">{loading?<div className="paper-card empty-card"><div className="loader"/><p>상영 준비 중이에요.</p></div>:!quiz?<div className="paper-card empty-card"><Ticket className="empty-icon" size={28}/><p className="eyebrow">NOW SHOWING</p><h2>오늘의 퀴즈를 준비하고 있어요.</h2><p className="muted">관리자가 문제를 등록하면 이곳에서 바로 만날 수 있어요.</p></div>:<article className="paper-card quiz-card">
      <div className="quiz-meta"><span className="meta-label">오늘의 퀴즈 {quiz.slot}</span><span className="time-label"><Clock3 size={14}/>{quiz.timeRange}</span></div><div className="thin-rule"/>
      {quiz.image_url&&<img className="question-image" src={quiz.image_url} alt="퀴즈 참고 이미지"/>}
      <p className="question-kicker">QUESTION {String(quiz.slot).padStart(2,"0")}</p><h2 className="question-title">{quiz.question}</h2>
{solved ? (
  <div className="solved-panel">
    <Sparkles size={20}/>
    <strong>정답을 맞혔어요!</strong>
    <span>{quiz.slot===3?20:10} 포인트 획득!</span>
    <span>다음 상영 시간에 새로운 문제가 공개됩니다.</span>
  </div>
) : (
  <form onSubmit={submitAnswer} className="answer-form">
        {quiz.answer_type==="choice"?<div className="choice-list">{(quiz.options||[]).map((option,index)=><label className={`choice-option ${selected===option?"selected":""}`} key={`${option}-${index}`}><input type="radio" name="choice" value={option} checked={selected===option} onChange={()=>setSelected(option)}/><span className="choice-dot"/><span>{option}</span></label>)}</div>:<input className="answer-input" value={answer} onChange={e=>setAnswer(e.target.value)} placeholder="정답을 입력해 주세요." autoComplete="off"/>}
        <button className="primary-button submit-button" type="submit" disabled={sending||!(quiz.answer_type==="choice"?selected:answer.trim())}>{sending?"제출 중...":"정답 제출하기"}</button>
      </form>
)}
      <div className="card-footnote"><span>오답 횟수 {data?.progress?.wrongCount??0} 회</span><span>힌트는 2 회 오답 후 공개 됩니다.</span></div>
    </article>}</section>
    <footer className="site-footer"><span>ⓒ胡桃劇場</span><Link href="/admin"><LockKeyhole size={12}/> 관리자</Link></footer>
    {notice&&<div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&setNotice(null)}><section className={`result-modal ${notice.type}`} role="dialog" aria-modal="true"><button className="modal-close" onClick={()=>setNotice(null)}>×</button><p className="eyebrow">THE RESULT</p><h2>{notice.title}</h2><p className="modal-message">{notice.message}</p>{notice.hint&&<div className="hint-box"><span>힌트</span><p>{notice.hint}</p></div>}<button className="primary-button modal-button" onClick={()=>setNotice(null)}>확인</button></section></div>}
  </main>;
}
