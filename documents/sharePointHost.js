/**
 * SharePoint / OneDrive block cross-origin fetch from the browser (CORS).
 * Host apps should stream bytes through their API, never fetch() to *.sharepoint.com.
 */
export function isSharePointHost(urlOrHostname) {
  const raw = String(urlOrHostname || '').trim()
  if (!raw) return false
  let host = raw
  if (raw.includes('://')) {
    try {
      host = new URL(raw).hostname
    } catch {
      return false
    }
  }
  const h = host.toLowerCase()
  return h.endsWith('sharepoint.com') || h.endsWith('onedrive.live.com')
}

export function isPdfFileName(name) {
  return /\.pdf$/i.test(String(name || '').trim())
}

export function isImageFileName(name) {
  return /\.(png|jpe?g|gif|webp|svg|avif|ico)$/i.test(String(name || '').trim())
}

export function canViewInApp(name) {
  return isPdfFileName(name) || isImageFileName(name)
}

export function isUrlShortcutFileName(name) {
  return /\.url$/i.test(String(name || '').trim())
}

/** Parse Windows Internet Shortcut (.url) file content. */
export function parseInternetShortcutUrl(content) {
  for (const line of String(content || '').split(/\r?\n/)) {
    const trimmed = line.trim()
    const match = /^URL=(.+)$/i.exec(trimmed)
    if (!match) continue
    const url = match[1].trim().replace(/^["']|["']$/g, '')
    if (/^https?:\/\//i.test(url)) {
      return url
    }
  }
  return null
}

/** Read .url shortcut text (UTF-8 or UTF-16 LE as created by Windows). */
export async function readUrlShortcutText(blob) {
  const buffer = await blob.arrayBuffer()
  const bytes = new Uint8Array(buffer)
  if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xfe) {
    return new TextDecoder('utf-16le').decode(buffer)
  }
  const utf8 = new TextDecoder('utf-8').decode(buffer)
  if (parseInternetShortcutUrl(utf8)) {
    return utf8
  }
  if (bytes.some((b, i) => b === 0 && i % 2 === 1)) {
    const utf16 = new TextDecoder('utf-16le').decode(buffer)
    if (parseInternetShortcutUrl(utf16)) {
      return utf16
    }
  }
  return utf8
}

export function documentFileExtension(file) {
  const name = String(file?.name || '').trim()
  let m = /\.([a-z0-9]{1,12})$/i.exec(name)
  if (m) return m[1].toLowerCase()
  try {
    const raw = String(file?.url || file?.web_url || '').trim()
    if (!raw) return ''
    const withProto = /^https?:\/\//i.test(raw) ? raw : `https://placeholder.invalid${raw.startsWith('/') ? '' : '/'}${raw}`
    const u = new URL(withProto)
    const last = (u.pathname.split('/').pop() || '').split('?')[0]
    m = /\.([a-z0-9]{1,12})$/i.exec(last)
    return m ? m[1].toLowerCase() : ''
  } catch {
    return ''
  }
}

const EXT_ICON = {
  pdf: 'filetype-pdf',
  mp4: 'filetype-mp4',
  m4v: 'filetype-mp4',
  mov: 'filetype-mov',
  webm: 'camera-video',
  mkv: 'camera-video',
  avi: 'camera-video',
  wmv: 'camera-video',
  mpg: 'camera-video',
  mpeg: 'camera-video',
  mp3: 'filetype-mp3',
  m4a: 'file-earmark-music',
  wav: 'filetype-wav',
  aac: 'filetype-aac',
  ogg: 'music-note-beamed',
  oga: 'music-note-beamed',
  flac: 'music-note-beamed',
  doc: 'filetype-doc',
  docx: 'filetype-docx',
  xls: 'filetype-xls',
  xlsx: 'filetype-xlsx',
  csv: 'filetype-csv',
  ppt: 'filetype-ppt',
  pptx: 'filetype-pptx',
  zip: 'filetype-zip',
  rar: 'archive',
  '7z': 'archive',
  gz: 'archive',
  txt: 'filetype-txt',
  md: 'filetype-md',
  html: 'filetype-html',
  htm: 'filetype-html',
  css: 'filetype-css',
  js: 'filetype-js',
  json: 'filetype-json',
  xml: 'filetype-xml',
  png: 'filetype-png',
  jpg: 'filetype-jpg',
  jpeg: 'filetype-jpg',
  gif: 'filetype-gif',
  webp: 'filetype-png',
  svg: 'filetype-svg',
  ico: 'file-image',
}

export function documentFileIconBiSuffix(file) {
  if (file?.type === 'folder') return 'folder2'
  const ext = documentFileExtension(file)
  return EXT_ICON[ext] || 'file-earmark'
}

export function documentFileVisualKind(file) {
  if (file?.type === 'folder') return 'folder'
  const e = documentFileExtension(file)
  if (!e) return 'file'
  if (e === 'pdf') return 'pdf'
  if (new Set(['mp4', 'm4v', 'mov', 'webm', 'mkv', 'avi', 'wmv', 'mpg', 'mpeg']).has(e)) return 'video'
  if (new Set(['mp3', 'wav', 'aac', 'flac', 'm4a', 'ogg', 'oga']).has(e)) return 'audio'
  if (new Set(['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'avif', 'ico']).has(e)) return 'image'
  if (['xls', 'xlsx', 'csv'].includes(e)) return 'sheet'
  if (['ppt', 'pptx'].includes(e)) return 'slide'
  if (['zip', 'rar', '7z', 'gz'].includes(e)) return 'archive'
  if (['doc', 'docx'].includes(e)) return 'doc'
  if (['txt', 'md', 'html', 'htm', 'css', 'js', 'json', 'xml'].includes(e)) return 'text'
  return 'file'
}

export function documentFileIcon(item) {
  return `bi-${documentFileIconBiSuffix(item)}`
}
