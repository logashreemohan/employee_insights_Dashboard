import { useRef, useState, useCallback, useEffect } from 'react'

function CameraCapture({ onPhotoCaptured }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)

  const [isCameraOn, setIsCameraOn] = useState(false)
  const [capturedPhoto, setCapturedPhoto] = useState(null)
  const [error, setError] = useState(null)

  const startCamera = useCallback(async () => {
    try {
      setError(null)
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
      })
      streamRef.current = mediaStream
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
      setIsCameraOn(true)
    } catch (err) {
      console.error('camera error:', err)
      setError('Could not access camera. Check your permissions.')
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    setIsCameraOn(false)
  }, [])

  const takePhoto = useCallback(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480
    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
    setCapturedPhoto(dataUrl)
    stopCamera()
  }, [stopCamera])

  const retakePhoto = useCallback(() => {
    setCapturedPhoto(null)
    startCamera()
  }, [startCamera])

  const confirmPhoto = useCallback(() => {
    if (capturedPhoto && onPhotoCaptured) {
      onPhotoCaptured(capturedPhoto)
    }
  }, [capturedPhoto, onPhotoCaptured])

  // make sure camera stops when component unmounts
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop())
      }
    }
  }, [])

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Profile Photo Capture</h3>

      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>
      )}

      {!capturedPhoto ? (
        <div>
          <div className="bg-gray-100 rounded-lg overflow-hidden mb-4 flex items-center justify-center" style={{ minHeight: '280px' }}>
            {isCameraOn ? (
              <video ref={videoRef} autoPlay playsInline muted className="w-full max-w-md block rounded-lg" />
            ) : (
              <div className="text-center text-gray-400 py-16">
                <p className="text-sm">Click "Start Camera" to begin</p>
              </div>
            )}
          </div>
          <div className="flex gap-3 justify-center">
            {!isCameraOn ? (
              <button onClick={startCamera} className="btn-primary">Start Camera</button>
            ) : (
              <button onClick={takePhoto} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors">
                Capture
              </button>
            )}
          </div>
        </div>
      ) : (
        <div>
          <img src={capturedPhoto} alt="Captured" className="w-full max-w-md mx-auto block rounded-lg shadow-md mb-4" />
          <div className="flex gap-3 justify-center">
            <button onClick={retakePhoto} className="btn-secondary">Retake</button>
            <button onClick={confirmPhoto} className="btn-primary">Use This Photo</button>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}

export default CameraCapture
