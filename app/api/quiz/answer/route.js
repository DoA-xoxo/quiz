import {NextResponse} from "next/server";
import {supabaseAdmin} from "@/lib/supabaseAdmin";
import {getKoreaQuizTime} from "@/lib/quizTime";
export async function POST(request){
 try{
  const {quizId,answer,wrongCount=0}=await request.json();
  if(!quizId||typeof answer!=="string"||!answer.trim())return NextResponse.json({error:"답안 정보를 확인해 주세요."},{status:400});
  const {date,slot}=getKoreaQuizTime();
  const {data:quiz,error}=await supabaseAdmin.from("quizzes").select("id,quiz_date,slot,correct_answer,hint").eq("id",quizId).maybeSingle();
  if(error)return NextResponse.json({error:error.message},{status:500});
  if(!quiz||quiz.quiz_date!==date||quiz.slot!==slot)return NextResponse.json({status:"inactive"});
  const normalized=value=>value.trim().replace(/\\s+/g," ").toLocaleLowerCase();
  if(normalized(answer)===normalized(quiz.correct_answer))return NextResponse.json({status:"correct"});
  const nextWrongCount=Math.max(0,Number.isInteger(wrongCount)?wrongCount:0)+1;
  return NextResponse.json({status:"wrong",wrongCount:nextWrongCount,hint:nextWrongCount>=2?quiz.hint:""});
 }catch{return NextResponse.json({error:"요청을 처리하지 못했어요."},{status:400});}
}
