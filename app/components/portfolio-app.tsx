'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import Lenis from 'lenis'
import LandingSection from './landing-section'
import AboutSection from './about-section'
import ServicesSection from './services-section'
import ProjectsSection from './projects-section'
import ToolsSection from './tools-section'
import ContactSection from './contact-section'
import Navigation from './navigation'

export interface Project {
  id: number
  title: string
  category: string
  description: string
  thumbnail: string
  videoSrc?: string
  caseStudy: {
    challenge?: string
    approach?: string
    result?: string
    roles: string[]
    links?: { label: string; url: string }[]
  }
}

const PROJECTS: Project[] = [
  {
    id: 1,
    title: "AppsFlyer: Compliance Course Redesign",
    category: 'E-Learning',
    description: '',
    thumbnail: '/images/thumbnails/appsflyer.webp',
    videoSrc:
      'https://res.cloudinary.com/dg4ayusok/video/upload/v1780995346/appsflyer-overview_dxwzha.mp4',
    caseStudy: {
      challenge:
        'Rebuild a long, outdated compliance course into something people would actually finish, under an hour, without losing what matters.',
      approach:
        'Each topic follows a tight structure: short overview, must-know guidelines, and a few realistic dilemmas shown as an AI-generated comic strip. Content was reorganized into four clear modules plus a brief intro, eliminating overlap and cutting volume without cutting value.',
      roles: [
        'Course Architecture',
        'Scriptwriting & Storyboarding',
        'PPT-Based Video Production',
        'Vyond Animation'
      ],
      result:
        'A concise, engaging course that employees actually complete, building sound judgment on real scenarios without the overwhelm of unnecessary detail.'
    }
  },
  {
    id: 2,
    title: 'CyberArk: Customer Training Video Library',
    category: 'Video Series',
    description: '',
    thumbnail: '/images/thumbnails/cyberark.webp',
    videoSrc:
      'https://res.cloudinary.com/dg4ayusok/video/upload/v1780995344/cyberark-overview_d75hww.mp4',
    caseStudy: {
      challenge:
        'Make sophisticated, enterprise-grade security products understandable to a broad customer audience, without dumbing them down.',
      approach:
        'Three video formats, each matched to the content type: whiteboard-style animations for conceptual introductions, hybrid videos combining animation with live system demos, and focused how-tos for specific workflows and settings.',
      roles: [
        'Course Architecture',
        'Scriptwriting & Storyboarding',
        'Vyond Animation',
        'Video Production'
      ],
      result:
        "A growing library that became a core part of CyberArk's customer education (what started as one project turned into an ongoing partnership).",
      links: [
        {
          label: 'Connector Management',
          url:
            'https://docs.cyberark.com/admin-space/latest/en/content/connector-management/cm_introduction.htm?tocpath=Manage%20your%20environment%7CManage%20connectors%20and%20connector%20pools%7C_____0'
        },
        {
          label: 'Cora AI Chatbot',
          url:
            'https://docs.cyberark.com/ai/latest/en/content/ai/coraai-chatbot.htm'
        },
        {
          label: 'Dynamic Privilege Access',
          url:
            'https://docs.cyberark.com/ispss-access/latest/en/content/hometileslps/dpa-v-linux.htm'
        },
        {
          label: 'SaaS Discovery Overview',
          url: 'https://youtu.be/c-_2rN7i7gA?si=vIzj2JgZxqSlLJb8'
        },
        {
          label: 'Access Orchestrator Demo',
          url: 'https://youtu.be/Fmc62KVf3do?si=MQTC-ZDXr2qEYBOb'
        }
      ]
    }
  },
  {
    id: 3,
    title: "JFrog: Product & Engineering Onboarding",
    category: 'Animation',
    description: '',
    thumbnail: '/images/thumbnails/jfrog.webp',
    videoSrc:
      'https://res.cloudinary.com/dg4ayusok/video/upload/v1780995342/jfrog-overview_jodafk.mp4',
    caseStudy: {
      challenge:
        'Reduce time to proficiency for new hires entering a complex, fast-moving product and engineering environment.',
      approach:
        'A blended learning path combining short animated videos for core concepts with SME-led sessions for complex product areas, which is faster to develop, more accurate, and a natural way to connect new hires with key leaders early.',
      roles: [
        'Needs Analysis',
        'Course Architecture',
        'Scriptwriting & Storyboarding',
        'Vyond Animation',
        'Presentation Design & Production'
      ],
      result:
        'A repeatable onboarding program that helps new hires navigate a complex landscape faster, with less trial and error.'
    }
  },
  {
    id: 4,
    title: 'Maccabi Intelligence: System Rollout Training',
    category: 'Simulation',
    description: '',
    thumbnail: '/images/thumbnails/maccabi.webp',
    videoSrc:
      'https://res.cloudinary.com/dg4ayusok/video/upload/v1780995349/maccabi-overview_khvyes.mp4',
    caseStudy: {
      challenge:
        'Get service reps ready to use a new AI-powered knowledge system from day one, replacing a fragmented set of legacy tools.',
      approach:
        'A four-part learning journey: a character-driven opening animation, a main functions video, scenario-based e-learning simulations built on real service cases, and trainer-guided session where learners work through case studies in the live system.',
      roles: [
        'Scriptwriting & Storyboarding',
        'AI-Generated Video Production',
        'E-Learning & Simulation Design',
        'Lesson Plan',
        'PowerPoint Design & Production',
        'Visual Design'
      ],
      result:
        'A program that walks reps from first impression all the way to real hands-on practice.'
    }
  },
  {
    id: 5,
    title: 'Wix: HayaData Conference Presentation Design',
    category: 'Marketing Training',
    description: '',
    thumbnail: '/images/thumbnails/wix.webp',
    videoSrc:
      'https://res.cloudinary.com/dg4ayusok/video/upload/v1780995349/wix-overview_btecuq.mp4',
    caseStudy: {
      challenge:
        'Turn two technically complex data talks into presentations the audience would actually enjoy sitting through.',
      approach:
        'Let the theme do the heavy lifting. A vintage 80s/90s computing aesthetic for one talk, a full fairy-tale world for the other, where steps became mixtures, agents became fairies, and challenges became dragons. Strong visual concept, purposeful animation, clean structure.',
      roles: [
        'PowerPoint Design & Production',
        'Content Structure & Story Design'
      ],
      result:
        'Both presenters were happy with the decks. Audience response was very positive.',
      links: [
        {
          label: 'Modelling Magic',
          url: 'https://youtu.be/ePGt_cw0NpY?si=uPBJqZIxk8vkwKHv'
        },
        {
          label: 'The Future of Data is Words',
          url: 'https://youtu.be/zYouMqp4bu8?si=GUmRBU4faNANuoqS'
        }
      ]
    }
  },
  {
    id: 6,
    title: 'Perion: Employee Onboarding Experience',
    category: 'E-Learning',
    description: '',
    thumbnail: '/images/thumbnails/perion.webp',
    videoSrc:
      'https://res.cloudinary.com/dg4ayusok/video/upload/v1781771857/Perion_Ready_pbys0y.mp4',
    caseStudy: {
      challenge:
        'New Perion employees come from all kinds of backgrounds – not everyone speaks ad tech, and there was no fast, engaging way to get them up to speed.',
      approach:
        'The course opens with a short film where a new hire figures out what her company does by living it as a consumer first. From there, "Behind the Screens" builds the full picture through an animated explainer and Perion\'s own story. The final two modules each follow a fictional partner through a real business problem – one on the advertiser side, one on the publisher side.',
      roles: [
        'Scriptwriting & Storyboarding',
        'Vyond Animation',
        'E-Learning & Interaction Design'
      ],
      result:
        'A four-module onboarding program that takes someone from zero ad-tech fluency to a confident grasp of what Perion does and why it matters.'
    }
  },
  {
    id: 7,
    title: 'Bank Hapoalim: Financial Security Training',
    category: 'Simulation',
    description: '',
    thumbnail: '/images/thumbnails/bankhapoalim.webp',
    caseStudy: {
      challenge:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud.',
      approach:
        'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia.',
      roles: ['Simulation Design', 'Scriptwriting', 'Storyboarding'],
      result:
        'At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint.'
    }
  },
  {
    id: 8,
    title: 'Amdocs: IT Onboarding',
    category: 'Video Series',
    description: '',
    thumbnail: '/images/thumbnails/amdocs.webp',
    videoSrc:
      'https://res.cloudinary.com/dg4ayusok/video/upload/v1782907177/Amdocs_Ready_uxnswd.mp4',
    caseStudy: {
      challenge:
        'New hires at a global tech company need to get through a long list of IT setup tasks from day one – fast, without documentation nobody reads, and without slowing down the start of actual work.',
      approach:
        'A series of short, animated videos, each focused on one topic – MFA setup, remote access, data storage, IT support, and more. SMEs provided the core knowledge; I shaped it into a clear narrative, wrote the narration, and built a detailed storyboard scene by scene, giving the client full visibility before production and the animator a complete, unambiguous brief. The series kept evolving over time – updates followed real changes in tools and policies, with additional sets developed for employees from acquired companies and for hiring managers.',
      roles: ['Scriptwriting & Storyboarding'],
      result:
        'A video program used globally across Amdocs new hires – still actively maintained.'
    }
  }
]

