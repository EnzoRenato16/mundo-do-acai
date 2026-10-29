// Copo de açaí em SVG, montado em camadas. Usado na seção "Camadas" (enche com o scroll)
// e no "Monte o seu" (muda conforme as escolhas).

const NS = 'http://www.w3.org/2000/svg'

// Geometria do copo (viewBox 0 0 400 560)
export const CUP = { top: 118, bottom: 500, topL: 62, topR: 338, botL: 102, botR: 298 }
export const LEVELS = { empty: 540, creme: 408, recheio: 292, acai: 150 }

export const FLAVORS = {
  creme: {
    ninho: { base: '#fff1d0', streak: '#ffffff', label: 'Ninho' },
    cupuacu: { base: '#f3e2a9', streak: '#fff6d6', label: 'Cupuaçu' },
    morango: { base: '#f7b9c6', streak: '#ffe1e8', label: 'Morango' },
  },
  recheio: {
    'doce-de-leite': { base: '#bb7a3b', streak: '#f6dcb2', label: 'Doce de leite' },
    avela: { base: '#5c3322', streak: '#a8714f', label: 'Creme de avelã' },
    amendoim: { base: '#cf9a5a', streak: '#f3d6a6', label: 'Pasta de amendoim' },
  },
  acai: {
    tradicional: { base: '#4a1352', streak: '#fff1d0', label: 'Tradicional' },
  },
}

function el(tag, attrs = {}, parent) {
  const n = document.createElementNS(NS, tag)
  for (const k in attrs) n.setAttribute(k, attrs[k])
  if (parent) parent.appendChild(n)
  return n
}

// Gerador pseudo-aleatório com semente: o copo sai sempre igual
function rng(seed) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

function wavePath(amp, period = 100) {
  let d = `M-300,0`
  for (let x = -300; x < 700; x += period) {
    d += ` C${x + period * 0.25},${-amp} ${x + period * 0.25},${-amp} ${x + period * 0.5},0`
    d += ` C${x + period * 0.75},${amp} ${x + period * 0.75},${amp} ${x + period},0`
  }
  return d + ' L700,700 L-300,700 Z'
}

export function cupX(y) {
  const t = (y - CUP.top) / (CUP.bottom - CUP.top)
  return [CUP.topL + (CUP.botL - CUP.topL) * t, CUP.topR + (CUP.botR - CUP.topR) * t]
}

const STRAW = 'M0,-18 C9,-27 29,-25 30,-6 C31,11 13,23 0,30 C-13,23 -31,11 -30,-6 C-29,-25 -9,-27 0,-18 Z'
const STRAW_IN = 'M0,-10 C6,-16 19,-15 19,-4 C19,7 9,15 0,19 C-9,15 -19,7 -19,-4 C-19,-15 -6,-16 0,-10 Z'

