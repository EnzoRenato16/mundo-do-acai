import './style.css'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { createCup, LEVELS, FLAVORS, ease, seg } from './cup.js'

gsap.registerPlugin(ScrollTrigger)

const LINKS = {
  instagram: 'https://www.instagram.com/mundodoacaiofc.pirituba/',
  maps: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('Rua Cinco, 123 - Vila Renato, São Paulo - SP'),
  mapEmbed: 'https://maps.google.com/maps?q=' + encodeURIComponent('Rua Cinco, 123 - Vila Renato, São Paulo - SP') + '&z=16&output=embed',
}

// Links de cada loja nos apps de delivery (as duas ficam no mesmo endereço)
const LOJAS = {
  'loja-1': {
    ifood: 'https://www.ifood.com.br/delivery/sao-paulo-sp/mundo-do-acai-vila-zat/38a321b8-ddf2-421d-86bf-d53a09af7a5e',
    food99: 'https://oia.99app.com/dlp9/6sR4Oq',
    keeta: 'https://url-eu.mykeeta.com/9qhQYMCz',
  },
  'loja-2': {
    ifood: 'https://www.ifood.com.br/delivery/sao-paulo-sp/mundo-do-acai---loja-2-vila-renato/2ffd0816-3c32-458c-a993-070495424887',
    food99: 'https://oia.99app.com/dlp9/3Xd1o4',
    keeta: 'https://url-eu.mykeeta.com/kqPCyKYz',
  },
}

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const $ = (s, r = document) => r.querySelector(s)
const $$ = (s, r = document) => [...r.querySelectorAll(s)]

// a página sempre recomeça do topo, para a história do scroll fazer sentido
if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
if (!location.hash) window.scrollTo(0, 0)

// ---------- Links ----------
$$('[data-link]').forEach((a) => { a.href = LINKS[a.dataset.link] })
$('[data-map]').src = LINKS.mapEmbed

// Botões dos apps seguem a loja escolhida (e o site lembra a escolha)
const lojas = $('[data-lojas]')
function setLoja(loja) {
  $$('[data-app]').forEach((a) => {
    a.href = LOJAS[loja][a.dataset.app]
    a.setAttribute('aria-label', `Pedir no ${a.querySelector('.app-name').textContent}, ${loja === 'loja-1' ? 'loja 1' : 'loja 2'}`)
  })
}
let lojaSalva = null
try { lojaSalva = localStorage.getItem('loja') } catch {}
if (LOJAS[lojaSalva]) lojas.querySelector(`input[value="${lojaSalva}"]`).checked = true
setLoja(lojas.querySelector('input:checked').value)
lojas.addEventListener('change', (e) => {
  setLoja(e.target.value)
  try { localStorage.setItem('loja', e.target.value) } catch {}
  if (!reduced) gsap.fromTo('.app', { y: 0 }, { y: -8, duration: 0.16, yoyo: true, repeat: 1, stagger: 0.05, ease: 'power2.out' })
})

// ---------- Scroll suave ----------
let lenis = null
if (!reduced) {
  lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1, touchMultiplier: 1.2 })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((t) => lenis.raf(t * 1000))
  gsap.ticker.lagSmoothing(0)
  if (import.meta.env.DEV) window.__lenis = lenis
}
$$('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href')
    const target = id.length > 1 && $(id)
    if (!target) return
    e.preventDefault()
    closeMenu()
    if (lenis) lenis.scrollTo(target, { duration: 1.4 })
    else target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' })
    history.replaceState(null, '', id)
  })
})

// ---------- Navegação ----------
const nav = $('[data-nav]')
const toggle = $('.nav-toggle')
const menu = $('#menu')
function closeMenu() {
  menu.classList.remove('is-open')
  toggle.setAttribute('aria-expanded', 'false')
  toggle.setAttribute('aria-label', 'Abrir menu')
}
toggle.addEventListener('click', () => {
  const open = !menu.classList.contains('is-open')
  menu.classList.toggle('is-open', open)
  toggle.setAttribute('aria-expanded', String(open))
  toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu')
})
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu() })

let lastY = 0
const mobileCta = $('.mobile-cta')
function onScroll() {
  const y = window.scrollY
  nav.classList.toggle('is-solid', y > 40)
  nav.classList.toggle('is-hidden', y > lastY && y > window.innerHeight * 0.8 && !menu.classList.contains('is-open'))
  lastY = y
}
window.addEventListener('scroll', onScroll, { passive: true })
onScroll()

