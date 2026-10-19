import RAW from './i18n-data'

export const LANGS = [
  ['uz', 'UZ', "O'zbekcha"],
  ['ru', 'RU', 'Русский'],
  ['en', 'EN', 'English'],
  ['kk', 'KZ', 'Қазақша'],
  ['tg', 'TJ', 'Тоҷикӣ'],
]
const IDX = { ru: 0, en: 1, kk: 2, tg: 3 }

const dict = { ru: {}, en: {}, kk: {}, tg: {} }
RAW.split('\n').forEach((line) => {
  const p = line.split(' ~ ')
  if (p.length !== 5) return
  const uz = p[0].trim()
  Object.keys(IDX).forEach((l) => (dict[l][uz] = p[IDX[l] + 1].trim()))
})

// [regex, {lang: template}] — $1.. are captured groups
const T = (ru, en, kk, tg) => ({ ru, en, kk, tg })
const PATTERNS = [
  [/^(\d+) daqiqa oldin$/, T('$1 мин. назад', '$1 min ago', '$1 мин бұрын', '$1 дақ. пеш')],
  [/^(\d+) soat oldin$/, T('$1 ч. назад', '$1 h ago', '$1 сағ бұрын', '$1 соат пеш')],
  [/^(\d+) kun oldin$/, T('$1 дн. назад', '$1 d ago', '$1 күн бұрын', '$1 рӯз пеш')],
  [/^Jami: (\d+) \| Bu hafta: (\d+) \| Konversiya: (\d+)%$/, T('Всего: $1 | За неделю: $2 | Конверсия: $3%', 'Total: $1 | This week: $2 | Conversion: $3%', 'Барлығы: $1 | Осы аптада: $2 | Конверсия: $3%', 'Ҳамагӣ: $1 | Ин ҳафта: $2 | Конверсия: $3%')],
  [/^(\d+)% yig'ish darajasi$/, T('$1% уровень сбора', '$1% collection rate', '$1% жинау деңгейі', '$1% сатҳи ҷамъоварӣ')],
  [/^(\d+) ta muddati o'tgan$/, T('$1 просрочено', '$1 overdue', '$1 мерзімі өткен', '$1 мӯҳлаташ гузашта')],
  [/^(\d+) joy bor$/, T('$1 мест свободно', '$1 seats left', '$1 орын бар', '$1 ҷой ҳаст')],
  [/^([\d\s]*\d) so'm$/, T('$1 сум', '$1 UZS', '$1 сом', '$1 сӯм')],
  [/^(\d+\.\d) mln$/, T('$1 млн', '$1 mln', '$1 млн', '$1 млн')],
  [/^"(.+)" majburiy$/, T('«$1» обязательно', '"$1" is required', '«$1» міндетті', '«$1» ҳатмӣ аст')],
  [/ o'chirishni tasdiqlaysizmi\?$/, T('Подтвердить удаление?', 'Confirm deletion?', 'Жоюды растайсыз ба?', 'Нест карданро тасдиқ мекунед?')],
  [/^Bu statusda (\d+) ta mijoz bor\./, T('В этом статусе $1 клиентов. Сначала переведите их в другой статус.', 'This status has $1 clients. Move them to another status first.', 'Бұл мәртебеде $1 клиент бар. Алдымен оларды басқа мәртебеге ауыстырыңыз.', 'Дар ин статус $1 мизоҷ ҳаст. Аввал онҳоро ба статуси дигар гузаронед.')],
  [/^Tizim rangi logotipdan avtomatik olinadi(.*)$/, T('Цвет системы берётся из логотипа$1', 'System color is taken from the logo$1', 'Жүйе түсі логотиптен алынады$1', 'Ранги система аз логотип гирифта мешавад$1')],
  [/^Import: maydonlarni JSON orqali/, T('Импорт полей через JSON появится в следующей версии.', 'Importing fields via JSON will come in a later version.', 'Өрістерді JSON арқылы импорттау келесі нұсқада болады.', 'Воридоти майдонҳо тавассути JSON дар версияи оянда меояд.')],
  [/^(\d+) ta mijoz topildi$/, T('Найдено клиентов: $1', '$1 clients found', '$1 клиент табылды', '$1 мизоҷ ёфт шуд')],
]

export function tr(s, lang) {
  if (!lang || lang === 'uz' || !s) return s
  const core = s.trim()
  if (!core) return s
  const lead = s.slice(0, s.indexOf(core)), trail = s.slice(s.indexOf(core) + core.length)
  let r = dict[lang][core]
  if (r === undefined) {
    for (const [re, t] of PATTERNS) {
      const m = core.match(re)
      if (m) {
        r = t[lang].replace(/\$(\d)/g, (_, i) => (m[i] ?? ''))
        // translate captured label inside required-field message
        if (re.source.includes('majburiy')) r = t[lang].replace('$1', tr(m[1], lang))
        break
      }
    }
  }
  return r === undefined ? s : lead + r + trail
}

// ---- DOM translator ----
const orig = new WeakMap() // node|attr key -> original uzbek
const written = new WeakMap() // node -> value we last wrote
const attrOrig = new WeakMap() // element -> {attr: orig}
const attrWritten = new WeakMap()
let current = 'uz'
let observer = null
const ATTRS = ['placeholder', 'title']

function doText(node) {
  const val = node.nodeValue
  if (written.get(node) === val) return // our own write
  orig.set(node, val)
  const out = tr(val, current)
  if (out !== val) { written.set(node, out); node.nodeValue = out } else written.delete(node)
}
function doAttrs(el) {
  for (const a of ATTRS) {
    if (!el.hasAttribute || !el.hasAttribute(a)) continue
    const v = el.getAttribute(a)
    const w = attrWritten.get(el) || {}
    if (w[a] === v) continue
    const o = attrOrig.get(el) || {}
    o[a] = v; attrOrig.set(el, o)
    const out = tr(v, current)
    if (out !== v) { w[a] = out; attrWritten.set(el, w); el.setAttribute(a, out) } else delete w[a]
  }
}
function walk(root) {
  if (root.nodeType === 3) return doText(root)
  if (root.nodeType !== 1 || /^(SCRIPT|STYLE|TEXTAREA)$/.test(root.nodeName)) return
  doAttrs(root)
  const tw = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT)
  let n
  while ((n = tw.nextNode())) {
    if (n.nodeType === 3) { if (!/^(SCRIPT|STYLE)$/.test(n.parentNode.nodeName)) doText(n) } else doAttrs(n)
  }
}

export function setLanguage(lang) {
  current = lang
  document.documentElement.lang = lang === 'tg' ? 'tg' : lang
  if (!observer) {
    observer = new MutationObserver((muts) => {
      for (const m of muts) {
        if (m.type === 'characterData') doText(m.target)
        else if (m.type === 'attributes') doAttrs(m.target)
        else m.addedNodes.forEach(walk)
      }
    })
    observer.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS })
    const c = window.confirm.bind(window), a = window.alert.bind(window)
    window.confirm = (m) => c(tr(m, current))
    window.alert = (m) => a(tr(m, current))
  }
  // full re-pass: restore originals first so switching language is lossless
  observer.disconnect()
  const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT)
  let n
  while ((n = tw.nextNode())) {
    if (n.nodeType === 3) {
      if (orig.has(n) && written.get(n) === n.nodeValue) { n.nodeValue = orig.get(n); written.delete(n) }
    } else {
      const w = attrWritten.get(n), o = attrOrig.get(n)
      if (w && o) for (const a of Object.keys(w)) if (n.getAttribute(a) === w[a]) { n.setAttribute(a, o[a]); delete w[a] }
    }
  }
  if (lang !== 'uz') walk(document.body)
  observer.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS })
}