export function createCup(svg, { id = 'cup', seed = 7 } = {}) {
  const r = rng(seed)
  svg.setAttribute('viewBox', '0 0 400 560')
  svg.setAttribute('overflow', 'visible')
  const defs = el('defs', {}, svg)

  const clipId = `${id}-clip`
  const clip = el('clipPath', { id: clipId }, defs)
  el('path', {
    d: `M${CUP.topL + 3},${CUP.top} L${CUP.topR - 3},${CUP.top} L${CUP.botR + 2},${CUP.bottom - 10} Q${CUP.botR},${CUP.bottom} ${CUP.botR - 10},${CUP.bottom} L${CUP.botL + 10},${CUP.bottom} Q${CUP.botL},${CUP.bottom} ${CUP.botL - 2},${CUP.bottom - 10} Z`,
  }, clip)

  // Sombreado cilíndrico por cima do conteúdo
  const shade = el('linearGradient', { id: `${id}-shade`, x1: 0, x2: 1, y1: 0, y2: 0 }, defs)
  ;[['0', '#000', 0.38], ['0.22', '#000', 0.04], ['0.34', '#fff', 0.16], ['0.42', '#fff', 0.02], ['0.78', '#000', 0.06], ['1', '#000', 0.5]]
    .forEach(([o, c, a]) => el('stop', { offset: o, 'stop-color': c, 'stop-opacity': a }, shade))

  const strawGrad = el('radialGradient', { id: `${id}-straw`, cx: '50%', cy: '40%', r: '65%' }, defs)
  el('stop', { offset: '0', 'stop-color': '#ff8a78' }, strawGrad)
  el('stop', { offset: '0.6', 'stop-color': '#f2373a' }, strawGrad)
  el('stop', { offset: '1', 'stop-color': '#c4142a' }, strawGrad)

  const poGrad = el('linearGradient', { id: `${id}-po`, x1: 0, x2: 0, y1: 0, y2: 1 }, defs)
  el('stop', { offset: '0', 'stop-color': '#fffdf6' }, poGrad)
  el('stop', { offset: '1', 'stop-color': '#f1e2bf' }, poGrad)

  const root = el('g', { class: 'cup-root' }, svg)
  // sombra no chão
  el('ellipse', { cx: 200, cy: 512, rx: 120, ry: 14, fill: '#000', opacity: 0.35, class: 'cup-shadow' }, root)

  // Corpo do copo (plástico) atrás do conteúdo
  el('path', {
    d: `M${CUP.topL},${CUP.top} L${CUP.topR},${CUP.top} L${CUP.botR},${CUP.bottom - 8} Q${CUP.botR - 2},${CUP.bottom + 2} ${CUP.botR - 12},${CUP.bottom + 2} L${CUP.botL + 12},${CUP.bottom + 2} Q${CUP.botL + 2},${CUP.bottom + 2} ${CUP.botL},${CUP.bottom - 8} Z`,
    fill: 'rgba(255,255,255,0.06)', stroke: 'rgba(255,255,255,0.35)', 'stroke-width': 2,
  }, root)

  const content = el('g', { 'clip-path': `url(#${clipId})` }, root)

  // Camadas: desenhadas de cima pra baixo, para a de baixo ficar na frente
  const layers = {}
  const order = [
    ['acai', 9, 1],
    ['recheio', 7, 2],
    ['creme', 6, 3],
  ]
  for (const [name, amp, s] of order) {
    const g = el('g', { class: `layer layer-${name}`, transform: `translate(0 ${LEVELS.empty})` }, content)
    const wave = el('g', { class: 'wave', style: `animation-duration:${2.6 + s * 0.7}s` }, g)
    const body = el('path', { d: wavePath(amp) }, wave)
    // veios de mistura dentro da camada
    const streaks = el('g', { opacity: name === 'acai' ? 0.38 : 0.55 }, g)
    const nStreak = name === 'acai' ? 3 : 4
    for (let i = 0; i < nStreak; i++) {
      const y = 18 + r() * 90
      const x = 40 + r() * 280
      const w = 50 + r() * 110
      el('path', {
        d: `M${x},${y} q${w * 0.3},${-14 - r() * 10} ${w * 0.6},${-2} t${w * 0.4},${8 + r() * 6}`,
        fill: 'none', 'stroke-width': 6 + r() * 10, 'stroke-linecap': 'round',
      }, streaks)
    }
    if (name === 'acai') {
      // bolinhas de creme no açaí, como no copo de verdade
      for (let i = 0; i < 3; i++) el('ellipse', { cx: 110 + i * 85 + r() * 20, cy: 40 + r() * 30, rx: 16 + r() * 8, ry: 11, class: 'blob' }, streaks)
    }
    layers[name] = {
      g, body, streaks, level: LEVELS.empty,
      setLevel(y) {
        if (Math.abs(y - this.level) < 0.05) return
        this.level = y
        g.setAttribute('transform', `translate(0 ${y.toFixed(2)})`)
      },
      setColor({ base, streak }) {
        body.setAttribute('fill', base)
        streaks.querySelectorAll('path').forEach((p) => p.setAttribute('stroke', streak))
        streaks.querySelectorAll('.blob').forEach((p) => p.setAttribute('fill', streak))
      },
    }
  }
  layers.acai.setColor(FLAVORS.acai.tradicional)
  layers.recheio.setColor(FLAVORS.recheio['doce-de-leite'])
  layers.creme.setColor(FLAVORS.creme.ninho)

  el('rect', { x: 0, y: 0, width: 400, height: 560, fill: `url(#${id}-shade)` }, content)

  // Fio de despejo (fica fora do clip para "cair" de cima)
  // some em degradê no alto, para não passar por cima do título
  const fade = el('linearGradient', { id: `${id}-fade`, x1: 0, x2: 0, y1: -60, y2: 70, gradientUnits: 'userSpaceOnUse' }, defs)
  el('stop', { offset: '0', 'stop-color': '#fff', 'stop-opacity': 0 }, fade)
  el('stop', { offset: '1', 'stop-color': '#fff', 'stop-opacity': 1 }, fade)
  const streamMask = el('mask', { id: `${id}-smask`, maskUnits: 'userSpaceOnUse', x: 0, y: -200, width: 400, height: 760 }, defs)
  el('rect', { x: 0, y: -200, width: 400, height: 760, fill: `url(#${id}-fade)` }, streamMask)
  const stream = el('rect', { x: 186, width: 28, rx: 14, y: -80, height: 0, opacity: 0, class: 'stream', mask: `url(#${id}-smask)` }, root)
  el('ellipse', { cx: 200, cy: CUP.top, rx: (CUP.topR - CUP.topL) / 2, ry: 9, fill: 'none', stroke: 'rgba(255,255,255,0.45)', 'stroke-width': 2.5 }, root)

  // Borda e brilhos do plástico na frente
  el('path', { d: `M${CUP.topL + 26},${CUP.top + 22} L${CUP.botL + 18},${CUP.bottom - 26}`, stroke: 'rgba(255,255,255,0.45)', 'stroke-width': 7, 'stroke-linecap': 'round' }, root)
  el('path', { d: `M${CUP.topL + 46},${CUP.top + 30} L${CUP.botL + 32},${CUP.bottom - 120}`, stroke: 'rgba(255,255,255,0.18)', 'stroke-width': 3, 'stroke-linecap': 'round' }, root)

  // Coberturas
  // o grupo é ampliado a partir da borda para a cobertura formar um morro acima do copo
  const top = el('g', { class: 'toppings', transform: 'translate(200 150) scale(1.18 1.5) translate(-200 -150)' }, svg)
  const toppings = {}

  // morangos fatiados em roda, com o leite em pó no meio (como no copo de verdade).
  // A fileira de trás fica atrás do montinho; a da frente, na frente.
  const strawberries = []
  const spots = []
  for (let k = 0; k < 11; k++) {
    const a = (k / 11) * Math.PI * 2 + 0.3
    spots.push([200 + Math.cos(a) * 108, 128 + Math.sin(a) * 24, (r() - 0.5) * 70])
  }
  spots.sort((a, b) => a[1] - b[1])
  const strawsBack = el('g', { class: 'top-morango' }, top)

  // leite em pó: um montinho com textura
  const po = el('g', { class: 'top-po', opacity: 0 }, top)
  const mound = el('path', { d: 'M118,150 C126,112 166,84 200,84 C236,84 274,112 282,150 Z', fill: `url(#${id}-po)` }, po)
  for (let i = 0; i < 80; i++) {
    const a = r() * Math.PI, rr = r()
    el('circle', { cx: 200 + Math.cos(a) * 76 * rr, cy: 148 - Math.sin(a) * 60 * rr, r: 1 + r() * 1.8, fill: r() > 0.5 ? '#fff' : '#ead7ad' }, po)
  }
  toppings.po = { g: po, mound }

  const strawsFront = el('g', { class: 'top-morango' }, top)
  spots.forEach(([x, y, rot], i) => {
    const g = el('g', { class: 'straw' }, y < 128 ? strawsBack : strawsFront)
    const inner = el('g', {}, g)
    el('path', { d: STRAW, fill: `url(#${id}-straw)`, stroke: '#a80f22', 'stroke-width': 1 }, inner)
    el('path', { d: STRAW_IN, fill: '#ffc2b5', opacity: 0.75 }, inner)
    el('path', { d: 'M0,-12 L0,20 M0,0 L-9,-8 M0,0 L9,-8 M0,9 L-8,3 M0,9 L8,3', stroke: '#fff3ee', 'stroke-width': 1.6, 'stroke-linecap': 'round', opacity: 0.85, fill: 'none' }, inner)
    for (let k = 0; k < 10; k++) {
      const a = (k / 10) * Math.PI * 2
      el('ellipse', { cx: Math.cos(a) * 23, cy: Math.sin(a) * 19 + 3, rx: 1.4, ry: 2.2, fill: '#ffe08a', transform: `rotate(${(a * 180) / Math.PI + 90} ${Math.cos(a) * 23} ${Math.sin(a) * 19 + 3})` }, inner)
    }
    strawberries.push({ g, x, y, rot, spin: (r() - 0.5) * 540, i })
  })
  toppings.morango = { g: [strawsBack, strawsFront], items: strawberries }

  // banana
  const banana = el('g', { class: 'top-banana', opacity: 0 }, top)
  ;[[130, 128], [182, 120], [236, 124], [282, 134], [160, 146], [214, 148]].forEach(([x, y]) => {
    const g = el('g', { transform: `translate(${x} ${y}) scale(1 0.72)` }, banana)
    el('circle', { r: 17, fill: '#fbeaa8', stroke: '#e8cd78', 'stroke-width': 2 }, g)
    el('circle', { r: 6, fill: '#f3dc8e' }, g)
    for (let k = 0; k < 3; k++) el('circle', { cx: Math.cos(k * 2.1) * 3, cy: Math.sin(k * 2.1) * 3, r: 1.3, fill: '#8a6a2f' }, g)
  })
  toppings.banana = { g: banana }

  // granola
  const granola = el('g', { class: 'top-granola', opacity: 0 }, top)
  for (let i = 0; i < 46; i++) {
    const x = 110 + r() * 180, y = 112 + r() * 40
    const s = 3 + r() * 5
    el('path', { d: `M${x},${y} l${s},${-s * 0.6} l${s * 0.8},${s * 0.9} l${-s * 1.2},${s * 0.5} Z`, fill: r() > 0.5 ? '#b9813f' : '#8d5a26' }, granola)
  }
  toppings.granola = { g: granola }

  // paçoca
  const pacoca = el('g', { class: 'top-pacoca', opacity: 0 }, top)
  for (let i = 0; i < 30; i++) {
    const x = 110 + r() * 180, y = 108 + r() * 42, s = 4 + r() * 7
    el('rect', { x, y, width: s, height: s * 0.8, rx: 1.5, fill: r() > 0.4 ? '#d9ab6f' : '#c4914f', transform: `rotate(${r() * 90} ${x} ${y})` }, pacoca)
  }
  toppings.pacoca = { g: pacoca }

  // leite condensado: fio por cima de tudo
  const condensado = el('g', { class: 'top-condensado', opacity: 0 }, top)
  el('path', {
    d: 'M96,124 C120,96 140,150 165,118 S205,96 222,128 S262,150 278,116 S300,104 306,126',
    fill: 'none', stroke: '#fffaf0', 'stroke-width': 7, 'stroke-linecap': 'round', 'stroke-linejoin': 'round',
  }, condensado)
  toppings.condensado = { g: condensado }

  // pó caindo (partículas)
  const dust = el('g', { class: 'dust' }, svg)
  const dustItems = []
  for (let i = 0; i < 44; i++) {
    const c = el('circle', { r: 1.6 + r() * 2.2, fill: '#fffaf0', opacity: 0 }, dust)
    dustItems.push({ c, x: 130 + r() * 140, y: 100 + r() * 46, d: r() })
  }

  return {
    svg, root, layers, stream, toppings, dust: dustItems,
    setStream(color, y1, y2, opacity) {
      stream.setAttribute('fill', color)
      stream.setAttribute('y', y1.toFixed(1))
      stream.setAttribute('height', Math.max(0, y2 - y1).toFixed(1))
      stream.setAttribute('opacity', opacity.toFixed(3))
    },
    // pos: 0 (no alto, fora) a 1 (pousado)
    setStraw(item, pos) {
      if (pos <= 0) { item.g.setAttribute('opacity', 0); return }
      const fall = 1 - pos
      const y = item.y - fall * 420
      const rot = item.rot + fall * item.spin
      const sc = 1.12 + 0.12 * Math.sin(Math.min(1, pos) * Math.PI)
      item.g.setAttribute('opacity', Math.min(1, pos * 3).toFixed(2))
      item.g.setAttribute('transform', `translate(${item.x} ${y.toFixed(1)}) rotate(${rot.toFixed(1)}) scale(${sc.toFixed(3)} ${(sc * 0.82).toFixed(3)})`)
    },
    setPo(pos) {
      po.setAttribute('opacity', Math.min(1, pos * 2).toFixed(2))
      po.setAttribute('transform', `translate(200 152) scale(${(0.4 + pos * 0.6).toFixed(3)} ${pos.toFixed(3)}) translate(-200 -152)`)
    },
    setDust(t) {
      for (const p of dustItems) {
        const local = Math.min(1, Math.max(0, (t - p.d * 0.6) / 0.4))
        const y = p.y - (1 - local) * 300
        p.c.setAttribute('cx', p.x.toFixed(1))
        p.c.setAttribute('cy', y.toFixed(1))
        p.c.setAttribute('opacity', local > 0 && local < 1 ? '0.9' : '0')
      }
    },
  }
}

export const ease = {
  inOut: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  out: (t) => 1 - Math.pow(1 - t, 3),
  back: (t) => { const c1 = 1.5, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2) },
}
export const clamp01 = (v) => Math.min(1, Math.max(0, v))
export const seg = (p, a, b) => clamp01((p - a) / (b - a))
