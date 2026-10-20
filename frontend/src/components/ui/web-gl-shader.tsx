'use client'

import { useEffect, useRef } from 'react'

interface WebGLShaderProps {
  className?: string
  mouseInteraction?: boolean
  speed?: number
}

export function WebGLShader({ className = '', mouseInteraction = true, speed = 0.3 }: WebGLShaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: 0.5, y: 0.5 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext('webgl')
    if (!gl) return

    let animationId: number

    const resize = () => {
      canvas.width = canvas.clientWidth * window.devicePixelRatio
      canvas.height = canvas.clientHeight * window.devicePixelRatio
      gl.viewport(0, 0, canvas.width, canvas.height)
    }
    resize()
    window.addEventListener('resize', resize)

    const handleMouse = (e: MouseEvent) => {
      mouseRef.current = {
        x: e.clientX / window.innerWidth,
        y: 1.0 - e.clientY / window.innerHeight,
      }
    }
    if (mouseInteraction) {
      window.addEventListener('mousemove', handleMouse)
    }

    const vertexSrc = `attribute vec2 position;void main(){gl_Position=vec4(position,0.0,1.0);}`
    const fragmentSrc = `
      precision highp float;
      uniform vec2 u_resolution;
      uniform float u_time;
      uniform vec2 u_mouse;

      float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
      }

      vec2 noise2(vec2 p) {
        return vec2(random(p), random(p + 100.0));
      }

      float cellular(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        float minDist = 1.0;
        for (int x = -1; x <= 1; x++) {
          for (int y = -1; y <= 1; y++) {
            vec2 neighbor = vec2(float(x), float(y));
            vec2 point = noise2(i + neighbor);
            point = 0.5 + 0.5 * sin(u_time * 0.1 + 6.2831 * point);
            vec2 diff = neighbor + point - f;
            float d = length(diff);
            minDist = min(minDist, d);
          }
        }
        return minDist;
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution;
        float aspect = u_resolution.x / u_resolution.y;
        vec2 pos = uv * 3.0;

        float cells = cellular(pos);
        float cells2 = cellular(pos * 2.0 + u_time * 0.02);

        float wave = sin(uv.x * 5.0 + u_time * 0.3) * cos(uv.y * 5.0 + u_time * 0.2) * 0.5 + 0.5;
        float wave2 = sin(uv.x * 8.0 - u_time * 0.4 + uv.y * 6.0) * 0.5 + 0.5;

        float mouseDist = distance(uv, u_mouse);
        float glow = exp(-mouseDist * 4.0) * 0.6;

        float r = 0.02 + 0.1 * cells + 0.05 * wave + 0.08 * cells2 * wave2;
        float g = 0.05 + 0.15 * cells2 + 0.1 * wave + 0.12 * cells * wave2;
        float b = 0.08 + 0.2 * cells2 + 0.15 * wave + 0.1 * wave2;

        r += glow * 0.3;
        g += glow * 0.5;
        b += glow * 0.8;

        float vignette = 1.0 - length(uv - 0.5) * 0.5;
        r *= vignette;
        g *= vignette;
        b *= vignette;

        gl_FragColor = vec4(r, g, b, 1.0);
      }
    `

    const vertexShader = gl.createShader(gl.VERTEX_SHADER)!
    gl.shaderSource(vertexShader, vertexSrc)
    gl.compileShader(vertexShader)

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!
    gl.shaderSource(fragmentShader, fragmentSrc)
    gl.compileShader(fragmentShader)

    const program = gl.createProgram()!
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)
    gl.useProgram(program)

    const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1])
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)

    const positionLoc = gl.getAttribLocation(program, 'position')
    gl.enableVertexAttribArray(positionLoc)
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0)

    const resLoc = gl.getUniformLocation(program, 'u_resolution')
    const timeLoc = gl.getUniformLocation(program, 'u_time')
    const mouseLoc = gl.getUniformLocation(program, 'u_mouse')

    const startTime = performance.now()

    const render = () => {
      const time = (performance.now() - startTime) / 1000 * speed
      gl.uniform2f(resLoc, canvas.width, canvas.height)
      gl.uniform1f(timeLoc, time)
      gl.uniform2f(mouseLoc, mouseRef.current.x, mouseRef.current.y)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      animationId = requestAnimationFrame(render)
    }
    render()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
      if (mouseInteraction) window.removeEventListener('mousemove', handleMouse)
    }
  }, [mouseInteraction, speed])

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full ${className}`}
      style={{ opacity: 0.8 }}
    />
  )
}
