const express = require("express")
const app = express()
const port = 1234

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

  app.get('/item/:id', (req,res) => {

    let { id } = req.params
    id = parseInt(id)


    if (id === 1) {
        return res.json({
        영화제목: item1.title,
        영화감독: item1.director,
        개봉년도: item1.year,
        장르: item1.genre,
        줄거리: item1.summary
        });
    } else if (id === 2) {
        return res.json({
        영화제목: item2.title,
        영화감독: item2.director,
        개봉년도: item2.year,
        장르: item2.genre,
        줄거리: item2.summary
        });
    } else if (id === 3) {
        return res.json({
        영화제목: item3.title,
        영화감독: item3.director,
        개봉년도: item3.year,
        장르: item3.genre,
        줄거리: item3.summary
        });
    } else if (id === 4) {
        return res.json({
        영화제목: item4.title,
        영화감독: item4.director,
        개봉년도: item4.year,
        장르: item4.genre,
        줄거리: item4.summary
        });
    } else if (id === 5) {
        return res.json({
        영화제목: item5.title,
        영화감독: item5.director,
        개봉년도: item5.year,
        장르: item5.genre,
        줄거리: item5.summary
        });
    } else {
        //범위를 벗어난 경우
        return res.status(404).json({ error: "영화 정보를 찾을 수 없습니다" });
    
    }})

    app.listen(port, () => {
        console.log(`Example app listening on port ${port}`)
    })
  