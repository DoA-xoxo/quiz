# 수수께끼 상영관

Next.js + Supabase 기반의 크리스마스 퀴즈 사이트입니다.

## 포함 기능

- 회원가입·로그인·유저 식별 없이 누구나 바로 참여
- 포인트 적립 및 개인별 기록 저장 없음
- 한국 시간(KST) 기준 매일 00:00 / 08:00 / 16:00에 퀴즈 자동 전환
- 단답형 / 다지선다형
- 2회 오답부터 힌트 공개, 답안 제출 횟수 제한 없음
- 날짜별 퀴즈 3개 관리자 등록 / 수정 / 삭제
- 관리자 이미지 업로드 (최대 5MB)
- 반응형 모바일 레이아웃

오답 횟수와 정답 여부는 방문자의 현재 브라우저 화면에서만 임시 관리됩니다. 새로고침하거나 다른 기기로 접속하면 초기화됩니다.

## Supabase 준비

1. Supabase 프로젝트를 생성합니다.
2. SQL Editor에서 `supabase/schema.sql` 전체를 실행합니다.
3. Project Settings → API에서 Project URL과 `service_role` 키를 확인합니다.
4. `service_role` 키는 절대 브라우저 코드나 공개 저장소에 직접 넣지 마세요.

기존 버전에서 플레이어/포인트 테이블과 답안 저장 함수가 있었다면 이 SQL이 해당 기능을 삭제합니다. 퀴즈 데이터는 유지됩니다.

## 환경변수

Vercel Project → Settings → Environment Variables에 다음 세 변수를 등록합니다.

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_PASSWORD`

`SUPABASE_SERVICE_ROLE_KEY`와 관리자 비밀번호는 서버 전용 비밀값입니다.

## 배포

Vercel에서 이 저장소를 Import하고 Framework Preset은 Next.js, Root Directory는 저장소 루트로 설정한 뒤 환경변수를 등록하고 Deploy합니다.

## 관리자

배포 주소 뒤에 `/admin`을 붙여 접속합니다. 관리자 비밀번호로 입장한 다음 날짜를 선택하고 퀴즈 1~3을 작성해 저장합니다.

- 퀴즈 1: 00:00~07:59
- 퀴즈 2: 08:00~15:59
- 퀴즈 3: 16:00~23:59
