# Site Mundo do Açaí

## Rodar no computador

```bash
npm install
npm run dev
```

Abre em http://localhost:5173

## Gerar a versão para publicar

```bash
npm run build
```

A pasta `dist/` é o site pronto.

## Publicado no GitHub Pages

O site está em https://enzorenato16.github.io/mundo-do-acai/ e é servido pela branch `gh-pages` do repositório https://github.com/EnzoRenato16/mundo-do-acai.

Para publicar uma alteração (dentro da pasta `site`):

```bash
npm run build
cd dist && git add -A && git commit -m "Atualiza o site" && git push origin gh-pages
```

O GitHub leva de 1 a 2 minutos para mostrar a versão nova.

## O que trocar antes de publicar

- **Links dos apps**: já estão com a Loja 1 e a Loja 2 (as duas no mesmo endereço) em `src/main.js`, no objeto `LOJAS`. Se algum mudar, é só trocar lá.
- **Cardápio do "Monte o seu"**: os cremes, recheios e coberturas são exemplos. Os nomes ficam em `index.html` (seção `#monte`) e as cores em `src/cup.js` (`FLAVORS`).
- **Endereço**: confira se o pino do mapa caiu no lugar certo.

## Onde fica cada coisa

- `src/cup.js`: o copo em SVG que enche camada por camada.
- `src/shader-bg.js`: os fundos animados em WebGPU (biblioteca Shaders). Em navegador sem WebGPU, aparece um fundo em CSS no lugar.
- `public/media/copo.webp`: o copo recortado do vídeo "premium", usado na cena do holofote ("Existe açaí… Mundo do Açaí.").
