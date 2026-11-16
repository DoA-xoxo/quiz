import {NextResponse} from "next/server";
import {supabaseAdmin} from "@/lib/supabaseAdmin";
import {isAdminRequest} from "@/lib/adminAuth";
export const runtime="nodejs";
export async function POST(request){
 if(!isAdminRequest(request))return NextResponse.json({error:"관리자 인증이 필요해요."},{status:401});
 try{
  const formData=await request.formData();const file=formData.get("file");
  if(!file||typeof file==="string"||!file.type.startsWith("image/"))return NextResponse.json({error:"이미지 파일을 선택해 주세요."},{status:400});
  if(file.size>5*1024*1024)return NextResponse.json({error:"이미지는 5MB 이하만 업로드할 수 있어요."},{status:400});
  const extension=file.name.split(".").pop()?.replace(/[^a-zA-Z0-9]/g,"")||"png";
  const path=`${Date.now()}-${crypto.randomUUID()}.${extension}`;
  const buffer=Buffer.from(await file.arrayBuffer());
  const {error}=await supabaseAdmin.storage.from("quiz-images").upload(path,buffer,{contentType:file.type,upsert:false});
  if(error)throw error;
  const {data}=supabaseAdmin.storage.from("quiz-images").getPublicUrl(path);
  return NextResponse.json({url:data.publicUrl});
 }catch(error){return NextResponse.json({error:error.message||"이미지 업로드에 실패했어요."},{status:500});}
}
