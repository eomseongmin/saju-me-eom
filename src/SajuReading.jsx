/**
 * Gemini가 보낸 마크다운을 읽기 좋은 문단/제목/목록으로 바꿉니다.
 * (###, **, - 같은 기호가 그대로 보이지 않게)
 */

function renderInline(text, keyPrefix) {
  // **굵게** / *기울임* 간단 처리
  const parts = []
  const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*)/g
  let lastIndex = 0
  let match
  let i = 0

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }
    const token = match[0]
    if (token.startsWith('**')) {
      parts.push(
        <strong key={`${keyPrefix}-b-${i}`}>{token.slice(2, -2)}</strong>,
      )
    } else {
      parts.push(<em key={`${keyPrefix}-i-${i}`}>{token.slice(1, -1)}</em>)
    }
    lastIndex = match.index + token.length
    i += 1
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return parts.length > 0 ? parts : text
}

function parseBlocks(raw) {
  const lines = String(raw || '')
    .replace(/\r\n/g, '\n')
    .trim()
    .split('\n')

  const blocks = []
  let listBuffer = null // { type: 'ul'|'ol', items: [] }

  function flushList() {
    if (listBuffer) {
      blocks.push(listBuffer)
      listBuffer = null
    }
  }

  for (const line of lines) {
    const trimmed = line.trim()

    if (!trimmed) {
      flushList()
      continue
    }

    const heading = trimmed.match(/^(#{1,3})\s+(.+)$/)
    if (heading) {
      flushList()
      blocks.push({
        type: 'h',
        level: heading[1].length,
        text: heading[2].replace(/\*\*/g, ''),
      })
      continue
    }

    // "1. 제목" / "1) 제목" 형태도 소제목처럼 보이게
    const numberedTitle = trimmed.match(/^(\d+)[.)]\s+(.+)$/)
    const looksLikeSection =
      numberedTitle &&
      (numberedTitle[2].length < 40 || /[:：]$/.test(numberedTitle[2]))

    const ul = trimmed.match(/^[-*•]\s+(.+)$/)
    const ol = trimmed.match(/^(\d+)[.)]\s+(.+)$/)

    if (ul) {
      if (!listBuffer || listBuffer.type !== 'ul') {
        flushList()
        listBuffer = { type: 'ul', items: [] }
      }
      listBuffer.items.push(ul[1])
      continue
    }

    if (ol && !looksLikeSection) {
      if (!listBuffer || listBuffer.type !== 'ol') {
        flushList()
        listBuffer = { type: 'ol', items: [] }
      }
      listBuffer.items.push(ol[2])
      continue
    }

    flushList()

    if (looksLikeSection) {
      blocks.push({ type: 'h', level: 3, text: numberedTitle[2] })
    } else {
      blocks.push({ type: 'p', text: trimmed })
    }
  }

  flushList()
  return blocks
}

function SajuReading({ text, streaming = false }) {
  const blocks = parseBlocks(text)

  return (
    <div className={`saju-reading ${streaming ? 'is-streaming' : ''}`}>
      {blocks.map((block, index) => {
        if (block.type === 'h') {
          const Tag = block.level === 1 ? 'h3' : block.level === 2 ? 'h3' : 'h4'
          return (
            <Tag key={`h-${index}`} className="saju-reading__title">
              {renderInline(block.text, `h${index}`)}
            </Tag>
          )
        }

        if (block.type === 'ul' || block.type === 'ol') {
          const ListTag = block.type === 'ul' ? 'ul' : 'ol'
          return (
            <ListTag key={`l-${index}`} className="saju-reading__list">
              {block.items.map((item, itemIndex) => (
                <li key={`li-${index}-${itemIndex}`}>
                  {renderInline(item, `li${index}${itemIndex}`)}
                </li>
              ))}
            </ListTag>
          )
        }

        return (
          <p key={`p-${index}`} className="saju-reading__p">
            {renderInline(block.text, `p${index}`)}
          </p>
        )
      })}
      {streaming && <span className="saju-reading__caret" aria-hidden="true" />}
    </div>
  )
}

export default SajuReading
