import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Profile, { StudentProfile } from '../components/Profile.js'

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>()
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    fetch(`/api/students/${id}`)
      .then((r) => r.json())
      .then((data) => {
        const mapped: StudentProfile = {
          _id: data._id || data.id || id,
          name: data.name || 'Unknown',
          email: data.email || 'n/a',
          programId: data.programId || 'unknown',
          enrollmentYear: data.enrollmentYear || 0,
          courses: data.courses || []
        }
        setProfile(mapped)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div>Loading...</div>
  if (!profile) return (
    <div>
      <div className="mb-4">
        <Link to="/students" className="text-indigo-600 hover:underline">← Back to Students</Link>
      </div>
      <div>Not found</div>
    </div>
  )

  return (
    <div>
      <div className="mb-4">
        <Link to="/students" className="text-indigo-600 hover:underline">← Back to Students</Link>
      </div>
      <Profile profile={profile} />
    </div>
  )
}
