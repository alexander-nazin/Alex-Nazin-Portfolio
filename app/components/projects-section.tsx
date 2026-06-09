'use client'
import { useRef, useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import type { Project } from './portfolio-app'

interface Props {
  projects: Project[]
}

const COMPANY_NAMES: Record<number, string> = {
  1: 'AppsFlyer',
  2: 'CyberArk',
  3: 'JFrog',
  4: 'Maccabi',
  5: 'Wix',
  6: 'Perion',
  7: 'Bank Hapoalim',
  8: 'Amdocs',
}

function ProjectRow({
  project,
  index,
  onOpenDrawer,
  isMobile,
  viewportHeight,
}: {
  project: Project
  index: number
  onOpenDrawer: (project: Project) => void
  isMobile: boolean
  viewportHeight: number
}) {
  const cardRef = useRef<HTMLDivElement>(null)
  
  const desktopVideoRef = useRef<HTMLVideoElement>(null)
  const mobileVideoRef = useRef<HTMLVideoElement>(null)
  const [hasBeenViewed, setHasBeenViewed] = useState(index === 0)
  
  // Observer 1: Visual Entrance Reveal (Triggered when 5% enters from bottom)
  const { ref: revealRef, inView: revealInView } = useInView({
    threshold: 0.05,
    triggerOnce: true,
  })
  
  // Observer 3: Mobile Auto-Pause Viewport Tracker (Standard, relaxed bounds)
  const { ref: mobileRef, inView: mobileInView } = useInView({
    threshold: 0.02,
  })
  
  // Dedicated observers attached to the video container players to pause instantly
  const { ref: desktopVideoViewRef, inView: desktopVideoInView } = useInView({
    threshold: 0,
  })
  const { ref: mobileVideoViewRef, inView: mobileVideoInView } = useInView({
    threshold: 0,
  })

  const setRefs = useCallback(
    (node: HTMLDivElement | null) => {
      // @ts-ignore
      cardRef.current = node
      revealRef(node)
      mobileRef(node)
    },
    [revealRef, mobileRef]
  )

  useEffect(() => {
    if (revealInView) {
      setHasBeenViewed(true)
    }
  }, [revealInView])

  useEffect(() => {
    if (!desktopVideoInView) {
      if (desktopVideoRef.current && !desktopVideoRef.current.paused) {
        desktopVideoRef.current.pause()
      }
    }
  }, [desktopVideoInView])

  useEffect(() => {
    if (!mobileVideoInView) {
      if (mobileVideoRef.current && !mobileVideoRef.current.paused) {
        mobileVideoRef.current.pause()
      }
    }
  }, [mobileVideoInView])

  const initialAnim = index === 0
    ? { opacity: 1, y: 0, scale: 1 }
    : { opacity: 0, y: 30, scale: 0.97 }

  const transitionDelay = index === 0 ? 0 : 0.15

  return (
    <motion.div
      ref={setRefs}
      id={`project-${project.id}`}
      initial={initialAnim}
      animate={hasBeenViewed ? { opacity: 1, y: 0, scale: 1 } : initialAnim}
      transition={{ duration: 0.8, delay: transitionDelay, ease: [0.22, 1, 0.36, 1] }}
      className="bg-[#2a2a2a] border border-white/[0.06] p-6 md:p-8 rounded-xl flex flex-col gap-8 shadow-xl scroll-mt-24 w-full xl:max-w-[1500px] 2xl:max-w-[1600px]"
    >
      <h3 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight text-left">
        {project.title}
      </h3>

      {/* ------------------------------------------------------------
          DESKTOP ONLY: 4-COLUMN HORIZONTAL GRID
         ------------------------------------------------------------ */}
      <div className="hidden lg:grid grid-cols-4 gap-8 md:gap-10 text-left items-start">
        {project.caseStudy.challenge && (
          <div className="flex flex-col gap-2.5">
            <h4 className="text-[10px] uppercase tracking-[0.2em] text-[#729E84]/70 font-mono font-bold">Challenge:</h4>
            <p className="text-[13px] leading-relaxed text-white/50 font-light">{project.caseStudy.challenge}</p>
          </div>
        )}
        {project.caseStudy.approach && (
          <div className="flex flex-col gap-2.5">
            <h4 className="text-[10px] uppercase tracking-[0.2em] text-[#729E84]/70 font-mono font-bold">Approach:</h4>
            <p className="text-[13px] leading-relaxed text-white/50 font-light">{project.caseStudy.approach}</p>
          </div>
        )}
        <div className="flex flex-col gap-2.5">
          <h4 className="text-[10px] uppercase tracking-[0.2em] text-[#729E84]/70 font-mono font-bold">Role:</h4>
          <div className="flex flex-wrap gap-2">
            {project.caseStudy.roles.map((role) => (
              <div key={role} className="px-3.5 py-2 border border-white/[0.08] bg-white/[0.02] text-[10px] text-white/70 font-mono rounded select-none font-medium">{role}</div>
            ))}
          </div>
        </div>
        {project.caseStudy.result && (
          <div className="flex flex-col gap-2.5">
            <h4 className="text-[10px] uppercase tracking-[0.2em] text-[#729E84]/70 font-mono font-bold">Outcome:</h4>
            <p className="text-[13px] leading-relaxed text-white/50 font-light">{project.caseStudy.result}</p>
          </div>
        )}
      </div>

      {/* --- DESKTOP ONLY: Examples Section --- */}
      {project.caseStudy.links && project.caseStudy.links.length > 0 && (
        <div className="hidden lg:flex flex-col gap-2.5 pt-4 border-t border-white/[0.04] w-full">
          {/* Symmetrical check: bypasses rendering the "Examples" title strictly on the Wix block (ID: 5) */}
          {project.id !== 5 && (
            <h4 className="text-[10px] uppercase tracking-[0.2em] text-[#729E84]/70 font-mono font-bold">Examples:</h4>
          )}
          <div className="flex flex-wrap gap-3">
            {project.caseStudy.links.map((link) => (
              <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer" className="text-xs font-mono text-[#729E84] hover:text-white transition-colors flex items-center gap-1.5 border border-[#729E84]/20 hover:border-white/30 px-4 py-2 rounded-full bg-white/[0.01]">
                <span>{link.label}</span>
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------
          MOBILE ONLY: VIDEO PLAYER POSITIONED FIRST
         ------------------------------------------------------------ */}
      <div
        ref={mobileVideoViewRef}
        className="lg:hidden relative aspect-[16/10] bg-black/40 rounded-xl overflow-hidden border border-white/[0.05] max-w-[600px] mx-auto w-full"
      >
        {project.videoSrc ? (
          <video
            ref={mobileVideoRef}
            src={project.videoSrc}
            poster={project.thumbnail}
            preload="none"
            controls
            controlsList="nodownload"
            onContextMenu={(e) => e.preventDefault()}
            playsInline
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#1e1e1e] text-white/20 font-mono text-sm">Mockup Assets Not Loaded</div>
        )}
      </div>

      {/* --- MOBILE ONLY: Role Tags --- */}
      <div className="lg:hidden flex flex-col gap-2">
        <h4 className="text-[9px] uppercase tracking-[0.2em] text-[#729E84]/70 font-mono font-bold text-left">Role:</h4>
        <div className="flex flex-wrap gap-1.5 justify-start">
          {project.caseStudy.roles.map((role) => (
            <div key={role} className="px-2.5 py-1.5 border border-white/[0.06] bg-white/[0.01] text-[9px] text-white/70 font-mono rounded">{role}</div>
          ))}
        </div>
      </div>

      {/* --- MOBILE ONLY: Open Bottom Sheet Trigger --- */}
      <div className="lg:hidden w-full text-left">
        <button
          onClick={() => onOpenDrawer(project)}
          className="group flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] text-[#729E84] py-1 font-mono font-bold"
        >
          <span>About the project +</span>
        </button>
      </div>

      {/* ------------------------------------------------------------
          DESKTOP ONLY: VIDEO PLAYER POSITIONED AT THE BOTTOM
         ------------------------------------------------------------ */}
      <div
        ref={desktopVideoViewRef}
        className="hidden lg:block relative aspect-[16/10] bg-black/40 rounded-2xl overflow-hidden border border-white/[0.05] w-full"
      >
        {project.videoSrc ? (
          <video
            ref={desktopVideoRef}
            src={project.videoSrc}
            poster={project.thumbnail}
            preload="none"
            controls
            controlsList="nodownload"
            onContextMenu={(e) => e.preventDefault()}
            playsInline
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#1e1e1e] text-white/20 font-mono text-sm">Mockup Assets Not Loaded</div>
        )}
      </div>
    </motion.div>
  )
}

export default function ProjectsSection({ projects }: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [selectedProjectForDrawer, setSelectedProjectForDrawer] = useState<Project | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [viewportHeight, setViewportHeight] = useState(800)
  const safeProjects = projects ?? []
  const isScrollingRef = useRef(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024)
      setViewportHeight(window.innerHeight)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (typeof document === 'undefined') return
    const globalLenis = (window as any).lenis
    if (selectedProjectForDrawer && isMobile) {
      if (globalLenis) globalLenis.stop()
    } else {
      if (globalLenis) globalLenis.start()
    }
    return () => {
      if (globalLenis) globalLenis.start()
    }
  }, [selectedProjectForDrawer, isMobile])

  const { ref: introRef, inView: introInView } = useInView({
    threshold: 0,
    rootMargin: isMobile ? '-220px 0px 0px 0px' : '-350px 0px 0px 0px',
  })

  useEffect(() => {
    if (introInView && !isScrollingRef.current) {
      setActiveIndex(null)
    }
  }, [introInView])

  const handleScrollToProject = (id: number, index: number) => {
    const el = document.getElementById(`project-${id}`)
    if (el) {
      isScrollingRef.current = true
      setActiveIndex(index)
      const headerOffset = isMobile ? 220 : 100
      const elementPosition = el.getBoundingClientRect().top
      const targetY = elementPosition + window.pageYOffset - headerOffset
      const startY = window.pageYOffset
      const difference = targetY - startY
      const duration = 900
      let startTime: number | null = null
      const step = (timestamp: number) => {
        if (!startTime) startTime = timestamp
        const progress = timestamp - startTime
        const percent = Math.min(progress / duration, 1)
        
        const ease = percent < 0.5
          ? 4 * percent * percent * percent
          : (percent - 1) * (2 * percent - 2) * (2 * percent - 2) + 1
        window.scrollTo(0, startY + difference * ease)
        if (progress < duration) {
          requestAnimationFrame(step)
        } else {
          isScrollingRef.current = false
        }
      }
      requestAnimationFrame(step)
    }
  }

  const updateActiveIndex = useCallback(() => {
    if (isScrollingRef.current) return
    const lineY = isMobile ? 220 : 350
    let currentActive: number | null = null
    const isAtBottom = window.innerHeight + window.pageYOffset >= document.documentElement.scrollHeight - 15
    if (isAtBottom) {
      currentActive = safeProjects.length - 1
    } else {
      for (let i = 0; i < safeProjects.length; i++) {
        const el = document.getElementById(`project-${safeProjects[i].id}`)
        if (el) {
          const rect = el.getBoundingClientRect()
          if (rect.top <= lineY + 2) {
            currentActive = i
          }
        }
      }
    }
    setActiveIndex(currentActive)
  }, [safeProjects, isMobile])

  useEffect(() => {
    window.addEventListener('scroll', updateActiveIndex, { passive: true })
    window.addEventListener('resize', updateActiveIndex, { passive: true })
    updateActiveIndex()
    return () => {
      window.removeEventListener('scroll', updateActiveIndex)
      window.removeEventListener('resize', updateActiveIndex)
    }
  }, [updateActiveIndex])

  const activeTitle = activeIndex !== null
    ? (COMPANY_NAMES[safeProjects[activeIndex].id] ?? safeProjects[activeIndex].title)
    : ""

  return (
    <div id="projects" className="relative text-white py-16 md:py-24">
      {/* Container wrapper stretched fluid wide to align with Services and About headers */}
      <div className="w-full px-8 md:px-12 lg:px-16 xl:px-20 relative">
        
        {/* ------------------------------------------------------------
            MOBILE ONLY: STICKY CENTER DROPDOWN SELECTOR (Animate in when active)
           ------------------------------------------------------------ */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{
            opacity: activeIndex !== null ? 1 : 0,
            y: activeIndex !== null ? 0 : -10,
            pointerEvents: activeIndex !== null ? 'auto' : 'none'
          }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="sticky z-30 bg-[#212121]/90 backdrop-blur-md border-b border-white/[0.06] lg:hidden -mx-8 relative"
          style={{ top: '4rem' }}
        >
          <div className="px-8 py-3 flex justify-center w-full">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center justify-between gap-3 px-6 py-2.5 bg-white/5 border border-white/10 rounded-full text-[12px] font-mono tracking-wide text-white/90 w-full max-w-xs hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${activeIndex !== null ? 'bg-[#729E84] animate-pulse' : 'bg-white/30'}`} />
                <span className="font-semibold truncate">{activeTitle}</span>
              </div>
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          </div>
          <AnimatePresence>
            {isOpen && (
              <>
                <div className="fixed inset-0 z-10 bg-black/40" onClick={() => setIsOpen(false)} />
                
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute left-8 right-8 top-full mt-2 bg-[#2a2a2a] border border-white/[0.08] rounded-xl shadow-2xl overflow-hidden z-20"
                >
                  <div className="py-2 flex flex-col">
                    {safeProjects.map((project, idx) => {
                      const isActive = idx === activeIndex
                      const shortTitle = COMPANY_NAMES[project.id] ?? project.title
                      return (
                        <button
                          key={project.id}
                          onClick={() => {
                            handleScrollToProject(project.id, idx)
                            setIsOpen(false)
                          }}
                          className={`w-full text-left px-6 py-3 text-[12px] font-mono tracking-wide transition-colors flex items-center justify-between ${
                            isActive
                              ? 'bg-[#729E84]/10 text-[#729E84] font-semibold'
                              : 'text-white/60 hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          <span>{shortTitle}</span>
                          {isActive && (
                            <span className="w-1.5 h-1.5 bg-[#729E84] rounded-full" />
                          )}
                        </button>
                      )
                    })}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ------------------------------------------------------------
            MAIN SPLIT EDITORIAL CANVAS
           ------------------------------------------------------------ */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start mt-8">
          
          {/* Left Column: Redesigned Pinned Timeline dots (Spans exactly 12% width) */}
          <div className="hidden lg:block w-[12%] flex-shrink-0 sticky top-[calc(50vh-240px)] h-[480px] select-none z-10">
            <motion.div
              initial={{ opacity: 0, x: -20, scale: 0.95 }}
              animate={{
                opacity: activeIndex !== null ? 1 : 0,
                x: activeIndex !== null ? 0 : -20,
                scale: activeIndex !== null ? 1 : 0.95,
                pointerEvents: activeIndex !== null ? 'auto' : 'none'
              }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="relative flex flex-col items-center h-full w-full"
            >
              <div className="absolute top-0 bottom-0 w-[1.5px] bg-white/10 left-4" />
              {safeProjects.map((project, idx) => {
                const isActive = idx === activeIndex
                const isHovered = hoveredIndex === idx
                const showCapsule = isActive || isHovered
                const shortTitle = COMPANY_NAMES[project.id] ?? project.title
                return (
                  <button
                    key={project.id}
                    onClick={() => handleScrollToProject(project.id, idx)}
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    className="absolute flex items-center transition-all duration-500 -translate-y-1/2 cursor-pointer h-10"
                    style={{
                      left: '16px',
                      top: `${(idx / (safeProjects.length - 1)) * 100}%`,
                    }}
                  >
                    <div
                      className={`flex items-center gap-3 py-1.5 rounded-full transition-all duration-300 h-8 absolute left-[-16px] ${
                        isActive
                          ? 'bg-white/[0.05] border border-white/10 shadow-lg shadow-black/30 backdrop-blur-md pl-3 pr-4'
                          : isHovered
                          ? 'bg-transparent border border-transparent pl-3 pr-4'
                          : 'bg-transparent border border-transparent pl-3 pr-3'
                      }`}
                    >
                      <div className={`rounded-full transition-all duration-300 flex-shrink-0 ${(isActive || isHovered) ? 'w-2.5 h-2.5 bg-[#729E84] shadow-[0_0_8px_rgba(114,158,132,0.6)]' : 'w-2 h-2 bg-white/80 border border-white/20'}`} />
                      <span className={`text-[11px] uppercase tracking-wider font-mono transition-all duration-300 whitespace-nowrap ${showCapsule ? 'opacity-100 max-w-[200px] translate-x-0' : 'opacity-0 max-w-0 -translate-x-2 overflow-hidden'} ${isActive ? 'text-white font-medium' : 'text-white/60'}`}>
                        {shortTitle}
                      </span>
                    </div>
                  </button>
                )
              })}
            </motion.div>
          </div>

          {/* Right Column: Spans 88% width, containing headers and the dynamic project list */}
          <div className="w-full lg:w-[88%] flex-shrink-0 flex flex-col gap-12 md:gap-16">
            
            {/* Symmetrical header intro container */}
            <div ref={introRef} className="flex flex-col mb-10">
              <h2 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white mb-6 leading-tight max-w-2xl">
                Selected <span className="font-serif italic font-normal text-[#729E84]">work</span>
              </h2>
              <p className="text-[15px] text-white/50 max-w-2xl leading-[1.8] font-light">
                A selection of projects from my time at ExperTeam — spanning strategy, scripting, and production across a range of industries.
              </p>
            </div>

            <div className="flex flex-col gap-12 md:gap-16">
              {safeProjects.map((project, i) => (
                <ProjectRow
                  key={project.id}
                  project={project}
                  index={i}
                  onOpenDrawer={setSelectedProjectForDrawer}
                  isMobile={isMobile}
                  viewportHeight={viewportHeight}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------
          MOBILE ONLY: PREMIUM SLIDE-UP BOTTOM SHEET FOR PROJECT DETAILS
         ------------------------------------------------------------ */}
      <AnimatePresence>
        {selectedProjectForDrawer && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
              onClick={() => setSelectedProjectForDrawer(null)}
            />
            {/* Bottom Sheet Drawer */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: '0%' }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-[#212121] border-t border-white/[0.08] rounded-t-2xl max-h-[80vh] overflow-y-auto z-50 p-6 pb-12 shadow-2xl text-left lg:hidden"
            >
              {/* Handle */}
              <div className="w-12 h-1 bg-white/10 rounded-full mx-auto mb-6" />
              
              <div className="flex justify-between items-start mb-6">
                <h3 className="font-heading text-2xl font-bold text-white tracking-tight leading-tight">
                  {selectedProjectForDrawer.title}
                </h3>
                <button
                  onClick={() => setSelectedProjectForDrawer(null)}
                  className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              <div className="flex flex-col gap-6 font-mono text-[12px]">
                {selectedProjectForDrawer.caseStudy.challenge && (
                  <div>
                    <h4 className="text-[#729E84] font-bold uppercase tracking-wider mb-2">Challenge</h4>
                    <p className="text-white/60 leading-relaxed font-sans font-light text-[13px]">{selectedProjectForDrawer.caseStudy.challenge}</p>
                  </div>
                )}
                {selectedProjectForDrawer.caseStudy.approach && (
                  <div>
                    <h4 className="text-[#729E84] font-bold uppercase tracking-wider mb-2">Approach</h4>
                    <p className="text-white/60 leading-relaxed font-sans font-light text-[13px]">{selectedProjectForDrawer.caseStudy.approach}</p>
                  </div>
                )}
                {selectedProjectForDrawer.caseStudy.result && (
                  <div>
                    <h4 className="text-[#729E84] font-bold uppercase tracking-wider mb-2">Outcome</h4>
                    <p className="text-white/60 leading-relaxed font-sans font-light text-[13px]">{selectedProjectForDrawer.caseStudy.result}</p>
                  </div>
                )}
                {selectedProjectForDrawer.caseStudy.links && selectedProjectForDrawer.caseStudy.links.length > 0 && (
                  <div>
                    {selectedProjectForDrawer.id !== 5 && (
                      <h5 className="text-[9px] uppercase tracking-[0.2em] text-[#729E84]/70 font-mono font-bold">Examples</h5>
                    )}
                    <div className="flex flex-col gap-1.5 mt-1">
                      {selectedProjectForDrawer.caseStudy.links.map((link) => (
                        <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer" className="text-[10px] font-mono text-[#729E84] flex items-center gap-1">
                          <span>{link.label}</span>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}