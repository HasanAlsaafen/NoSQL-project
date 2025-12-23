import React from 'react'
import { Link } from 'react-router-dom'

export default function HomePage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Welcome to NoQSL University Management System</h1>
      <p className="text-slate-600 mb-6">
        A comprehensive system for managing students, programs, courses, and enrollments
        with advanced analytics and academic network visualization.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <h3 className="text-lg font-semibold mb-2">Students</h3>
          <p className="text-sm text-slate-600 mb-4">
            Manage student profiles, enrollment history, and academic progress.
          </p>
          <Link to="/students" className="text-indigo-600 hover:underline text-sm font-medium">
            View Students →
          </Link>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-2">Programs</h3>
          <p className="text-sm text-slate-600 mb-4">
            Define academic programs, departments, and credit requirements.
          </p>
          <Link to="/programs" className="text-indigo-600 hover:underline text-sm font-medium">
            View Programs →
          </Link>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-2">Courses</h3>
          <p className="text-sm text-slate-600 mb-4">
            Manage course catalog with prerequisites and credit hours.
          </p>
          <Link to="/courses" className="text-indigo-600 hover:underline text-sm font-medium">
            View Courses →
          </Link>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-2">Enrollments</h3>
          <p className="text-sm text-slate-600 mb-4">
            Track student course enrollments, grades, and academic records.
          </p>
          <Link to="/enrollments" className="text-indigo-600 hover:underline text-sm font-medium">
            View Enrollments →
          </Link>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-2">Analytics</h3>
          <p className="text-sm text-slate-600 mb-4">
            View course popularity, student activity, and academic network insights.
          </p>
          <Link to="/analytics" className="text-indigo-600 hover:underline text-sm font-medium">
            View Analytics →
          </Link>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-2">System Architecture</h3>
          <p className="text-sm text-slate-600 mb-4">
            Built with MongoDB, Redis, Neo4j, and Cassandra for optimal performance.
          </p>
          <span className="text-slate-500 text-sm">Multi-database architecture</span>
        </div>
      </div>

      <div className="card bg-slate-50">
        <h3 className="text-lg font-semibold mb-2">System Status</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-slate-600">Redis Cache</div>
            <div className="text-green-600 font-medium">✓ Connected</div>
          </div>
          <div>
            <div className="text-slate-600">MongoDB</div>
            <div className="text-yellow-600 font-medium">○ TODO</div>
          </div>
          <div>
            <div className="text-slate-600">Neo4j</div>
            <div className="text-yellow-600 font-medium">○ TODO</div>
          </div>
          <div>
            <div className="text-slate-600">Cassandra</div>
            <div className="text-yellow-600 font-medium">○ TODO</div>
          </div>
        </div>
      </div>
    </div>
  )
}
