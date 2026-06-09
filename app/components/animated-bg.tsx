'use client'

import { useEffect, useRef } from 'react'

/**
 * Continuously animated dark background with vertical lines (straight & curved),
 * geometric shapes, and subtle accents matching the site palette.
 * Uses canvas for smooth 60fps animation.
 */
export default function AnimatedBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let w = 0
    let h = 0

    const resize = () => {
      w = canvas.width = window.innerWidth
      h = canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Palette
    const GREEN = '#729E84'
    const LIGHT_GREEN = '#A9C3B4'
    const DARK = '#212121'

    // Pre-generate lines
    const LINES_COUNT = 18
    const lines: { x: number; speed: number; opacity: number; width: number; curved: boolean; amplitude: number; frequency: number; phase: number }[] = []
    for (let i = 0; i < LINES_COUNT; i++) {
      const curved = i % 3 === 0
      lines.push({
        x: (i / LINES_COUNT) + (Math.random() - 0.5) * 0.08,
        speed: 0.15 + Math.random() * 0.35,
        opacity: 0.04 + Math.random() * 0.08,
        width: 0.5 + Math.random() * 1,
        curved,
        amplitude: curved ? 20 + Math.random() * 40 : 0,
        frequency: curved ? 0.003 + Math.random() * 0.004 : 0,
        phase: Math.random() * Math.PI * 2,
      })
    }

    // Geometric shapes
    const SHAPES_COUNT = 12
    const shapes: { x: number; y: number; size: number; rotation: number; rotSpeed: number; type: 'diamond' | 'circle' | 'cross' | 'triangle'; opacity: number; driftY: number; driftSpeed: number }[] = []
    for (let i = 0; i < SHAPES_COUNT; i++) {
      const types: ('diamond' | 'circle' | 'cross' | 'triangle')[] = ['diamond', 'circle', 'cross', 'triangle']
      shapes.push({
        x: Math.random(),
        y: Math.random(),
        size: 6 + Math.random() * 18,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.008,
        type: types[i % types.length],
        opacity: 0.03 + Math.random() * 0.06,
        driftY: 0,
        driftSpeed: 0.1 + Math.random() * 0.2,
      })
    }

    let time = 0

    const draw = () => {
      time += 1
      ctx.fillStyle = DARK
      ctx.fillRect(0, 0, w, h)

      // Subtle gradient overlay
      const grad = ctx.createRadialGradient(w * 0.5, h * 0.5, 0, w * 0.5, h * 0.5, w * 0.7)
      grad.addColorStop(0, 'rgba(114,158,132,0.03)')
      grad.addColorStop(1, 'transparent')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, w, h)

      // Draw vertical lines
      for (const line of lines) {
        const baseX = line.x * w
        const yOffset = (time * line.speed) % h

        ctx.beginPath()
        ctx.strokeStyle = line.curved
          ? `rgba(114,158,132,${line.opacity})`
          : `rgba(169,195,180,${line.opacity})`
        ctx.lineWidth = line.width

        if (line.curved) {
          for (let y = -h; y < h * 2; y += 2) {
            const adjustedY = y + yOffset
            const xPos = baseX + Math.sin((y + time * 0.5) * line.frequency + line.phase) * line.amplitude
            if (y === -h) ctx.moveTo(xPos, adjustedY % (h * 2) - h)
            else ctx.lineTo(xPos, adjustedY % (h * 2) - h)
          }
        } else {
          // Dashed effect — just a long line with subtle drift
          const drift = Math.sin(time * 0.005 + line.phase) * 3
          ctx.moveTo(baseX + drift, -h + yOffset)
          ctx.lineTo(baseX + drift, h * 2 + yOffset)
        }
        ctx.stroke()
      }

      // Draw geometric shapes
      for (const shape of shapes) {
        shape.rotation += shape.rotSpeed
        shape.driftY = (shape.driftY + shape.driftSpeed) % (h * 1.5)

        const sx = shape.x * w
        const sy = ((shape.y * h + shape.driftY) % (h * 1.5)) - h * 0.25

        ctx.save()
        ctx.translate(sx, sy)
        ctx.rotate(shape.rotation)
        ctx.strokeStyle = `rgba(114,158,132,${shape.opacity})`
        ctx.lineWidth = 0.8

        const s = shape.size

        switch (shape.type) {
          case 'diamond':
            ctx.beginPath()
            ctx.moveTo(0, -s)
            ctx.lineTo(s, 0)
            ctx.lineTo(0, s)
            ctx.lineTo(-s, 0)
            ctx.closePath()
            ctx.stroke()
            break
          case 'circle':
            ctx.beginPath()
            ctx.arc(0, 0, s * 0.7, 0, Math.PI * 2)
            ctx.stroke()
            break
          case 'cross':
            ctx.beginPath()
            ctx.moveTo(-s * 0.6, 0)
            ctx.lineTo(s * 0.6, 0)
            ctx.moveTo(0, -s * 0.6)
            ctx.lineTo(0, s * 0.6)
            ctx.stroke()
            break
          case 'triangle':
            ctx.beginPath()
            ctx.moveTo(0, -s)
            ctx.lineTo(s * 0.866, s * 0.5)
            ctx.lineTo(-s * 0.866, s * 0.5)
            ctx.closePath()
            ctx.stroke()
            break
        }

        ctx.restore()
      }

      // Subtle horizontal accent lines
      for (let i = 0; i < 4; i++) {
        const yPos = (h * 0.2 * (i + 1) + time * 0.1 * (i + 1)) % (h * 1.2)
        ctx.beginPath()
        ctx.strokeStyle = `rgba(169,195,180,0.025)`
        ctx.lineWidth = 0.5
        ctx.moveTo(w * 0.1, yPos)
        ctx.lineTo(w * 0.9, yPos)
        ctx.stroke()
      }

      animId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ display: 'block' }}
    />
  )
}