interface OrchestratedSectionProps {
  children: React.ReactNode
  zIndex: number
  isLast?: boolean
  exitType?: 'shrink' | 'shade' | 'none'
  trackHeight?: string
  marginTop?: string
  disableRotate?: boolean
  alignTop?: boolean
  entryUnshade?: boolean
  dynamicHeight?: boolean
  scrollBuffer?: number
}

function OrchestratedSection({
  children,
  zIndex,
  isLast = false,
  exitType = 'shrink',
  trackHeight = 'min-h-screen',
  marginTop = '0px',
  disableRotate = false,
  alignTop = false,
  entryUnshade = false,
  dynamicHeight = false,
  scrollBuffer = 500,
}: OrchestratedSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  const [originYPercent, setOriginYPercent] = useState(50)
  const [contentHeight, setContentHeight] = useState(0)
  const [viewportHeight, setViewportHeight] = useState(800)

  useEffect(() => {
    let lastHeight = window.innerHeight
    setViewportHeight(window.innerHeight)

    const updateHeight = () => {
      const currentHeight = window.innerHeight
      const isMob = typeof window !== 'undefined' && window.innerWidth < 768

      if (isMob) {
        if (Math.abs(currentHeight - lastHeight) > 100) {
          setViewportHeight(currentHeight)
          lastHeight = currentHeight
        }
      } else {
        setViewportHeight(currentHeight)
        lastHeight = currentHeight
      }
      if (contentRef.current) {
        setContentHeight(contentRef.current.offsetHeight)
      }
    }

    updateHeight()
    window.addEventListener('resize', updateHeight)
    let resizeObserver: ResizeObserver | null = null

    if (dynamicHeight && contentRef.current) {
      resizeObserver = new ResizeObserver(() => {
        updateHeight()
      })
      resizeObserver.observe(contentRef.current)
    }

    return () => {
      window.removeEventListener('resize', updateHeight)
      if (resizeObserver) {
        resizeObserver.disconnect()
      }
    }
  }, [children, dynamicHeight])

  useEffect(() => {
    const calculateOrigin = () => {
      if (containerRef.current) {
        const height = containerRef.current.offsetHeight
        const vHeight = window.innerHeight
        if (height > 0) {
          const middleFromTop = height - vHeight / 2
          const percent = (middleFromTop / height) * 100
          setOriginYPercent(percent)
        }
      }
    }
    const timer = setTimeout(calculateOrigin, 150)
    window.addEventListener('resize', calculateOrigin)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', calculateOrigin)
    }
  }, [children, contentHeight])

  const { scrollYProgress: exitProgress } = useScroll({
    target: containerRef,
    offset: exitType === 'shade' ? ['end 2', 'end 1'] : ['end end', 'end start'],
  })

  const { scrollYProgress: entryProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'start start'],
  })

  const rotate = useTransform(entryProgress, [0, 1], disableRotate ? [0, 0] : [2, 0])
  const shouldShrink = exitType === 'shrink'

  const scale = useTransform(
    exitProgress,
    [0, 0.2, 0.65],
    [
      1,
      shouldShrink ? 0.95 : 1,
      (isLast || !shouldShrink) ? 1 : 0.25
    ]
  )

  const opacity = useTransform(
    exitProgress,
    [0, 0.2, 0.65],
    [
      1,
      shouldShrink ? 0.92 : 1,
      (isLast || !shouldShrink) ? 1 : 0
    ]
  )

  const exitShadeOpacity = useTransform(
    exitProgress,
    [0.3, 0.98],
    [0, exitType === 'shade' ? 0.85 : 0]
  )

  const { scrollYProgress: selfScrollProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  })

  const entryUnshadeOpacity = useTransform(selfScrollProgress, (progress) => {
    const totalTrackHeight = contentHeight + viewportHeight + scrollBuffer
    const targetProgress = totalTrackHeight > 0 ? (viewportHeight * 0.6) / totalTrackHeight : 0.05
    if (progress <= 0) return 0.85
    if (progress >= targetProgress) return 0
    return 0.85 * (1 - progress / targetProgress)
  })

  const activeShadeOpacity = entryUnshade ? entryUnshadeOpacity : exitShadeOpacity
  const resolvedTrackHeight = exitType === 'shade'
    ? (contentHeight + viewportHeight + scrollBuffer) + 'px'
    : undefined

  const stickyTop = (exitType === 'shade' && contentHeight > viewportHeight && !alignTop)
    ? (viewportHeight - contentHeight) + 'px'
    : '0px'

  const transitionClass = dynamicHeight
    ? ""
    : "transition-[top] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"

  return (
    <div
      ref={containerRef}
      style={{
        zIndex,
        height: resolvedTrackHeight,
        marginTop
      }}
      className={`relative w-full ${!resolvedTrackHeight ? 'min-h-screen' : ''}`}
    >
      <div
        className={`sticky w-full ${transitionClass}`}
        style={{ top: stickyTop }}
      >
        <motion.div
          ref={contentRef}
          style={{
            rotate,
            scale,
            opacity,
            transformOrigin: 'center ' + originYPercent + '%',
            width: '100%'
          }}
          className="w-full relative"
        >
          {children}
          <motion.div
            style={{ opacity: activeShadeOpacity }}
            className="absolute inset-0 bg-black pointer-events-none z-10"
          />
        </motion.div>
      </div>
    </div>
  )
}

