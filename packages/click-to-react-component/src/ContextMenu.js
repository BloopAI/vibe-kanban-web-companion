/**
 * @typedef {import('react').DialogHTMLAttributes} DialogHTMLAttributes
 * @typedef {import('react').HTMLAttributes} HTMLAttributes
 * @typedef {import('react').MouseEvent<HTMLElement, MouseEvent>} ReactMouseEvent}
 * @typedef {import('./types').ContextMenuProps} Props
 */

import {
  arrow,
  autoUpdate,
  flip,
  FloatingFocusManager,
  FloatingOverlay,
  offset,
  shift,
  useDismiss,
  useFloating,
  useInteractions,
  useListNavigation,
  useRole,
} from '@floating-ui/react-dom-interactions'
import { html } from 'htm/react'
import * as React from 'react'
import mergeRefs from 'react-merge-refs'

import { getDisplayNameForInstance } from './getDisplayNameFromReactInstance.js'
import { getPathToSource } from './getPathToSource.js'
import { getPropsForInstance } from './getPropsForInstance.js'
import { getReactInstancesForElement } from './getReactInstancesForElement.js'
import { getSourceForInstance } from './getSourceForInstance.js'

// @ts-expect-error
export const ContextMenu = React.forwardRef((props, ref) => {
  // @ts-expect-error
  const { onClose, pathModifier, port } = props

  const [target, setTarget] = React.useState(
    /** @type {HTMLElement | null} */
    (null)
  )

  const arrowRef = React.useRef(
    /** @type {HTMLElement | null} */
    (null)
  )

  const [open, setOpen] = React.useState(false)

  const [input, setInput] = React.useState('')

  const {
    x,
    y,
    reference,
    floating,
    strategy,
    refs,
    update,
    context,
    placement,
    middlewareData: { arrow: { x: arrowX, y: arrowY } = {} },
  } = useFloating({
    open,
    onOpenChange(open) {
      setOpen(open)

      if (!open) onClose?.()
    },
    middleware: [
      offset({ mainAxis: 5, alignmentAxis: 4 }),
      flip(),
      shift(),
      arrow({ element: arrowRef }),
    ],
    placement: 'right',
  })

  const { getFloatingProps } = useInteractions([
    useRole(context, { role: 'menu' }),
    useDismiss(context),
  ])

  React.useEffect(() => {
    if (open && refs.reference.current && refs.floating.current) {
      return autoUpdate(refs.reference.current, refs.floating.current, update)
    }
  }, [open, update, refs.reference, refs.floating])

  const mergedReferenceRef = React.useMemo(
    () => mergeRefs([ref, reference]),
    [reference, ref]
  )

  // Expose imperative API for parent component to open the menu
  React.useImperativeHandle(ref, () => ({
    open({ x, y, target }) {
      reference({
        getBoundingClientRect() {
          return {
            x,
            y,
            width: 0,
            height: 0,
            top: y,
            right: x,
            bottom: y,
            left: x,
          }
        },
      })
      setTarget(target)
      setOpen(true)
    },
  }), [reference])

  React.useLayoutEffect(() => {
    if (open) {
      refs.floating.current?.focus()
    }
  }, [open, refs.floating])

  React.useLayoutEffect(() => {
    if (!arrowRef.current) return

    const staticSide = {
      top: 'bottom',
      right: 'left',
      bottom: 'top',
      left: 'right',
    }[placement.split('-')[0]]

    Object.assign(arrowRef.current.style, {
      display: 'block',
      left: arrowX != null ? `${arrowX}px` : '',
      top: arrowY != null ? `${arrowY}px` : '',
      right: '',
      bottom: '',
      [staticSide]: '-4px',
    })
  }, [arrowX, arrowY, placement])

  // Build the instance list only when a target exists – avoids
  // unnecessary work after the menu is closed.
  const instances = React.useMemo(() => {
    if (!target) return []
    return getReactInstancesForElement(target).filter((instance) =>
      getSourceForInstance(instance)
    )
  }, [target])

  return html`
    <style key="click-to-component-contextmenu-style">
      #floating-ui-root > div {
        z-index: 2147483647;
      }

      [data-click-to-component-contextmenu],
      [data-click-to-component-contextmenu] * {
        box-sizing: border-box !important;
      }

      [data-click-to-component-contextmenu] {
        all: unset;
        outline: 0;
        background: white;
        color: black;
        font-weight: bold;
        overflow: visible;
        padding: 5px;
        font-size: 13px;
        border-radius: 6px;
        border: none;

        --shadow-color: 0deg 0% 0%;
        --shadow-elevation-low: 0px -1px 0.8px hsl(var(--shadow-color) / 0.1),
          0px -1.2px 0.9px -2.5px hsl(var(--shadow-color) / 0.07),
          0px -3px 2.3px -5px hsl(var(--shadow-color) / 0.03);

        --shadow-elevation-medium: 0px 1px 0.8px hsl(var(--shadow-color) / 0.11),
          0px 1.5px 1.1px -1.7px hsl(var(--shadow-color) / 0.08),
          0px 5.1px 3.8px -3.3px hsl(var(--shadow-color) / 0.05),
          0px 15px 11.3px -5px hsl(var(--shadow-color) / 0.03);
        --shadow-elevation-high: 0px 1px 0.8px hsl(var(--shadow-color) / 0.1),
          0px 1.1px 0.8px -0.7px hsl(var(--shadow-color) / 0.09),
          0px 2.1px 1.6px -1.4px hsl(var(--shadow-color) / 0.07),
          0px 4.9px 3.7px -2.1px hsl(var(--shadow-color) / 0.06),
          0px 10.1px 7.6px -2.9px hsl(var(--shadow-color) / 0.05),
          0px 18.9px 14.2px -3.6px hsl(var(--shadow-color) / 0.04),
          0px 31.9px 23.9px -4.3px hsl(var(--shadow-color) / 0.02),
          0px 50px 37.5px -5px hsl(var(--shadow-color) / 0.01);

        box-shadow: var(--shadow-elevation-high);
        filter: drop-shadow(0px 0px 0.5px rgba(0 0 0 / 50%));
      }

      [data-click-to-component-contextmenu] code {
        color: royalblue;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
          'Liberation Mono', 'Courier New', monospace;
      }

      [data-click-to-component-contextmenu] code var {
        background: rgba(0 0 0 / 5%);
        cursor: help;
        border-radius: 3px;
        padding: 3px 6px;
        font-style: normal;
        font-weight: normal;
        font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
          'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif,
          'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
          'Noto Color Emoji';
      }

      [data-click-to-component-contextmenu-arrow] {
        display: none;
        position: absolute;
        background: inherit;
        width: 8px;
        height: 8px;
        transform: rotate(45deg);
      }
    </style>

    ${open &&
    html`
        <${FloatingOverlay} key="click-to-component-overlay" lockScroll>
          <${FloatingFocusManager} context=${context}>
            <dialog
              ...${getFloatingProps({
      ref: floating,
      style: {
        position: strategy,
        top: y ?? '',
        left: x ?? '',
      },
    })}
              data-click-to-component-contextmenu
              onClose=${function handleClose(event) {
        // @ts-ignore Property 'returnValue' does not exist on type 'HTMLElement'.ts(2339)
        onClose(refs.floating.current.returnValue)
        setOpen(false)
      }}
              open
            >
              <form
                onSubmit=${function handleSubmit(event) {
        event.preventDefault()

        const components = instances.map((instance) => {
          const name = getDisplayNameForInstance(instance)
          const source = getSourceForInstance(instance)
          const path = getPathToSource(source, pathModifier)
          const props = getPropsForInstance(instance)

          return {
            name,
            props,
            source: {
              fileName: source.fileName,
              lineNumber: source.lineNumber,
              columnNumber: source.columnNumber
            },
            path
          }
        })

        const component_strs = components.map(({ name, path }) => {
          return `<${name}> component located in \`${path}\``
        })

        const component_str = component_strs.join('\nInside ')

        const prompt = `The user has the following feedback:\n\n\`\`\`\n${input}\n\`\`\`\n\nAbout the component stack: ${component_str}`;

        console.log(prompt, port)

        fetch(`http://127.0.0.1:${port}/api/task-attempts/890419d8-150c-485d-ada3-49541475e18b/follow-up`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt,
          }),
        })
          .then((res) => {
            if (!res.ok) {
              throw new Error(`HTTP error! Status: ${res.status}`);
            }
            return res.json();
          })
          .then((data) => {
            console.log("Response:", data);
          })
          .catch((err) => {
            console.error("Error:", err);
          });

        setOpen(false)
        onClose?.()
      }}
              >
                <textarea
                  rows="5"
                  cols="40"
                  placeholder="Describe what you want…"
                  value=${input}
                  onInput=${function handleInput(event) {
        setInput(event.target.value)
      }}
                  style=${{
        width: '100%',
        resize: 'vertical',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        border: '1px solid #ccc',
        borderRadius: '4px',
        padding: '5px',
        boxSizing: 'border-box'
      }}
                  autoFocus
                />

                <hr style=${{ margin: '10px 0', border: 'none', borderTop: '1px solid #ccc' }} />

                <ul style=${{ listStyle: 'none', margin: 0, padding: 0 }}>
                  ${instances.map((instance, i) => {
        const name = getDisplayNameForInstance(instance)
        const source = getSourceForInstance(instance)
        const path = getPathToSource(source, pathModifier)
        const props = getPropsForInstance(instance)

        return html`
                      <li key=${i} style=${{ marginBottom: '8px' }}>
                        <code>
                          ${'<'}${name}
                          ${Object.entries(props).map(
          ([prop, value]) => html`
                              ${' '}
                              <var key=${prop} title="${value}">${prop}</var>
                            `
        )}
                          ${'>'}
                        </code>
                        <br/>
                        <cite style=${{ opacity: 0.5, fontSize: '11px', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
                          ${source.fileName.replace(/.*(src|pages)/, '$1')} ${source.lineNumber}:${source.columnNumber}
                        </cite>
                      </li>
                    `
      })}
                </ul>

                <button 
                  type="submit" 
                  style=${{
        all: 'unset',
        cursor: 'pointer',
        background: 'royalblue',
        color: 'white',
        padding: '5px 10px',
        borderRadius: '4px',
        fontSize: '13px',
        marginTop: '10px',
        float: 'right'
      }}
                >
                  Submit
                </button>
              </form>

              <div
                data-click-to-component-contextmenu-arrow
                ref=${arrowRef}
              />
            </dialog>
          </${FloatingFocusManager}>
        </${FloatingOverlay}>
      `}
  `
})
