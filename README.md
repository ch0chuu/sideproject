# 🎬 Movie API

이 프로젝트는 Node.js와 MariaDB를 사용하여 영화 정보를 관리하는 RESTful API입니다.

## 📌 주요 기능
- **영화 조회**
  - 전체 영화 목록 조회 (`GET /items`)
  - 특정 장르의 영화 조회 (`GET /items/genre?genres=로맨스,액션`)
  - 특정 ID의 영화 조회 (`GET /items/:id`)
- **영화 관리**
  - 새로운 영화 등록 (`POST /items`)
  - 영화 정보 수정 (`PUT /items/:id`)
  - 특정 영화 삭제 (`DELETE /items/:id`)
  - 전체 영화 삭제 (`DELETE /items`)
- **사용자 관리**
  - 회원가입 (`POST /users/register`)
  - 로그인 (`POST /users/login`)
  - 회원 정보 조회 (`GET /users/:id`)
  - 회원 탈퇴 (`DELETE /users/:id`)

## 🛠 기술 스택
- **Backend**: Node.js, Express
- **Database**: MariaDB (mysql2/promise)
- **Environment**: Docker (옵션)


