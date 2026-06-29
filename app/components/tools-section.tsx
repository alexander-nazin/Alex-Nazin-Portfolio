'use client'
import React, { useRef, useState, useEffect } from 'react'
import { motion, useScroll, useTransform, useMotionTemplate } from 'framer-motion'
import Image from 'next/image'
import AnimatedBg from './animated-bg'

const TOOLS_LIST = [
  {
    id: 'card2', // The main green card (symmetrically centered)
    text: 'That includes the full **Articulate 360** pack, **Adobe creative tools** for graphic design, web-based animation platforms like **Vyond** and **Powtoon**, **Camtasia** and **Premiere** for video production, advanced **PowerPoint**, and an expanding set of **AI tools** for content, visuals, and production.',
    bgColor: '#8cbfa2', // Lighter HSL lightness (150, 20%, 65%) to let the dark grid lines stand out clearly
    textColor: '#1a1a1a', // Dark text for excellent readability over the lighter background
    layoutIdx: 0
  },
  {
    id: 'card3', // The bottom gray card (aligned to the right edge of Card 2)
    text: 'The list keeps growing, and I like it that way',
    bgColor: '#f0f0f0', // Soft, light gray (0, 0%, 94%) for crisp line contrast and clean grid visibility
    textColor: '#212121',
    layoutIdx: 1
  }
]

// Text segment models for the mechanical split-flap rendering
const CARD_2_PARTS = [
  { text: "That includes the full ", isBold: false },
  { text: "Articulate 360", isBold: true },
  { text: " pack, ", isBold: false },
  { text: "Adobe", isBold: true },
  { text: " creative tools for graphic design, web-based animation platforms like ", isBold: false },
  { text: "Vyond", isBold: true },
  { text: " and ", isBold: false },
  { text: "Powtoon", isBold: true },
  { text: ", ", isBold: false },
  { text: "Camtasia", isBold: true },
  { text: " and ", isBold: false },
  { text: "Premiere", isBold: true },
  { text: " for video production, advanced ", isBold: false },
  { text: "PowerPoint", isBold: true },
  { text: ", and an expanding set of ", isBold: false },
  { text: "AI tools", isBold: true },
  { text: " for content, visuals, and production.", isBold: false },
]

interface GridPosition {
  col: number
  row: number
  w: number
  h: number
}

// Title explicit layout mapping
const TITLE_LAYOUT = {
  desktop: { col: 5, row: 1, w: 16, h: 3 },
  mobile: { col: 0, row: 0, w: 8, h: 3 }
}

// 14 rows layout grid (Strict 1-square gaps maintained)
const DESKTOP_LAYOUT: GridPosition[] = [
  { col: 5, row: 5, w: 16, h: 5 },   // Green card: Symmetrically centered below Title (Gap = row 4)
  { col: 14, row: 11, w: 7, h: 2 }   // Gray card: Right-aligned relative to green card (14 + 7 = 21) (Gap = row 10)
]

// Mobile layout mapping inside centered grid area (8 columns x 14 rows)
const MOBILE_LAYOUT: GridPosition[] = [
  { col: 0, row: 4, w: 8, h: 6 },    // Green card (Gap = row 3)
  { col: 0, row: 11, w: 8, h: 2 }    // Gray card (Gap = row 10)
]

interface GridLineProps {
  scrollYProgress: any
  position: number
  dir: number
  type: 'vertical' | 'horizontal'
}

const GridLine: React.FC<GridLineProps> = ({ scrollYProgress, position, dir, type }) => {
  const translatePercent = useTransform(scrollYProgress, [0.35, 0.55], [dir === 1 ? 100 : -100, 0])
  const translateVal = useMotionTemplate`${translatePercent}%`
  const opacityVal = useTransform(scrollYProgress, [0.35, 0.45, 0.55], [0, 1, 1])
  
  return (
    <motion.div
      style={{
        left: type === 'vertical' ? `${position}px` : 0,
        top: type === 'horizontal' ? `${position}px` : 0,
        y: type === 'vertical' ? translateVal : 0,
        x: type === 'horizontal' ? translateVal : 0,
        opacity: opacityVal,
        backgroundColor: "rgba(33, 33, 33, 0.14)"
      }}
      className={`absolute ${type === 'vertical' ? 'w-[1.5px] h-full top-0' : 'h-[1.5px] w-full left-0'}`}
    />
  )
}

interface BlueprintGridProps {
  scrollYProgress: any
  gridLines: {
    vertical: number[]
    horizontal: number[]
    squareSize: number
    cols: number
    rows: number
    padLeft: number
    padTop: number
  }
  cardsLaunched: boolean
  canvasCardsActive: boolean
}

