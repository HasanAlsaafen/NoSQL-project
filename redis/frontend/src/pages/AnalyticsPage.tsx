import React, { useEffect, useState } from 'react'

export type CoursePopularity = {
  course_id: string
  enrollment_count: number
}

export type StudentActivity = {
  week: string
  login_count: number
  quiz_count: number
  submission_count: number
}

export default function AnalyticsPage() {
  const [coursePopularity, setCoursePopularity] = useState<CoursePopularity[]>([])
  const [studentActivity, setStudentActivity] = useState<StudentActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSemester, setSelectedSemester] = useState('Fall2024')
  const [selectedStudentId, setSelectedStudentId] = useState('STU001')

  useEffect(() => {
    Promise.all([
      fetch(`/api/analytics/course-popularity/${selectedSemester}`).then(r => r.json()),
      fetch(`/api/analytics/student-activity/${selectedStudentId}`).then(r => r.json())
    ])
      .then(([popularity, activity]) => {
        setCoursePopularity(Array.isArray(popularity) ? popularity : [])
        setStudentActivity(Array.isArray(activity) ? activity : [])
      })
      .catch(() => {
        setCoursePopularity([])
        setStudentActivity([])
      })
      .finally(() => setLoading(false))
  }, [selectedSemester, selectedStudentId])

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Analytics Dashboard</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Course Popularity */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Course Popularity</h2>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            >
              <option value="Fall2024">Fall 2024</option>
              <option value="Spring2024">Spring 2024</option>
              <option value="Summer2024">Summer 2024</option>
            </select>
          </div>

          {coursePopularity.length > 0 ? (
            <div className="space-y-2">
              {coursePopularity.slice(0, 10).map((course, index) => (
                <div key={course.course_id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-600">#{index + 1}</span>
                    <span>{course.course_id}</span>
                  </div>
                  <span className="text-sm text-slate-500">{course.enrollment_count} enrollments</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-slate-500">No data available</div>
          )}
        </div>

        {/* Student Activity */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Student Activity</h2>
            <input
              type="text"
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              placeholder="Student ID"
              className="border rounded px-2 py-1 text-sm"
            />
          </div>

          {studentActivity.length > 0 ? (
            <div className="space-y-3">
              {studentActivity.map((activity) => (
                <div key={activity.week} className="border rounded p-3">
                  <div className="font-medium text-sm mb-2">Week of {activity.week}</div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <div className="text-slate-600">Logins</div>
                      <div className="font-medium">{activity.login_count}</div>
                    </div>
                    <div>
                      <div className="text-slate-600">Quizzes</div>
                      <div className="font-medium">{activity.quiz_count}</div>
                    </div>
                    <div>
                      <div className="text-slate-600">Submissions</div>
                      <div className="font-medium">{activity.submission_count}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-slate-500">No activity data available</div>
          )}
        </div>
      </div>

      {/* Graph Visualization Placeholder */}
      <div className="card mt-6">
        <h2 className="text-lg font-semibold mb-4">Academic Network Graph</h2>
        <div className="text-center py-8 text-slate-500">
          Graph visualization will be implemented with Neo4j integration
        </div>
      </div>
    </div>
  )
}