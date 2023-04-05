import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { SerializedEditorState } from "lexical";
import { useEffect, useState } from "react";

export function DataPlugin({
  onChange,
  value
}: {
  onChange?: (value: SerializedEditorState) => void;
  value?: SerializedEditorState
}) {
  const [editor] = useLexicalComposerContext()
  const [isFirstRender, setIsFirstRender] = useState(true)

  useEffect(() => {
    if (isFirstRender) {
      setIsFirstRender(false)

      if (value) {
        const initialEditorState = editor.parseEditorState(value)
        editor.setEditorState(initialEditorState)
      }
    }
  }, [isFirstRender, value, editor])

  return (
    <OnChangePlugin onChange={(state) => {
      onChange && onChange(state.toJSON())
    }} />
  )
}