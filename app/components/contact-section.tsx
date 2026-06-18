'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

export default function ContactSection() {
  const [emailCopied, setEmailCopied] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [typedEmail, setTypedEmail] = useState('')
  const [showCta, setShowCta] = useState(false)
  const [animationCompleted, setAnimationCompleted] = useState(false)
  const emailStr = 'alexnz.ser@gmail.com'
  const sectionRef = useRef<HTMLDivElement>(null)
  
  const [isMobile, setIsMobile] = useState(false)
  const [isMobileRevealed, setIsMobileRevealed] = useState(false)
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Safely prune timers on component unmount
  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current)
      }
    }
  }, [])

  // Track the scroll entry progress of ContactSection
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'start start']
  })
  
  // 1. Top Part (Left): Slides in dynamically from Left as you scroll
  const topX = useTransform(scrollYProgress, [0.2, 0.8], ["-100%", "0%"])
  // 2. Bottom Part (Right): Slides in dynamically from Right as you scroll
  const bottomX = useTransform(scrollYProgress, [0.35, 0.95], ["100%", "0%"])

  const copyEmail = async () => {
    try {
      await navigator?.clipboard?.writeText?.(emailStr)
      setEmailCopied(true)
      setTimeout(() => setEmailCopied(false), 2000)
    } catch { /* fallback */ }
  }

  const handleBlockTap = async () => {
    if (isMobile) {
      if (!isMobileRevealed) {
        // Step 1: Open the curtain and start typing, but do not copy yet
        setIsMobileRevealed(true)
        setIsHovered(true)
        
        // Start 5-second auto-close inactivity timer
        if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
        closeTimerRef.current = setTimeout(() => {
          handleClose()
        }, 5000)
      } else {
        // Step 2: Copy to clipboard on the second tap
        await copyEmail()
        
        // Reset/extend close timer to 2 seconds following successful copy
        if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
        closeTimerRef.current = setTimeout(() => {
          handleClose()
        }, 2000)
      }
    } else {
      // Desktop copies immediately on click, as reveal is already handled by hover
      await copyEmail()
    }
  }

  const handleClose = () => {
    setIsMobileRevealed(false)
    setIsHovered(false)
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }

  // Monitor scroll progress to unlock hover interactions only when the card is fully unified (at 95% scroll progress)
  useEffect(() => {
    if (!scrollYProgress) return
    const handleChange = (latest: number) => {
      setAnimationCompleted(latest >= 0.95)
    }
    const unsubscribe = scrollYProgress.onChange
      ? scrollYProgress.onChange(handleChange)
      : scrollYProgress.on('change', handleChange)

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [scrollYProgress])

  // Snappy typing animation triggered after 150ms of hover
  useEffect(() => {
    if (emailCopied) {
      setTypedEmail('Copied!')
      setShowCta(true)
      return
    }
    if (!isHovered) {
      setTypedEmail('')
      setShowCta(false)
      return
    }
    let currentIdx = 0
    let tempText = ''
    setShowCta(false)
    let activeInterval: any = null
    const startTimeout = setTimeout(() => {
      activeInterval = setInterval(() => {
        if (currentIdx < emailStr.length) {
          tempText += emailStr[currentIdx]
          setTypedEmail(tempText)
          currentIdx++
        } else {
          if (activeInterval) clearInterval(activeInterval)
          setShowCta(true)
        }
      }, 25)
    }, 150)
    return () => {
      clearTimeout(startTimeout)
      if (activeInterval) clearInterval(activeInterval)
    }
  }, [isHovered, emailCopied])

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="bg-transparent text-white h-screen flex flex-col justify-center items-center overflow-hidden select-none z-20"
    >
      {/* Symmetrically centered card container bounds matching standard page widths */}
      <div className="w-full px-8 md:px-12 lg:px-16 xl:px-20 flex-1 flex flex-col justify-center items-center relative z-10">
        <div className="w-full flex flex-col min-h-[420px] md:min-h-[580px] xl:max-w-[1500px] 2xl:max-w-[1600px] relative">
          
          {/* Top Part: Aligned to Left - Slides in dynamically from Left as you scroll */}
          <motion.div
            style={{ x: topX }}
            className="flex-1 flex flex-col justify-center items-start px-8 py-12 md:px-16 md:py-20 lg:px-20 lg:py-24 text-left select-none bg-[#729E84] text-[#212121] rounded-t-xl shadow-2xl"
          >
            <h3 className="font-heading text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight mb-4 uppercase leading-none">
              Still here? Good.
            </h3>
            <p className="font-mono text-[11px] sm:text-[13px] md:text-[14px] uppercase tracking-[0.25em] opacity-80 mt-2">
              Time to make learning that actually lands
            </p>
          </motion.div>
          
          {/* Bottom Part: Divided by Thin Line - Slides in dynamically from Right as you scroll */}
          <motion.button
            style={{ x: bottomX }}
            onClick={handleBlockTap}
            onMouseEnter={!isMobile ? () => setIsHovered(true) : undefined}
            onMouseLeave={!isMobile ? () => setIsHovered(false) : undefined}
            className={`group/bottom w-full border-t border-[#212121]/15 flex items-center justify-between px-8 py-10 md:px-16 md:py-14 lg:px-20 lg:py-16 min-h-[110px] md:min-h-[140px] relative overflow-hidden text-left focus:outline-none rounded-b-xl bg-[#729E84] text-[#212121] transition-colors duration-500 shadow-2xl ${
              !isMobile ? 'hover:bg-[#212121]' : ''
            } ${
              animationCompleted ? 'pointer-events-auto cursor-pointer' : 'pointer-events-none'
            }`}
          >
            {/* Curtain overlay covering from top */}
            <div
              className="absolute inset-0 bg-[#212121] transform transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] z-20"
              style={{ transform: isHovered ? 'translateY(0)' : 'translateY(-100%)' }}
            />
            
            {/* Left Part: Email (revealed above the curtain with typed effect) */}
            <div className="relative z-30 flex flex-col justify-center pr-4 text-[#729E84]">
              <span className="font-heading text-lg sm:text-2xl md:text-4xl lg:text-5xl font-bold tracking-tight h-[28px] sm:h-[40px] md:h-[50px] flex items-center select-all">
                {typedEmail}
              </span>
              <span className={`text-[9px] md:text-xs font-mono uppercase tracking-[0.2em] transition-all duration-500 transform mt-1 md:mt-2 ${showCta ? 'opacity-70 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                {emailCopied ? 'copied!' : 'copy my email'}
              </span>
            </div>

            {/* Right Part: "← Let's talk" (Z-index 10, covered statically by Z-index 20 curtain) */}
            <div className="absolute right-8 md:right-16 lg:right-20 z-10 text-[#212121] pointer-events-none select-none">
              <span className="font-heading text-xl sm:text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight uppercase flex items-center gap-4">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 transform -translate-x-2"
                >
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
                Let{"'"}s talk
              </span>
            </div>
          </motion.button>
        </div>
      </div>

      {/* Footer Area - locked at the bottom of the viewport with matching edge gutters */}
      <div className="w-full px-8 md:px-12 lg:px-16 xl:px-20 pb-8 flex items-center justify-between select-none border-t border-white/[0.06] pt-6 z-10">
        <p className="text-[12px] text-white/25 font-mono">© Alex Nazin</p>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-[#729E84] rounded-full" />
          <span className="text-[11px] text-white/25 font-mono tracking-wider">
            Available for work
          </span>
        </div>
      </div>
    </section>
  )
}