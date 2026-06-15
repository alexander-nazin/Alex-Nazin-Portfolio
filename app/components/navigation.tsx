'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const NAV_ITEMS = [
  { label: 'About', href: '#about' },
  { label: 'Services', href: '#services' },
  { label: 'Tools', href: '#tools' },
  { label: 'Projects', href: '#projects' },
  { label: 'Contact', href: '#contact' },
]

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isLightBg, setIsLightBg] = useState(false)

  // Splitting the name into an array of characters
  const nameLetters = Array.from("ALEX NAZIN")

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100)

      const aboutEl = document.getElementById('about')
      const toolsEl = document.getElementById('tools')
      let light = false
      const navHeight = 64

      // Detect if we are currently scrolling over the About section (white background)
      if (aboutEl) {
        const rect = aboutEl.getBoundingClientRect()
        if (rect.top <= navHeight && rect.bottom >= 0) {
          light = true
        }
      }

      // Detect if we are currently scrolling over the Tools section's white background transition
      if (toolsEl) {
        const rect = toolsEl.getBoundingClientRect()
        if (rect.top <= navHeight && rect.bottom >= 0) {
          const scrollProgress = -rect.top / (rect.height - window.innerHeight)
          if (scrollProgress >= 0.46) {
            light = true
          }
        }
      }

      setIsLightBg(light)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const executeInstantScroll = (href: string) => {
    const el = document.querySelector(href) as HTMLElement | null
    if (!el) return
    // Walk up to target the parent container track
    let current: HTMLElement | null = el
    while (
      current &&
      current.parentElement &&
      current.parentElement.tagName !== 'MAIN' &&
      current.parentElement !== document.body
    ) {
      current = current.parentElement
    }
    const target = current || el
    // Access global Lenis smooth scrolling instance
    const globalLenis = (window as any).lenis
    if (globalLenis) {
      if (href === '#projects') {
        // Because Tools covers Projects for the first 100vh, we scroll past this
        // covered segment to the revealed section (absoluteTop + 100vh)
        const rect = target.getBoundingClientRect()
        const absoluteTop = rect.top + window.pageYOffset
        const targetScrollY = absoluteTop + window.innerHeight
        globalLenis.scrollTo(targetScrollY, {
          immediate: true,
        })
      } else {
        globalLenis.scrollTo(target, {
          immediate: true,
        })
      }
    } else {
      if (href === '#projects') {
        const rect = target.getBoundingClientRect()
        const absoluteTop = rect.top + window.pageYOffset
        window.scrollTo({
          top: absoluteTop + window.innerHeight,
          behavior: 'auto',
        })
      } else {
        const rect = target.getBoundingClientRect()
        const absoluteTop = rect.top + window.pageYOffset
        window.scrollTo({
          top: absoluteTop,
          behavior: 'auto',
        })
      }
    }
  }

  const handleNavClick = (href: string) => {
    setMobileOpen(false)
    const triggerTransition = () => {
      executeInstantScroll(href)
    }
    // Check for native browser support for View Transitions
    if (typeof document !== 'undefined' && (document as any).startViewTransition) {
      (document as any).startViewTransition(triggerTransition)
    } else {
      // Fallback for older browsers
      triggerTransition()
    }
  }

  // Generates perfectly-timed absolute keyframe arrays for each letter index
  const getBillboardKeyframes = (index: number) => {
    const totalDuration = 3.0 // Active animation takes 3 seconds
    const stagger = 0.12 // Time delay between letter starts
    const flipDuration = 0.4 // Duration of a single letter's green flip
    const holdTime = 2.0 // Absolute timestamp when the entire word resets
    const resetDuration = 0.4 // Duration of the simultaneous white reset
    const tStartFlip = index * stagger
    const tEndFlip = tStartFlip + flipDuration
    const tStartReset = holdTime
    const tEndReset = holdTime + resetDuration
    // Normalized times sorted from 0.0 to 1.0
    const times = [
      0,
      tStartFlip / totalDuration,
      tEndFlip / totalDuration,
      tStartReset / totalDuration,
      tEndReset / totalDuration,
      1.0
    ]
    const colors = [
      "#ffffff", // Starts white
      "#ffffff", // Holds white until its flip turn
      "#729E84", // Becomes green
      "#729E84", // Holds green until holdTime
      "#ffffff", // Resets back to white
      "#ffffff"  // Remains white until loop ends
    ]
    const rotateY = [
      0,
      0,
      360, // Flips 360 degrees to green
      360, // Holds position
      720, // All letters flip 360 degrees more back to white simultaneously
      720
    ]
    return { times, colors, rotateY, totalDuration }
  }

  return (
    <>
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: scrolled ? 0 : -80 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-2xl border-b transition-colors duration-500 bg-[#212121]/90 border-white/[0.06]"
      >
        <div className="w-full px-8 md:px-12 lg:px-16 xl:px-20 h-16 flex items-center justify-between">
          
          {/* Logo Button - Interactive character billboard loop */}
          <motion.button
            onClick={() => handleNavClick('#landing')}
            className="flex items-center font-heading text-sm font-semibold tracking-wider uppercase focus:outline-none select-none h-6"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
          >
            {nameLetters.map((char, index) => {
              const { times, colors, rotateY, totalDuration } = getBillboardKeyframes(index)
              return (
                <motion.span
                  key={index}
                  animate={{
                    rotateY: rotateY,
                    color: colors
                  }}
                  transition={{
                    duration: totalDuration,
                    ease: "easeInOut",
                    times: times,
                    repeat: Infinity,
                    repeatType: "loop",
                    repeatDelay: 5 // Holds static white state for 5 seconds before repeating
                  }}
                  // Applying local perspective and preserve-3d to each letter prevents edge distortion
                  style={{
                    transformStyle: "preserve-3d",
                    perspective: 1000
                  }}
                  className="inline-block"
                >
                  {/* Correctly renders space characters in split array loops */}
                  {char === ' ' ? '\u00A0' : char}
                </motion.span>
              )
            })}
          </motion.button>

          {/* Interactive Hover Capsule Menu (Desktop only) */}
          <div
            className="hidden md:flex items-center relative cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* The sliding container width: animates dynamically from 0 to auto */}
            <motion.div
              initial="closed"
              animate={isHovered ? "open" : "closed"}
              variants={{
                closed: {
                  width: 0,
                  transition: {
                    duration: 0.35,
                    ease: [0.22, 1, 0.36, 1]
                  }
                },
                open: {
                  width: "auto",
                  transition: {
                    duration: 0.35,
                    ease: [0.22, 1, 0.36, 1]
                  }
                }
              }}
              className="flex items-center overflow-hidden"
            >
              {/* Inner button holder wrapper */}
              <div className="flex items-center gap-8 pr-6 pl-2">
                {NAV_ITEMS.map((item) => (
                  <motion.button
                    key={item.href}
                    variants={{
                      closed: { x: 100 },
                      open: { x: 0 }
                    }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    onClick={() => handleNavClick(item.href)}
                    className="text-[13px] whitespace-nowrap tracking-wide text-white/50 hover:text-white font-mono uppercase"
                  >
                    {item.label}
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Capsule Menu Button */}
            <motion.div
              className="flex items-center py-1.5 px-4 h-8 rounded-full border border-white/10 bg-white/5 shadow-md text-xs font-mono text-white/90 select-none"
              whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.08)" }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="font-normal tracking-wider">MENU</span>
            </motion.div>
          </div>
          
          {/* Mobile hamburger menu */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden flex flex-col gap-[5px] p-2"
            aria-label="Menu"
          >
            <span
              className={`block w-5 h-[1.5px] transition-all duration-300 bg-white/70 ${
                mobileOpen ? 'rotate-45 translate-y-[3.25px]' : ''
              }`}
            />
            <span
              className={`block w-5 h-[1.5px] transition-all duration-300 bg-white/70 ${
                mobileOpen ? '-rotate-45 -translate-y-[3.25px]' : ''
              }`}
            />
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-[#212121]/98 backdrop-blur-2xl flex flex-col items-center justify-center gap-10 md:hidden"
          >
            {NAV_ITEMS.map((item, i) => (
              <motion.button
                key={item.href}
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: i * 0.08,
                  duration: 0.5,
                  ease: [0.22, 1, 0.36, 1],
                }}
                onClick={() => handleNavClick(item.href)}
                className={`text-3xl font-heading font-light tracking-wide transition-colors ${
                  isLightBg ? 'text-[#212121]/70 hover:text-[#212121]' : 'text-white/70 hover:text-white'
                }`}
              >
                {item.label}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}