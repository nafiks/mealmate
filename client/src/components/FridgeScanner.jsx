import { useCallback, useEffect, useRef, useState } from 'react'
import { IconCamera, IconCheck, IconSpark, IconX } from './icons.jsx'

// Smart AI Fridge Scanner — UI concept.
// The camera and the photo are real; the "AI" step is SIMULATED on the client:
// no image leaves the browser. Replace `fakeDetect` with a call to
// POST /api/scan when a real vision model is plugged in.

const TEXT = {
  en: {
    title: 'Scan your fridge', beta: 'AI · demo',
    hint: 'Point the camera at your fridge shelf and take a photo.',
    snap: 'Take photo', upload: 'Upload a photo instead', retake: 'Retake',
    noCam: 'Camera is not available here — choose a photo or use your phone camera.',
    pick: 'Choose photo', analysing: 'AI is looking at your photo…',
    steps: ['Finding products', 'Reading labels', 'Matching to ingredients'],
    found: (n) => `Found ${n} products`, untick: 'Untick anything the AI got wrong.',
    show: (n) => `Show recipes (${n})`, demo: 'Demo: detection is simulated, no real AI yet.',
    added: (n) => `Scanner added ${n} products to your kitchen`,
  },
  ru: {
    title: 'Сканировать холодильник', beta: 'ИИ · демо',
    hint: 'Наведите камеру на полку холодильника и сделайте фото.',
    snap: 'Сфотографировать', upload: 'Загрузить фото', retake: 'Переснять',
    noCam: 'Камера здесь недоступна — выберите фото или снимите на телефон.',
    pick: 'Выбрать фото', analysing: 'ИИ изучает фото…',
    steps: ['Ищем продукты', 'Читаем упаковки', 'Сопоставляем с ингредиентами'],
    found: (n) => `Найдено продуктов: ${n}`, untick: 'Снимите отметку, если ИИ ошибся.',
    show: (n) => `Показать рецепты (${n})`, demo: 'Демо: распознавание имитируется, настоящей ИИ пока нет.',
    added: (n) => `Сканер добавил продуктов: ${n}`,
  },
  kk: {
    title: 'Тоңазытқышты сканерлеу', beta: 'ЖИ · демо',
    hint: 'Камераны тоңазытқыш сөресіне бағыттап, суретке түсіріңіз.',
    snap: 'Суретке түсіру', upload: 'Сурет жүктеу', retake: 'Қайта түсіру',
    noCam: 'Камера қолжетімсіз — суретті таңдаңыз немесе телефонмен түсіріңіз.',
    pick: 'Сурет таңдау', analysing: 'ЖИ суретті қарап жатыр…',
    steps: ['Өнімдерді іздеу', 'Қаптаманы оқу', 'Ингредиенттермен сәйкестендіру'],
    found: (n) => `Табылған өнімдер: ${n}`, untick: 'ЖИ қателессе, белгіні алып тастаңыз.',
    show: (n) => `Рецепттерді көрсету (${n})`, demo: 'Демо: тану имитацияланған, нақты ЖИ әлі жоқ.',
    added: (n) => `Сканер ${n} өнім қосты`,
  },
}

// products that typically live in a fridge — the demo "detector" picks from these
const FRIDGE_POOL = ['eggs', 'milk', 'cheese', 'butter', 'tomato', 'cucumber', 'sausage', 'yogurt',
  'bell-pepper', 'carrot', 'lemon', 'sour-cream', 'kefir', 'green-onion', 'chicken', 'mushrooms', 'onion', 'avocado']

function fakeDetect(ingredients, seedText) {
  const byKey = Object.fromEntries(ingredients.filter((i) => i.key).map((i) => [i.key, i]))
  const pool = FRIDGE_POOL.filter((k) => byKey[k])
  // tiny deterministic PRNG seeded from the photo, so the same photo gives the same result
  let seed = 0
  for (let i = 0; i < seedText.length; i += 97) seed = (seed * 31 + seedText.charCodeAt(i)) >>> 0
  const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296)
  const picked = [...pool].sort(() => rnd() - 0.5).slice(0, 5 + Math.floor(rnd() * 3))
  return picked.map((k) => ({ ...byKey[k], confidence: 0.72 + rnd() * 0.27 }))
    .sort((a, b) => b.confidence - a.confidence)
}

