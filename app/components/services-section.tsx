'use client'
import {
  motion,
  useScroll,
  useTransform,
  useMotionTemplate,
} from 'framer-motion'
import { useRef, useState, useEffect, useCallback } from 'react'
import {
  Video,
  Gamepad2,
  Layers3,
  Film,
  Presentation,
  Palette,
  LayoutTemplate,
  User,
  Settings2,
  type LucideIcon,
} from 'lucide-react'

const ICON_MAP: Record<string, LucideIcon> = {
  video: Video,
  gamepad: Gamepad2,
  layers: Layers3,
  film: Film,
  presentation: Presentation,
  palette: Palette,
  template: LayoutTemplate,
  user: User,
  settings: Settings2,
}

interface ServiceItem {
  title: string
  description: string
  iconLabel: string
}

interface Service {
  num: string
  title: string
  description: string
  items: ServiceItem[]
  bg: string
  textColor: string
  descColor: string
  itemTitleColor: string
  itemDescColor: string
  numColor: string
  iconBg: string
  iconColor: string
  gridColor: string
}

const SERVICES: Service[] = [
  {
    num: '01',
    title: 'Learning Strategy & Methodology',
    description:
      'Needs analysis, finding the right approach for your audience, and designing the full course architecture and learning flow.',
    items: [],
    bg: '#f2f2f0',
    textColor: '#212121',
    descColor: 'rgba(33,33,33,0.6)',
    itemTitleColor: 'rgba(33,33,33,0.8)',
    itemDescColor: 'rgba(33,33,33,0.5)',
    numColor: 'rgba(33,33,33,0.06)',
    iconBg: 'rgba(33,33,33,0.06)',
    iconColor: '#517360',
    gridColor: 'rgba(33,33,33,0.04)',
  },
  {
    num: '02',
    title: 'Scriptwriting & Storyboarding',
    description: 'Writing scripts and creating detailed storyboards for:',
    items: [
      {
        title: 'Videos',
        description:
          'Narrated or on-screen text videos, including animations, presenter-led content, system tutorials, marketing-style training clips, and more.',
        iconLabel: 'video',
      },
      {
        title: 'E-Learning & Games',
        description:
          'Mapping out every screen, learner interaction, and UI/UX flow for interactive modules, gamified learning, system simulations, and branching dialogue scenarios.',
        iconLabel: 'gamepad',
      },
    ],
    bg: '#729E84',
    textColor: '#212121',
    descColor: 'rgba(33,33,33,0.72)',
    itemTitleColor: 'rgba(33,33,33,0.82)',
    itemDescColor: 'rgba(33,33,33,0.6)',
    numColor: 'rgba(255,255,255,0.12)',
    iconBg: 'rgba(255,255,255,0.14)',
    iconColor: '#212121',
    gridColor: 'rgba(255,255,255,0.06)',
  },
  {
    num: '03',
    title: 'Production',
    description: '',
    items: [
      {
        title: 'Interactive E-Learning Development',
        description:
          'Developing e-learning modules, games, and simulations from scratch.',
        iconLabel: 'layers',
      },
      {
        title: 'Video & Animation',
        description:
          "Producing training videos (presenter-led, How-To's, footage-based), professional Vyond animations, PPT-based motion graphics, and AI-generated video with consistent characters.",
        iconLabel: 'film',
      },
      {
        title: 'Professional Presentations',
        description:
          'Creating polished decks, from design-only refreshes to end-to-end production including content organization, structure, and facilitator guides.',
        iconLabel: 'presentation',
      },
      {
        title: 'Visual Design & UI/UX',
        description:
          'Crafting the visual language for learning environments, custom graphics for educational tools, digital mailers, infographics, and other training assets.',
        iconLabel: 'palette',
      },
      {
        title: 'Visual Templates',
        description:
          'Creating ready-to-use templates for PowerPoint, Rise, or Storyline, designed for easy content population while maintaining a consistent look and feel.',
        iconLabel: 'template',
      },
    ],
    bg: '#f7f5f2',
    textColor: '#212121',
    descColor: 'rgba(33,33,33,0.62)',
    itemTitleColor: 'rgba(33,33,33,0.82)',
    itemDescColor: 'rgba(33,33,33,0.55)',
    numColor: 'rgba(33,33,33,0.06)',
    iconBg: 'rgba(114,158,132,0.1)',
    iconColor: '#517360',
    gridColor: 'rgba(33,33,33,0.04)',
  },
  {
    num: '04',
    title: 'Custom Learning Tools & Game Generators',
    description:
      "High-level design for building your own internal learning tools. I map out how the whole system works, from the learner's experience to the manager's control panel:",
    items: [
      {
        title: "The Learner's Side",
        description:
          'Defining the game logic, how players progress, and the actual interactive experience.',
        iconLabel: 'user',
      },
      {
        title: "The Manager's Side",
        description:
          'Designing the back-end interface where managers can update questions, change settings, and manage content without needing a developer every time.',
        iconLabel: 'settings',
      },
    ],
    bg: '#517360',
    textColor: '#ffffff',
    descColor: 'rgba(255,255,255,0.72)',
    itemTitleColor: 'rgba(255,255,255,0.88)',
    itemDescColor: 'rgba(255,255,255,0.58)',
    numColor: 'rgba(255,255,255,0.08)',
    iconBg: 'rgba(255,255,255,0.12)',
    iconColor: '#D8E6DE',
    gridColor: 'rgba(255,255,255,0.04)',
  },
]

