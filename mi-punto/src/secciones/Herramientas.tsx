import { useEffect, useState } from 'react'
import { Boton } from '../componentes/Boton'
import { Campo } from '../componentes/Campo'
import { Panel, Vista } from '../componentes/Marco'
import { T } from '../config/textos'

/* Sin eval: la calculadora es una maquina de estados con cuatro
   operaciones. Lo que entra se analiza, no se ejecuta. */

const cifra = (n: number): string =>
  Number.isFinite(n) ? new Intl.NumberFormat('es-ES', { maximumFractionDigits: 8 }).format(n) : '—'

const leer = (s: string): number | null => {
  const limpio = s.trim().replace(/\./g, '').replace(',', '.')
  if (!limpio || !/^-?\d*\.?\d*$/.test(limpio)) return null
  const n = Number(limpio)
  return Number.isFinite(n) ? n : null
}

type Operador = '+' | '−' | '×' | '÷'

const opera = (a: number, b: number, op: Operador): number => {
  switch (op) {
    case '+': return a + b
    case '−': return a - b
    case '×': return a * b
    case '÷': return b === 0 ? NaN : a / b
  }
}

const Calculadora = () => {
  const [visor, setVisor] = useState('0')
  const [acumulado, setAcumulado] = useState<number | null>(null)
  const [operador, setOperador] = useState<Operador | null>(null)
  const [esperando, setEsperando] = useState(false)

  const digito = (d: string) => {
    setVisor((v) => {
      if (esperando || v === '0') return d === ',' ? '0,' : d
      if (d === ',' && v.includes(',')) return v
      return v.length < 16 ? v + d : v
    })
    setEsperando(false)
  }

  const conOperador = (op: Operador) => {
    const actual = leer(visor) ?? 0
    if (acumulado !== null && operador && !esperando) {
      const r = opera(acumulado, actual, operador)
      setAcumulado(r)
      setVisor(cifra(r))
    } else {
      setAcumulado(actual)
    }
    setOperador(op)
    setEsperando(true)
  }

  const igual = () => {
    const actual = leer(visor) ?? 0
    if (acumulado === null || !operador) return
    const r = opera(acumulado, actual, operador)
    setVisor(cifra(r))
    setAcumulado(null)
    setOperador(null)
    setEsperando(true)
  }

  const limpiar = () => {
    setVisor('0')
    setAcumulado(null)
    setOperador(null)
    setEsperando(false)
  }
  const borrarUno = () =>
    setVisor((v) => (v.length <= 1 || (v.length === 2 && v.startsWith('-')) ? '0' : v.slice(0, -1)))
  const porCiento = () => {
    const actual = leer(visor) ?? 0
    const base = acumulado ?? 0
    setVisor(cifra(operador === '+' || operador === '−' ? (base * actual) / 100 : actual / 100))
  }

  useEffect(() => {
    const alPulsar = (e: KeyboardEvent) => {
      const k = e.key
      if (/^[0-9]$/.test(k)) digito(k)
      else if (k === ',' || k === '.') digito(',')
      else if (k === '+') conOperador('+')
      else if (k === '-') conOperador('−')
      else if (k === '*' || k.toLowerCase() === 'x') conOperador('×')
      else if (k === '/') { e.preventDefault(); conOperador('÷') }
      else if (k === 'Enter' || k === '=') { e.preventDefault(); igual() }
      else if (k === 'Backspace') borrarUno()
      else if (k === 'Delete' || k.toLowerCase() === 'c') limpiar()
      else if (k === '%') porCiento()
    }
    window.addEventListener('keydown', alPulsar)
    return () => window.removeEventListener('keydown', alPulsar)
  })

  const teclas: Array<[string, () => void, string]> = [
    ['C', limpiar, 'tecla tecla--op'],
    ['%', porCiento, 'tecla tecla--op'],
    ['←', borrarUno, 'tecla tecla--op'],
    ['÷', () => conOperador('÷'), 'tecla tecla--op'],
    ['7', () => digito('7'), 'tecla'], ['8', () => digito('8'), 'tecla'], ['9', () => digito('9'), 'tecla'],
    ['×', () => conOperador('×'), 'tecla tecla--op'],
    ['4', () => digito('4'), 'tecla'], ['5', () => digito('5'), 'tecla'], ['6', () => digito('6'), 'tecla'],
    ['−', () => conOperador('−'), 'tecla tecla--op'],
    ['1', () => digito('1'), 'tecla'], ['2', () => digito('2'), 'tecla'], ['3', () => digito('3'), 'tecla'],
    ['+', () => conOperador('+'), 'tecla tecla--op'],
    ['0', () => digito('0'), 'tecla'], [',', () => digito(','), 'tecla'],
    ['=', igual, 'tecla tecla--igual'],
  ]

  return (
    <div className="calculadora">
      <div className="visor">
        <span className="visor__operacion">
          {acumulado !== null && operador ? `${cifra(acumulado)} ${operador}` : ' '}
        </span>
        <output className="visor__cifra" aria-live="polite">{visor}</output>
      </div>
      <div className="teclado">
        {teclas.map(([signo, accion, clase], i) => (
          <button
            key={signo + i}
            type="button"
            className={clase}
            style={signo === '0' ? { gridColumn: 'span 2' } : undefined}
            onClick={accion}
          >
            {signo}
          </button>
        ))}
      </div>
      <p className="menor suave">{T.herramientas.ayudaTeclado}</p>
    </div>
  )
}

