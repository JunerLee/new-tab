import { useEffect } from 'react'
import { useAppStore } from '@/stores/useAppStore'
import { fetchBingImages, getRandomItem } from '@/utils'

export function useBingImage() {
  const { 
    bingImages, 
    currentBingImage, 
    setBingImages, 
    setCurrentBingImage,
    settings 
  } = useAppStore()

  useEffect(() => {
    const loadBingImages = async () => {
      if (!settings.background.bingEnabled) return

      try {
        // Only fetch if we don't have images or they're old
        const shouldFetch = bingImages.length === 0 || 
          !bingImages.some(img => {
            const imgDate = new Date(img.date)
            const today = new Date()
            return imgDate.toDateString() === today.toDateString()
          })

        if (shouldFetch) {
          const images = await fetchBingImages(8)
          if (images.length > 0) {
            setBingImages(images)
            
            // Set current image to today's image or random if not available
            const todayImage = images.find(img => {
              const imgDate = new Date(img.date)
              const today = new Date()
              return imgDate.toDateString() === today.toDateString()
            })
            
            setCurrentBingImage(todayImage || images[0])
          }
        } else if (!currentBingImage && bingImages.length > 0) {
          // Set a random image if none is selected
          const randomImage = getRandomItem(bingImages)
          if (randomImage) {
            setCurrentBingImage(randomImage)
          }
        }
      } catch (error) {
        console.error('Failed to load Bing images:', error)
      }
    }

    loadBingImages()
  }, [settings.background.bingEnabled, setBingImages, setCurrentBingImage])

  useEffect(() => {
    if (!settings.background.bingEnabled || !currentBingImage) return

    const interval = setInterval(() => {
      if (bingImages.length > 1) {
        const currentIndex = bingImages.findIndex(img => img.url === currentBingImage.url)
        const nextIndex = (currentIndex + 1) % bingImages.length
        setCurrentBingImage(bingImages[nextIndex])
      }
    }, settings.background.changeInterval * 60 * 60 * 1000) // Convert hours to milliseconds

    return () => clearInterval(interval)
  }, [
    settings.background.bingEnabled,
    settings.background.changeInterval,
    currentBingImage,
    bingImages,
    setCurrentBingImage
  ])

  const changeToNextImage = () => {
    if (bingImages.length > 1) {
      const currentIndex = bingImages.findIndex(img => img.url === currentBingImage?.url)
      const nextIndex = (currentIndex + 1) % bingImages.length
      setCurrentBingImage(bingImages[nextIndex])
    }
  }

  const changeToPreviousImage = () => {
    if (bingImages.length > 1) {
      const currentIndex = bingImages.findIndex(img => img.url === currentBingImage?.url)
      const prevIndex = currentIndex === 0 ? bingImages.length - 1 : currentIndex - 1
      setCurrentBingImage(bingImages[prevIndex])
    }
  }

  return {
    currentBingImage,
    bingImages,
    changeToNextImage,
    changeToPreviousImage
  }
}