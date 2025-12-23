import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import HomePage from './pages/HomePage.js'
import ProfilePage from './pages/ProfilePage.js'
import StudentsPage from './pages/StudentsPage.js'
import ProgramsPage from './pages/ProgramsPage.js'
import CoursesPage from './pages/CoursesPage.js'
import EnrollmentsPage from './pages/EnrollmentsPage.js'
import AnalyticsPage from './pages/AnalyticsPage.js'

export default function App() {
  return (
    <div className="container">
      <header className="flex items-center gap-4 mb-6">
        <div className="text-2xl font-bold text-indigo-600">NoQSL</div>
        <nav className="ml-auto text-sm text-slate-600">
          <Link to="/" className="hover:underline">Home</Link>
          <span className="mx-2">|</span>
          <Link to="/students" className="hover:underline">Students</Link>
          <span className="mx-2">|</span>
          <Link to="/programs" className="hover:underline">Programs</Link>
          <span className="mx-2">|</span>
          <Link to="/courses" className="hover:underline">Courses</Link>
          <span className="mx-2">|</span>
          <Link to="/enrollments" className="hover:underline">Enrollments</Link>
          <span className="mx-2">|</span>
          <Link to="/analytics" className="hover:underline">Analytics</Link>
        </nav>
      </header>

      <div className="card">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/students" element={<StudentsPage />} />
          <Route path="/students/:id" element={<ProfilePage />} />
          <Route path="/programs" element={<ProgramsPage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/enrollments" element={<EnrollmentsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
        </Routes>
      </div>
    </div>
  )
}
