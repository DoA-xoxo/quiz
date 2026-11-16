import {NextResponse} from "next/server";
import {supabaseAdmin} from "@/lib/supabaseAdmin";
export async function POST(request){
 try{
  const {playerId,quizId,answer}=await request.json();
  if(!playerId||!/^[0-9a-f-]{36}$/i.test(playerId)||!quizId||!answer||typeof answer!=="string")return NextResponse.json({error:"답안 정보가 올바르지 않아요."},{status:400});
  const {data,error}=await supabaseAdmin.rpc("submit_quiz_answer",{p_player_id:playerId,p_quiz_id:quizId,p_answer:answer});
  if(error)return NextResponse.json({error:error.message},{status:500});
  if(!data)return NextResponse.json({error:"결과를 확인하지 못했어요."},{status:500});
  return NextResponse.json(data);
 }catch{return NextResponse.json({error:"요청을 처리하지 못했어요."},{status:400});}
}
