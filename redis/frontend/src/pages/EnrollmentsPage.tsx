import React, { useEffect, useState } from 'react'

export type Enrollment = {
  _id: string
  studentId: string
  courseId: string
  semester: string
  grade: string
  enrollmentDate: string
}

export default function EnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/enrollments')
      .then((r) => r.json())
      .then((data) => setEnrollments(data))
      .catch(() => setEnrollments([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Enrollments</h1>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
          Add Enrollment
        </button>
      </div>

      {enrollments.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-600 border-b">
                <th className="pb-2 text-left">ID</th>
                <th className="pb-2 text-left">Student ID</th>
                <th className="pb-2 text-left">Course ID</th>
                <th className="pb-2 text-left">Semester</th>
                <th className="pb-2 text-left">Grade</th>
                <th className="pb-2 text-left">Enrollment Date</th>
                <th className="pb-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.map((enrollment) => (
                <tr key={enrollment._id} className="border-b last:border-b-0">
                  <td className="py-3">{enrollment._id}</td>
                  <td className="py-3">{enrollment.studentId}</td>
                  <td className="py-3">{enrollment.courseId}</td>
                  <td className="py-3">{enrollment.semester}</td>
                  <td className="py-3 font-medium">{enrollment.grade}</td>
                  <td className="py-3">{new Date(enrollment.enrollmentDate).toLocaleDateString()}</td>
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
          No enrollments found. <button className="text-indigo-600 hover:underline">Add the first enrollment</button>
        </div>
      )}
    </div>
  )
}