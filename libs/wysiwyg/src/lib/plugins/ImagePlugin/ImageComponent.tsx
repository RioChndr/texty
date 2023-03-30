import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection';
import { mergeRegister } from '@lexical/utils';
import classNames from 'classnames';
import { $getNodeByKey, $getSelection, $isNodeSelection, CLICK_COMMAND, COMMAND_PRIORITY_LOW, GridSelection, KEY_BACKSPACE_COMMAND, KEY_DELETE_COMMAND, LexicalEditor, NodeSelection, RangeSelection, SELECTION_CHANGE_COMMAND } from 'lexical';
import { useCallback, useEffect, useRef, useState } from 'react';
import Styles from './image.module.scss';
import { SELECT_IMAGE_COMMAND } from './ImagePlugin';

export interface ImageComponentProps {
  src: string;
  caption?: string;
  nodeKey?: string;
  isLoading?: boolean;
}

export default function ImageComponent(props: ImageComponentProps) {
  const [editor] = useLexicalComposerContext();

  const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(props.nodeKey!)
  const refImage = useRef<HTMLImageElement>(null)
  const activeEditorRef = useRef<LexicalEditor>()

  const onDelete = useCallback((event: KeyboardEvent) => {
    if (isSelected && $isNodeSelection($getSelection())) {
      event.preventDefault()
      const node = $getNodeByKey(props.nodeKey ?? '')
      event.preventDefault()
      node?.remove()
      setSelected(false)
    }
    return false
  }, [editor, isSelected, props.nodeKey])

  useEffect(() => {
    editor.update(() => {
      if (isSelected) {
        editor.dispatchCommand(SELECT_IMAGE_COMMAND, $getNodeByKey(props.nodeKey ?? ''))
      } else {
        editor.dispatchCommand(SELECT_IMAGE_COMMAND, null)
      }
    })
  }, [isSelected, editor])


  useEffect(() => {
    let isMounted = true;
    const unregister = mergeRegister(
      editor.registerCommand<MouseEvent>(
        CLICK_COMMAND,
        (payload) => {
          const event = payload;

          if (event.target === refImage.current) {
            if (event.shiftKey) {
              setSelected(!isSelected);
              return true;
            }
            setSelected(!isSelected);
          }
          return false;

        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(KEY_DELETE_COMMAND, (e) => onDelete(e), COMMAND_PRIORITY_LOW),
      editor.registerCommand(KEY_BACKSPACE_COMMAND, (e) => onDelete(e), COMMAND_PRIORITY_LOW),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        (_, activeEditor) => {
          setSelected(!isSelected);
          activeEditorRef.current = activeEditor;
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
    )

    return () => {
      isMounted = false;
      unregister();
    }
  }, [editor, isSelected, onDelete, setSelected, props.nodeKey])

  return (
    <>
      <img
        draggable={isSelected}
        src={props.src}
        alt={props.caption}
        className={classNames(Styles.image, {
          [Styles.active]: isSelected
        })}
        ref={refImage}
      />
      {props.isLoading && <div className={Styles.loading}>
        Loading ...
      </div>}
    </>
  )
}