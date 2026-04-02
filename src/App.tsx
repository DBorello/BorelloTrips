import { HashRouter, Routes, Route } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { HomePage } from './pages/HomePage'
import { TripPage } from './pages/TripPage'

export default function App() {
  return (
    <HashRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/trip/:id" element={<TripPage />} />
        </Routes>
      </AppShell>
    </HashRouter>
  )
}