function CardGrid({ color }: { color: string }) {
  const id = `grid-${color.replace(/[^a-z0-9]/gi, '')}`
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden
    >
      <defs>
        <pattern id={id} width={48} height={48} patternUnits="userSpaceOnUse">
          <path
            d="M 48 0 L 0 0 0 48"
            fill="none"
            stroke={color}
            strokeWidth="0.8"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  )
}

function ServiceCard({
  service,
  index,
  total,
  progress,
  maxHeight,
  onHeightMeasured,
  cardHeights,
}: {
  service: Service
  index: number
  total: number
  progress: any
  maxHeight: number | null
  onHeightMeasured: (idx: number, height: number) => void
  cardHeights: Record<number, number>
}) {
  const cardRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Measure and report the natural content height of the card on load and resize
  useEffect(() => {
    const measure = () => {
      if (innerRef.current) {
        onHeightMeasured(index, innerRef.current.scrollHeight)
      }
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [index, onHeightMeasured])

  // Sticky top coordinates: 60px on desktop
  const stickyTop = isMobile ? 'auto' : '60px'
  const totalSteps = total
  const step = 1 / totalSteps

  // Create a local viewport-locked scroll hook targeting this card specifically on mobile.
  // The animation starts when the card's bottom (end) reaches 35% of viewport height (the X point)
  // and finishes when the bottom of the card leaves the viewport (0.0).
  const localScroll = useScroll({
    target: cardRef,
    offset: ['end 0.35', 'end 0.0'],
  })

  // Use local card progress on mobile; parent progress on desktop
  const activeProgress = isMobile ? localScroll.scrollYProgress : progress

  // Generate original desktop progress arrays
  const inputRange = Array.from({ length: totalSteps + 1 }, (_, i) => i * step)

  const scaleOutput = inputRange.map((_, idx) => {
    if (idx <= index) return 1
    const activeIndex = Math.min(idx, totalSteps - 1)
    if (activeIndex <= index) return 1
    const depth = activeIndex - index
    const factor = 0.065
    return Math.max(0.7, 1 - (depth * factor))
  })

  const blurOutput = inputRange.map((_, idx) => {
    if (idx <= index) return 0
    const activeIndex = Math.min(idx, totalSteps - 1)
    if (activeIndex <= index) return 0
    const depth = activeIndex - index
    const factor = 4
    return depth * factor
  })

  const brightnessOutput = inputRange.map((_, idx) => {
    if (idx <= index) return 1
    const activeIndex = Math.min(idx, totalSteps - 1)
    if (activeIndex <= index) return 1
    const depth = activeIndex - index
    const factor = 0.08
    return Math.max(0.65, 1 - (depth * factor))
  })

  const yOutput = inputRange.map((_, idx) => {
    if (idx <= index) return '0%'
    const activeIndex = Math.min(idx, totalSteps - 1)
    if (activeIndex <= index) return '0%'
    const depth = activeIndex - index
    const stepVal = -72
    return `${depth * stepVal}%`
  })

  const zOutput = inputRange.map((_, idx) => {
    if (idx <= index) return 0
    const activeIndex = Math.min(idx, totalSteps - 1)
    if (activeIndex <= index) return 0
    const depth = activeIndex - index
    return depth * -40
  })

  // Set transforms based on active progress
  const scale = useTransform(
    activeProgress,
    isMobile ? [0, 1] : inputRange,
    isMobile ? [1, 0.94] : scaleOutput,
    { clamp: true }
  )
  const blurVal = useTransform(
    activeProgress,
    isMobile ? [0, 1] : inputRange,
    isMobile ? [0, 2] : blurOutput,
    { clamp: true }
  )
  const brightnessVal = useTransform(
    activeProgress,
    isMobile ? [0, 1] : inputRange,
    isMobile ? [1, 0.92] : brightnessOutput,
    { clamp: true }
  )
  // On mobile, translating the card downwards (positive 'y') relative to the natural page scroll
  // slows down its upward movement relative to the viewport, letting the upcoming card smoothly overlap it.
  const yTranslate = useTransform(
    activeProgress,
    isMobile ? [0, 1] : inputRange,
    isMobile ? ['0%', '25%'] : yOutput,
    { clamp: true }
  )
  const z = useTransform(
    activeProgress,
    isMobile ? [0, 1] : inputRange,
    isMobile ? [0, -40] : zOutput,
    { clamp: true }
  )
  const filterStr = useMotionTemplate`blur(${blurVal}px) brightness(${brightnessVal})`

  return (
    <div
      style={{
        position: isMobile ? 'relative' : 'sticky',
        top: stickyTop,
        zIndex: index + 1,
        marginTop: index > 0 ? (isMobile ? '40px' : '80px') : '0px',
      }}
      className="w-full"
    >
      <motion.div
        style={{
          scale,
          filter: filterStr,
          z,
          y: yTranslate,
          transformPerspective: '1200px',
          transformStyle: 'preserve-3d',
          transformOrigin: 'center center',
        }}
        className="relative overflow-visible rounded-2xl shadow-[0_12px_40px_-12px_rgba(0,0,0,0.2)]"
      >
        <div
          ref={cardRef}
          className="w-full flex flex-col relative overflow-hidden transition-all duration-300"
          style={{
            backgroundColor: service.bg,
            height: isMobile ? 'auto' : (maxHeight ? `${maxHeight}px` : 'auto'),
          }}
        >
          {/* Grid background */}
          <CardGrid color={service.gridColor} />

          {/* Number: desktop watermark background position. right-X matches content left-X exactly */}
          <div className="hidden md:flex absolute right-8 md:right-12 lg:right-16 xl:right-20 2xl:right-24 top-1/2 -translate-y-1/2 select-none pointer-events-none z-[0]">
            <span
              className="font-heading font-bold leading-none block"
              style={{
                color: service.numColor,
                fontSize: 'clamp(180px, 26vw, 360px)',
              }}
            >
              {service.num}
            </span>
          </div>

          {/* Content Wrapper: left/right padding is balanced to equal watermark spacing. Content is aligned to top (justify-start) */}
          <div
            ref={innerRef}
            className={`relative z-[1] w-full flex flex-col justify-start overflow-visible ${
              isMobile
                ? 'pt-6 pb-6 px-6'
                : 'pt-8 pb-8 pl-8 pr-8 md:pt-10 md:pb-10 md:pl-12 md:pr-12 lg:pt-12 lg:pb-12 lg:pl-16 lg:pr-16 xl:pt-14 xl:pb-14 xl:pl-20 xl:pr-20 2xl:pl-24 2xl:pr-24'
            }`}
          >
            {/* Mobile watermark placed natively in document flow inside innerRef, so its height is measured and never cut off */}
            {isMobile && (
              <div className="md:hidden select-none pointer-events-none z-[1] mb-4 w-full text-right">
                <span
                  className="font-heading font-bold leading-none block text-right text-[16vw]"
                  style={{ color: service.numColor }}
                >
                  {service.num}
                </span>
              </div>
            )}

            {/* max-w-[12ch] forces long titles to break elegantly into exactly two lines on widescreen, while "PRODUCTION" stays on one line */}
            <h3
              className="font-heading text-[clamp(1.8rem,4vw,3.5rem)] font-bold tracking-tight leading-[0.95] uppercase mb-6 md:mb-8 max-w-[12ch] sm:max-w-[15ch] lg:max-w-[18ch] xl:max-w-[22ch]"
              style={{ color: service.textColor }}
            >
              {service.title}
            </h3>

            <div
              className="max-w-xl overflow-visible"
              style={{ color: service.textColor }}
            >
              {service.description && (
                <p
                  className="text-[14px] md:text-[15px] leading-[1.7] mb-6 md:mb-8"
                  style={{ color: service.descColor }}
                >
                  {service.description}
                </p>
              )}

              {service.items.length > 0 && (
                <div className="space-y-4">
                  {service.items.map((item, j) => {
                    const Icon = ICON_MAP[item.iconLabel]
                    return (
                      <div key={j} className="flex gap-4 items-start">
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                          style={{ backgroundColor: service.iconBg }}
                        >
                          {Icon && (
                            <Icon
                              size={16}
                              strokeWidth={1.6}
                              style={{ color: service.iconColor }}
                            />
                          )}
                        </div>
                        <div>
                          <span
                            className="font-heading text-[15px] md:text-[17px] font-semibold block mb-1"
                            style={{ color: service.itemTitleColor }}
                          >
                            {item.title}
                          </span>
                          <span
                            className="text-[13px] md:text-[14px] leading-[1.7] block"
                            style={{ color: service.itemDescColor }}
                          >
                            {item.description}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default function ServicesSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [cardHeights, setCardHeights] = useState<Record<number, number>>({})
  const [maxHeight, setMaxHeight] = useState<number | null>(null)

  const handleHeightMeasured = useCallback((index: number, height: number) => {
    setCardHeights((prev) => {
      if (prev[index] === height) return prev
      return { ...prev, [index]: height }
    })
  }, [])

  // Calculate the maximum height among all rendered cards, adding a 16px safety padding only on desktop layout to preserve mobile symmetry
  // Also added a 28px safety padding specifically on mobile to prevent bottom clipping
  useEffect(() => {
    const heights = Object.values(cardHeights)
    if (heights.length > 0) {
      const max = Math.max(...heights)
      const isMob = typeof window !== 'undefined' && window.innerWidth < 768
      setMaxHeight(max + (isMob ? 28 : 16))
    }
  }, [cardHeights])

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  })

  return (
    <div id="services" className="relative bg-[#212121]">
      {/* Outer container aligned to widescreen limits */}
      <div className="w-full px-8 md:px-12 lg:px-16 xl:px-20 pt-32 pb-16 md:pt-44 md:pb-20">
        {/* Static Header Title */}
        <div className="pb-16 relative z-[0]">
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
            What I <span className="font-serif italic font-normal text-[#729E84]">bring</span> to the table
          </h2>
        </div>

        {/* Dynamic vertical stack */}
        <div ref={containerRef} className="relative pb-4">
          {SERVICES.map((service, i) => (
            <ServiceCard
              key={service.num}
              service={service}
              index={i}
              total={SERVICES.length}
              progress={scrollYProgress}
              maxHeight={maxHeight}
              onHeightMeasured={handleHeightMeasured}
              cardHeights={cardHeights}
            />
          ))}
        </div>
      </div>
    </div>
  )
}