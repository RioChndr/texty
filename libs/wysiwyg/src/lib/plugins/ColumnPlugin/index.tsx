import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { mergeRegister, $findMatchingParent } from '@lexical/utils'
import { $createParagraphNode, $getSelection, $isRangeSelection, COMMAND_PRIORITY_EDITOR, COMMAND_PRIORITY_LOW, createCommand, DELETE_CHARACTER_COMMAND, KEY_ARROW_DOWN_COMMAND } from "lexical"
import { useEffect } from "react"
import { $createColumnNode, $isColumnNode } from "./ColumnNode"
import { $createContainerColumnNode, $isContainerColumnNode } from "./ContainerColumnNode"

export const INSERT_COLUMN_COMMAND = createCommand<{
  totalColumns: number;
}>()

export function ColumnPlugin() {
  const [editor] = useLexicalComposerContext()
  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(INSERT_COLUMN_COMMAND, (options) => {
        const selection = $getSelection()
        if (!$isRangeSelection(selection)) {
          return false
        }

        const container = $createContainerColumnNode(options)
        for (let i = 0; i < options.totalColumns; i++) {
          container.append($createColumnNode().append($createParagraphNode()))
        }
        selection.insertNodes([
          container
        ])

        return true
      }, COMMAND_PRIORITY_EDITOR),
      editor.registerCommand(
        KEY_ARROW_DOWN_COMMAND,
        () => {
          const selection = $getSelection();
          if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
            return false;
          }

          const container = $findMatchingParent(
            selection.anchor.getNode(),
            $isContainerColumnNode,
          );

          if (container === null) {
            return false;
          }

          const parent = container.getParent();
          if (parent !== null && parent.getLastChild() === container) {
            parent.append($createParagraphNode());
          }
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        DELETE_CHARACTER_COMMAND,
        () => {
          const selection = $getSelection();
          if (
            !$isRangeSelection(selection) ||
            selection.anchor.offset !== 0
          ) {
            console.info('not range selection or anchor offset is not 0')
            return false;
          }

          const anchorNode = selection.anchor.getNode();
          if ($isColumnNode(anchorNode.getParent()) || $isContainerColumnNode(anchorNode.getParent())) {
            anchorNode.getParent()?.remove();
            return true;
          }

          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
    )
  }, [])

  return null
}