export default function FridgeScanner({ lang = 'en', ingredients = [], nameFor, onApply, onClose }) {
  const tx = TEXT[lang] || TEXT.en
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const fileRef = useRef(null)
  const [phase, setPhase] = useState('camera') // camera | nocam | scanning | result
  const [photo, setPhoto] = useState(null)
  const [step, setStep] = useState(0)
  const [found, setFound] = useState([])
  const [kept, setKept] = useState(new Set())

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((tr) => tr.stop())
    streamRef.current = null
  }, [])

  const startCamera = useCallback(async () => {
    setPhoto(null)
    if (!navigator.mediaDevices?.getUserMedia) { setPhase('nocam'); return }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 } }, audio: false,
      })
      streamRef.current = stream
      setPhase('camera')
      requestAnimationFrame(() => { if (videoRef.current) videoRef.current.srcObject = stream })
    } catch {
      setPhase('nocam')
    }
  }, [])

  useEffect(() => {
    startCamera()
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      stopCamera()
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [startCamera, stopCamera, onClose])

  const analyse = (dataUrl) => {
    stopCamera()
    setPhoto(dataUrl)
    setPhase('scanning')
    setStep(0)
    const timers = [700, 1400].map((ms, i) => setTimeout(() => setStep(i + 1), ms))
    timers.push(setTimeout(() => {
      const res = fakeDetect(ingredients, dataUrl)
      setFound(res)
      setKept(new Set(res.map((r) => r.id)))
      setPhase('result')
    }, 2200))
  }

  const snap = () => {
    const v = videoRef.current
    if (!v || !v.videoWidth) return
    const scale = Math.min(1, 960 / v.videoWidth)
    const c = document.createElement('canvas')
    c.width = Math.round(v.videoWidth * scale)
    c.height = Math.round(v.videoHeight * scale)
    c.getContext('2d').drawImage(v, 0, 0, c.width, c.height)
    analyse(c.toDataURL('image/jpeg', 0.82))
  }

  const pickFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const fr = new FileReader()
    fr.onload = () => analyse(fr.result)
    fr.readAsDataURL(file)
  }

  const toggle = (id) => setKept((s) => {
    const n = new Set(s)
    n.has(id) ? n.delete(id) : n.add(id)
    return n
  })

  const apply = () => {
    onApply([...kept], tx.added(kept.size))
    onClose()
  }

  const fileInput = (
    <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={pickFile} hidden />
  )

  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal scanner" role="dialog" aria-modal="true" aria-label={tx.title}>
        <div className="modal-head">
          <h3>{tx.title} <span className="scan-badge">{tx.beta}</span></h3>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            <IconX size={16} />
          </button>
        </div>

        <div className={`scan-stage ${phase}`}>
          {phase === 'camera' && <video ref={videoRef} autoPlay playsInline muted />}
          {phase === 'nocam' && (
            <div className="scan-nocam"><IconCamera size={28} /><p>{tx.noCam}</p></div>
          )}
          {photo && <img src={photo} alt="" />}
          {(phase === 'camera' || phase === 'scanning') && <span className="scan-frame" aria-hidden="true" />}
          {phase === 'scanning' && <span className="scan-line" aria-hidden="true" />}
        </div>

        {phase === 'camera' && (
          <>
            <p className="scan-hint">{tx.hint}</p>
            <div className="scan-actions">
              <button type="button" className="scan-shutter" onClick={snap} aria-label={tx.snap}><span /></button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => fileRef.current?.click()}>{tx.upload}</button>
            </div>
          </>
        )}

        {phase === 'nocam' && (
          <div className="scan-actions">
            <button type="button" className="btn btn-primary" onClick={() => fileRef.current?.click()}>
              <IconCamera size={16} /> {tx.pick}
            </button>
          </div>
        )}

        {phase === 'scanning' && (
          <div className="scan-progress" aria-live="polite">
            <p><IconSpark size={16} /> {tx.analysing}</p>
            <ol>
              {tx.steps.map((s, i) => (
                <li key={s} className={i < step ? 'done' : i === step ? 'now' : ''}>{s}</li>
              ))}
            </ol>
          </div>
        )}

        {phase === 'result' && (
          <div className="scan-result">
            <p className="scan-found"><strong>{tx.found(found.length)}</strong> · {tx.untick}</p>
            <div className="scan-chips">
              {found.map((f, i) => (
                <button
                  key={f.id}
                  type="button"
                  className={`chip ${kept.has(f.id) ? 'on' : ''}`}
                  style={{ animationDelay: `${i * 70}ms` }}
                  aria-pressed={kept.has(f.id)}
                  onClick={() => toggle(f.id)}
                >
                  <span className="chip-dot" aria-hidden="true"><IconCheck size={10} /></span>
                  <span className="emoji">{f.emoji}</span>
                  <span className="name">{nameFor(f)}</span>
                  <span className="conf">{Math.round(f.confidence * 100)}%</span>
                </button>
              ))}
            </div>
            <div className="scan-actions">
              <button type="button" className="btn btn-lime" disabled={!kept.size} onClick={apply}>{tx.show(kept.size)}</button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={startCamera}>{tx.retake}</button>
            </div>
            <p className="scan-demo">{tx.demo}</p>
          </div>
        )}
        {fileInput}
      </div>
    </div>
  )
}
