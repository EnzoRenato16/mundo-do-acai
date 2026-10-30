// Fundo animado em WebGPU com a biblioteca Shaders (shaders.com), só na seção de apps
// e só no computador. Sem WebGPU, o fundo em CSS que fica atrás do canvas continua aparecendo.
import { createShader, isWebGPUSupported } from 'shaders/js'

const PRESETS = {
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
        props: { particleColor: '#9be22d', shape: 'glow', count: 160, particleSize: 2.2, softness: 0.8, speed: 0.1, twinkle: 0.9, cursorStrength: 0.25 },
        opacity: 0.6,
      },
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

export async function mountShader(canvas, name) {
  const host = canvas.parentElement
  if (!isWebGPUSupported()) { host.classList.add('shader-off'); return null }
  const preset = normalize(PRESETS[name])
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
