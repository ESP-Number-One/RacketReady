import { useState } from 'react'
import reactLogo from '../static/img/react.svg'
import viteLogo from '../static/img/vite.svg'
import '../static/img/app.css'

function App() {
  const [fruits, setFruits] = useState<string[]>([])
  const [selectedFruit, setSelectedFruit] = useState<string | null>(null);


  fetch(`http://localhost:3000/fruits`)
    .then(res => res.json())
    .then(setFruits);

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <select id="fruit" onChange={e => setSelectedFruit(() => e.target.value)}>
          {fruits.map(a => (<option key={a} value={a}>{a}</option>))}
        </select><br />
        <button disabled={selectedFruit === null} onClick={async () => alert((await fetch(`http://localhost:3000/fruits/${selectedFruit}`).then(r => r.json())).price)}>
          Click for price.
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
