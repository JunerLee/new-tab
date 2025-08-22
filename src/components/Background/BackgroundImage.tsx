import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Info } from 'lucide-react'
import { useBingImage } from '@/hooks/useBingImage'
import { useAppStore } from '@/stores/useAppStore'
import { cn } from '@/utils'

export function BackgroundImage() {
  const { settings } = useAppStore()
  const { currentBingImage, changeToNextImage, changeToPreviousImage } = useBingImage()

  if (!settings.background.bingEnabled || !currentBingImage) {
    return null
  }

  const backgroundStyle = {
    backgroundImage: `url(${currentBingImage.url})`
  }

  return (
    <div className="fixed inset-0 -z-10">
      {/* Background Image */}
      <motion.div
        key={currentBingImage.url}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="absolute inset-0 bg-cover bg-center bg-no-repeat apply-background-settings dynamic-opacity dynamic-blur"
        style={backgroundStyle}
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/20 dark:bg-black/40" />
      
      {/* Navigation Controls */}
      <div className="absolute bottom-6 right-6 flex items-center gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={changeToPreviousImage}
          className={cn(
            "glass-effect rounded-2xl p-3", /* 更大的内边距和更圆润的边角 */
            "text-white/80 hover:text-white",
            "transition-all duration-300 ease-out",
            "hover:shadow-lg backdrop-blur-md"
          )}
        >
          <ChevronLeft className="w-5 h-5" />
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={changeToNextImage}
          className={cn(
            "glass-effect rounded-2xl p-3", /* 更大的内边距和更圆润的边角 */
            "text-white/80 hover:text-white",
            "transition-all duration-300 ease-out",
            "hover:shadow-lg backdrop-blur-md"
          )}
        >
          <ChevronRight className="w-5 h-5" />
        </motion.button>
      </div>
      
      {/* Image Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="absolute bottom-6 left-6 max-w-md"
      >
        <div className="glass-effect rounded-2xl p-5 text-white shadow-lg">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 mt-0.5 text-white/60" />
            <div>
              <h3 className="font-medium text-sm mb-1">
                {currentBingImage.title}
              </h3>
              <p className="text-xs text-white/70 leading-relaxed">
                {currentBingImage.copyright}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}