$$('.nav-links a').forEach((a) => {
  const sec = $(a.getAttribute('href'))
  ScrollTrigger.create({
    trigger: sec, start: 'top 50%', end: 'bottom 50%',
    onToggle: (self) => a.classList.toggle('is-active', self.isActive),
  })
})

// Barra fixa no celular: aparece depois do hero, some na seção de apps
ScrollTrigger.create({ trigger: '.hero', start: 'bottom 60%', onEnter: () => mobileCta.classList.add('is-on'), onLeaveBack: () => mobileCta.classList.remove('is-on') })
ScrollTrigger.create({ trigger: '#pedir', start: 'top 80%', end: 'bottom 20%', onToggle: (s) => mobileCta.classList.toggle('is-on', !s.isActive && window.scrollY > window.innerHeight * 0.6) })

// ---------- Shaders (WebGPU) ----------
// Só no computador: no celular o fundo em CSS da seção de apps já basta e a página fica leve.
// A biblioteca é grande, então carrega à parte e não segura o resto da página.
if (!reduced && window.matchMedia('(pointer: fine) and (min-width: 861px)').matches) {
  import('./shader-bg.js').then(({ mountShader }) => mountShader($('[data-shader="pedir"]'), 'pedir'))
}

// ---------- História: "Existe açaí. E existe… Mundo do Açaí." e o holofote acende ----------
if (!reduced) {
  const out = { opacity: 0, filter: 'blur(14px)', y: -24, ease: 'power2.in' }
  const hidden = { opacity: 0, filter: 'blur(14px)', y: 24 }
  const shown = { opacity: 1, filter: 'blur(0px)', y: 0, ease: 'power2.out' }
  const tl = gsap.timeline({
    defaults: { duration: 0.1 },
    scrollTrigger: {
      trigger: '.historia', start: 'top top', end: 'bottom bottom', scrub: 0.7,
      onUpdate: (s) => { $('.historia-progress span').style.transform = `scaleX(${s.progress})` },
    },
  })
  tl.set('.h-line-2', hidden, 0)
    .set('.h-line-3', { opacity: 1 }, 0)
    .set('.h-line-3 span', hidden, 0)
    .fromTo('.h-line-1', { scale: 0.94 }, { scale: 1, duration: 0.2, ease: 'none' }, 0)
    .to('.h-line-1', out, 0.22)
    .to('.h-line-2', shown, 0.32)
    .to('.h-line-2', out, 0.5)
    // a luz acende de cima pra baixo e o copo aparece
    .fromTo('.spot', { opacity: 0, scaleY: 0.4 }, { opacity: 1, scaleY: 1, duration: 0.16, ease: 'power3.out' }, 0.54)
    .to('.spot-glow', { opacity: 1, duration: 0.2, ease: 'power2.out' }, 0.56)
    .to('.spot-dust', { opacity: 1, duration: 0.2 }, 0.6)
    .to('.floor', { opacity: 1, duration: 0.16 }, 0.58)
    .fromTo('.copo', { filter: 'brightness(0.55)' }, { filter: 'brightness(1.06)', duration: 0.18, ease: 'power2.out' }, 0.55)
    .fromTo('.stage', { scale: 0.93 }, { scale: 1, duration: 0.3, ease: 'power2.out' }, 0.55)
    .to('.h-line-3 span', { ...shown, stagger: 0.06 }, 0.64)
    .fromTo('.h-line-3 .hl', { scale: 0.8 }, { scale: 1, duration: 0.12, ease: 'back.out(3)' }, 0.76)
    .to('.stage', { y: -14, duration: 0.14, ease: 'none' }, 0.86)
}

// ---------- Camadas: o copo enche com o scroll ----------
const cup = createCup($('[data-cup="scroll"]'), { id: 'scrollcup' })
const PHASES = [
  { name: 'creme', from: LEVELS.empty, a: 0.06, b: 0.26, word: 'Creme', glow: '255, 241, 208' },
  { name: 'recheio', from: LEVELS.creme + 16, a: 0.28, b: 0.48, word: 'Recheio', glow: '214, 140, 66' },
  { name: 'acai', from: LEVELS.recheio + 16, a: 0.5, b: 0.7, word: 'Açaí', glow: '160, 77, 255' },
]
const TOP = { a: 0.72, b: 0.9, word: 'Cobertura', glow: '240, 65, 63' }
const pin = $('.camadas-pin')
const wordEl = $('[data-word]')
const steps = $$('.camadas-steps li')
const done = $('.camadas-done')
let lastStep = -2

