import {NextResponse} from "next/server";
import {supabaseAdmin} from "@/lib/supabaseAdmin";
import {getKoreaQuizTime} from "@/lib/quizTime";
export const dynamic="force-dynamic";
export async function GET(request){
 const playerId=new URL(request.url).searchParams.get("playerId");
 if(!playerId||!/^[0-9a-f-]{36}$/i.test(playerId))return NextResponse.json({error:"플레이어 정보가 올바르지 않아요."},{status:400});
 const {date,slot,range}=getKoreaQuizTime();
 const {data:quiz,error:quizError}=await supabaseAdmin.from("quizzes").select("id,quiz_date,slot,question,answer_type,options,image_url").eq("quiz_date",date).eq("slot",slot).maybeSingle();
 if(quizError)return NextResponse.json({error:quizError.message},{status:500});
 const {error:playerError}=await supabaseAdmin.from("quiz_players").upsert({player_id:playerId},{onConflict:"player_id",ignoreDuplicates:true});
 if(playerError)return NextResponse.json({error:playerError.message},{status:500});
 const {data:player}=await supabaseAdmin.from("quiz_players").select("points").eq("player_id",playerId).maybeSingle();
 let progress={wrongCount:0,solved:false};
 if(quiz){const {data:saved}=await supabaseAdmin.from("quiz_progress").select("wrong_count,solved").eq("player_id",playerId).eq("quiz_id",quiz.id).maybeSingle();if(saved)progress={wrongCount:saved.wrong_count,solved:saved.solved};}
 return NextResponse.json({date,slot,timeRange:range,points:player?.points??0,quiz:quiz?{...quiz,timeRange:range}:null,progress});
}
