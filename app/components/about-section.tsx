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
  
  // Scroll Progress measurement targeted at the Orchestrated parent track
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  })
  
  // Sequential Entrance: Wait for the faster typewriter animation (approx 1.2s) before revealing the intro line
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
  
  useEffect(() => {
    const calculateProgress = () => {
      if (!sectionRef.current) return
      // Climb up the DOM tree to locate the correct Orchestrated parent track (height > 120% of viewport)
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
      
      // Continuous Directional Tracking based on parent scroll progress
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
    calculateProgress() // Initial run
    
    return () => {
      window.removeEventListener('scroll', calculateProgress)
      window.removeEventListener('resize', calculateProgress)
    }
  }, [])
  
  // Swap text segments past progress threshold (22%) to complete reveal before Services slides over
  useEffect(() => {
    if (scrollYProgressVal >= 0.22) {
      setShowBackstory(true)
    } else {
      setShowBackstory(false)
    }
  }, [scrollYProgressVal])
  
  const words1 = TITLE_LINE_1.split(" ")
  const words2 = TITLE_LINE_2.split(" ")
  
  // Direction-Aware Animation Variant Definitions
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
    /* Safety height margin (min-h-[calc(100vh+8px)]) mathematically forces the white canvas flush with the bottom screen edge */
    <div ref={setRefs} id="about" className="relative bg-white text-[#212121] overflow-hidden min-h-[calc(100vh+8px)] flex flex-col justify-between">
      
      {/* Absolute photo wrapper anchored to the absolute bottom of the entire section, sharing identical horizontal centering limits */}
      {/* style={{ height: '100vh' }} forces a definite vertical height so the child does not experience flex-collapsing */}
      <div
        className="hidden lg:block absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[1400px] xl:max-w-[1500px] 2xl:max-w-[1600px] h-full pointer-events-none z-[1]"
        style={{ height: '100vh' }}
      >
        <div className="absolute bottom-0 -right-8 lg:-right-16 xl:-right-20 flex items-end justify-end">
          {/* xl:w-[700px] preserves your preferred laptop proportions exactly. min-[1920px]:w-[820px] restores the perfect, slightly smaller widescreen scale. */}
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
      
      {/* Outer wrapper padded container */}
      <div className="w-full px-8 md:px-12 lg:px-16 xl:px-20 relative pt-10 md:pt-24 lg:pt-36 pb-0 flex-1 flex flex-col justify-between">
        
        {/* Centered content grid wrapper: restricts maximum width to pull content toward the center proportionally */}
        <div className="max-w-[1400px] xl:max-w-[1500px] 2xl:max-w-[1600px] mx-auto w-full relative flex-1 flex flex-col justify-center">
          
          {/* Grid structure inside centered content limits */}
          <div className="grid grid-cols-1 lg:grid-cols-[auto,1fr] gap-y-0 lg:gap-12 xl:gap-16 items-stretch relative lg:min-h-[650px] xl:min-h-[700px] w-full">
            
            {/* Left Column Container */}
            <div className="pt-12 pb-16 lg:py-12 max-w-2xl lg:max-w-[650px] xl:max-w-[750px] w-full flex flex-col justify-center relative z-[2]">
              <div>
                {/* Headline — Completely Static Position (Initial position is final position) */}
                <div className="mb-4 lg:mb-14">
                  <motion.h2
                    initial="hidden"
                    animate={inView ? "visible" : "hidden"}
                    variants={{
                      hidden: {},
                      visible: {
                        transition: { staggerChildren: 0.025 } // Sped up stagger pace for typing
                      }
                    }}
                    className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-[64px] xl:text-[80px] font-bold tracking-tight leading-[1.05] text-[#212121]"
                  >
                    {/* Words are rendered as inline blocks to prevent mid-character wrapping */}
                    {words1.map((word, wordIdx) => (
                      <span key={`w1-${wordIdx}`} className="inline-block whitespace-nowrap">
                        {word.split("").map((char, charIdx) => (
                          <motion.span
                            key={`c1-${charIdx}`}
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
                      <span key={`w2-${wordIdx}`} className="inline-block whitespace-nowrap font-serif italic font-normal text-[#729E84]">
                        {word.split("").map((char, charIdx) => (
                          <motion.span
                            key={`c2-${charIdx}`}
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
                
                {/* Mobile Version Portrait (Approach 2) — Placed between title and text swap with baseline grounding */}
                <div className="lg:hidden flex flex-col items-center pt-1 pb-2">
                  <div className="relative w-[170px] sm:w-[200px]">
                    <div className="relative w-full">
                      <Image
                        src="/images/alex-portrait.webp"
                        alt="Alex Nazin — Freelance Learning Designer"
                        width={423}
                        height={1194}
                        className="object-contain object-bottom w-full h-auto"
                        quality={85}
                        priority
                      />
                    </div>
                    {/* Architectural anchoring line to prevent a floating appearance */}
                    <div className="w-full h-[1px] bg-[#729E84]/30 mt-[-1px] relative z-10" />
                  </div>
                </div>
                
                {/* Text Swap Container — Responsive h-[220px] on mobile to safely fit full backstory, h-[280px] on desktop */}
                <div className="relative w-full mt-4 lg:mt-8 overflow-visible h-[220px] lg:h-[280px]">
                  <AnimatePresence mode="wait" custom={scrollDirection}>
                    {!showBackstory ? (
                      /* Text Chunk 1: Main Intro — Animates on entry and scroll-up */
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
                        <p className="text-[14px] lg:text-[15px] xl:text-[16px] text-[#212121]/65 leading-[1.7] lg:leading-[1.85] font-light">
                          I&apos;m Alex, an instructional designer with ten years of hands-on experience, covering everything from learning strategy and methodology to scriptwriting and final production.
                        </p>
                      </motion.div>
                    ) : (
                      /* Text Chunk 2: Backstory — Swaps cleanly with direction-aware physics and snug mobile spacing */
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
                        <p className="text-[13.5px] lg:text-[15px] xl:text-[16px] text-[#212121]/65 leading-[1.65] lg:leading-[1.85] font-light">
                          My background includes six years at ExperTeam, a leading Israeli vendor for organizational learning and training development. Working on a vast range of projects across industries like tech, finance, and healthcare allowed me to build the professional toolbox I use today: the ability to dive into any field and find creative ways to turn complex topics into clear, engaging learning experiences that actually work.
                        </p>
                        <p className="text-[13.5px] lg:text-[15px] xl:text-[16px] text-[#212121] leading-[1.65] lg:leading-[1.85] font-semibold">
                          Whether you need someone for one specific stage or the whole journey - I&apos;m in.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
            
            {/* Right Column / Desktop Portrait Spacer — Empty inside the centered grid to preserve layout structure, since the actual photo is now anchored flush to the bottom container */}
            <div className="hidden lg:flex items-end justify-end relative h-full w-full min-w-[380px] xl:min-w-[500px] pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  )
}