function renderCup(p) {
  // entrada do copo
  const enter = ease.out(seg(p, 0, 0.06))
  cup.root.style.opacity = 0.35 + enter * 0.65
  cup.root.style.transform = `translateY(${(1 - enter) * 24}px)`

  let pouring = null
  for (const ph of PHASES) {
    const t = seg(p, ph.a, ph.b)
    const layer = cup.layers[ph.name]
    const level = p < ph.a ? LEVELS.empty : ph.from + (LEVELS[ph.name] - ph.from) * ease.inOut(t)
    layer.setLevel(level)
    if (t > 0 && t < 1) pouring = { t, level, color: layer.body.getAttribute('fill') }
  }
  if (pouring) {
    const { t, level, color } = pouring
    const y2 = -140 + (level + 140) * ease.out(seg(t, 0, 0.14))
    const y1 = -140 + (level + 140) * ease.inOut(seg(t, 0.82, 1))
    cup.setStream(color, y1, y2, 1)
  } else cup.setStream('#fff', 0, 0, 0)

  const tt = seg(p, TOP.a, TOP.b)
  cup.setPo(ease.out(seg(tt, 0, 0.45)))
  cup.setDust(seg(tt, 0, 0.6))
  const items = cup.toppings.morango.items
  items.forEach((it, i) => {
    const start = (((i * 7) % items.length) / items.length) * 0.6
    cup.setStraw(it, ease.back(seg(tt, start, start + 0.32)))
  })

  // passo atual (0..3), -1 antes de começar
  let step = -1
  if (p >= PHASES[0].a) step = 0
  if (p >= PHASES[1].a) step = 1
  if (p >= PHASES[2].a) step = 2
  if (p >= TOP.a) step = 3
  if (step !== lastStep) {
    lastStep = step
    steps.forEach((li, i) => {
      li.classList.toggle('is-on', i <= step)
      li.classList.toggle('is-now', i === step)
      li.classList.toggle('is-done', i < step)
    })
    const info = step === 3 ? TOP : PHASES[Math.max(0, step)]
    pin.style.setProperty('--glow', info.glow)
    if (wordEl.textContent !== info.word) {
      gsap.fromTo(wordEl, { yPercent: 40, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.6, ease: 'expo.out' })
      wordEl.textContent = info.word
    }
  }
  done.classList.toggle('is-on', p > 0.93)
}

if (reduced) renderCup(1)
else {
  renderCup(0)
  ScrollTrigger.create({ trigger: '.camadas', start: 'top top', end: 'bottom bottom', onUpdate: (s) => renderCup(s.progress) })
}

// ---------- Toda hora: painéis na horizontal ----------
if (!reduced) {
  const track = $('.horas-track')
  const slide = gsap.to(track, {
    x: () => -(track.scrollWidth - window.innerWidth),
    ease: 'none',
    scrollTrigger: { trigger: '.horas', start: 'top top', end: 'bottom bottom', scrub: 0.6, invalidateOnRefresh: true },
  })
  $$('.hora').forEach((panel, i) => {
    const title = $('.hora-title', panel)
    const ico = $('.hora-ico, .hora-final-art', panel)
    const from = i === 0 ? null : { containerAnimation: slide, trigger: panel, start: 'left 75%', end: 'left 15%', scrub: true }
    if (!from) return
    gsap.fromTo(title, { scale: 0.55, rotate: -8, opacity: 0 }, { scale: 1, rotate: 0, opacity: 1, ease: 'back.out(2)', scrollTrigger: from })
    if (ico) gsap.fromTo(ico, { y: 80, opacity: 0 }, { y: 0, opacity: 1, ease: 'power2.out', scrollTrigger: { ...from } })
  })
}

// ---------- Monte o seu ----------
const bcup = createCup($('[data-cup="builder"]'), { id: 'buildcup', seed: 11 })
bcup.layers.creme.setLevel(LEVELS.creme)
bcup.layers.recheio.setLevel(LEVELS.recheio)
bcup.layers.acai.setLevel(LEVELS.acai)
bcup.toppings.morango.items.forEach((it) => bcup.setStraw(it, 1))
bcup.setPo(1)
const groups = (key) => [].concat(bcup.toppings[key].g)
Object.keys(bcup.toppings).forEach((k) => groups(k).forEach((g) => g.setAttribute('opacity', 1)))

