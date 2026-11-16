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

alter table public.quizzes enable row level security;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('quiz-images','quiz-images',true,5242880,array['image/png','image/jpeg','image/webp','image/gif'])
on conflict(id) do update set public=true,file_size_limit=5242880;

-- 기존 버전에서 생성한 플레이어/포인트 저장 기능 제거
drop function if exists public.submit_quiz_answer(uuid,uuid,text);
drop table if exists public.quiz_progress;
drop table if exists public.quiz_players;
