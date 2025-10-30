import React from 'react'

type Props = {
  editor: any
}

export default function MathToolbarButton({ editor }: Props) {
  return (
    <button
      type="button"
      title="Insert equation"
      onClick={() => {
        // focus editor then open modal
        editor.chain().focus().run()
        const evt = new CustomEvent('tiptap-math-edit', { detail: { latex: '', pos: null } })
        window.dispatchEvent(evt)
      }}
      style={buttonStyle}
    >
      ∑
    </button>
  )
}

const buttonStyle: React.CSSProperties = {
  padding: '6px 8px',
  borderRadius: 4,
  border: '1px solid transparent',
  background: 'transparent',
  cursor: 'pointer',
  fontSize: 16,
}