const form = $('[data-builder]')
const resumo = $('[data-resumo]')
const wrap = $('.monte-cup-wrap')
const sizeLabel = $('[data-size-label]')
const NOMES = { morango: 'morango', po: 'leite em pó', banana: 'banana', granola: 'granola', pacoca: 'paçoca', condensado: 'leite condensado' }
const juntar = (arr) => (arr.length < 2 ? arr.join('') : `${arr.slice(0, -1).join(', ')} e ${arr.at(-1)}`)
let pedido = ''

function updateBuilder() {
  const fd = new FormData(form)
  const tamanho = fd.get('tamanho')
  const creme = fd.get('creme')
  const recheio = fd.get('recheio')
  const coberturas = fd.getAll('cobertura')

  wrap.dataset.size = tamanho
  sizeLabel.textContent = `${tamanho} ml`
  bcup.layers.creme.setColor(FLAVORS.creme[creme])
  bcup.layers.recheio.setColor(FLAVORS.recheio[recheio])
  for (const key of Object.keys(NOMES)) groups(key).forEach((g) => g.classList.toggle('is-off', !coberturas.includes(key)))

  const cremeNome = FLAVORS.creme[creme].label
  const recheioNome = FLAVORS.recheio[recheio].label.toLowerCase()
  const cob = coberturas.map((c) => NOMES[c])
  resumo.textContent = `Açaí de ${tamanho} ml com creme de ${cremeNome}, recheio de ${recheioNome}` + (cob.length ? ` e cobertura de ${juntar(cob)}.` : ', sem cobertura.')
  pedido = `Olá! Quero um ${resumo.textContent.charAt(0).toLowerCase()}${resumo.textContent.slice(1)}`
}
form.addEventListener('change', (e) => {
  updateBuilder()
  // um pulinho no copo a cada escolha
  if (!reduced) gsap.fromTo('.cup-builder', { y: 0 }, { y: -10, duration: 0.18, yoyo: true, repeat: 1, ease: 'power2.out' })
  if (e.target.name === 'cobertura' && e.target.checked && !reduced) {
    gsap.fromTo(groups(e.target.value), { y: -60 }, { y: 0, duration: 0.7, ease: 'bounce.out', clearProps: 'transform' })
  }
})
updateBuilder()

const toast = $('[data-toast]')
let toastTimer
function showToast(msg) {
  toast.textContent = msg
  toast.classList.add('is-on')
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => toast.classList.remove('is-on'), 2800)
}
$('[data-copy]').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(pedido)
  } catch {
    const ta = Object.assign(document.createElement('textarea'), { value: pedido })
    document.body.append(ta); ta.select(); document.execCommand('copy'); ta.remove()
  }
  showToast('Pedido copiado. Agora é só colar no app.')
})

// ---------- Vídeos do Instagram ----------
const reels = $$('[data-reel]')
reels.forEach((v) => {
  const btn = v.parentElement.querySelector('.reel-sound')
  btn.addEventListener('click', () => {
    const turnOn = v.muted
    reels.forEach((o) => { o.muted = true; o.parentElement.querySelector('.reel-sound').setAttribute('aria-pressed', 'false') })
    v.muted = !turnOn
    btn.setAttribute('aria-pressed', String(turnOn))
    btn.setAttribute('aria-label', turnOn ? 'Desligar som' : 'Ligar som')
    if (turnOn) v.play().catch(() => {})
  })
})
if (reduced) reels.forEach((v) => { v.controls = true })
else {
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      const v = e.target
      if (e.isIntersecting) { v.preload = 'auto'; v.play().catch(() => {}) }
      else v.pause()
    }
  }, { threshold: 0.5 })
  reels.forEach((v) => io.observe(v))
}

// ---------- Hero: entrada e movimento ----------
const heroArt = $('[data-tilt]')
function heroIntro() {
  if (reduced) return
  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })
  tl.from('.hero-title .line > span', { yPercent: 115, rotate: 4, duration: 1.1, stagger: 0.09 })
    .from('.hero-art', { scale: 0.6, opacity: 0, duration: 1.4, ease: 'back.out(1.6)' }, 0.1)
    .from('.hero .eyebrow, .hero-sub, .hero-ctas', { y: 24, opacity: 0, duration: 0.9, stagger: 0.08 }, 0.35)
    // as frutinhas "explodem" do planeta até a órbita
    .fromTo(orbit, { spread: 0 }, { spread: 1, duration: 1.8, ease: 'expo.out' }, 0.5)
}

