// Gera public/media/qr-zap.svg, o QR code do WhatsApp (rode com: npm run qr)
// Módulos quadrados e o centro livre para a logo, que o site coloca por cima.
const QRCode = require('qrcode')
const fs = require('fs')

const url = 'https://wa.me/5511940454529?text=' + encodeURIComponent('Olá! Quero fazer um pedido.')
const out = require('path').join(__dirname, '../public/media/qr-zap.svg')
const qr = QRCode.create(url, { errorCorrectionLevel: 'H' })
const n = qr.modules.size
const data = qr.modules.data
const q = 2 // margem
const dark = '#120720'
const eye = '#4a1259'

const isFinder = (x, y) => (x < 7 && y < 7) || (x >= n - 7 && y < 7) || (x < 7 && y >= n - 7)
const hole = Math.ceil(n * 0.24) | 1 // lado (ímpar) do quadrado livre no centro
const h0 = (n - hole) / 2
const inHole = (x, y) => x >= h0 && x < h0 + hole && y >= h0 && y < h0 + hole

let dots = ''
for (let y = 0; y < n; y++) {
  const row = []
  for (let x = 0; x < n; x++) row.push(data[y * n + x] && !inHole(x, y) ? 1 : 0)
  // módulos cheios e colados (os leitores leem melhor); vizinhos na linha viram um retângulo só
  for (let x = 0; x < n; ) {
    if (!row[x] || isFinder(x, y)) { x++; continue }
    let len = 1
    while (x + len < n && row[x + len] && !isFinder(x + len, y)) len++
    dots += `M${x + q} ${y + q}h${len}v1h-${len}z`
    x += len
  }
}
// olhos quadrados: com cantos arredondados alguns leitores não acham o código
const eyes = [[0, 0], [n - 7, 0], [0, n - 7]].map(([x, y]) =>
  `<path fill="${eye}" fill-rule="evenodd" d="M${x + q} ${y + q}h7v7h-7zM${x + q + 1} ${y + q + 1}v5h5v-5zM${x + q + 2} ${y + q + 2}h3v3h-3z"/>`
).join('')
const s = n + q * 2
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${s} ${s}" shape-rendering="crispEdges"><rect width="${s}" height="${s}" fill="#fff"/><path fill="${dark}" d="${dots}"/>${eyes}</svg>\n`
fs.writeFileSync(out, svg)
console.log({ url, n, version: qr.version, hole, bytes: svg.length })
