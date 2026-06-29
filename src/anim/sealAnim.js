/**
 * Datos de animación Lottie para el sello de cera.
 * Canvas 100×100, centro (50,50), 60fps, 100 frames.
 *
 * Segmentos:
 *   0 → 40 : ABRIR  (sello se rompe y sale volando)
 *  50 → 90 : CERRAR (fragmentos convergen, sello se reforma)
 *
 * Uso:
 *   lottieRef.current.playSegments([0,  40], true)  // abrir
 *   lottieRef.current.playSegments([50, 90], true)  // cerrar
 */

// ── Paleta (Herald) — valores RGBA normalizados (0-1) ─────────────────────────
const CS  = [0.557, 0.129, 0.102, 1]  // #8E211A — cuerpo del sello
const CR  = [0.714, 0.227, 0.180, 1]  // #B63A2E — relieve interior
const CG  = [0.831, 0.416, 0.176, 1]  // #D46A2D — destello de brasa
const CA  = [0.722, 0.580, 0.290, 1]  // #B8944A — acento dorado (emblema)
const CCR = [1.000, 0.950, 0.820, 1]  // crema — grietas

// ── Helpers de easing ─────────────────────────────────────────────────────────
// En Lottie, escala/opacidad/rotación usan arrays; posición usa números.
const ei  = (x=0.5) => ({ x:[x], y:[1] })    // in-handle (arrays)
const eo  = (x=0.5) => ({ x:[x], y:[0] })    // out-handle (arrays)
const eip = (x=0.5) => ({ x, y:1  })          // in-handle posición (números)
const eop = (x=0.5) => ({ x, y:0  })          // out-handle posición

// ── Formas base ───────────────────────────────────────────────────────────────

// Blob irregular (12 vértices) centrado en (0,0) — el sello
const BLOB_V = [
  [34,0],[28,16],[16,29],[0,33],[-17,28],[-28,15],
  [-34,0],[-28,-17],[-16,-30],[0,-32],[17,-30],[28,-16]
]
const Z12 = Array(12).fill([0,0])

const blobPath = {
  ty:'sh', nm:'blob',
  ks:{ a:0, k:{ i:Z12, o:Z12, v:BLOB_V, c:true } }
}

// Triángulos — fragmentos de cera
const tri1 = { ty:'sh', nm:'t', ks:{ a:0, k:{ i:[[0,0],[0,0],[0,0]], o:[[0,0],[0,0],[0,0]], v:[[-5,-7],[5,-4],[1,8]], c:true } } }
const tri2 = { ty:'sh', nm:'t', ks:{ a:0, k:{ i:[[0,0],[0,0],[0,0]], o:[[0,0],[0,0],[0,0]], v:[[-4,-7],[6,-2],[-1,8]], c:true } } }
const tri3 = { ty:'sh', nm:'t', ks:{ a:0, k:{ i:[[0,0],[0,0],[0,0]], o:[[0,0],[0,0],[0,0]], v:[[-6,-5],[3,-5],[4,7]], c:true } } }

// Silhoueta del emblema (farol+lanza combinados como un path)
const EMBLEM_V = [
  [0,-22],[3,-18],[6,-16],[6,-15],[4,-15],
  [4,-1],[-4,-1],[-4,-15],[-6,-15],[-6,-16],[-3,-18]
]
const Z11 = Array(11).fill([0,0])

const emblemPath = {
  ty:'sh', nm:'emblem',
  ks:{ a:0, k:{ i:Z11, o:Z11, v:EMBLEM_V, c:true } }
}

// ── Helpers de capas ──────────────────────────────────────────────────────────
const fl = (c, op=100) => ({ ty:'fl', nm:'fill',   c:{a:0,k:c}, o:{a:0,k:op}, r:1 })
const st = (c, w=1.5)  => ({ ty:'st', nm:'stroke', c:{a:0,k:c}, o:{a:0,k:100}, w:{a:0,k:w}, lc:2, lj:2 })
const gr = (nm, ...it) => ({ ty:'gr', nm, it })
const el = (rx, ry)    => ({ ty:'el', nm:'circle', s:{a:0,k:[rx*2,ry*2]}, p:{a:0,k:[0,0]} })

