import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import CameraCapture from '../components/CameraCapture'
import SignatureCanvas from '../components/SignatureCanvas'
import { mergeImages } from '../utils/mergeImage'

const Details = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [photo, setPhoto] = useState(null)      
  const [isMerging, setIsMerging] = useState(false)

  const handlePhotoCaptured = (photoBase64) => {
    setPhoto(photoBase64)
    
    localStorage.setItem('auditPhoto', photoBase64)
  }

  const handleSignatureComplete = async (signatureBase64) => {
    console.log('=== MERGE START === photo:', !!photo, 'sig:', !!signatureBase64, signatureBase64 ? signatureBase64.length : 0)
    if (!photo) {
      alert('no photo')
      return
    }

    setIsMerging(true)
    try {
      const mergedResult = await mergeImages(photo, signatureBase64)
      console.log('=== MERGE SUCCESS ===')
      localStorage.setItem('mergedAuditImage', mergedResult)
      navigate('/result')
    } catch (err) {
      console.error('merge error', err)
      alert('merge failed: ' + err.message)
      setIsMerging(false)
    }
  }

  return (
    <div className="px-4 sm:px-6 py-6 max-w-5xl mx-auto">
      {/* top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Identity Verification</h2>
          <p className="text-gray-500 mt-1">Employee ID: <span className="font-mono font-semibold">{id}</span></p>
        </div>
        <Link to="/list" className="btn-secondary inline-flex items-center gap-2 self-start">
          ← Back to List
        </Link>
      </div>

      {/* loading overlay while merging */}
      {isMerging && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 flex flex-col items-center shadow-2xl">
            <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
            <p className="text-gray-700 font-medium">Merging photo & signature...</p>
          </div>
        </div>
      )}

      {/* step indicator */}
      <div className="flex items-center gap-4 mb-8 text-sm">
        <div className={`flex items-center gap-2 ${!photo ? 'text-indigo-600 font-semibold' : 'text-green-600'}`}>
          <span className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold ${!photo ? 'bg-indigo-600' : 'bg-green-500'}`}>
            {photo ? '✓' : '1'}
          </span>
          Capture Photo
        </div>
        <div className="flex-1 h-px bg-gray-300" />
        <div className={`flex items-center gap-2 ${photo ? 'text-indigo-600 font-semibold' : 'text-gray-400'}`}>
          <span className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold ${photo ? 'bg-indigo-600' : 'bg-gray-300'}`}>
            2
          </span>
          Sign & Merge
        </div>
      </div>

      {}
      <div className="grid md:grid-cols-2 gap-8">
        {/* step 1: always show camera capture */}
        <CameraCapture onPhotoCaptured={handlePhotoCaptured} />

        {}
        <SignatureCanvas
          photoBase64={photo}
          onSignatureComplete={handleSignatureComplete}
        />
      </div>
    </div>
  )
}

export default Details
