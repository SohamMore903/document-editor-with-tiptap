import React, { useEffect, useState } from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'

type Props = {
  editor: any
  openInitially?: boolean
}

export default function MathModal({ editor }: Props) {
  const [open, setOpen] = useState(false)
  const [latex, setLatex] = useState('')
  const [pos, setPos] = useState<number | null>(null)
  const [previewHtml, setPreviewHtml] = useState('')

  useEffect(() => {
    function onEdit(e: any) {
      const d = e.detail || {}
      setLatex(d.latex || '')
      setPos(typeof d.pos === 'number' ? d.pos : null)
      setOpen(true)
    }
    window.addEventListener('tiptap-math-edit', onEdit as EventListener)
    return () => window.removeEventListener('tiptap-math-edit', onEdit as EventListener)
  }, [])

  useEffect(() => {
    try {
      setPreviewHtml(katex.renderToString(latex || '\text{}', { throwOnError: false, displayMode: true }))
    } catch {
      setPreviewHtml(latex)
    }
  }, [latex])

  if (!open) return null

  function close() {
    setOpen(false)
    setPos(null)
    setLatex('')
  }

  function save() {
    if (!editor) return
    editor.chain().focus()
    if (pos !== null) {
      // update existing node at pos
      editor.view.dispatch(editor.state.tr.setNodeMarkup(pos, undefined, { latex }))
    } else {
      editor.commands.setMath(latex)
    }
    close()
  }

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0 }}>Insert / Edit Equation (LaTeX)</h3>
          <button onClick={close} style={closeBtnStyle}>
            ×
          </button>
        </div>

        <textarea
          value={latex}
          onChange={(e) => setLatex(e.target.value)}
          placeholder="e.g. \\frac{a}{b}"
          style={{ width: '100%', minHeight: 120, marginTop: 10, boxSizing: 'border-box' }}
        />

        <div style={{ marginTop: 8, display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>Preview</div>
            <div style={{ padding: 8, border: '1px solid #eee', borderRadius: 4, minHeight: 48 }}>
              <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
            </div>
          </div>

          <div style={{ width: 120, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button onClick={save} style={saveBtnStyle}>
              Save
            </button>
            <button onClick={close} style={cancelBtnStyle}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  left: 0,
  top: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0,0,0,0.3)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999,
}

const modalStyle: React.CSSProperties = {
  width: 680,
  background: '#fff',
  padding: 20,
  borderRadius: 8,
  boxShadow: '0 12px 40px rgba(0,0,0,0.14)',
}

const closeBtnStyle: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  fontSize: 20,
  cursor: 'pointer',
}

const saveBtnStyle: React.CSSProperties = {
  background: '#3f51b5',
  color: '#fff',
  border: 'none',
  padding: '8px 12px',
  borderRadius: 4,
  cursor: 'pointer',
}

const cancelBtnStyle: React.CSSProperties = {
  background: '#fff',
  color: '#333',
  border: '1px solid #ddd',
  padding: '8px 12px',
  borderRadius: 4,
  cursor: 'pointer',
}