export default function PortfolioApp() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    })

    if (typeof window !== 'undefined') {
      (window as any).lenis = lenis
    }

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    return () => {
      lenis.destroy()
      if (typeof window !== 'undefined') {
        delete (window as any).lenis
      }
    }
  }, [mounted])

  if (!mounted) {
    return <div className="min-h-screen bg-[#212121]" />
  }

  return (
    <div className="relative min-h-screen w-full max-w-full overflow-x-clip">
      <Navigation />
      <main className="relative w-full max-w-full overflow-x-clip">
        <LandingSection />

        {/* DynamicHeight is enabled strictly here so height shifts during
        collapsible expansions are smoothly animated */}
        <OrchestratedSection
          zIndex={2}
          exitType="shade"
          trackHeight="230vh"
          dynamicHeight={true}
          alignTop={true} // Forces the sticky container to stick exactly at the top (top: 0) instead of floating or sliding
          scrollBuffer={1450} // Increased scroll buffer for delayed Services entry
        >
          <AboutSection />
        </OrchestratedSection>

        <OrchestratedSection zIndex={3} exitType="none" marginTop="-100svh">
          <ServicesSection />
        </OrchestratedSection>

        <OrchestratedSection zIndex={5} exitType="none" disableRotate>
          <ToolsSection />
        </OrchestratedSection>

        {/* dynamicHeight remains false (default) here so the project section is
        unaffected by dynamic offsets, leaving its collapsibles jump-free */}
        <OrchestratedSection
          zIndex={4}
          exitType="shade"
          trackHeight="200vh"
          marginTop="-100svh"
          disableRotate
          alignTop
          entryUnshade
        >
          <ProjectsSection projects={PROJECTS} />
        </OrchestratedSection>

        <ContactSection />
      </main>
    </div>
  )
}