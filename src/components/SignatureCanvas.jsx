import { useRef, useEffect, useCallback, useState } from 'react'

const SignatureCanvas = ({ photoBase64, onSignatureComplete }) => {
  const canvasRef = useRef(null)
  const isDrawing = useRef(false)
  const strokeCount = useRef(0)
  const [hasDrawn, setHasDrawn] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    
    const dpr = window.devicePixelRatio || 1
    canvas.style.width = '100%'
    canvas.style.height = '350px'
    canvas.width = canvas.offsetWidth * dpr
    canvas.height = 350 * dpr
    ctx.scale(dpr, dpr)

    if (photoBase64) {
      const img = new Image()
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0, canvas.width / dpr, canvas.height / dpr)
        ctx.lineWidth = 3
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.strokeStyle = '#1e3a5f'
      }
      img.src = photoBase64
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = '#fff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.lineWidth = 3
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.strokeStyle = '#1e3a5f'
    }
  }, [photoBase64])

  function getPos(e) {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    if (e.touches && e.touches.length > 0) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      }
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }

  const startDrawing = useCallback((e) => {
    e.preventDefault()
    isDrawing.current = true
    strokeCount.current += 1
    setHasDrawn(strokeCount.current > 1)
    const pos = getPos(e)
    const ctx = canvasRef.current.getContext('2d')
    ctx.beginPath()
    ctx.moveTo(pos.x, pos.y)
  }, [])

  const draw = useCallback((e) => {
    if (!isDrawing.current) return
    e.preventDefault()
    const pos = getPos(e)
    const ctx = canvasRef.current.getContext('2d')
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
  }, [])

  const stopDrawing = useCallback(() => {
    isDrawing.current = false
  }, [])

  function clearCanvas() {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    if (photoBase64) {
      const img = new Image()
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0)
        ctx.lineWidth = 3
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.strokeStyle = '#1e3a5f'
      }
      img.src = photoBase64
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = '#fff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
    setHasDrawn(false)
  }

  function handleComplete() {
    const canvas = canvasRef.current
    const signatureData = canvas.toDataURL('image/png')
    console.log('=== SIGNATURE CLICK === canvas data ready', signatureData ? signatureData.length : 'null')
    if (onSignatureComplete) onSignatureComplete(signatureData)
  }

 
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.addEventListener('mousedown', startDrawing)
    canvas.addEventListener('mousemove', draw)
    canvas.addEventListener('mouseup', stopDrawing)
    canvas.addEventListener('mouseleave', stopDrawing)
    canvas.addEventListener('touchstart', startDrawing, { passive: false })
    canvas.addEventListener('touchmove', draw, { passive: false })
    canvas.addEventListener('touchend', stopDrawing)

    return () => {
      canvas.removeEventListener('mousedown', startDrawing)
      canvas.removeEventListener('mousemove', draw)
      canvas.removeEventListener('mouseup', stopDrawing)
      canvas.removeEventListener('mouseleave', stopDrawing)
      canvas.removeEventListener('touchstart', startDrawing)
      canvas.removeEventListener('touchmove', draw)
      canvas.removeEventListener('touchend', stopDrawing)
    }
  }, [startDrawing, draw, stopDrawing])

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Signature Overlay</h3>
      <p className="text-sm text-gray-500 mb-3">
        {photoBase64 ? 'Sign directly over the captured photo below.' : 'Capture a photo first, then sign over it.'}
      </p>

      <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden mb-4 bg-gray-50">
        <canvas ref={canvasRef} className="signature-area w-full block" style={{ maxWidth: '100%', height: 'auto' }} />
      </div>

      <div className="flex gap-3 justify-center">
        <button onClick={clearCanvas} className="btn-secondary">Clear</button>
        <button
          onClick={handleComplete}
          disabled={!hasDrawn}
          className="bg-green-600 hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
        >
          Merge & Continue
        </button>
      </div>
    </div>
  )
}

export default SignatureCanvas
