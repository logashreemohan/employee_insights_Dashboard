
export function mergeImages(p, s) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    const photo = new Image()
    photo.onload = () => {
      canvas.width = photo.width
      canvas.height = photo.height
      ctx.drawImage(photo, 0, 0)

      const sig = new Image()
      sig.onload = () => {
        ctx.globalAlpha = 0.75
        ctx.drawImage(sig, 0, 0, canvas.width, canvas.height)
        ctx.globalAlpha = 1.0

        canvas.toBlob((blob) => {
          if (!blob) reject(new Error('no blob'))
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result)
          reader.readAsDataURL(blob)
        }, 'image/png', 0.9)
      }
      sig.src = s
    }
    photo.src = p
  })
}
