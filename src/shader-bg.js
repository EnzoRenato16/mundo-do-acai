// Fundos animados em WebGPU com a biblioteca Shaders (shaders.com).
// Sem WebGPU, o fundo em CSS que fica atrás do canvas continua aparecendo.
import { createShader, isWebGPUSupported } from 'shaders/js'

const PRESETS = {
  hero: {
    components: [
      {
        type: 'MeshGradient', id: 'mesh',
        props: {
          stops: [
            { color: '#120720', position: 0 },
            { color: '#2e0b47', position: 0.3 },
            { color: '#5a1a86', position: 0.58 },
            { color: '#8f3fe0', position: 0.82 },
            { color: '#1c0b30', position: 1 },
          ],
          colorSpace: 'oklab', count: 6, smoothness: 2.4, swirl: 0.35, drift: 0.6, speed: 0.5, seed: 12,
        },
      },
      {
        type: 'Aurora', id: 'aurora',
        props: {
          colorA: '#7b2cbf', colorB: '#9be22d', colorC: '#a04dff', colorSpace: 'oklch',
          intensity: 45, curtainCount: 3, speed: 2.2, waviness: 70, rayDensity: 26, height: 90,
          center: { x: 0.5, y: 0 }, seed: 8,
        },
        // a aurora entra por cima como luz, sem lavar o roxo
        blendMode: 'screen', opacity: 0.45,
      },
      {
        type: 'FloatingParticles', id: 'dust',
        props: { particleColor: '#e9d8ff', count: 700, particleSize: 1.4, softness: 0.4, speed: 0.12, twinkle: 0.7, cursorStrength: 0.35 },
        opacity: 0.7,
      },
      {
        type: 'CursorTrail', id: 'trail',
        props: { colorA: '#9be22d', colorB: '#a04dff', radius: 0.9, length: 0.6, shrink: 1, softness: 0.7, colorSpace: 'oklch' },
        blendMode: 'screen', opacity: 0.55,
      },
      { type: 'FilmGrain', id: 'grain', props: { strength: 0.12, bias: 2, animated: true } },
    ],
  },
  pedir: {
    components: [
      { type: 'SolidColor', id: 'base', props: { color: '#120720' } },
      {
        type: 'Godrays', id: 'rays',
        props: { center: { x: 0.5, y: -0.1 }, density: 0.4, intensity: 0.6, spotty: 0.3, speed: 0.3, rayColor: '#8f3fe0', backgroundColor: 'transparent' },
        blendMode: 'screen', opacity: 0.8,
      },
      {
        type: 'FloatingParticles', id: 'dust2',
        props: { particleColor: '#9be22d', shape: 'glow', count: 260, particleSize: 2.2, softness: 0.8, speed: 0.1, twinkle: 0.9, cursorStrength: 0.25 },
        opacity: 0.6,
      },
      { type: 'FilmGrain', id: 'grain2', props: { strength: 0.05, bias: 2, animated: true } },
    ],
  },
}

// Os campos universais (blendMode, opacity) vão dentro de props no formato JSON
function normalize(preset) {
  return {
    components: preset.components.map(({ blendMode, opacity, ...c }) => ({
      ...c,
      props: { ...c.props, ...(blendMode && { blendMode }), ...(opacity != null && { opacity }) },
    })),
  }
}

export async function mountShader(canvas, name, { reducedMotion = false } = {}) {
  const host = canvas.parentElement
  if (!isWebGPUSupported()) { host.classList.add('shader-off'); return null }
  const preset = normalize(PRESETS[name])
  if (reducedMotion) {
    preset.components.forEach((c) => {
      if ('speed' in c.props) c.props.speed = 0
      if (c.type === 'FilmGrain') c.props.animated = false
    })
    preset.components = preset.components.filter((c) => c.type !== 'CursorTrail')
  }
  try {
    const inst = await createShader(canvas, preset, {
      disableTelemetry: true,
      onReady: () => host.classList.add('shader-on'),
      onError: () => { host.classList.remove('shader-on'); host.classList.add('shader-off') },
    })
    if (!inst.getFailureReason()) host.classList.add('shader-on')
    return inst
  } catch {
    host.classList.add('shader-off')
    return null
  }
}
