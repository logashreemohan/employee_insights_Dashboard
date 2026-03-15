import { useState, useEffect } from 'react'
import VirtualTable from '../components/VirtualTable'

const API_URL = 'https://backend.jotish.in/backend_dev/gettabledata.php'

const List = () => {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [useMockData, setUseMockData] = useState(false)


  const demoEmployees = [
    { id: 1, name: 'logashree', city: 'Mumbai', salary: 850000, department: 'Engineering' },
    { id: 2, name: 'pragadeesh', city: 'Ahmedabad', salary: 720000, department: 'Marketing' },
    { id: 3, name: 'keerthi', city: 'Delhi', salary: 650000, department: 'Sales' },
    { id: 4, name: 'rahul', city: 'Bangalore', salary: 1200000, department: 'HR' },
    { id: 5, name: 'priya', city: 'Hyderabad', salary: 950000, department: 'Engineering' },
  ]

  const fetchEmployees = async () => {
    if (useMockData) {
      setEmployees(demoEmployees)
      setLoading(false)
      return
    }

    let isCancelled = false

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'test', password: '123456' }),
      })

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`)
      }

      const json = await response.json()
      let rows = Array.isArray(json) ? json : json.data || []

      rows = rows.map((row, index) => ({
        id: row.id || row.ID || index + 1,
        name: row.name || row.Name || row.employee_name || '—',
        city: row.city || row.City || row.location || '—',
        salary: parseFloat(row.salary || row.Salary || 0),
        department: row.department || row.Department || row.dept || '—',
      }))

      if (!isCancelled) {
        setEmployees(rows)
        setLoading(false)
      }
    } catch (err) {
      console.error('Fetch error:', err)
      if (!isCancelled) {
        setError(err.message)
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    fetchEmployees()
  }, [useMockData])


  // ── loading state ──
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="inline-block w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
          <p className="text-gray-500">Loading employee data...</p>
        </div>
      </div>
    )
  }

// ── error / fallback banner ──
  if (error && !useMockData) {
    return (
      <div className="max-w-lg mx-auto mt-10">
        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-6 text-center">
          <p className="text-lg font-semibold mb-2">API unavailable</p>
          <p className="text-sm mb-4">{error}</p>
          <div className="space-x-3">
            <button
              onClick={fetchEmployees}
              className="btn-secondary inline-flex items-center gap-2"
            >
              Retry API
            </button>
            <button
              onClick={() => setUseMockData(true)}
              className="btn-primary"
            >
              Use Demo Data
            </button>
          </div>
        </div>
      </div>
    )
  }


  // ── main content ──
  return (
    <div className="px-4 sm:px-6 py-6">
      {/* Menu Bar */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Employee Directory</h2>
            <p className="text-sm text-gray-500 mt-1">
              Showing <strong>{employees.length.toLocaleString()}</strong> records
              {employees.length > 100 && ' — using custom virtualization for performance'}
              {useMockData && ' (Demo Mode)'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setUseMockData(!useMockData)}
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-1.5"
            >
              {useMockData ? 'Real API' : 'Demo Data'}
            </button>

            <a
              href="/details/new"
              className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1"
            >
              ➕ New Verification
            </a>
          </div>
        </div>

        {error && useMockData && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
            API failed — using demo data. Toggle "Real API" to retry.
          </div>
        )}
      </div>

      <VirtualTable data={employees} />
    </div>
  )
}


export default List
