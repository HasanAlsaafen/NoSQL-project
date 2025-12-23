import React, { useEffect, useState } from 'react'

export type Program = {
  _id: string
  programName: string
  department: string
  requiredCredits: number
}

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/programs')
      .then((r) => r.json())
      .then((data) => setPrograms(data))
      .catch(() => setPrograms([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Programs</h1>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
          Add Program
        </button>
      </div>

      {programs.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-600 border-b">
                <th className="pb-2 text-left">ID</th>
                <th className="pb-2 text-left">Program Name</th>
                <th className="pb-2 text-left">Department</th>
                <th className="pb-2 text-left">Required Credits</th>
                <th className="pb-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {programs.map((program) => (
                <tr key={program._id} className="border-b last:border-b-0">
                  <td className="py-3">{program._id}</td>
                  <td className="py-3 font-medium">{program.programName}</td>
                  <td className="py-3">{program.department}</td>
                  <td className="py-3">{program.requiredCredits}</td>
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
          No programs found. <button className="text-indigo-600 hover:underline">Add the first program</button>
        </div>
      )}
    </div>
  )
}