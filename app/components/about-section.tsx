'use client'

import { motion, AnimatePresence, useScroll } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
import { useInView } from 'react-intersection-observer'
import Image from 'next/image'

const TITLE_LINE_1 = "I create learning experiences"
const TITLE_LINE_2 = "that actually work"

export default function AboutSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [scrollYProgressVal, setScrollYProgressVal] = useState(0)
  const [showBackstory, setShowBackstory] = useState(false)
  const [isTitleRevealed, setIsTitleRevealed] = useState(false)
  const [scrollDirection, setScrollDirection] = useState<'down' | 'up'>('down')
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false)
  const lastScrollValRef = useRef(0)
  
  // Trigger typewriter entry when the section is at least 10% visible in the viewport
  const { ref: inViewRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  })
  
  // Combine both scroll and viewport observer refs on the outer container
  const setRefs = (node: HTMLDivElement | null) => {
    // @ts-ignore
    sectionRef.current = node
    inViewRef(node)
  }
  
  // Scroll Progress measurement targeted at the parent track
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  })
  
  // Sequential Entrance: Wait for the typewriter animation to complete before revealing descriptions
  useEffect(() => {
    if (inView) {
      const timer = setTimeout(() => {
        setIsTitleRevealed(true)
      }, 1200)
      return () => clearTimeout(timer)
    } else {
      setIsTitleRevealed(false)
    }
  }, [inView])

  // Track scroll progress of parent Orchestrated track
  useEffect(() => {
    const calculateProgress = () => {
      if (!sectionRef.current) return
      // Climb up the DOM tree to locate the correct Orchestrated parent track
      let parent = sectionRef.current.parentElement
      while (parent && parent !== document.body) {
        if (parent.offsetHeight > window.innerHeight * 1.2) {
          break
        }
        parent = parent.parentElement
      }
      if (!parent) return
      
      const rect = parent.getBoundingClientRect()
      const parentHeight = parent.offsetHeight
      const viewportHeight = window.innerHeight
      const totalScrollableDistance = parentHeight - viewportHeight
      const currentScrollPosition = -rect.top
      
      if (totalScrollableDistance <= 0) return
      const progress = Math.max(0, Math.min(1, currentScrollPosition / totalScrollableDistance))
      
      const prev = lastScrollValRef.current
      if (progress > prev) {
        setScrollDirection('down')
      } else if (progress < prev) {
        setScrollDirection('up')
      }
      lastScrollValRef.current = progress
      setScrollYProgressVal(progress)
    }
    
    window.addEventListener('scroll', calculateProgress, { passive: true })
    window.addEventListener('resize', calculateProgress, { passive: true })
    calculateProgress()
    
    return () => {
      window.removeEventListener('scroll', calculateProgress)
      window.removeEventListener('resize', calculateProgress)
    }
  }, [])
  
  // Swap inline segments on desktop past 22% scroll progress
  useEffect(() => {
    if (scrollYProgressVal >= 0.22) {
      setShowBackstory(true)
    } else {
      setShowBackstory(false)
    }
  }, [scrollYProgressVal])

  // Lock parent page scrolling (Lenis) when the mobile slide-up sheet is open
  useEffect(() => {
    if (typeof document === 'undefined') return
    const globalLenis = (window as any).lenis
    if (isMobileDrawerOpen) {
      if (globalLenis) globalLenis.stop()
    } else {
      if (globalLenis) globalLenis.start()
    }
    return () => {
      if (globalLenis) globalLenis.start()
    }
  }, [isMobileDrawerOpen])
  
  const words1 = TITLE_LINE_1.split(" ")
  const words2 = TITLE_LINE_2.split(" ")
  
  const introVariants = {
    initial: (dir: 'down' | 'up') => ({
      y: dir === 'up' ? -50 : 25,
      opacity: 0,
      filter: 'blur(8px)',
      rotateX: dir === 'up' ? -8 : 8,
    }),
    visible: {
      y: 0,
      opacity: 1,
      filter: 'blur(0px)',
      rotateX: 0,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
    },
    exit: (dir: 'down' | 'up') => ({
      y: dir === 'down' ? -50 : 25,
      opacity: 0,
      filter: 'blur(8px)',
      rotateX: dir === 'down' ? -8 : 8,
      transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] }
    })
  }
  
  const backstoryVariants = {
    initial: (dir: 'down' | 'up') => ({
      y: dir === 'down' ? 50 : -50,
      opacity: 0,
      filter: 'blur(8px)',
      rotateX: dir === 'down' ? 8 : -8,
    }),
    visible: {
      y: 0,
      opacity: 1,
      filter: 'blur(0px)',
      rotateX: 0,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
    },
    exit: (dir: 'down' | 'up') => ({
      y: dir === 'up' ? 50 : -50,
      opacity: 0,
      filter: 'blur(8px)',
      rotateX: dir === 'up' ? 8 : -8,
      transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] }
    })
  }
  
  return (
    <div ref={setRefs} id="about" className="relative bg-white text-[#212121] overflow-hidden min-h-[calc(100vh+8px)] flex flex-col justify-between">
      
      {/* Desktop absolute image wrapper */}
      <div
        className="hidden lg:block absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[1400px] xl:max-w-[1500px] 2xl:max-w-[1600px] h-full pointer-events-none z-[1]"
        style={{ height: '100vh' }}
      >
        <div className="absolute bottom-0 -right-8 lg:-right-16 xl:-right-20 flex items-end justify-end">
          <div className="relative w-[460px] xl:w-[700px] min-[1920px]:w-[820px] bg-white translate-y-[8px]">
            <Image
              src="/images/alex-portrait.webp"
              alt="Alex Nazin — Freelance Learning Designer"
              width={423}
              height={1194}
              className="object-contain object-bottom w-full h-auto"
              quality={90}
              priority
            />
          </div>
        </div>
      </div>
      
      {/* Centered container */}
      <div className="w-full px-8 md:px-12 lg:px-16 xl:px-20 relative pt-10 md:pt-24 lg:pt-36 pb-12 lg:pb-0 flex-1 flex flex-col justify-between">
        <div className="max-w-[1400px] xl:max-w-[1500px] 2xl:max-w-[1600px] mx-auto w-full relative flex-1 flex flex-col justify-center">
          
          <div className="grid grid-cols-1 lg:grid-cols-[auto,1fr] gap-y-0 lg:gap-12 xl:gap-16 items-stretch relative lg:min-h-[650px] xl:min-h-[700px] w-full">
            
            {/* Left Column Container */}
            <div className="pt-4 pb-4 lg:py-12 max-w-2xl lg:max-w-[650px] xl:max-w-[750px] w-full flex flex-col justify-center relative z-[2]">
              
              {/* DESKTOP VIEWPORT LAYOUT */}
              <div className="hidden lg:block">
                {/* Headline — Static Position */}
                <div className="mb-4 lg:mb-14">
                  <motion.h2
                    initial="hidden"
                    animate={inView ? "visible" : "hidden"}
                    variants={{
                      hidden: {},
                      visible: {
                        transition: { staggerChildren: 0.025 }
                      }
                    }}
                    className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-[64px] xl:text-[80px] font-bold tracking-tight leading-[1.05] text-[#212121]"
                  >
                    {words1.map((word, wordIdx) => (
                      <span key={`dw1-${wordIdx}`} className="inline-block whitespace-nowrap">
                        {word.split("").map((char, charIdx) => (
                          <motion.span
                            key={`dc1-${charIdx}`}
                            variants={{
                              hidden: { opacity: 0 },
                              visible: { opacity: 1 }
                            }}
                          >
                            {char}
                          </motion.span>
                        ))}
                        <span>&nbsp;</span>
                      </span>
                    ))}
                    <br />
                    {words2.map((word, wordIdx) => (
                      <span key={`dw2-${wordIdx}`} className="inline-block whitespace-nowrap font-serif italic font-normal text-[#729E84]">
                        {word.split("").map((char, charIdx) => (
                          <motion.span
                            key={`dc2-${charIdx}`}
                            variants={{
                              hidden: { opacity: 0 },
                              visible: { opacity: 1 }
                            }}
                          >
                            {char}
                          </motion.span>
                        ))}
                        <span>&nbsp;</span>
                      </span>
                    ))}
                  </motion.h2>
                </div>

                {/* Text Swap Container */}
                <div className="relative w-full mt-4 lg:mt-8 overflow-visible h-[280px]">
                  <AnimatePresence mode="wait" custom={scrollDirection}>
                    {!showBackstory ? (
                      /* Text Chunk 1: Main Intro - Standard Line-Height Line Break */
                      <motion.div
                        key="intro"
                        custom={scrollDirection}
                        variants={introVariants}
                        initial="initial"
                        animate={isTitleRevealed ? "visible" : "initial"}
                        exit="exit"
                        className="absolute inset-0 flex flex-col justify-start"
                        style={{ transformPerspective: '1000px' }}
                      >
                        <p className="text-[17px] lg:text-[19px] xl:text-[21px] text-[#212121]/80 leading-relaxed font-light">
                          I&apos;m Alex, an instructional designer with ten years of hands-on experience.
                          <br className="hidden lg:block" />
                          I handle the full picture – from strategy and methodology to scriptwriting and final production.
                        </p>
                      </motion.div>
                    ) : (
                      /* Text Chunk 2: Backstory */
                      <motion.div
                        key="backstory"
                        custom={scrollDirection}
                        variants={backstoryVariants}
                        initial="initial"
                        animate="visible"
                        exit="exit"
                        className="absolute inset-0 flex flex-col justify-start space-y-4 lg:space-y-6"
                        style={{ transformPerspective: '1000px' }}
                      >
                        <p className="text-[14px] lg:text-[15px] xl:text-[16px] text-[#212121]/65 leading-[1.7] lg:leading-[1.85] font-light">
                          I spent six years at ExperTeam, working on a wide variety of projects across many different domains – complex technical training, organizational change, skill-building, you name it. That&apos;s how I developed the ability to jump into unfamiliar territory, get up to speed fast, and turn complicated ideas into learning that sticks.
                        </p>
                        <p className="text-[14px] lg:text-[15px] xl:text-[16px] text-[#212121] leading-[1.7] lg:leading-[1.85] font-semibold">
                          Whether you need someone for one specific stage or the whole journey – I&apos;m in.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* MOBILE ONLY LAYOUT */}
              <div className="lg:hidden flex flex-col items-start text-left w-full py-0 gap-2">
                {/* Mobile Title (Typewriter, Left Aligned) */}
                <div className="w-full text-left">
                  <motion.h2
                    initial="hidden"
                    animate={inView ? "visible" : "hidden"}
                    variants={{
                      hidden: {},
                      visible: {
                        transition: { staggerChildren: 0.025 }
                      }
                    }}
                    className="font-heading text-3xl sm:text-4xl font-bold tracking-tight leading-tight text-[#212121] text-left"
                  >
                    {words1.map((word, wordIdx) => (
                      <span key={`mw1-${wordIdx}`} className="inline-block whitespace-nowrap">
                        {word.split("").map((char, charIdx) => (
                          <motion.span
                            key={`mc1-${charIdx}`}
                            variants={{
                              hidden: { opacity: 0 },
                              visible: { opacity: 1 }
                            }}
                          >
                            {char}
                          </motion.span>
                        ))}
                        <span>&nbsp;</span>
                      </span>
                    ))}
                    <br />
                    {words2.map((word, wordIdx) => (
                      <span key={`mw2-${wordIdx}`} className="inline-block whitespace-nowrap font-serif italic font-normal text-[#729E84]">
                        {word.split("").map((char, charIdx) => (
                          <motion.span
                            key={`mc2-${charIdx}`}
                            variants={{
                              hidden: { opacity: 0 },
                              visible: { opacity: 1 }
                            }}
                          >
                            {char}
                          </motion.span>
                        ))}
                        <span>&nbsp;</span>
                      </span>
                    ))}
                  </motion.h2>
                </div>

                {/* Mobile Portrait (Enlarged & Centered, Anchoring Line directly underneath with NO empty gap) */}
                <div className="w-full flex justify-center mt-1">
                  <div className="relative w-[280px] xs:w-[315px] sm:w-[340px]">
                    <div className="relative w-full">
                      <Image
                        src="/images/alex-portrait.webp"
                        alt="Alex Nazin — Freelance Learning Designer"
                        width={423}
                        height={1194}
                        className="object-contain object-bottom w-full h-auto"
                        quality={90}
                        priority
                    />
                    </div>
                    {/* Architectural anchoring line keeping flush directly beneath base */}
                    <div className="w-full h-[1px] bg-[#729E84]/30 mt-[-1px] relative z-10" />
                  </div>
                </div>

                {/* Mobile Opening Line (Full descriptions aligned strictly left, slightly enlarged) */}
                <div className="w-full text-left mt-1">
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: isTitleRevealed ? 1 : 0, y: isTitleRevealed ? 0 : 10 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="text-[15px] sm:text-[17px] leading-relaxed font-light text-[#212121]/70 text-left"
                  >
                    I&apos;m Alex, an instructional designer with ten years of hands-on experience. I handle the full picture – from strategy and methodology to scriptwriting and final production.
                  </motion.p>
                </div>

                {/* Mobile Read More Button (Aligned strictly left) */}
                <div className="w-full flex justify-start mt-1">
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: isTitleRevealed ? 1 : 0, y: isTitleRevealed ? 0 : 10 }}
                    transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
                    onClick={() => setIsMobileDrawerOpen(true)}
                    className="px-6 py-2.5 rounded-full border border-[#729E84]/30 bg-[#729E84]/5 text-[11px] uppercase tracking-[0.2em] text-[#729E84] font-mono font-bold hover:bg-[#729E84]/10 transition-all flex items-center gap-1.5"
                  >
                    Read more +
                  </motion.button>
                </div>
              </div>

            </div>
            
            {/* Right Column / Desktop Portrait Spacer */}
            <div className="hidden lg:flex items-end justify-end relative h-full w-full min-w-[380px] xl:min-w-[500px] pointer-events-none" />
          </div>
        </div>
      </div>

      {/* MOBILE ONLY: SLIDE-UP SHEET (NO BACKDROP BLUR) */}
      <AnimatePresence>
        {isMobileDrawerOpen && (
          <>
            {/* Solid background overlay (No Blur) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-[100] lg:hidden"
              onClick={() => setIsMobileDrawerOpen(false)}
            />
            {/* Bottom Sheet Drawer */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: '0%' }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-[#212121] border-t border-white/[0.08] rounded-t-2xl max-h-[80vh] overflow-y-auto z-[101] p-6 pb-12 shadow-2xl text-left lg:hidden"
            >
              {/* Handle */}
              <div className="w-12 h-1 bg-white/10 rounded-full mx-auto mb-6" />

              {/* Close Button Container (Title Removed) */}
              <div className="flex justify-end items-center mb-6">
                <button
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              <div className="flex flex-col gap-6 text-[13px] leading-relaxed">
                <div className="text-white/80 font-sans font-light flex flex-col gap-4">
                  <p>
                    I spent six years at ExperTeam, working on a wide variety of projects across many different domains – complex technical training, organizational change, skill-building, you name it. That&apos;s how I developed the ability to jump into unfamiliar territory, get up to speed fast, and turn complicated ideas into learning that sticks.
                  </p>
                  <p className="font-semibold text-[#729E84]">
                    Whether you need someone for one specific stage or the whole journey – I&apos;m in.
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}