// ── Transform keyframes del cuerpo del sello ──────────────────────────────────
// Apertura (0→22): pulso → rompe y sube
// Cierre (70→90): baja y reforma con overshoot

const sealBodyKs = {
  o:{ a:1, k:[
    // APERTURA
    {i:ei(),o:eo(),t:0,  s:[100]},
    {i:ei(),o:eo(),t:12, s:[100]},
    {i:ei(),o:eo(),t:22, s:[0]},
    // GAP invisible
    {i:ei(),o:eo(),t:40, s:[0]},
    {i:ei(),o:eo(),t:70, s:[0]},
    // CIERRE
    {i:ei(),o:eo(),t:74, s:[100]},
    {t:100, s:[100]}
  ]},
  r:{ a:0, k:0 },
  p:{ a:1, k:[
    // APERTURA: centro → sube
    {i:eip(),o:eop(),t:0,  s:[50,50,0]},
    {i:eip(),o:eop(),t:8,  s:[50,50,0]},
    {i:eip(),o:eop(),t:22, s:[50,14,0]},
    // GAP
    {i:eip(),o:eop(),t:40, s:[50,14,0]},
    {i:eip(),o:eop(),t:70, s:[50,14,0]},
    // CIERRE: baja al centro con overshoot
    {i:eip(0.25),o:eop(0.75),t:82, s:[50,52,0]},
    {i:eip(0.5), o:eop(0.5), t:88, s:[50,49,0]},
    {t:100, s:[50,50,0]}
  ]},
  a:{ a:0, k:[0,0,0] },
  s:{ a:1, k:[
    // APERTURA: pulso → rompe
    {i:ei(),o:eo(),t:0,  s:[100,100,100]},
    {i:ei(),o:eo(),t:6,  s:[115,115,100]},
    {i:ei(),o:eo(),t:22, s:[5,5,100]},
    // GAP
    {i:ei(),o:eo(),t:40, s:[5,5,100]},
    {i:ei(),o:eo(),t:70, s:[5,5,100]},
    // CIERRE: crece con overshoot → asienta
    {i:ei(0.25),o:eo(0.75),t:80, s:[122,122,100]},
    {i:ei(0.5), o:eo(0.5), t:88, s:[94,94,100]},
    {t:100, s:[100,100,100]}
  ]}
}

// Relieve (mismo timing, opacidad reducida)
const sealReliefKs = {
  o:{ a:1, k:[
    {i:ei(),o:eo(),t:0,  s:[55]},
    {i:ei(),o:eo(),t:12, s:[55]},
    {i:ei(),o:eo(),t:22, s:[0]},
    {i:ei(),o:eo(),t:70, s:[0]},
    {i:ei(),o:eo(),t:74, s:[55]},
    {t:100, s:[55]}
  ]},
  r:{ a:0, k:0 },
  p: sealBodyKs.p,
  a:{ a:0, k:[0,0,0] },
  s: sealBodyKs.s
}

// Emblema (mismo timing, opacidad más baja)
const sealEmblemKs = {
  o:{ a:1, k:[
    {i:ei(),o:eo(),t:0,  s:[60]},
    {i:ei(),o:eo(),t:10, s:[60]},
    {i:ei(),o:eo(),t:22, s:[0]},
    {i:ei(),o:eo(),t:70, s:[0]},
    {i:ei(),o:eo(),t:74, s:[60]},
    {t:100, s:[60]}
  ]},
  r:{ a:0, k:0 },
  p: sealBodyKs.p,
  a:{ a:0, k:[0,0,0] },
  s: sealBodyKs.s
}

