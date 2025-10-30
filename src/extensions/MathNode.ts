import { Node, mergeAttributes } from '@tiptap/core'
import katex from 'katex'

export interface MathOptions {
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    math: {
      setMath: (latex: string) => ReturnType
      toggleMath: (latex?: string) => ReturnType
      updateMathAtPos: (pos: number, latex: string) => ReturnType
    }
  }
}

const MathNode = Node.create<MathOptions>({
  name: 'math',

  group: 'block',

  atom: true,

  selectable: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  addAttributes() {
    return {
      latex: {
        default: '',
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="math"]',
      },
    ]
  },

  renderHTML({ node, HTMLAttributes }) {
    return ['div', mergeAttributes({ 'data-type': 'math', 'data-latex': node.attrs.latex }, HTMLAttributes), 0]
  },

  addCommands() {
    return {
      setMath:
        (latex: string) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: { latex },
          })
        },

      toggleMath:
        (latex = '') =>
        ({ commands, state }) => {
          const { selection } = state
          const node = selection.$from.node(selection.$from.depth)
          if (node && node.type.name === this.name) {
            return commands.deleteSelection()
          }
          return commands.insertContent({
            type: this.name,
            attrs: { latex },
          })
        },

      updateMathAtPos:
        (pos: number, latex: string) =>
        ({ tr, state, dispatch }) => {
          const node = state.doc.nodeAt(pos)
          if (!node || node.type.name !== this.name) return false
          tr = tr.setNodeMarkup(pos, undefined, { ...node.attrs, latex })
          if (dispatch) dispatch(tr)
          return true
        },
    }
  },

  addNodeView() {
    return ({ node, getPos }) => {
      const dom = document.createElement('div')
      dom.setAttribute('data-type', 'math')
      dom.classList.add('tiptap-math-node')
      dom.style.padding = '6px'
      dom.style.border = '1px dashed #d0d0d0'
      dom.style.borderRadius = '4px'
      dom.style.background = '#fbfbfb'
      dom.style.cursor = 'pointer'
      dom.style.display = 'block'

      function renderLatex(latex: string) {
        try {
          dom.innerHTML = katex.renderToString(latex || '\\text{}', {
            throwOnError: false,
            displayMode: true,
          })
        } catch (e) {
          dom.textContent = latex
        }
      }

      renderLatex(node.attrs.latex)

      dom.addEventListener('click', (event) => {
        const nodePos = (getPos as any)()
        const detail = { pos: nodePos, latex: node.attrs.latex }
        const customEvent = new CustomEvent('tiptap-math-edit', { detail })
        window.dispatchEvent(customEvent)
        event.preventDefault()
      })

      return {
        dom,
        update(updatedNode: any) {
          if (updatedNode.type.name !== this.name) return false
          if (updatedNode.attrs.latex !== node.attrs.latex) {
            renderLatex(updatedNode.attrs.latex)
          }
          return true
        },
        selectNode() {
          dom.style.boxShadow = '0 0 0 3px rgba(63,81,181,0.08)'
        },
        deselectNode() {
          dom.style.boxShadow = ''
        },
      }
    }
  },
})

export default MathNode
