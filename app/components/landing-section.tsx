'use client'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useEffect, useState } from 'react'
import AnimatedBg from './animated-bg'

export default function LandingSection() {
  const { scrollY } = useScroll()
  
  // Extended the scroll thresholds to 800px for a much longer, gentler transition
  const contentY = useTransform(scrollY, [0, 800], [0, -200])
  const opacity = useTransform(scrollY, [0, 800], [1, 0])
  const nameScale = useTransform(scrollY, [0, 800], [1, 0.8])
  
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  
  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 40,
        y: (e.clientY / window.innerHeight - 0.5) * 40
      })
    }
    window.addEventListener('mousemove', handleMouse, { passive: true })
    return () => window.removeEventListener('mousemove', handleMouse)
  }, [])
  
  const scrollToAbout = () => document.querySelector('#about')?.scrollIntoView?.({
    behavior: 'smooth'
  })
  
  const nameLetters = 'ALEX NAZIN'.split('')
  
  return (
    <section id="landing" className="sticky top-0 z-[1] h-[100dvh] w-full flex flex-col items-center justify-center overflow-hidden">
      {/* Animated pattern background */}
      <div className="absolute inset-0">
        <AnimatedBg />
        <div className="absolute inset-0 bg-gradient-to-b from-[#212121]/30 via-transparent to-[#212121]/50" />
      </div>
      
      <div
        className="absolute inset-0 pointer-events-none z-[1]"
        style={{
          background: `radial-gradient(800px circle at ${50 + mousePos.x * 0.3}% ${50 + mousePos.y * 0.3}%, rgba(114,158,132,0.04), transparent 60%)`
        }}
      />
      
      {/* Parent container handles the scroll movement, fade, and scale together */}
      <motion.div style={{ y: contentY, opacity, scale: nameScale }} className="relative text-center px-6 z-[2]">
        <h1 className="font-heading text-[clamp(3rem,10vw,9rem)] font-bold tracking-tighter leading-[0.85] text-white mb-8">
          <span className="inline-block overflow-hidden">
            {nameLetters.map((letter, i) => (
              <motion.span
                key={i}
                initial={{ y: 140, opacity: 0, rotateX: -90 }}
                animate={{ y: 0, opacity: 1, rotateX: 0 }}
                transition={{ duration: 0.9, delay: 0.5 + i * 0.04, ease: [0.22, 1, 0.36, 1] }}
                className="inline-block"
                style={{ display: letter === ' ' ? 'inline' : 'inline-block' }}
              >
                {letter === ' ' ? '\u00A0' : letter}
              </motion.span>
            ))}
          </span>
        </h1>
        
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.2, delay: 1, ease: [0.22, 1, 0.36, 1] }}
          className="h-[2px] bg-[#729E84] mx-auto mb-6 w-20 origin-center"
        />
        
        <motion.p
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="font-serif !font-light italic text-lg sm:text-xl md:text-2xl text-white/30 tracking-wide mb-6"
        >
          Freelance Learning Designer
        </motion.p>
      </motion.div>
      
      <motion.button
        onClick={scrollToAbout}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 group cursor-pointer z-[2]"
        aria-label="Scroll down"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
          className="w-[1px] h-14 bg-gradient-to-b from-white/0 via-white/15 to-white/0"
        />
      </motion.button>
    </section>
  )
}