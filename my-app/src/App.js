// src/App.js
import React, { useEffect, useState } from "react"

function App() {
    const [movies, setMovies] = useState([])

    useEffect(() => {
        fetch("/items")
            .then(res => res.json())
            .then(data => setMovies(data))
            .catch(err => console.error("영화 목록 불러오기 오류:", err))
    }, [])

    return (
        <div>
            <h1>🎬 영화 목록</h1>
            <ul>
                {movies.map(movie => (
                    <li key={movie.id}>
                        {movie.title} ({movie.year})
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default App