// Destello de brasa
const glowKs = {
  o:{ a:1, k:[
    {i:ei(),o:eo(),t:0,  s:[0]},
    {i:ei(),o:eo(),t:6,  s:[0]},
    {i:ei(),o:eo(),t:9,  s:[55]},
    {i:ei(),o:eo(),t:18, s:[0]},
    {i:ei(),o:eo(),t:69, s:[0]},
    {i:ei(),o:eo(),t:73, s:[40]},
    {t:82, s:[0]}
  ]},
  r:{ a:0, k:0 },
  p:{ a:0, k:[50,50,0] },
  a:{ a:0, k:[0,0,0] },
  s:{ a:1, k:[
    {i:ei(),o:eo(),t:6,  s:[80,80,100]},
    {i:ei(),o:eo(),t:18, s:[140,140,100]},
    {i:ei(),o:eo(),t:69, s:[80,80,100]},
    {t:82, s:[130,130,100]}
  ]}
}

// Grieta 1: de (0,0) a (-22,-26)
const crack1Ks = {
  o:{ a:1, k:[
    {i:ei(),o:eo(),t:4,  s:[0]},
    {i:ei(),o:eo(),t:7,  s:[85]},
    {t:16, s:[0]}
  ]},
  r:{a:0,k:0}, p:{a:0,k:[50,50,0]}, a:{a:0,k:[0,0,0]}, s:{a:0,k:[100,100,100]}
}
// Grieta 2: de (0,0) a (24,-20)
const crack2Ks = { ...crack1Ks }

// ── Keyframes de fragmentos ───────────────────────────────────────────────────
// Posiciones de destino en el canvas (100×100):
// frag1 → esquina superior izquierda  [8, 5]
// frag2 → esquina superior derecha    [94, 8]
// frag3 → zona inferior               [28, 95]

function fragKs(dest, endRot, closeStart) {
  return {
    o:{ a:1, k:[
      // APERTURA: aparece → se desvanece
      {i:ei(),o:eo(),t:8,  s:[100]},
      {i:ei(),o:eo(),t:24, s:[80]},
      {i:ei(),o:eo(),t:38, s:[0]},
      // GAP
      {i:ei(),o:eo(),t:50, s:[0]},
      // CIERRE: aparece convergiendo → desaparece al centro
      {i:ei(),o:eo(),t:closeStart,    s:[0]},
      {i:ei(),o:eo(),t:closeStart+4,  s:[85]},
      {i:ei(),o:eo(),t:closeStart+22, s:[80]},
      {t:closeStart+26, s:[0]}
    ]},
    r:{ a:1, k:[
      {i:ei(),o:eo(),t:8,  s:[0]},
      {i:ei(),o:eo(),t:38, s:[endRot]},
      {i:ei(),o:eo(),t:50, s:[endRot]},
      {t:closeStart+26, s:[0]}
    ]},
    p:{ a:1, k:[
      // APERTURA: centro → destino
      {i:eip(),o:eop(),t:8,  s:[50,50,0]},
      {i:eip(),o:eop(),t:38, s:[dest[0],dest[1],0]},
      // GAP
      {i:eip(),o:eop(),t:50, s:[dest[0],dest[1],0]},
      // CIERRE: destino → centro
      {i:eip(0.3),o:eop(0.7),t:closeStart+26, s:[50,50,0]}
    ]},
    a:{ a:0, k:[0,0,0] },
    s:{ a:0, k:[100,100,100] }
  }
}

// ── Construcción de capas ─────────────────────────────────────────────────────
// El primer elemento del array es la capa más arriba (frontmost).