const BlueprintGrid: React.FC<BlueprintGridProps> = ({ scrollYProgress, gridLines, cardsLaunched, canvasCardsActive }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    let animId: number
    let dpr = window.devicePixelRatio || 1
    const clientW = window.innerWidth
    const clientH = window.innerHeight
    let w = canvas.width = clientW * dpr
    let h = canvas.height = clientH * dpr
    canvas.style.width = `${clientW}px`
    canvas.style.height = `${clientH}px`
    
    const handleResize = () => {
      if (canvasRef.current) {
        dpr = window.devicePixelRatio || 1
        const resizedW = window.innerWidth
        const resizedH = window.innerHeight
        w = canvasRef.current.width = resizedW * dpr
        h = canvasRef.current.height = resizedH * dpr
        canvasRef.current.style.width = `${resizedW}px`
        canvasRef.current.style.height = `${resizedH}px`
      }
    }
    
    window.addEventListener('resize', handleResize)
    
    const mouse = { x: -2000, y: -2000 }
    const trailMouse = { x: -2000, y: -2000 }
    let targetInfluence = 0
    let currentInfluence = 0
    let targetMultiplier = 1.0
    let currentMultiplier = 1.0
    let isMouseDown = false
    let isMouseOverCanvas = false
    
    interface Particle {
      x: number
      y: number
      vx: number
      vy: number
      baseX: number
      baseY: number
    }
    
    let particles: Particle[][] = []
    
    interface Pluck {
      x: number
      y: number
      time: number
    }
    const plucks: Pluck[] = []
    
    const numCols = gridLines.vertical.length
    const numRows = gridLines.horizontal.length
    
    let rebuild = false
    if (particles.length !== numCols) {
      rebuild = true
    } else {
      for (let i = 0; i < numCols; i++) {
        if (!particles[i] || particles[i].length !== numRows) {
          rebuild = true
          break
        }
      }
    }
    
    if (rebuild && numCols > 0 && numRows > 0) {
      particles = []
      for (let i = 0; i < numCols; i++) {
        particles[i] = []
        const baseX = gridLines.vertical[i]
        for (let j = 0; j < numRows; j++) {
          particles[i][j] = {
            x: baseX,
            y: gridLines.horizontal[j],
            vx: 0,
            vy: 0,
            baseX: baseX,
            baseY: gridLines.horizontal[j]
          }
        }
      }
    }
    
    const handleMouseMove = (e: MouseEvent) => {
      // Grid is interactive ONLY after canvasCardsActive (gray tile revealed) is active
      if (!canvasCardsActive) return
      const isMobileDevice = window.innerWidth < 768
      if (isMobileDevice) return
      
      const rect = canvas.getBoundingClientRect()
      const scrollVal = scrollYProgress.get()
      const isStickyActive = scrollVal > 0.01 && scrollVal < 0.99
      const isInside =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
        
      if (isStickyActive && isInside) {
        mouse.x = e.clientX
        mouse.y = e.clientY
        const currentSquareSize = gridLines.squareSize || 50
        targetInfluence = currentSquareSize * 2.2
        isMouseOverCanvas = true
      } else {
        targetInfluence = 0
        isMouseOverCanvas = false
      }
    }
    
    const handleMouseLeave = () => {
      targetInfluence = 0
      isMouseOverCanvas = false
    }
    
    const handleMouseDown = (e: MouseEvent) => {
      // Grid is interactive ONLY after canvasCardsActive (gray tile revealed) is active
      if (!canvasCardsActive) return
      const isMobileDevice = window.innerWidth < 768
      const rect = canvas.getBoundingClientRect()
      const scrollVal = scrollYProgress.get()
      const isStickyActive = scrollVal > 0.01 && scrollVal < 0.99
      const isInside =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      if (isMobileDevice) {
        if (isStickyActive && isInside) {
          const tapX = e.clientX - rect.left
          const tapY = e.clientY - rect.top
          plucks.push({
            x: tapX,
            y: tapY,
            time: 0
          })
        }
      } else {
        if (isMouseOverCanvas) {
          isMouseDown = true
        }
      }
    }
    
    const handleMouseUp = () => {
      isMouseDown = false
    }
    
    const handleTouchStart = (e: TouchEvent) => {
      // Grid is interactive ONLY after canvasCardsActive (gray tile revealed) is active
      if (!canvasCardsActive) return
      if (e.touches.length > 0) {
        const rect = canvas.getBoundingClientRect()
        const scrollVal = scrollYProgress.get()
        const isStickyActive = scrollVal > 0.01 && scrollVal < 0.99
        const touch = e.touches[0]
        const isInside =
          touch.clientX >= rect.left &&
          touch.clientX <= rect.right &&
          touch.clientY >= rect.top &&
          touch.clientY <= rect.bottom
        if (isStickyActive && isInside) {
          const isMobileDevice = window.innerWidth < 768
          if (isMobileDevice) {
            const tapX = touch.clientX - rect.left
            const tapY = touch.clientY - rect.top
            plucks.push({
              x: tapX,
              y: tapY,
              time: 0
            })
          } else {
            mouse.x = touch.clientX
            mouse.y = touch.clientY
            const currentSquareSize = gridLines.squareSize || 50
            targetInfluence = currentSquareSize * 2.2
            isMouseOverCanvas = true
            isMouseDown = true
          }
        }
      }
    }
    
    const handleTouchMove = (e: TouchEvent) => {
      // Grid is interactive ONLY after canvasCardsActive (gray tile revealed) is active
      if (!canvasCardsActive) return
      const isMobileDevice = window.innerWidth < 768
      if (isMobileDevice) return
      
      if (e.touches.length > 0) {
        const rect = canvas.getBoundingClientRect()
        const scrollVal = scrollYProgress.get()
        const isStickyActive = scrollVal > 0.01 && scrollVal < 0.99
        const touch = e.touches[0]
        const isInside =
          touch.clientX >= rect.left &&
          touch.clientX <= rect.right &&
          touch.clientY >= rect.top &&
          touch.clientY <= rect.bottom
        if (isStickyActive && isInside) {
          mouse.x = touch.clientX
          mouse.y = touch.clientY
          const currentSquareSize = gridLines.squareSize || 50
          targetInfluence = currentSquareSize * 2.2
          isMouseOverCanvas = true
        } else {
          targetInfluence = 0
          isMouseOverCanvas = false
          isMouseDown = false
        }
      }
    }
    
    const handleTouchEnd = () => {
      isMouseDown = false
      isMouseOverCanvas = false
      targetInfluence = 0
    }
    
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    window.addEventListener('mouseleave', handleMouseLeave, { passive: true })
    window.addEventListener('mousedown', handleMouseDown, { passive: true })
    window.addEventListener('mouseup', handleMouseUp, { passive: true })
    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: true })
    window.addEventListener('touchend', handleTouchEnd, { passive: true })
    window.addEventListener('touchcancel', handleTouchEnd, { passive: true })
    
    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      ctx.save()
      ctx.scale(dpr, dpr)
      const screenW = window.innerWidth
      const screenH = window.innerHeight
      
      if (trailMouse.x === -2000) {
        trailMouse.x = mouse.x
        trailMouse.y = mouse.y
      } else {
        trailMouse.x += (mouse.x - trailMouse.x) * 0.15
        trailMouse.y += (mouse.y - trailMouse.y) * 0.15
      }
      
      const stiffness = 0.35
      const damping = 0.72
      const waveSpeed = 26
      
      const maxRadius = Math.max(window.innerWidth, window.innerHeight) * 1.3
      for (let pIdx = plucks.length - 1; pIdx >= 0; pIdx--) {
        plucks[pIdx].time += 1
        if (plucks[pIdx].time * waveSpeed > maxRadius) {
          plucks.splice(pIdx, 1)
        }
      }
      
      if (numCols > 0 && numRows > 0 && particles.length === numCols) {
        for (let i = 0; i < numCols; i++) {
          for (let j = 0; j < numRows; j++) {
            const p = particles[i]?.[j]
            if (!p) continue
            
            let ax = -stiffness * (p.x - p.baseX)
            let ay = -stiffness * (p.y - p.baseY)
            
            for (const pluck of plucks) {
              const dx = p.baseX - pluck.x
              const dy = p.baseY - pluck.y
              const dist = Math.sqrt(dx * dx + dy * dy)
              if (dist > 0) {
                const waveRadius = pluck.time * waveSpeed
                const diff = dist - waveRadius
                const waveWidth = 20
                if (Math.abs(diff) < waveWidth) {
                  const progress = diff / waveWidth
                  const envelope = Math.cos(progress * Math.PI / 2)
                  const forceFactor = Math.sin(progress * Math.PI) * envelope
                  const pluckForce = 16.0
                  const decay = Math.max(0, 1 - waveRadius / maxRadius)
                  
                  ax += (dx / dist) * forceFactor * pluckForce * decay
                  ay += (dy / dist) * forceFactor * pluckForce * decay
                }
              }
            }
            
            p.vx += ax
            p.vy += ay
            p.vx *= damping
            p.vy *= damping
            p.x += p.vx
            p.y += p.vy
          }
        }
      }
      
      currentInfluence += (targetInfluence - currentInfluence) * 0.2
      targetMultiplier = isMouseDown ? -1.0 : 1.0
      currentMultiplier += (targetMultiplier - currentMultiplier) * 0.2
      
      const clickFactor = (1 - currentMultiplier) / 2
      
      const influenceRadius = currentInfluence
      const strength = 1.0
      const isMobileDevice = screenW < 768
      const layout = isMobileDevice ? MOBILE_LAYOUT : DESKTOP_LAYOUT
      const layoutWidth = isMobileDevice ? 8 : 26
      const layoutHeight = isMobileDevice ? 14 : 14
      const squareSize = gridLines.squareSize || 50
      const colOffset = Math.max(0, Math.floor((gridLines.cols - layoutWidth) / 2))
      const rowOffset = Math.max(0, Math.floor((gridLines.rows - layoutHeight) / 2))
      const nodesColOffset = gridLines.vertical.filter(x => x < gridLines.padLeft).length
      const nodesRowOffset = gridLines.horizontal.filter(y => y < gridLines.padTop).length

      // Helper routines mapping mouse distances to grid opacities (restored to correct file scope)
      const getOpacityAtPoint = (dist: number) => {
        if (dist >= influenceRadius || dist <= 0) return 0.14
        const force = (influenceRadius - dist) / influenceRadius
        const hoverFactor = Math.sin(force * Math.PI / 2)
        const hoveredOpacity = 0.14 - 0.05 * hoverFactor
        return hoveredOpacity + (0.22 - hoveredOpacity) * clickFactor
      }
      const getDotOpacityAtPoint = (dist: number) => {
        if (dist >= influenceRadius || dist <= 0) return 0.45
        const force = (influenceRadius - dist) / influenceRadius
        const hoverFactor = Math.sin(force * Math.PI / 2)
        const hoveredOpacity = 0.45 - 0.10 * hoverFactor
        return hoveredOpacity + (0.60 - hoveredOpacity) * clickFactor
      }
      
      const scrollVal = scrollYProgress.get()
      // Stretched grid built animation: drawing lines from [0.35, 0.65], dots appearing over [0.60, 0.70]
      const lineProgress = Math.max(0, Math.min(1, (scrollVal - 0.35) / (0.65 - 0.35)))
      const lineOpacity = Math.max(0, Math.min(1, (scrollVal - 0.35) / (0.55 - 0.35)))
      const dotProgress = Math.max(0, Math.min(1, (scrollVal - 0.60) / (0.70 - 0.60)))
      ctx.lineWidth = 1
      
      const nodes: { x: number; y: number }[][] = []
      
      if (cardsLaunched) {
        for (let i = 0; i < numCols; i++) {
          nodes[i] = []
          for (let j = 0; j < numRows; j++) {
            const p = particles[i]?.[j]
            let tx, ty;
            
            if (isMobileDevice && p && canvasCardsActive) {
              tx = p.x
              ty = p.y
            } else if (p) {
              const baseX = p.baseX
              const baseY = p.baseY
              const dx = trailMouse.x - baseX
              const dy = trailMouse.y - baseY
              const dist = Math.sqrt(dx * dx + dy * dy)
              const finalInfluence = cardsLaunched ? influenceRadius : 0
              if (finalInfluence > 0 && dist < finalInfluence && dist > 0) {
                const power = Math.pow(1 - dist / finalInfluence, 1.5)
                tx = baseX + dx * power * strength * currentMultiplier
                ty = baseY + dy * power * strength * currentMultiplier
              } else {
                tx = baseX
                ty = baseY
              }
            } else {
              tx = gridLines.vertical[i]
              ty = gridLines.horizontal[j]
            }
            
            nodes[i][j] = { x: tx, y: ty }
          }
        }
        
        const getNode = (col: number, row: number) => {
          if (nodes && nodes[col] && nodes[col][row]) {
            return nodes[col][row]
          }
          
          const p = particles[col]?.[row]
          const isMobileDevice = window.innerWidth < 768
          
          if (isMobileDevice && p && canvasCardsActive) {
            return { x: p.x, y: p.y }
          }
          
          const baseX = gridLines.vertical && gridLines.vertical[col] !== undefined
            ? gridLines.vertical[col]
            : ((gridLines.vertical && gridLines.vertical[0] !== undefined ? gridLines.vertical[0] : 0) + col * squareSize)
          const baseY = gridLines.horizontal && gridLines.horizontal[row] !== undefined
            ? gridLines.horizontal[row]
            : ((gridLines.horizontal && gridLines.horizontal[0] !== undefined ? gridLines.horizontal[0] : 0) + row * squareSize)
          
          let tx = baseX
          let ty = baseY
          
          const dx = trailMouse.x - baseX
          const dy = trailMouse.y - baseY
          const dist = Math.sqrt(dx * dx + dy * dy)
          const finalInfluence = cardsLaunched ? influenceRadius : 0
          if (finalInfluence > 0 && dist < finalInfluence && dist > 0) {
            const power = Math.pow(1 - dist / finalInfluence, 1.5)
            tx += dx * power * strength * currentMultiplier
            ty += dy * power * strength * currentMultiplier
          }
          
          return { x: tx, y: ty }
        }
        
        // Calculate scroll-linked values for each card inside canvas draw loop
        // Tile entries now run at constant 1.0 opacity once triggered to enable solid non-fading expansions
        const c2Opacity = scrollVal >= 0.78 ? 1.0 : 0.0
        const c2Clip = Math.max(0, Math.min(100, ((scrollVal - 0.78) / (0.82 - 0.78)) * 100))
        const c2Scale = Math.max(0, Math.min(1, (scrollVal - 0.75) / (0.78 - 0.75)))
        
        const c3Opacity = scrollVal >= 0.85 ? 1.0 : 0.0
        const c3Clip = Math.max(0, Math.min(100, ((scrollVal - 0.85) / (0.87 - 0.85)) * 100))
        const c3Scale = Math.max(0, Math.min(1, (scrollVal - 0.83) / (0.85 - 0.83)))

        // DRAW TILES FIRST (So lines and dots naturally render on top)
        TOOLS_LIST.forEach((tool) => {
          if (tool.bgColor === 'transparent') return
          const cardPos = layout[tool.layoutIdx]
          if (!cardPos) return
          
          const colIndex = nodesColOffset + colOffset + cardPos.col
          const rowIndex = nodesRowOffset + rowOffset + cardPos.row
          
          const opacity = tool.id === 'card2' ? c2Opacity : c3Opacity
          const clipRight = tool.id === 'card2' ? c2Clip : c3Clip
          const scale = tool.id === 'card2' ? c2Scale : c3Scale
          
          const c1 = getNode(colIndex, rowIndex)
          const c2 = getNode(colIndex + cardPos.w, rowIndex)
          const c3 = getNode(colIndex + cardPos.w, rowIndex + cardPos.h)
          const c4 = getNode(colIndex, rowIndex + cardPos.h)
          
          // Draw card backgrounds only if opacity is fully triggered (> 0)
          if (opacity > 0) {
            ctx.save()
            
            // Bidirectional expansion mask revealing simultaneously from top-left (cross location c1) toward bottom-right
            if (clipRight < 100) {
              const t = clipRight / 100
              
              // Top-Right edge point (along c1 -> c2)
              const topClipX = c1.x + (c2.x - c1.x) * t
              const topClipY = c1.y + (c2.y - c1.y) * t
              
              // Bottom-Left edge point (along c1 -> c4)
              const leftClipX = c1.x + (c4.x - c1.x) * t
              const leftClipY = c1.y + (c4.y - c1.y) * t
              
              // Bottom-Right corner point (bilinear interpolation inside quad of c1, c2, c3, c4 at coordinate t, t)
              const diagClipX = c1.x + (c2.x - c1.x) * t + (c4.x - c1.x) * t + (c3.x - c2.x - c4.x + c1.x) * t * t
              const diagClipY = c1.y + (c2.y - c1.y) * t + (c4.y - c1.y) * t + (c3.y - c2.y - c4.y + c1.y) * t * t
              
              ctx.beginPath()
              ctx.moveTo(c1.x, c1.y)
              ctx.lineTo(topClipX, topClipY)
              ctx.lineTo(diagClipX, diagClipY)
              ctx.lineTo(leftClipX, leftClipY)
              ctx.closePath()
              ctx.clip()
            }
            
            // Render each grid square of the tile individually so it follows warp non-linearly
            for (let u = 0; u < cardPos.w; u++) {
              for (let v = 0; v < cardPos.h; v++) {
                const sc1 = getNode(colIndex + u, rowIndex + v)
                const sc2 = getNode(colIndex + u + 1, rowIndex + v)
                const sc3 = getNode(colIndex + u + 1, rowIndex + v + 1)
                const sc4 = getNode(colIndex + u, rowIndex + v + 1)
                
                ctx.globalAlpha = opacity
                
                // 1. Fill base card background color
                ctx.fillStyle = tool.bgColor
                ctx.beginPath()
                ctx.moveTo(sc1.x, sc1.y)
                ctx.lineTo(sc2.x, sc2.y)
                ctx.lineTo(sc3.x, sc3.y)
                ctx.lineTo(sc4.x, sc4.y)
                ctx.closePath()
                ctx.fill()
                
                // 2. Blend the 5% bright white overlay directly inside the exact same path!
                // This resolves any edge-alignment artifacts and completely prevents dark borders when warped.
                ctx.fillStyle = 'rgba(255, 255, 255, 0.05)'
                ctx.fill()
              }
            }
            ctx.restore()
          }
          
          // Draw crosshair at the top-left corner node c1 inside the canvas
          // Runs if scale > 0, which occurs before card opacity is triggered (crosshair appears first, then card!)
          const easedScale = Math.sin(scale * Math.PI / 2)
          const size = 6 * easedScale
          if (size > 0) {
            ctx.save()
            ctx.globalAlpha = scale
            ctx.strokeStyle = '#212121'
            ctx.lineWidth = 1.5
            ctx.beginPath()
            ctx.moveTo(c1.x - size, c1.y)
            ctx.lineTo(c1.x + size, c1.y)
            ctx.moveTo(c1.x, c1.y - size)
            ctx.lineTo(c1.x, c1.y + size)
            ctx.stroke()
            ctx.restore()
          }
          
          ctx.globalAlpha = 1.0 // Reset alpha
        })
        
        // NOW DRAW LINES AND DOTS ON TOP OF THE CARDS
        for (let j = 0; j < numRows; j++) {
          for (let i = 0; i < numCols - 1; i++) {
            const p1 = nodes[i]?.[j]
            const p2 = nodes[i+1]?.[j]
            if (!p1 || !p2) continue
            
            const dx1 = p1.x - trailMouse.x
            const dy1 = p1.y - trailMouse.y
            const dist1 = Math.sqrt(dx1 * dx1 + dy1 * dy1)
            
            const dx2 = p2.x - trailMouse.x
            const dy2 = p2.y - trailMouse.y
            const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2)
            
            ctx.beginPath()
            
            if (dist1 >= influenceRadius && dist2 >= influenceRadius) {
              ctx.strokeStyle = `rgba(33, 33, 33, ${0.14 * lineOpacity})`
            } else {
              const opacity1 = getOpacityAtPoint(dist1) * lineOpacity
              const opacity2 = getOpacityAtPoint(dist2) * lineOpacity
              
              const grad = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y)
              grad.addColorStop(0, `rgba(33, 33, 33, ${opacity1})`)
              grad.addColorStop(1, `rgba(33, 33, 33, ${opacity2})`)
              ctx.strokeStyle = grad
            }
            
            if (i === 0) {
              ctx.moveTo(0, p1.y)
              ctx.lineTo(p1.x, p1.y)
            } else {
              ctx.moveTo(p1.x, p1.y)
            }
            ctx.lineTo(p2.x, p2.y)
            if (i === numCols - 2) {
              ctx.lineTo(screenW, p2.y)
            }
            ctx.stroke()
          }
        }
        
        for (let i = 0; i < numCols; i++) {
          for (let j = 0; j < numRows - 1; j++) {
            const p1 = nodes[i]?.[j]
            const p2 = nodes[i]?.[j+1]
            if (!p1 || !p2) continue
            
            const dx1 = p1.x - trailMouse.x
            const dy1 = p1.y - trailMouse.y
            const dist1 = Math.sqrt(dx1 * dx1 + dy1 * dy1)
            
            const dx2 = p2.x - trailMouse.x
            const dy2 = p2.y - trailMouse.y
            const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2)
            
            ctx.beginPath()
            
            if (dist1 >= influenceRadius && dist2 >= influenceRadius) {
              ctx.strokeStyle = `rgba(33, 33, 33, ${0.14 * lineOpacity})`
            } else {
              const opacity1 = getOpacityAtPoint(dist1) * lineOpacity
              const opacity2 = getOpacityAtPoint(dist2) * lineOpacity
              
              const grad = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y)
              grad.addColorStop(0, `rgba(33, 33, 33, ${opacity1})`)
              grad.addColorStop(1, `rgba(33, 33, 33, ${opacity2})`)
              ctx.strokeStyle = grad
            }
            
            if (j === 0) {
              ctx.moveTo(p1.x, 0)
              ctx.lineTo(p1.x, p1.y)
            } else {
              ctx.moveTo(p1.x, p1.y)
            }
            ctx.lineTo(p2.x, p2.y)
            if (j === numRows - 2) {
              ctx.lineTo(p2.x, screenH)
            }
            ctx.stroke()
          }
        }
        
        for (let i = 0; i < numCols; i++) {
          for (let j = 0; j < numRows; j++) {
            const node = nodes[i]?.[j]
            if (!node) continue
            const dx = node.x - trailMouse.x
            const dy = node.y - trailMouse.y
            const dist = Math.sqrt(dx * dx + dy * dy)
            
            let r = 33, g = 33, b = 33
            const localOpacity = getDotOpacityAtPoint(dist)
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${localOpacity * dotProgress})`
            ctx.beginPath()
            ctx.arc(node.x, node.y, 1, 0, Math.PI * 2)
            ctx.fill()
          }
        }
      } else {
        ctx.strokeStyle = `rgba(33, 33, 33, ${0.14 * lineOpacity})`
        for (let i = 0; i < numCols; i++) {
          const baseX = gridLines.vertical[i]
          const dirCol = i % 2 === 0 ? 1 : -1
          const shiftY = (1 - lineProgress) * dirCol * screenH
          ctx.beginPath()
          ctx.moveTo(baseX, 0 + shiftY)
          ctx.lineTo(baseX, screenH + shiftY)
          ctx.stroke()
        }
        for (let j = 0; j < numRows; j++) {
          const baseY = gridLines.horizontal[j]
          const dirRow = j % 2 === 0 ? 1 : -1
          const shiftX = (1 - lineProgress) * dirRow * screenW
          ctx.beginPath()
          ctx.moveTo(0 + shiftX, baseY)
          ctx.lineTo(screenW + shiftX, baseY)
          ctx.stroke()
        }
        if (dotProgress > 0) {
          ctx.fillStyle = `rgba(33, 33, 33, ${0.45 * dotProgress})`
          const dotRadius = 1.2 * dotProgress
          for (let i = 0; i < numCols; i++) {
            const baseX = gridLines.vertical[i]
            for (let j = 0; j < numRows; j++) {
              const baseY = gridLines.horizontal[j]
              ctx.beginPath()
              ctx.arc(baseX, baseY, dotRadius, 0, Math.PI * 2)
              ctx.fill()
            }
          }
        }
      }
      ctx.restore()
      animId = requestAnimationFrame(draw)
    }
    draw()
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseleave', handleMouseLeave)
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
      window.removeEventListener('touchcancel', handleTouchEnd)
    }
  }, [cardsLaunched, canvasCardsActive, gridLines, scrollYProgress])
  
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ display: 'block' }} />
}

interface CornerCrossHairProps {
  style: any
  idx: number
  crossVariants: any
}
const CornerCrossHair: React.FC<CornerCrossHairProps> = ({ style, idx, crossVariants }) => {
  return (
    <motion.div
      variants={crossVariants}
      custom={idx}
      style={{
        position: 'absolute',
        width: '12px',
        height: '12px',
        pointerEvents: 'none',
        transformOrigin: 'center',
        ...style
      }}
      className="z-[3]"
    >
      <svg width="12" height="12" viewBox="0 0 12 12" className="overflow-visible pointer-events-none">
        <line x1="0" y1="6" x2="12" y2="6" stroke="#212121" strokeWidth={1.5} />
        <line x1="6" y1="0" x2="6" y2="12" stroke="#212121" strokeWidth={1.5} />
      </svg>
    </motion.div>
  )
}

export default function ToolsSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [cardsLaunched, setCardsLaunched] = useState(false)
  const [canvasCardsActive, setCanvasCardsActive] = useState(false)
  const [revealText1, setRevealText1] = useState(false)
  const [revealText2, setRevealText2] = useState(false)
  const [revealText3, setRevealText3] = useState(false)
  const [gridData, setGridData] = useState<{ vertical: number[], horizontal: number[], squareSize: number, cols: number, rows: number, padLeft: number, padTop: number }>({ vertical: [], horizontal: [], squareSize: 50, cols: 0, rows: 0, padLeft: 0, padTop: 0 })
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  useEffect(() => {
    const calculateGrid = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      const isMob = w < 768
      const padX = isMob ? 40 : 0
      
      const headerOffset = isMob ? 110 : 0
      const bottomOffset = isMob ? 40 : 0
      const activeHeight = isMob ? (h - headerOffset - bottomOffset) : h
      
      const squareSize = isMob
        ? Math.min(Math.floor((w - padX) / 8), Math.floor(activeHeight / 14))
        : Math.max(45, Math.min(Math.floor(w / 28), Math.floor(h / 14.5)))
        
      const cols = isMob ? 8 : Math.floor(w / squareSize)
      const rows = isMob ? 14 : Math.floor(h / squareSize)
      const padLeft = Math.floor((w - (cols * squareSize)) / 2)
      
      const padTop = isMob
        ? headerOffset + Math.floor((activeHeight - (rows * squareSize)) / 2)
        : Math.floor((h - (rows * squareSize)) / 2)
        
      const vertical: number[] = []
      let vPos = padLeft
      while (vPos >= 0) { vertical.push(vPos); vPos -= squareSize }
      vPos = padLeft + squareSize
      while (vPos <= w) { vertical.push(vPos); vPos += squareSize }
      const horizontal: number[] = []
      let hPos = padTop
      while (hPos >= 0) { horizontal.push(hPos); hPos -= squareSize }
      hPos = padTop + squareSize
      while (hPos <= h) { horizontal.push(hPos); hPos += squareSize }
      vertical.sort((a, b) => a - b)
      horizontal.sort((a, b) => a - b)
      setGridData({ vertical, horizontal, squareSize, cols, rows, padLeft, padTop })
    }
    
    calculateGrid()
    window.addEventListener('resize', calculateGrid)
    return () => window.removeEventListener('resize', calculateGrid)
  }, [])
  
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end end'] })
  
  // Custom staggered timeline matching exact sequential reveal requirements
  // 1. Title fades in and floats up from [0.70, 0.74] (completes after the longer grid build finishes at 0.70)
  const card1Opacity = useTransform(scrollYProgress, [0.70, 0.74], [0, 1])
  const card1Y = useTransform(scrollYProgress, [0.70, 0.74], [30, 0])
  
  // 2. Card Opacities: step functions that turn on instantly at the start of expansion to prevent premature fade-in
  const card2Opacity = useTransform(scrollYProgress, (latest) => latest >= 0.78 ? 1 : 0)
  const card3Opacity = useTransform(scrollYProgress, (latest) => latest >= 0.85 ? 1 : 0)

  // 3. Dedicated Text Opacities: stay strictly invisible during tile expansion, and fade in only after the tile is revealed
  const card2TextOpacity = useTransform(scrollYProgress, [0.81, 0.82], [0, 1])
  const card3TextOpacity = useTransform(scrollYProgress, [0.86, 0.87], [0, 1])
  
  const card2CrossScale = useTransform(scrollYProgress, [0.75, 0.78], [0, 1])
  const card2CrossOpacity = useTransform(scrollYProgress, (latest) => {
    if (latest >= 0.88) return 0
    if (latest >= 0.75 && latest < 0.78) return (latest - 0.75) / 0.03
    if (latest >= 0.78) return 1
    return 0
  })
  
  const card2ClipRight = useTransform(scrollYProgress, [0.78, 0.82], [0, 100])
  const card2TextClip = useTransform(scrollYProgress, [0.81, 0.84], [100, 0])
  
  const card3CrossScale = useTransform(scrollYProgress, [0.83, 0.85], [0, 1])
  const card3CrossOpacity = useTransform(scrollYProgress, (latest) => {
    if (latest >= 0.88) return 0
    if (latest >= 0.83 && latest < 0.85) return (latest - 0.83) / 0.02
    if (latest >= 0.85) return 1
    return 0
  })
  
  const card3ClipRight = useTransform(scrollYProgress, [0.85, 0.87], [0, 100])
  const card3TextClip = useTransform(scrollYProgress, [0.86, 0.88], [100, 0])
  
  useEffect(() => {
    if (!scrollYProgress) return
    const handleChange = (latest: number) => {
      // Background grid structures trigger responsive interaction precisely at 0.70
      if (latest >= 0.70) setCardsLaunched(true)
      else setCardsLaunched(false)
      
      // Trigger text reveals
      setRevealText1(latest >= 0.74)
      setRevealText2(latest >= 0.84)
      setRevealText3(latest >= 0.88)
      
      // Grid becomes fully interactive on cards at 0.88 (once Card 3 text finishes drawing)
      if (latest >= 0.88) setCanvasCardsActive(true)
      else setCanvasCardsActive(false)
    }
    const unsubscribe = scrollYProgress.onChange
      ? scrollYProgress.onChange(handleChange)
      : scrollYProgress.on('change', handleChange)
    return () => unsubscribe()
  }, [scrollYProgress])
  
  const bgOpacity = useTransform(
    scrollYProgress,
    [0, 0.1, 0.35, 0.35],
    [0, 1, 1, 0]
  )
  
  const textOpacity = useTransform(scrollYProgress, (pos) => (pos < 0.35 ? 1 : 0))
  const lightBgOpacity = useTransform(scrollYProgress, (pos) => (pos < 0.35 ? 0 : 1))
  const textScale = useTransform(scrollYProgress, [0.0, 0.20, 0.29, 0.34, 0.35], [1, 2.2, 8, 35, 160])
  const transformOrigin = isMobile ? '49.3% 41.5%' : '49.3% 52%'
  
  const layout = isMobile ? MOBILE_LAYOUT : DESKTOP_LAYOUT
  const titleLayout = isMobile ? TITLE_LAYOUT.mobile : TITLE_LAYOUT.desktop
  
  const colOffset = Math.max(0, Math.floor((gridData.cols - (isMobile ? 8 : 26)) / 2))
  const rowOffset = Math.max(0, Math.floor((gridData.rows - (isMobile ? 14 : 14)) / 2))
  const lineWidth = 2
  
  const card2TextClipPath = useMotionTemplate`inset(0% 0% ${card2TextClip}% 0%)`
  const card3TextClipPath = useMotionTemplate`inset(0% 0% ${card3TextClip}% 0%)`
  
  return (
    <div ref={containerRef} id="tools" className="relative h-[600vh] w-full">
      <div className="sticky top-0 left-0 h-[100dvh] w-full flex items-center justify-center overflow-hidden z-[4]">
        <motion.div style={{ opacity: bgOpacity }} className="fixed inset-0 z-[2] pointer-events-none">
          <AnimatedBg />
          <div className="absolute inset-0 bg-gradient-to-b from-[#212121]/30 via-transparent to-[#212121]/50 pointer-events-none" />
        </motion.div>
        
        <motion.div style={{ opacity: lightBgOpacity }} className="absolute inset-0 bg-[#ffffff] z-[1]" />
        
        <motion.div style={{ opacity: lightBgOpacity }} className="absolute inset-0 z-[2] pointer-events-none">
          <BlueprintGrid scrollYProgress={scrollYProgress} gridLines={gridData} cardsLaunched={cardsLaunched} canvasCardsActive={canvasCardsActive} />
        </motion.div>
        
        <motion.div style={{ opacity: textOpacity }} className="absolute inset-0 flex items-center justify-center pointer-events-none z-[3]">
          <motion.div style={{ scale: textScale, transformOrigin }} className="relative flex flex-col items-end w-fit h-fit px-8">
            <h2 className="font-heading text-[15vw] font-bold leading-[0.9] tracking-tight text-white uppercase select-none">Creative</h2>
            <p className="font-mono text-[3vw] font-medium tracking-[0.25em] text-[#729E84] uppercase whitespace-nowrap leading-none mt-6 select-none">TOOLBOX</p>
          </motion.div>
        </motion.div>
        
        <motion.div
          style={{ opacity: lightBgOpacity }}
          className="absolute inset-0 w-full h-full z-[4] pointer-events-none"
        >
          <div className="relative w-full h-full">
            
            {/* Standard Section Heading / Title: "I work with..." aligned cleanly with grid constraints */}
            {gridData.squareSize > 0 && (
              <motion.div
                style={{
                  position: 'absolute',
                  left: `${gridData.padLeft + (colOffset + titleLayout.col) * gridData.squareSize}px`,
                  top: `${gridData.padTop + (rowOffset + titleLayout.row) * gridData.squareSize}px`,
                  width: `${titleLayout.w * gridData.squareSize}px`,
                  height: `${titleLayout.h * gridData.squareSize}px`,
                  paddingLeft: isMobile ? '1rem' : '0px',
                  paddingRight: isMobile ? '1rem' : '0px',
                  opacity: card1Opacity,
                  y: card1Y,
                }}
                className="pointer-events-none z-[10] flex flex-col justify-end items-start overflow-visible text-left pb-1 md:pb-2"
              >
                <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-[45px] font-bold tracking-tight text-[#212121] leading-[1.1] w-full">
                  I work with a <span className="font-serif italic font-normal text-[#729E84]">wide range</span> of tools to bring learning experiences to life – whatever the project calls{"\u00A0"}for
                </h2>
              </motion.div>
            )}
            
            {gridData.squareSize > 0 && TOOLS_LIST.map((tool, idx) => {
              const cardPos = layout[tool.layoutIdx]
              if (!cardPos) return null
              const left = gridData.padLeft + (cardPos.col + colOffset) * gridData.squareSize
              const top = gridData.padTop + (cardPos.row + rowOffset) * gridData.squareSize
              const width = cardPos.w * gridData.squareSize + lineWidth
              const height = cardPos.h * gridData.squareSize + lineWidth
              
              const textOpacityVal = tool.id === 'card2' ? card2TextOpacity : card3TextOpacity
              const textClipPathVal = tool.id === 'card2' ? card2TextClipPath : card3TextClipPath
              return (
                <motion.div
                  key={tool.id}
                  style={{
                    position: 'absolute',
                    left: `${left}px`,
                    top: `${top}px`,
                    width: `${width}px`,
                    height: `${height}px`,
                    transformOrigin: 'top left',
                    pointerEvents: 'none'
                  }}
                  className="rounded-none select-none overflow-visible z-[10]"
                >
                  {/* HTML solid backgrounds and crosshairs have been fully removed. 
                      They are drawn inside the Canvas render layer to support reactive physical movement on hover. */}
                  
                  {/* HTML text layer overlay with scroll-linked downward mask wipe */}
                  <motion.div
                    style={{
                      clipPath: textClipPathVal,
                      opacity: textOpacityVal,
                    }}
                    className="absolute inset-0 flex flex-col justify-center items-start z-[2] px-8 md:px-10 text-left pointer-events-none"
                  >
                    {tool.id === 'card2' ? (
                      <p className="font-sans font-medium text-sm sm:text-base md:text-lg lg:text-[19px] leading-relaxed" style={{ color: tool.textColor }}>
                        That includes the full <strong>Articulate 360</strong> pack, <strong>Adobe creative tools</strong> for graphic design, web-based animation platforms like <strong>Vyond</strong> and <strong>Powtoon</strong>, <strong>Camtasia</strong> and <strong>Premiere</strong> for video production, advanced <strong>PowerPoint</strong>, and an expanding set of <strong>AI tools</strong> for content, visuals, and production.
                      </p>
                    ) : (
                      <p className="font-sans font-bold text-base sm:text-lg md:text-xl lg:text-[22px] uppercase leading-snug tracking-wider" style={{ color: tool.textColor }}>
                        {tool.text}
                      </p>
                    )}
                  </motion.div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </div>
    </div>
  )
}