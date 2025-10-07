import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import WaveCanvas from '@/components/WaveCanvas'
import EnhancedAudioControls from '@/components/EnhancedAudioControls'
import AnimatedButton from '@/components/AnimatedButton'
import EnhancedOrb from '@/components/EnhancedOrb'

// Analyze page: animated waves + audio controls
export default function Analyze() {
  const [hasAudio, setHasAudio] = useState(false)

  return (
    <motion.main 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen relative"
    >
      {/* Enhanced background with orb and waves */}
      <EnhancedOrb 
        hue={35} 
        hoverIntensity={0.3}
        rotateOnHover={true}
        className="opacity-25"
      />
      <div className="absolute inset-0 pointer-events-none z-10">
        <WaveCanvas className="w-full h-[50vh] md:h-[60vh] opacity-50" />
      </div>

      <section className="relative z-10 max-w-4xl mx-auto px-6 pb-12 pt-24 md:pt-32 space-y-8">
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-3"
        >
          <motion.h1 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="funky-title text-3xl md:text-5xl"
          >
            Audio Playground
          </motion.h1>
          <div className="flex flex-wrap items-center gap-2">
            {['Upload', 'Record', 'Visualize'].map((tag, index) => (
              <motion.span
                key={tag}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ 
                  duration: 0.4, 
                  delay: 0.4 + (index * 0.1),
                  type: "spring",
                  stiffness: 300
                }}
                whileHover={{ scale: 1.05, y: -2 }}
                className="inline-block rounded-full bg-gradient-to-r from-secondary to-accent/20 text-secondary-foreground text-xs px-3 py-1 cursor-default"
              >
                {tag}
              </motion.span>
            ))}
          </div>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-muted-foreground max-w-prose"
          >
            Choose a file or record directly. Then jump to results.
          </motion.p>
        </motion.header>

        <EnhancedAudioControls onAudioReady={() => setHasAudio(true)} />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="pt-6"
        >
          <Link to="/results" aria-disabled={!hasAudio} aria-label="View results">
            <AnimatedButton className="gap-2" variant="primary" disabled={!hasAudio}>
              View Results →
            </AnimatedButton>
          </Link>
          {!hasAudio && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-xs text-muted-foreground mt-3"
            >
              Select or record audio to enable results.
            </motion.p>
          )}
        </motion.div>
      </section>
    </motion.main>
  )
}