const layers = [
  // ① Destello de brasa
  {
    ddd:0, ind:1, ty:4, nm:'glow_flash', sr:1,
    ks: glowKs, ao:0,
    shapes:[ gr('g', el(40,40), fl(CG)) ],
    ip:0, op:100, st:0, bm:0
  },

  // ② Grieta 1
  {
    ddd:0, ind:2, ty:4, nm:'crack1', sr:1,
    ks: crack1Ks, ao:0,
    shapes:[ gr('c',
      { ty:'sh', nm:'l', ks:{ a:0, k:{ i:[[0,0],[0,0]], o:[[0,0],[0,0]], v:[[0,0],[-22,-26]], c:false } } },
      st(CCR, 2.2)
    )],
    ip:0, op:40, st:0, bm:0
  },

  // ③ Grieta 2
  {
    ddd:0, ind:3, ty:4, nm:'crack2', sr:1,
    ks: crack2Ks, ao:0,
    shapes:[ gr('c',
      { ty:'sh', nm:'l', ks:{ a:0, k:{ i:[[0,0],[0,0]], o:[[0,0],[0,0]], v:[[0,0],[24,-20]], c:false } } },
      st(CCR, 2.2)
    )],
    ip:0, op:40, st:0, bm:0
  },

  // ④ Fragmento 1 (esquina sup-izq)
  {
    ddd:0, ind:4, ty:4, nm:'frag1', sr:1,
    ks: fragKs([8,5], 65, 50), ao:0,
    shapes:[ gr('f', tri1, fl(CS)) ],
    ip:8, op:100, st:0, bm:0
  },

  // ⑤ Fragmento 2 (esquina sup-der)
  {
    ddd:0, ind:5, ty:4, nm:'frag2', sr:1,
    ks: fragKs([94,8], -50, 50), ao:0,
    shapes:[ gr('f', tri2, fl(CS)) ],
    ip:8, op:100, st:0, bm:0
  },

  // ⑥ Fragmento 3 (zona inferior)
  {
    ddd:0, ind:6, ty:4, nm:'frag3', sr:1,
    ks: fragKs([28,95], 90, 50), ao:0,
    shapes:[ gr('f', tri3, fl(CS)) ],
    ip:8, op:100, st:0, bm:0
  },

  // ⑦ Emblema del Heraldo (encima del relieve)
  {
    ddd:0, ind:7, ty:4, nm:'seal_emblem', sr:1,
    ks: sealEmblemKs, ao:0,
    shapes:[ gr('e',
      emblemPath,
      fl(CA, 100),
      // Llama interior
      { ty:'sh', nm:'flame', ks:{ a:0, k:{ i:[[0,0],[0,0],[0,0],[0,0]], o:[[0,0],[0,0],[0,0],[0,0]], v:[[0,-1],[2,-5],[0,-10],[-2,-5]], c:true } } },
      fl(CG, 100)
    )],
    ip:0, op:100, st:0, bm:0
  },

  // ⑧ Brillo especular
  {
    ddd:0, ind:8, ty:4, nm:'seal_hi', sr:1,
    ks:{ ...sealBodyKs,
      o:{ a:1, k:[
        {i:ei(),o:eo(),t:0,  s:[13]},
        {i:ei(),o:eo(),t:10, s:[13]},
        {i:ei(),o:eo(),t:22, s:[0]},
        {i:ei(),o:eo(),t:70, s:[0]},
        {i:ei(),o:eo(),t:74, s:[13]},
        {t:100, s:[13]}
      ]},
      p:{ a:1, k:[
        {i:eip(),o:eop(),t:0,  s:[39,32,0]},
        {i:eip(),o:eop(),t:8,  s:[39,32,0]},
        {i:eip(),o:eop(),t:22, s:[39,10,0]},
        {i:eip(),o:eop(),t:70, s:[39,10,0]},
        {i:eip(0.25),o:eop(0.75),t:82, s:[39,34,0]},
        {t:100, s:[39,32,0]}
      ]}
    },
    ao:0,
    shapes:[ gr('h', el(9, 5.5), fl([1,1,1,1])) ],
    ip:0, op:100, st:0, bm:0
  },

  // ⑨ Relieve interior (círculo)
  {
    ddd:0, ind:9, ty:4, nm:'seal_relief', sr:1,
    ks: sealReliefKs, ao:0,
    shapes:[ gr('r', el(26,26), fl(CR)) ],
    ip:0, op:100, st:0, bm:0
  },

  // ⑩ Cuerpo del sello (blob exterior) — la capa más atrás
  {
    ddd:0, ind:10, ty:4, nm:'seal_body', sr:1,
    ks: sealBodyKs, ao:0,
    shapes:[ gr('b', blobPath, fl(CS)) ],
    ip:0, op:100, st:0, bm:0
  }
]

// ── Export ────────────────────────────────────────────────────────────────────
export const SEAL_ANIM = {
  v:'5.9.0',
  fr:60,
  ip:0,
  op:100,
  w:100,
  h:100,
  nm:'wax_seal',
  ddd:0,
  assets:[],
  layers
}
