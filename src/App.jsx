import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Factory from './Factory'
import Generator from './Generator'

const styles = {
  home: {
    minHeight: '100vh',
    backgroundColor: '#0d0905',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '2rem',
    fontFamily: 'sans-serif',
  },
  heading: {
    color: '#fff',
    fontSize: '2.5rem',
    fontWeight: '700',
    marginBottom: '1rem',
    letterSpacing: '-0.5px',
  },
  buttonGroup: {
    display: 'flex',
    gap: '1.5rem',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  button: {
    display: 'inline-block',
    padding: '1rem 2.5rem',
    borderRadius: '10px',
    fontSize: '1.1rem',
    fontWeight: '600',
    textDecoration: 'none',
    color: '#fff',
    background: 'linear-gradient(135deg, #f97316, #ea580c, #c2410c)',
    boxShadow: '0 4px 20px rgba(249,115,22,0.35)',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
  },
}

function Home() {
  return (
    <div style={styles.home}>
      <h1 style={styles.heading}>Passive Income Tools</h1>
      <div style={styles.buttonGroup}>
        <Link
          to="/factory"
          style={styles.button}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 8px 28px rgba(249,115,22,0.5)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(249,115,22,0.35)'
          }}
        >
          Digital Product Factory
        </Link>
        <Link
          to="/generator"
          style={styles.button}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 8px 28px rgba(249,115,22,0.5)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(249,115,22,0.35)'
          }}
        >
          Product Content Generator
        </Link>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/factory" element={<Factory />} />
        <Route path="/generator" element={<Generator />} />
      </Routes>
    </BrowserRouter>
  )
}
