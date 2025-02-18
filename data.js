
let item1 = {
    id: 1,
    title: "인터스텔라",
    director: "크리스토퍼 놀란",
    year: 2014,
    genre: "SF",
    summary: "지구의 미래가 불투명해진 시대, 우주로 떠난 이들의 여정..."
  }
  
  let item2 = {
    id: 2,
    title: "그랜드 부다페스트 호텔",
    director: "웨스 앤더슨",
    year: 2014,
    genre: "코미디",
    summary: "유럽의 한 호텔에서 벌어지는 이야기와 독특한 미장센..."
  }
  
  let item3 = {
    id: 3,
    title: "기생충",
    director: "봉준호",
    year: 2019,
    genre: "드라마",
    summary: "서로 다른 두 가정의 만남이 부른 예기치 못한 결과..."
  }
  
  let item4 = {
    id: 4,
    title: "킹스맨: 시크릿 에이전트",
    director: "매튜 본",
    year: 2014,
    genre: "액션",
    summary: "영국의 비밀 정보기관 킹스맨에 스카우트된 신입 요원의 활약..."
  }
  
  let item5 = {
    id: 5,
    title: "라라랜드",
    director: "데이미언 차젤레",
    year: 2016,
    genre: "뮤지컬",
    summary: "재즈 피아니스트와 배우 지망생이 꿈을 좇아가는 로맨틱 뮤지컬..."
  }

  let db = new Map ([
    [1, item1],
    [2, item2],
    [3, item3],
    [4, item4],
    [5, item5]
  ])

  let id = 6

  module.exports = {db, id}