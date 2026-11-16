create extension if not exists pgcrypto;
create table if not exists public.quizzes (
 id uuid primary key default gen_random_uuid(),
 quiz_date date not null,
 slot smallint not null check(slot in(1,2,3)),
 question text not null,
 answer_type text not null check(answer_type in('short','choice')),
 correct_answer text not null,
 hint text not null default '',
 options jsonb not null default '[]'::jsonb,
 image_url text,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(quiz_date,slot)
);
create table if not exists public.quiz_players(player_id uuid primary key,points integer not null default 0 check(points>=0),created_at timestamptz not null default now());
create table if not exists public.quiz_progress(
 id uuid primary key default gen_random_uuid(),
 player_id uuid not null references public.quiz_players(player_id) on delete cascade,
 quiz_id uuid not null references public.quizzes(id) on delete cascade,
 wrong_count integer not null default 0,
 solved boolean not null default false,
 rewarded boolean not null default false,
 updated_at timestamptz not null default now(),
 unique(player_id,quiz_id)
);
alter table public.quizzes enable row level security;
alter table public.quiz_players enable row level security;
alter table public.quiz_progress enable row level security;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('quiz-images','quiz-images',true,5242880,array['image/png','image/jpeg','image/webp','image/gif'])
on conflict(id) do update set public=true,file_size_limit=5242880;
create or replace function public.submit_quiz_answer(p_player_id uuid,p_quiz_id uuid,p_answer text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare
 v_quiz public.quizzes%rowtype; v_progress public.quiz_progress%rowtype;
 v_points integer; v_today date; v_hour integer; v_slot integer; v_correct boolean;
begin
 select * into v_quiz from public.quizzes where id=p_quiz_id;
 if not found then return jsonb_build_object('status','inactive'); end if;
 v_today:=(now() at time zone 'Asia/Seoul')::date;
 v_hour:=extract(hour from(now() at time zone 'Asia/Seoul'));
 v_slot:=case when v_hour<8 then 1 when v_hour<16 then 2 else 3 end;
 if v_quiz.quiz_date<>v_today or v_quiz.slot<>v_slot then return jsonb_build_object('status','inactive'); end if;
 insert into public.quiz_players(player_id) values(p_player_id) on conflict(player_id) do nothing;
 insert into public.quiz_progress(player_id,quiz_id) values(p_player_id,p_quiz_id) on conflict(player_id,quiz_id) do nothing;
 select * into v_progress from public.quiz_progress where player_id=p_player_id and quiz_id=p_quiz_id for update;
 select points into v_points from public.quiz_players where player_id=p_player_id;
 if v_progress.solved then return jsonb_build_object('status','already_solved','points',v_points,'rewarded',false); end if;
 v_correct:=lower(regexp_replace(trim(p_answer),'\s+',' ','g'))=lower(regexp_replace(trim(v_quiz.correct_answer),'\s+',' ','g'));
 if v_correct then
  update public.quiz_progress set solved=true,rewarded=true,updated_at=now() where id=v_progress.id;
  update public.quiz_players set points=points+30 where player_id=p_player_id returning points into v_points;
  return jsonb_build_object('status','correct','points',v_points,'rewarded',true);
 else
  update public.quiz_progress set wrong_count=wrong_count+1,updated_at=now() where id=v_progress.id returning * into v_progress;
  return jsonb_build_object('status','wrong','wrongCount',v_progress.wrong_count,'hint',case when v_progress.wrong_count>=2 then v_quiz.hint else null end,'points',v_points);
 end if;
end; $$;
revoke all on function public.submit_quiz_answer(uuid,uuid,text) from public,anon,authenticated;
grant execute on function public.submit_quiz_answer(uuid,uuid,text) to service_role;
