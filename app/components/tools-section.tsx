'use client'
import React, { useRef, useState, useEffect } from 'react'
import { motion, useScroll, useTransform, useMotionTemplate } from 'framer-motion'
import Image from 'next/image'
import AnimatedBg from './animated-bg'

const TOOLS_LIST = [
  { name: 'Articulate 360', logoSrc: '/images/Articulate.webp', bgColor: '#bae6fd', borderColor: '#0369a1' },
  { name: 'Vyond', logoSrc: '/images/Vyond.webp', bgColor: '#fed7aa', borderColor: '#c2410c' },
  { name: 'Camtasia', logoSrc: '/images/Camtasia.webp', bgColor: '#bbf7d0', borderColor: '#15803d' },
  { name: 'Adobe Illustrator', logoSrc: '/images/illustrator.webp', bgColor: '#fde68a', borderColor: '#b45309' },
  { name: 'Microsoft PowerPoint', logoSrc: '/images/PPT.webp', bgColor: '#fecdd3', borderColor: '#be123c' },
  { name: 'Generative AI', logoSrc: '/images/Generative AI.webp', bgColor: '#e0e7ff', borderColor: '#6b21a8' },
]

interface GridPosition {
  col: number
  row: number
  w: number
  h: number
}

const DESKTOP_LAYOUT: GridPosition[] = [
  { col: 0, row: 3, w: 3, h: 3 },
  { col: 6, row: 0, w: 4, h: 4 },
  { col: 11, row: 5, w: 4, h: 4 },
  { col: 16, row: 1, w: 5, h: 5 },
  { col: 4, row: 7, w: 4, h: 4 },
  { col: 23, row: 5, w: 3, h: 3 },
]

const MOBILE_LAYOUT: GridPosition[] = [
  { col: 1, row: 0, w: 2, h: 2 },
  { col: 4, row: 1, w: 3, h: 3 },
  { col: 0, row: 4, w: 3, h: 3 },
  { col: 4, row: 6, w: 4, h: 4 },
  { col: 0, row: 9, w: 3, h: 3 },
  { col: 4, row: 12, w: 2, h: 2 },
]

interface GridLineProps {
  scrollYProgress: any
  position: number
  dir: number
  type: 'vertical' | 'horizontal'
}

