import React, { useEffect, useState } from 'react'

export type Course = {
  _id: string
  courseName: string
  creditHours: number
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/courses')
      .then((r) => r.json())
      .then((data) => setCourses(data))
      .catch(() => setCourses([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Courses</h1>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
          Add Course
        </button>
      </div>

      {courses.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-600 border-b">
                <th className="pb-2 text-left">ID</th>
                <th className="pb-2 text-left">Course Name</th>
                <th className="pb-2 text-left">Credit Hours</th>
                <th className="pb-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course._id} className="border-b last:border-b-0">
                  <td className="py-3">{course._id}</td>
                  <td className="py-3 font-medium">{course.courseName}</td>
                  <td className="py-3">{course.creditHours}</td>
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
          No courses found. <button className="text-indigo-600 hover:underline">Add the first course</button>
        </div>
      )}
    </div>
  )
}