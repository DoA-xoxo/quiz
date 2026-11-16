import {NextResponse} from "next/server";
import {supabaseAdmin} from "@/lib/supabaseAdmin";
import {getKoreaQuizTime} from "@/lib/quizTime";
export const dynamic="force-dynamic";
export async function GET(){
 const {date,slot,range}=getKoreaQuizTime();
 const {data:quiz,error}=await supabaseAdmin.from("quizzes").select("id,quiz_date,slot,question,answer_type,options,image_url").eq("quiz_date",date).eq("slot",slot).maybeSingle();
 if(error)return NextResponse.json({error:error.message},{status:500});
 return NextResponse.json({date,slot,timeRange:range,quiz:quiz?{...quiz,timeRange:range}:null});
}