const GridLine: React.FC<GridLineProps> = ({ scrollYProgress, position, dir, type }) => {
  const translatePercent = useTransform(scrollYProgress, [0.52, 0.72], [dir === 1 ? 100 : -100, 0])
  const translateVal = useMotionTemplate`${translatePercent}%`
  const opacityVal = useTransform(scrollYProgress, [0.52, 0.56, 0.72], [0, 1, 1])
  
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
  const imagesRef = useRef<HTMLImageElement[]>([])
  
  useEffect(() => {
    imagesRef.current = TOOLS_LIST.map((tool) => {
      const img = new window.Image()
      img.src = tool.logoSrc
      return img
    })
  }, [])
  
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
      const isMobileDevice = window.innerWidth < 768
      if (isMobileDevice) return
      
      const rect = canvas.getBoundingClientRect()
      const isStickyActive = Math.abs(rect.top) < 10
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
      const isMobileDevice = window.innerWidth < 768
      const rect = canvas.getBoundingClientRect()
      const isStickyActive = Math.abs(rect.top) < 10
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
      if (e.touches.length > 0) {
        const rect = canvas.getBoundingClientRect()
        const isStickyActive = Math.abs(rect.top) < 10
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
      const isMobileDevice = window.innerWidth < 768
      if (isMobileDevice) return
      
      if (e.touches.length > 0) {
        const rect = canvas.getBoundingClientRect()
        const isStickyActive = Math.abs(rect.top) < 10
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
      const layoutHeight = isMobileDevice ? 14 : 11
      const squareSize = gridLines.squareSize || 50
      const colOffset = Math.max(0, Math.floor((gridLines.cols - layoutWidth) / 2))
      const rowOffset = Math.max(0, Math.floor((gridLines.rows - layoutHeight) / 2))
      const nodesColOffset = gridLines.vertical.filter(x => x < gridLines.padLeft).length
      const nodesRowOffset = gridLines.horizontal.filter(y => y < gridLines.padTop).length
      
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
      
      if (numCols === 0 || numRows === 0) {
        ctx.restore()
        animId = requestAnimationFrame(draw)
        return
      }
      
      const scrollVal = scrollYProgress.get()
      const lineProgress = Math.max(0, Math.min(1, (scrollVal - 0.52) / (0.72 - 0.52)))
      const lineOpacity = Math.max(0, Math.min(1, (scrollVal - 0.52) / (0.56 - 0.52)))
      const dotProgress = Math.max(0, Math.min(1, (scrollVal - 0.68) / (0.78 - 0.68)))
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
              const finalInfluence = canvasCardsActive ? influenceRadius : 0
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
          const finalInfluence = canvasCardsActive ? influenceRadius : 0
          if (finalInfluence > 0 && dist < finalInfluence && dist > 0) {
            const power = Math.pow(1 - dist / finalInfluence, 1.5)
            tx += dx * power * strength * currentMultiplier
            ty += dy * power * strength * currentMultiplier
          }
          
          return { x: tx, y: ty }
        }
        
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
        
        if (canvasCardsActive) {
          TOOLS_LIST.forEach((tool, idx) => {
            const cardPos = layout[idx]
            if (!cardPos) return
            const colIndex = nodesColOffset + colOffset + cardPos.col
            const rowIndex = nodesRowOffset + rowOffset + cardPos.row
            const c1 = getNode(colIndex, rowIndex)
            const c2 = getNode(colIndex + cardPos.w, rowIndex)
            const c4 = getNode(colIndex, rowIndex + cardPos.h)
            const cardW = cardPos.w * squareSize + 2
            const cardH = cardPos.h * squareSize + 2
            
            for (let u = 0; u < cardPos.w; u++) {
              for (let v = 0; v < cardPos.h; v++) {
                const sc1 = getNode(colIndex + u, rowIndex + v)
                const sc2 = getNode(colIndex + u + 1, rowIndex + v)
                const sc3 = getNode(colIndex + u + 1, rowIndex + v + 1)
                const sc4 = getNode(colIndex + u, rowIndex + v + 1)
                ctx.fillStyle = tool.bgColor
                ctx.beginPath()
                ctx.moveTo(sc1.x, sc1.y)
                ctx.lineTo(sc2.x, sc2.y)
                ctx.lineTo(sc3.x, sc3.y)
                ctx.lineTo(sc4.x, sc4.y)
                ctx.closePath()
                ctx.fill()
              }
            }
            ctx.save()
            
            const ax = (c2.x - c1.x) / cardW
            const ay = (c2.y - c1.y) / cardW
            const bx = (c4.x - c1.x) / cardH
            const by = (c4.y - c1.y) / cardH
            ctx.transform(ax, ay, bx, by, c1.x, c1.y)
            ctx.fillStyle = 'rgba(255, 255, 255, 0.05)'
            ctx.fillRect(0, 0, cardW, cardH)
            
            const logoImg = imagesRef.current[idx]
            if (logoImg && logoImg.complete) {
              const maxW = cardW * 0.6
              const maxH = cardH * 0.6
              const imgRatio = logoImg.naturalWidth / logoImg.naturalHeight
              const containerRatio = maxW / maxH
              let logoW = maxW
              let logoH = maxH
              if (imgRatio > containerRatio) {
                logoH = maxW / imgRatio
              } else {
                logoW = maxH * imgRatio
              }
              ctx.imageSmoothingEnabled = true
              ctx.imageSmoothingQuality = 'high'
              ctx.drawImage(logoImg, (cardW - logoW) / 2, (cardH - logoH) / 2, logoW, logoH)
            }
            ctx.restore()
            ctx.strokeStyle = '#212121'
            ctx.lineWidth = 1.5
            ctx.beginPath()
            ctx.moveTo(c1.x - 6, c1.y)
            ctx.lineTo(c1.x + 6, c1.y)
            ctx.moveTo(c1.x, c1.y - 6)
            ctx.lineTo(c1.x, c1.y + 6)
            ctx.stroke()
          })
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
  style: React.CSSProperties
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
        : 50
        
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
  
  const { scrollYProgress: entryProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'start start']
  })
  
  useEffect(() => {
    if (!scrollYProgress) return
    const handleChange = (latest: number) => {
      if (latest >= 0.76) setCardsLaunched(true)
      else if (latest < 0.73) setCardsLaunched(false)
    }
    const unsubscribe = scrollYProgress.onChange(handleChange)
    return () => unsubscribe()
  }, [scrollYProgress])
  
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (cardsLaunched) {
      timer = setTimeout(() => {
        setCanvasCardsActive(true)
      }, 2000)
    } else {
      setCanvasCardsActive(false)
    }
    return () => clearTimeout(timer)
  }, [cardsLaunched])
  
  if (!cardsLaunched && canvasCardsActive) {
    setCanvasCardsActive(false)
  }
  
  // Custom scrolling lock with active touch inertia blocker on mobile
  useEffect(() => {
    if (typeof window === 'undefined') return
    const lenis = (window as any).lenis
    if (!lenis || !cardsLaunched) return
    
    // Halt Lenis scrolling
    lenis.stop()

    // Emergency physical brake strictly on mobile to halt kinetic touch momentum
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault()
    }

    if (isMobile) {
      window.addEventListener('touchmove', handleTouchMove, { passive: false })
    }

    document.documentElement.style.setProperty('overflow', 'auto', 'important')
    document.documentElement.style.setProperty('overflow-y', 'scroll', 'important')
    
    const timer = setTimeout(() => {
      lenis.start()
      if (isMobile) {
        window.removeEventListener('touchmove', handleTouchMove)
      }
      document.documentElement.style.removeProperty('overflow')
      document.documentElement.style.removeProperty('overflow-y')
    }, 2000)
    
    return () => {
      clearTimeout(timer)
      lenis.start()
      if (isMobile) {
        window.removeEventListener('touchmove', handleTouchMove)
      }
      document.documentElement.style.removeProperty('overflow')
      document.documentElement.style.removeProperty('overflow-y')
    }
  }, [cardsLaunched, isMobile])
  
  useEffect(() => {
    if (typeof window === 'undefined') return
    const lenis = (window as any).lenis
    if (!lenis || !cardsLaunched) return
    lenis.stop()
    document.documentElement.style.setProperty('overflow', 'auto', 'important')
    document.documentElement.style.setProperty('overflow-y', 'scroll', 'important')
    
    const timer = setTimeout(() => {
      lenis.start()
      document.documentElement.style.removeProperty('overflow')
      document.documentElement.style.removeProperty('overflow-y')
    }, 2000)
    
    return () => {
      clearTimeout(timer)
      lenis.start()
    }
  }, [cardsLaunched])
  
  const bgOpacity = useTransform(
    scrollYProgress,
    [0, 0.1, 0.46, 0.46],
    [0, 1, 1, 0]
  )
  
  const textOpacity = useTransform(scrollYProgress, (pos) => (pos < 0.46 ? 1 : 0))
  const lightBgOpacity = useTransform(scrollYProgress, (pos) => (pos < 0.46 ? 0 : 1))
  const textScale = useTransform(scrollYProgress, [0.0, 0.25, 0.37, 0.45, 0.46], [1, 2.2, 8, 35, 160])
  const transformOrigin = isMobile ? '49.3% 41.5%' : '49.3% 52%'
  const layout = isMobile ? MOBILE_LAYOUT : DESKTOP_LAYOUT
  const colOffset = Math.max(0, Math.floor((gridData.cols - (isMobile ? 8 : 26)) / 2))
  const rowOffset = Math.max(0, Math.floor((gridData.rows - (isMobile ? 14 : 11)) / 2))
  const lineWidth = 2
  
  const cardVariants = {
    hidden: {
      opacity: 0,
      pointerEvents: "none" as const,
      transition: {
        duration: 0.2,
        delay: 0.6
      }
    },
    visible: { opacity: 1, pointerEvents: "auto" as const, transition: { duration: 0.01 } }
  }
  
  const crossVariants = {
    hidden: (idx: number) => ({ opacity: 0, scale: 0, transition: { duration: 0.2, ease: "easeIn", delay: (5 - idx) * 0.05 + 0.35 } }),
    visible: (idx: number) => ({ opacity: 1, scale: 1, transition: { type: "spring", stiffness: 120, damping: 14, delay: idx * 0.1 + 0.90 } })
  }
  
  const fillVariants = {
    hidden: (idx: number) => ({ clipPath: "inset(0% 100% 100% 0%)", transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: (5 - idx) * 0.05 + 0.15 } }),
    visible: (idx: number) => ({ clipPath: "inset(0% 0% 0% 0%)", transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1], delay: idx * 0.1 + 0.35 } })
  }
  
  const contentVariants = {
    hidden: (idx: number) => ({ opacity: 0, y: 15, scale: 0.85, transition: { duration: 0.2, ease: "easeIn", delay: (5 - idx) * 0.05 } }),
    visible: (idx: number) => ({ opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 120, damping: 14, delay: idx * 0.1 + 0.90 } })
  }
  
  return (
    <div ref={containerRef} id="tools" className="relative h-[450vh] w-full">
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
            <p className="font-mono text-[2.2vw] font-light tracking-widest text-[#729E84] uppercase whitespace-nowrap leading-none mt-6 select-none">Development Stack</p>
          </motion.div>
        </motion.div>
        
        <motion.div
          style={{ opacity: lightBgOpacity }}
          className="absolute inset-0 w-full h-full z-[4] pointer-events-none"
        >
          <div className="relative w-full h-full">
            {gridData.squareSize > 0 && TOOLS_LIST.map((tool, idx) => {
              const cardPos = layout[idx]
              if (!cardPos) return null
              const left = gridData.padLeft + (cardPos.col + colOffset) * gridData.squareSize
              const top = gridData.padTop + (cardPos.row + rowOffset) * gridData.squareSize
              const width = cardPos.w * gridData.squareSize + lineWidth
              const height = cardPos.h * gridData.squareSize + lineWidth
              return (
                <motion.div
                  key={tool.name}
                  custom={idx}
                  variants={cardVariants}
                  animate={cardsLaunched ? "visible" : "hidden"}
                  style={{
                    position: 'absolute',
                    left: `${left}px`,
                    top: `${top}px`,
                    width: `${width}px`,
                    height: `${height}px`,
                    transformOrigin: 'top left',
                  }}
                  className="rounded-none flex items-center justify-center select-none pointer-events-auto overflow-visible"
                >
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      opacity: canvasCardsActive ? 0 : 1,
                      transition: canvasCardsActive ? 'opacity 0.25s ease-in-out' : 'none',
                      pointerEvents: canvasCardsActive ? 'none' : 'auto'
                    }}
                    className="flex items-center justify-center w-full h-full"
                  >
                    <CornerCrossHair style={{ left: '-6px', top: '-6px' }} idx={idx} crossVariants={crossVariants} />
                    <motion.div variants={fillVariants} custom={idx} style={{ position: 'absolute', inset: 0, backgroundColor: tool.bgColor }} className="overflow-hidden animate-none">
                      <div style={{ position: 'absolute', inset: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 250 250' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`, opacity: 0.15, mixBlendMode: 'multiply' }} className="pointer-events-none w-full h-full" />
                    </motion.div>
                    <motion.div custom={idx} variants={contentVariants} className="relative w-[60%] h-[60%] flex items-center justify-center z-[2]">
                      <Image src={tool.logoSrc} alt={tool.name} fill priority={idx < 3} className="object-contain" />
                    </motion.div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </div>
    </div>
  )
}