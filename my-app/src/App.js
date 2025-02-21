import React, { useEffect, useState } from "react"
import styled from "styled-components"

const Container = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`

const NavBar = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: #1c1c1c;
  color: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`

const Logo = styled.h1`
  font-size: 1.5rem;
  font-weight: bold;
  color: #ff2e63;
`

const SearchInput = styled.input`
  width: 300px;
  padding: 8px 12px;
  border-radius: 20px;
  border: 1px solid #ddd;
  outline: none;
`

const ButtonContainer = styled.div`
  display: flex;
  gap: 10px;
`

const Button = styled.button`
  background: #ff2e63;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 20px;
  cursor: pointer;
  font-weight: bold;
`

const MovieGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-top: 20px;
`

const MovieCard = styled.div`
  background: #2c2c2c;
  color: white;
  padding: 10px;
  border-radius: 10px;
  text-align: center;
`

function App() {
  const [movies, setMovies] = useState([])
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetch("/items")
      .then(res => res.json())
      .then(data => setMovies(data))
      .catch(err => console.error("영화 목록 불러오기 오류:", err))
  }, [])

  const filteredMovies = movies.filter(movie =>
    movie.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Container>
      {/* 네비게이션 바 */}
      <NavBar>
        <Logo>🎬 MOVIE SEARCH</Logo>
        <SearchInput
          type="text"
          placeholder="영화 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <ButtonContainer>
          <Button>회원가입</Button>
          <Button>로그인</Button>
        </ButtonContainer>
      </NavBar>

      {/* 영화 목록 */}
      <MovieGrid>
        {filteredMovies.map(movie => (
          <MovieCard key={movie.id}>
            <h3>{movie.title}</h3>
            <p>{movie.year}</p>
          </MovieCard>
        ))}
      </MovieGrid>
    </Container>
  )
}

export default App