// ---------- Hero: órbita ao redor do planeta ----------
// Cada item anda numa elipse inclinada como o anel da logo. Na metade de trás
// passa por trás do planeta (z-index menor), fica menor e mais apagado.
const orbs = $$('[data-orb]').map((el, i) => ({ el, phase: (i / 6) * Math.PI * 2, speed: 0.32 + (i % 3) * 0.05, wobble: 0.04 + (i % 2) * 0.05 }))
const orbit = { spread: reduced ? 1 : 0, w: 0, h: 0, running: true }
const TILT = (-12 * Math.PI) / 180
function measureOrbit() { orbit.w = heroArt.clientWidth; orbit.h = heroArt.clientHeight }
function renderOrbit(time) {
  const cx = orbit.w * 0.5, cy = orbit.h * 0.31
  const rx = orbit.w * 0.627 * orbit.spread, ry = orbit.h * 0.167 * orbit.spread
  for (const o of orbs) {
    const a = o.phase + time * o.speed
    const x0 = Math.cos(a) * rx, y0 = Math.sin(a) * ry * (1 + Math.sin(time * 1.3 + o.phase) * o.wobble)
    const x = cx + x0 * Math.cos(TILT) - y0 * Math.sin(TILT)
    const y = cy + x0 * Math.sin(TILT) + y0 * Math.cos(TILT)
    const depth = Math.sin(a) // > 0: metade da frente
    const s = 0.72 + 0.28 * (depth + 1) / 2
    o.el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) scale(${s.toFixed(3)}) rotate(${((a * 180) / Math.PI).toFixed(0)}deg)`
    o.el.style.opacity = (0.55 + 0.45 * (depth + 1) / 2).toFixed(2)
    const z = depth > 0 ? '3' : '1'
    if (o.el.style.zIndex !== z) o.el.style.zIndex = z
  }
}
measureOrbit()
window.addEventListener('resize', measureOrbit)
if (reduced) renderOrbit(0)
else {
  gsap.ticker.add((time) => { if (orbit.running) renderOrbit(time) })
  // para de calcular quando o hero sai da tela
  new IntersectionObserver(([e]) => { orbit.running = e.isIntersecting }).observe($('.hero'))
}
if (!reduced) {
  const rx = gsap.quickTo(heroArt, 'rotationX', { duration: 0.8, ease: 'power3.out' })
  const ry = gsap.quickTo(heroArt, 'rotationY', { duration: 0.8, ease: 'power3.out' })
  $('.hero').addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return
    const r = heroArt.getBoundingClientRect()
    ry(((e.clientX - (r.left + r.width / 2)) / r.width) * 18)
    rx((-(e.clientY - (r.top + r.height / 2)) / r.height) * 14)
  })
  gsap.to('.hero-art', { yPercent: 18, scale: 0.9, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } })
  gsap.to('.hero-copy', { yPercent: -12, opacity: 0.2, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'center top', end: 'bottom top', scrub: true } })

  // Faixa: anda sozinha e acelera com o scroll
  const track = $('[data-marquee]')
  let x = 0, boost = 0
  ScrollTrigger.create({ trigger: '.marquee', start: 'top bottom', end: 'bottom top', onUpdate: (s) => { boost = Math.min(12, Math.abs(s.getVelocity()) / 220) } })
  gsap.ticker.add(() => {
    const third = track.scrollWidth / 3
    x -= 1 + boost
    boost *= 0.92
    if (-x >= third) x += third
    track.style.transform = `translate3d(${x}px,0,0)`
  })

  // Entradas suaves nas seções de baixo
  $$('.monte-panel > *, .psiu, #pedir-title, .pedir .lead, .app, .reels-head, .reel, .onde-copy > *, .onde-map, .footer-big').forEach((el) => {
    gsap.from(el, { y: 36, opacity: 0, duration: 0.9, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } })
  })
}

// ---------- Carregamento ----------
const bar = $('.loader-bar span')
const decode = (src) => { const img = new Image(); img.src = src; return img.decode().catch(() => {}) }
async function boot() {
  let n = 0
  const tasks = [document.fonts.ready, decode('media/logo.webp'), decode('media/copo.webp')]
    .map((p) => p.then(() => { n++; bar.style.width = `${Math.round((n / 3) * 100)}%` }))
  await Promise.race([Promise.all(tasks), new Promise((r) => setTimeout(r, 2500))])
  document.documentElement.classList.add('is-loaded')
  heroIntro()
  ScrollTrigger.refresh()
}
boot()