type Modo = 'deTotal' | 'queParte' | 'variacion'

const Porcentajes = () => {
  const [modo, setModo] = useState<Modo>('deTotal')
  const [a, setA] = useState('')
  const [b, setB] = useState('')

  const na = leer(a)
  const nb = leer(b)
  const escritos = a.trim() !== '' && b.trim() !== ''
  const malFormado = escritos && (na === null || nb === null)
  const listo = na !== null && nb !== null

  let resultado = '—'
  let explicacion: string = malFormado ? T.herramientas.noNumero : T.herramientas.incompleto

  if (listo) {
    if (modo === 'deTotal') {
      resultado = cifra((na * nb) / 100)
      explicacion = `El ${cifra(na)} % de ${cifra(nb)}`
    } else if (modo === 'queParte') {
      resultado = nb === 0 ? '—' : `${cifra((na / nb) * 100)} %`
      explicacion = nb === 0 ? T.herramientas.sinCero : `${cifra(na)} sobre ${cifra(nb)}`
    } else if (na === 0) {
      explicacion = T.herramientas.sinCero
    } else {
      const v = ((nb - na) / Math.abs(na)) * 100
      const sentido = v > 0 ? T.herramientas.sube : v < 0 ? T.herramientas.baja : T.herramientas.igual
      resultado = `${cifra(Math.abs(v))} %`
      explicacion = `${sentido}, de ${cifra(na)} a ${cifra(nb)}`
    }
  }

  const etiquetas: Record<Modo, [string, string]> = {
    deTotal: [T.herramientas.porcentaje, T.herramientas.cantidad],
    queParte: [T.herramientas.parte, T.herramientas.total],
    variacion: [T.herramientas.desde, T.herramientas.hasta],
  }

  return (
    <div className="porcentajes">
      <div className="grupo-botones" role="group" aria-label={T.herramientas.porcentajesGrupo}>
        {(Object.keys(etiquetas) as Modo[]).map((m) => (
          <Boton
            key={m}
            compacto
            tono={modo === m ? 'principal' : 'secundario'}
            aria-pressed={modo === m}
            onClick={() => setModo(m)}
          >
            {T.herramientas[m]}
          </Boton>
        ))}
      </div>
      <div className="dos-campos">
        <Campo etiqueta={etiquetas[modo][0]} value={a} onChange={(e) => setA(e.target.value)} inputMode="decimal" autoComplete="off" />
        <Campo etiqueta={etiquetas[modo][1]} value={b} onChange={(e) => setB(e.target.value)} inputMode="decimal" autoComplete="off" />
      </div>
      <div className="salida" aria-live="polite">
        <span className="menor suave">{T.herramientas.resultado}</span>
        <strong>{resultado}</strong>
        <span className="menor suave">{explicacion}</span>
      </div>
    </div>
  )
}

export const Herramientas = () => {
  const [pestana, setPestana] = useState<'calc' | 'pct'>('calc')
  return (
    <Vista titulo={T.herramientas.titulo} descripcion={T.herramientas.subtitulo}>
      <Panel>
        <div className="grupo-botones" style={{ marginBottom: 'var(--e4)' }}>
          <Boton compacto tono={pestana === 'calc' ? 'principal' : 'secundario'} aria-pressed={pestana === 'calc'} onClick={() => setPestana('calc')}>
            {T.herramientas.calculadora}
          </Boton>
          <Boton compacto tono={pestana === 'pct' ? 'principal' : 'secundario'} aria-pressed={pestana === 'pct'} onClick={() => setPestana('pct')}>
            {T.herramientas.porcentajes}
          </Boton>
        </div>
        <div style={{ maxWidth: 420 }}>{pestana === 'calc' ? <Calculadora /> : <Porcentajes />}</div>
      </Panel>
    </Vista>
  )
}
