import {NextResponse} from "next/server";
import {supabaseAdmin} from "@/lib/supabaseAdmin";
import {isAdminRequest} from "@/lib/adminAuth";
export const dynamic="force-dynamic";
export async function GET(request){
 if(!isAdminRequest(request))return NextResponse.json({error:"관리자 인증이 필요해요."},{status:401});
 const date=new URL(request.url).searchParams.get("date");
 if(!date||!/^\d{4}-\d{2}-\d{2}$/.test(date))return NextResponse.json({error:"날짜를 확인해 주세요."},{status:400});
 const {data,error}=await supabaseAdmin.from("quizzes").select("*").eq("quiz_date",date).order("slot");
 if(error)return NextResponse.json({error:error.message},{status:500});
 return NextResponse.json({quizzes:data||[]});
}
export async function POST(request){
 if(!isAdminRequest(request))return NextResponse.json({error:"관리자 인증이 필요해요."},{status:401});
 try{
  const {date,quizzes}=await request.json();
  if(!date||!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Array.isArray(quizzes))return NextResponse.json({error:"저장할 날짜와 퀴즈 정보를 확인해 주세요."},{status:400});
  for(const item of quizzes){
   if(![1,2,3].includes(Number(item.slot)))continue;
   if(!item.question?.trim()){const {error}=await supabaseAdmin.from("quizzes").delete().eq("quiz_date",date).eq("slot",item.slot);if(error)throw error;continue;}
   if(!item.correct_answer?.trim())return NextResponse.json({error:`퀴즈 ${item.slot}의 정답을 입력해 주세요.`},{status:400});
   if(!["short","choice"].includes(item.answer_type))return NextResponse.json({error:`퀴즈 ${item.slot}의 유형이 올바르지 않아요.`},{status:400});
   if(item.answer_type==="choice"&&(!Array.isArray(item.options)||item.options.length<2))return NextResponse.json({error:`퀴즈 ${item.slot}의 선택지를 두 개 이상 입력해 주세요.`},{status:400});
   const {error}=await supabaseAdmin.from("quizzes").upsert({quiz_date:date,slot:Number(item.slot),question:item.question.trim(),answer_type:item.answer_type,correct_answer:item.correct_answer.trim(),hint:item.hint||"",options:item.answer_type==="choice"?item.options:[],image_url:item.image_url||null},{onConflict:"quiz_date,slot"});
   if(error)throw error;
  }
  return NextResponse.json({ok:true});
 }catch(error){return NextResponse.json({error:error.message||"저장에 실패했어요."},{status:500});}
}
