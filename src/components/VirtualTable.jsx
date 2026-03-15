import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ROW_HEIGHT, getVisibleRange } from '../utils/virtualization'

const VirtualTable = ({ data }) => {
  const containerRef = useRef(null)
  const [scrollTop, setScrollTop] = useState(0)
  const [containerHeight, setContainerHeight] = useState(600)

  useEffect(() => {
    let resizeObserver = null

    if (containerRef.current) {
      resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) setContainerHeight(entry.contentRect.height)
      })
      resizeObserver.observe(containerRef.current)
    }

    return () => {
      if (resizeObserver) resizeObserver.disconnect()
    }
  }, [])

  const { startIndex, endIndex } = useMemo(() => {
    return getVisibleRange(scrollTop, containerHeight, data.length)
  }, [scrollTop, containerHeight, data.length])

  const visibleRows = useMemo(() => {
    return data.slice(startIndex, endIndex)
  }, [data, startIndex, endIndex])

  const handleScroll = useCallback((e) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [])

  const totalHeight = data.length * ROW_HEIGHT

  return (
    <div
      ref={containerRef}
      className="virtual-scroll-container w-full overflow-auto border border-gray-200 rounded-xl shadow-sm bg-white"
      style={{ maxHeight: '600px' }}
      onScroll={handleScroll}
    >
      <table className="min-w-full table-fixed">
        <thead className="sticky top-0 bg-gray-50 z-10 border-b border-gray-200">
          <tr>
            <th className="w-20 px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
            <th className="w-36 px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">City</th>
            <th className="w-32 px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Salary</th>
            <th className="w-36 px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Department</th>
            <th className="w-24 px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
      </table>

      {/* this div is sized to the full data height so the scrollbar works right */}
      <div style={{ height: `${totalHeight}px`, position: 'relative' }}>
        {visibleRows.map((emp, idx) => {
          const actualIdx = startIndex + idx
          const top = actualIdx * ROW_HEIGHT

          return (
            <div
              key={emp.id || actualIdx}
              className="flex items-center hover:bg-indigo-50 transition-colors duration-150 border-b border-gray-100"
              style={{
                position: 'absolute',
                top: `${top}px`,
                height: `${ROW_HEIGHT}px`,
                width: '100%',
              }}
            >
              <div className="w-20 px-4 text-sm text-gray-700 truncate">{emp.id}</div>
              <div className="flex-1 px-4 text-sm font-medium text-gray-900 truncate">{emp.name}</div>
              <div className="w-36 px-4 text-sm text-gray-600 truncate">{emp.city}</div>
              <div className="w-32 px-4 text-sm text-gray-600">₹{Number(emp.salary).toLocaleString()}</div>
              <div className="w-36 px-4 text-sm">{emp.department || emp.dept}</div>
              <div className="w-24 px-4">
                <Link to={`/details/${emp.id}`} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                  View
                </Link>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default VirtualTable
