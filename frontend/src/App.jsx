import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Analyze from './pages/Analyze'
import Results from './pages/Results'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/analyze" element={<Analyze />} />
        <Route path="/results" element={<Results />} />
      </Routes>
    </Router>
  )
}

export default App