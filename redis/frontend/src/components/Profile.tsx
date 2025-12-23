import React from 'react'

export type Course = { courseId: string; semester: string; grade: string }
export type StudentProfile = {
  _id: string
  name: string
  email: string
  programId: string
  enrollmentYear: number
  courses: Course[]
}

export default function Profile({ profile }: { profile: StudentProfile }) {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold">{profile.name}</h2>
          <div className="text-sm text-slate-500">{profile._id}</div>
        </div>
        <div>
          <span className="inline-block bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-sm">{profile.programId}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="md:col-span-2">
          <div className="mb-2 text-sm text-slate-500">Email</div>
          <div className="mb-4">{profile.email}</div>

          <div className="mb-2 text-sm text-slate-500">Enrollment Year</div>
          <div>{profile.enrollmentYear}</div>
        </div>

        <div className="md:col-span-1">
          <div className="text-sm text-slate-500">Summary</div>
          <div className="mt-2 text-sm text-slate-600">{profile.courses.length} courses enrolled</div>
        </div>
      </div>

      <h3 className="text-lg font-medium mb-2">Courses</h3>
      {profile.courses && profile.courses.length > 0 ? (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-slate-600">
              <th className="pb-2 text-left">Course ID</th>
              <th className="pb-2 text-left">Semester</th>
              <th className="pb-2 text-left">Grade</th>
            </tr>
          </thead>
          <tbody>
            {profile.courses.map((c) => (
              <tr key={c.courseId} className="border-b last:border-b-0">
                <td className="py-3">{c.courseId}</td>
                <td className="py-3 text-slate-600">{c.semester}</td>
                <td className="py-3 font-medium">{c.grade}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div>No courses</div>
      )}
    </div>
  )
}
