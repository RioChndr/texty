import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $wrapNodeInElement, mergeRegister } from "@lexical/utils";
import { $createParagraphNode, $createRangeSelection, $getNodeByKey, $getSelection, $insertNodes, $isNodeSelection, $isRootOrShadowRoot, $setSelection, COMMAND_PRIORITY_EDITOR, COMMAND_PRIORITY_HIGH, createCommand, DRAGSTART_COMMAND, DROP_COMMAND, LexicalCommand, LexicalEditor, RangeSelection } from "lexical";
import { useEffect, useRef, useState } from "react";
import { $createImageNode, $isImageNode, ImageNode, SerializedImageNode } from "./ImageNode";

export const INSERT_IMAGE_COMMAND: LexicalCommand<{
  file?: File;
  src: string;
}> =
  createCommand('INSERT_IMAGE_COMMAND');
export const PICK_IMAGE_COMMAND: LexicalCommand<null> =
  createCommand('PICK_IMAGE_COMMAND');
export const SELECT_IMAGE_COMMAND: LexicalCommand<ImageNode | null> =
  createCommand('SELECT_IMAGE_COMMAND');
export const SET_ALIGN_IMAGE_COMMAND: LexicalCommand<'left' | 'center' | 'right'> =
  createCommand('SET_ALIGN_IMAGE_COMMAND');

export function ImagePlugin(props: {
  uploadImage: (file: File) => Promise<string>;
}) {
  const [editor] = useLexicalComposerContext();
  const inputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File>()

  useEffect(() => {
    if (!editor.hasNodes([ImageNode])) {
      throw new Error('ImagesPlugin: ImageNode not registered on editor');
    }

    return mergeRegister(
      editor.registerCommand(PICK_IMAGE_COMMAND, (_payload) => {
        inputRef.current?.click()
        return true;
      },
        COMMAND_PRIORITY_EDITOR
      ),
      editor.registerCommand(DRAGSTART_COMMAND, (event) => {
        const node = getImageNodeInSelection()
        if (!node) {
          console.error('no image node in selection')
          return false;
        };
        const dataTransfer = event.dataTransfer
        if (!dataTransfer) {
          return false;
        };
        dataTransfer.setData('text/plain', "_")
        dataTransfer.setData('application/x-lexical-drag', JSON.stringify({
          data: {
            src: node.__src,
          },
          key: node.getKey()
        }))
        return true;
      }, COMMAND_PRIORITY_HIGH),
      editor.registerCommand(DROP_COMMAND, (event: DragEvent, editor: LexicalEditor) => {
        const data = event.dataTransfer?.getData('application/x-lexical-drag')
        if (!data) {
          // drop from outside
          const files = event.dataTransfer?.files
          if (!files || files.length < 1) {
            return false
          }
          for (let i = 0; i < files.length; i++) {
            const file = files[i];
            handleImportImage(file, (url) => {
              editor.dispatchCommand(INSERT_IMAGE_COMMAND, { src: url, file })
            })
          }
          return false
        };
        const { key, data: nodeData } = JSON.parse(data)
        const node = $getNodeByKey(key)
        if (!key || !nodeData || !node) {
          return false
        };
        event.preventDefault();
        setDropLocationSelection(event)
        node.remove()
        editor.dispatchCommand(INSERT_IMAGE_COMMAND, nodeData)
        return true;
      }, COMMAND_PRIORITY_HIGH),
      editor.registerCommand(INSERT_IMAGE_COMMAND, (payload) => {
        if (payload.file) {
          const preImage = $createImageNode({ src: payload.src, isLoading: true })
          editor.update(() => {
            $insertNodes([preImage]);
            if ($isRootOrShadowRoot(preImage.getParentOrThrow())) {
              $wrapNodeInElement(preImage, $createParagraphNode).selectEnd();
            }
          })
          props.uploadImage(payload.file).then(url => {
            if (!url) return;
            editor.update(() => {
              preImage.remove()
            })
            editor.dispatchCommand(INSERT_IMAGE_COMMAND, { src: url })
          })
          return true;
        }
        const node = $createImageNode(payload);
        editor.update(() => {
          $insertNodes([node]);
          if ($isRootOrShadowRoot(node.getParentOrThrow())) {
            $wrapNodeInElement(node, $createParagraphNode).selectEnd();
          }
        })
        return true;
      }, COMMAND_PRIORITY_EDITOR),
    )
  }, [editor])

  const handleImportImage = (file: File, onLoad: (url: string, file: File) => void) => {
    // check if file is image
    if (!file.type.startsWith('image/')) {
      return
    }

    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      const url = reader.result as string
      onLoad(url, file)
    }
  }

  useEffect(() => {
    if (selectedFile) {
      handleImportImage(selectedFile, (url, file) => {
        editor.dispatchCommand(INSERT_IMAGE_COMMAND, { src: url, file })
      })
    }
  }, [selectedFile])


  return (
    <div>
      <input type='file' ref={inputRef} onChange={(e) => {
        setSelectedFile(e.target.files?.[0])
      }} style={{ display: 'none' }} />
    </div>
  )
}

function getImageNodeInSelection(): ImageNode | null {
  const selection = $getSelection();
  if (!$isNodeSelection(selection)) {
    return null;
  }
  const nodes = selection.getNodes();
  const node = nodes[0];
  return $isImageNode(node) ? node : null;
}

/**
 * Below is code from 
 * https://github.com/facebook/lexical/blob/1cf4eada0c414f2747bffad7f47dd0668057554a/packages/lexical-playground/src/plugins/ImagesPlugin/index.tsx
 * 
 * have no idea what it does, but it works
 */
export const CAN_USE_DOM: boolean =
  typeof window !== 'undefined' &&
  typeof window.document !== 'undefined' &&
  typeof window.document.createElement !== 'undefined';

const getDOMSelection = (targetWindow: Window | null): Selection | null =>
  CAN_USE_DOM ? (targetWindow || window).getSelection() : null;

function getDragSelection(event: any): Range | null | undefined {
  let range;
  const target = event.target as null | Element | Document;
  const targetWindow =
    target == null
      ? null
      : target.nodeType === 9
        ? (target as Document).defaultView
        : (target as Element).ownerDocument.defaultView;
  const domSelection = getDOMSelection(targetWindow);
  if (document.caretRangeFromPoint) {
    range = document.caretRangeFromPoint(event.clientX, event.clientY);
  } else if (event.rangeParent && domSelection !== null) {
    domSelection.collapse(event.rangeParent, event.rangeOffset || 0);
    range = domSelection.getRangeAt(0);
  } else {
    throw Error(`Cannot get the selection when dragging`);
  }

  return range;
}

function setDropLocationSelection(event: DragEvent) {
  const range = getDragSelection(event)
  const rangeSelection = $createRangeSelection()
  if (range) {
    rangeSelection.applyDOMRange(range);
  }
  $setSelection(rangeSelection);
}