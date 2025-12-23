import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export type Student = {
  _id: string
  name: string
  email: string
  programId: string
  enrollmentYear: number
  courses: Array<{ courseId: string; semester: string; grade: string }>
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/students')
      .then((r) => r.json())
      .then((data) => setStudents(data))
      .catch(() => setStudents([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Students</h1>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
          Add Student
        </button>
      </div>

      {students.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-600 border-b">
                <th className="pb-2 text-left">ID</th>
                <th className="pb-2 text-left">Name</th>
                <th className="pb-2 text-left">Email</th>
                <th className="pb-2 text-left">Program</th>
                <th className="pb-2 text-left">Year</th>
                <th className="pb-2 text-left">Courses</th>
                <th className="pb-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student._id} className="border-b last:border-b-0">
                  <td className="py-3">{student._id}</td>
                  <td className="py-3">
                    <Link to={`/students/${student._id}`} className="text-indigo-600 hover:underline">
                      {student.name}
                    </Link>
                  </td>
                  <td className="py-3">{student.email}</td>
                  <td className="py-3">{student.programId}</td>
                  <td className="py-3">{student.enrollmentYear}</td>
                  <td className="py-3">{student.courses.length}</td>
                  <td className="py-3">
                    <button className="text-indigo-600 hover:underline mr-2">Edit</button>
                    <button className="text-red-600 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 text-slate-500">
          No students found. <Link to="/students/new" className="text-indigo-600 hover:underline">Add the first student</Link>
        </div>
      )}
    </div>
  )
}