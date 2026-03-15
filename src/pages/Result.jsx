import { useState, useEffect, useRef, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { cityCoordinates } from '../utils/cityCoordinates'

import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

const API_URL = 'https://backend.jotish.in/backend_dev/gettabledata.php'

/**
 * Result / Analytics page:
 *  1. Shows the merged "audit image" (photo + signature)
 *  2. SVG bar chart of salary distribution per city (raw SVG, no Chart.js / D3)
 *  3. Leaflet map with city markers
 */
const Result = () => {
  const mergedImage = localStorage.getItem('mergedAuditImage')
  const mapContainerRef = useRef(null)
  const mapInstanceRef = useRef(null)

  const [apiData, setApiData] = useState([])
  const [dataLoading, setDataLoading] = useState(true)

  // fetch the same employee data for charting
  useEffect(() => {
    let cancelled = false

    async function loadData() {
      try {
        const res = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: 'test', password: '123456' }),
        })
        const json = await res.json()
        const rows = Array.isArray(json) ? json : json.data || []

        if (!cancelled) {
          setApiData(rows)
          setDataLoading(false)
        }
      } catch (err) {
        console.error('Failed to fetch chart data:', err)
        if (!cancelled) setDataLoading(false)
      }
    }

    loadData()
    return () => { cancelled = true }
  }, [])

  // ── aggregate salary data by city ──
  const cityStats = useMemo(() => {
    const map = {}

    apiData.forEach((row) => {
      const city = row.city || row.City || row.location || 'Unknown'
      const salary = parseFloat(row.salary || row.Salary || 0)

      if (!map[city]) {
        map[city] = { totalSalary: 0, count: 0 }
      }
      map[city].totalSalary += salary
      map[city].count += 1
    })

    // calculate averages and convert to array
    return Object.entries(map)
      .map(([city, stats]) => ({
        city,
        avgSalary: Math.round(stats.totalSalary / stats.count),
        count: stats.count,
      }))
      .sort((a, b) => b.avgSalary - a.avgSalary) // highest salary first
      .slice(0, 10) // top 10 cities for the chart
  }, [apiData])

  const maxAvgSalary = useMemo(() => {
    return Math.max(...cityStats.map((c) => c.avgSalary), 1)
  }, [cityStats])

  // ── Leaflet map initialization ──
  // We handle the city→coordinate mapping by looking up each city name
  // in our cityCoordinates.js dictionary. Cities without a match are
  // simply skipped — no errors.
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return
    if (cityStats.length === 0) return

    // create the Leaflet map
    const map = L.map(mapContainerRef.current, {
      center: [39.8283, -98.5795], // center of US
      zoom: 4,
      scrollWheelZoom: false,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map)

    // place markers
    cityStats.forEach(({ city, avgSalary, count }) => {
      const coords = cityCoordinates[city]
      if (!coords) return // skip cities we don't have coordinates for

      const marker = L.circleMarker([coords.lat, coords.lng], {
        radius: Math.min(6 + count * 0.5, 20),
        fillColor: '#4f46e5',
        color: '#312e81',
        weight: 2,
        fillOpacity: 0.7,
      }).addTo(map)

      marker.bindPopup(
        `<strong>${city}</strong><br/>Avg Salary: $${avgSalary.toLocaleString()}<br/>Employees: ${count}`
      )
    })

    mapInstanceRef.current = map

    // cleanup on unmount
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [cityStats])

  // ── SVG Chart dimensions ──
  const chartWidth = 600
  const chartHeight = 320
  const chartPadding = { top: 30, right: 20, bottom: 70, left: 70 }
  const plotWidth = chartWidth - chartPadding.left - chartPadding.right
  const plotHeight = chartHeight - chartPadding.top - chartPadding.bottom

  // bar chart color palette
  const barColors = [
    '#4f46e5', '#7c3aed', '#2563eb', '#0891b2', '#059669',
    '#d97706', '#dc2626', '#db2777', '#6366f1', '#14b8a6',
  ]

  return (
    <div className="px-4 sm:px-6 py-6 max-w-6xl mx-auto">
      {/* header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">📊 Audit & Analytics</h2>
          <p className="text-gray-500 mt-1">Identity verification complete — review the results below.</p>
        </div>
        <Link to="/list" className="btn-secondary inline-flex items-center gap-2 self-start">
          ← Back to Dashboard
        </Link>
      </div>

      {/* ── section 1: merged audit image ── */}
      <section className="mb-12">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Audit Trail Image</h3>
        {mergedImage ? (
          <div className="card p-4 inline-block">
            <img
              src={mergedImage}
              alt="Merged photo and signature"
              className="max-w-full sm:max-w-lg rounded-lg shadow-lg"
            />
          </div>
        ) : (
          <div className="card text-center text-gray-400 py-12">
            <p className="text-4xl mb-2">📷</p>
            <p>No audit image found. Go to an employee's Details page to capture one.</p>
          </div>
        )}
      </section>

      <div className="grid lg:grid-cols-2 gap-10 mb-12">
        {/* ── section 2: SVG salary chart ── */}
        <section>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Salary Distribution by City</h3>
          {dataLoading ? (
            <div className="card flex items-center justify-center h-80">
              <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            </div>
          ) : cityStats.length === 0 ? (
            <div className="card text-center text-gray-400 py-12">No data available</div>
          ) : (
            <div className="card p-4 overflow-x-auto">
              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="w-full"
                style={{ maxHeight: '360px' }}
              >
                {/* background */}
                <rect
                  x={chartPadding.left}
                  y={chartPadding.top}
                  width={plotWidth}
                  height={plotHeight}
                  fill="#f8fafc"
                  rx="4"
                />

                {/* y-axis gridlines */}
                {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
                  const y = chartPadding.top + plotHeight * (1 - frac)
                  const label = Math.round(maxAvgSalary * frac)
                  return (
                    <g key={frac}>
                      <line
                        x1={chartPadding.left}
                        y1={y}
                        x2={chartPadding.left + plotWidth}
                        y2={y}
                        stroke="#e2e8f0"
                        strokeWidth="1"
                      />
                      <text
                        x={chartPadding.left - 8}
                        y={y + 4}
                        textAnchor="end"
                        fill="#94a3b8"
                        fontSize="11"
                      >
                        ${label.toLocaleString()}
                      </text>
                    </g>
                  )
                })}

                {/* bars */}
                {cityStats.map((item, i) => {
                  const barWidth = Math.max(plotWidth / cityStats.length - 8, 12)
                  const gap = (plotWidth - barWidth * cityStats.length) / (cityStats.length + 1)
                  const x = chartPadding.left + gap + i * (barWidth + gap)
                  const barHeight = (item.avgSalary / maxAvgSalary) * plotHeight
                  const y = chartPadding.top + plotHeight - barHeight

                  return (
                    <g key={item.city}>
                      {/* bar */}
                      <rect
                        x={x}
                        y={y}
                        width={barWidth}
                        height={barHeight}
                        fill={barColors[i % barColors.length]}
                        rx="3"
                      >
                        <title>{`${item.city}: $${item.avgSalary.toLocaleString()} avg (${item.count} employees)`}</title>
                      </rect>

                      {/* salary label on top of bar */}
                      <text
                        x={x + barWidth / 2}
                        y={y - 6}
                        textAnchor="middle"
                        fill="#334155"
                        fontSize="10"
                        fontWeight="600"
                      >
                        ${item.avgSalary.toLocaleString()}
                      </text>

                      {/* city label below */}
                      <text
                        x={x + barWidth / 2}
                        y={chartPadding.top + plotHeight + 16}
                        textAnchor="end"
                        fill="#64748b"
                        fontSize="10"
                        transform={`rotate(-35, ${x + barWidth / 2}, ${chartPadding.top + plotHeight + 16})`}
                      >
                        {item.city.length > 12 ? item.city.slice(0, 11) + '…' : item.city}
                      </text>
                    </g>
                  )
                })}
              </svg>
            </div>
          )}
        </section>

        {/* ── section 3: Leaflet map ── */}
        <section>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Employee Locations</h3>
          <div className="card p-0 overflow-hidden">
            <div
              ref={mapContainerRef}
              className="w-full"
              style={{ height: '360px' }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-2">
            City markers are plotted using a coordinate lookup table in <code>cityCoordinates.js</code>.
            Cities without matching coordinates are skipped.
          </p>
        </section>
      </div>
    </div>
  )
}

export default Result
