import { InitialConfigType, LexicalComposer } from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { InitialNodes } from './nodes/initial-nodes';
import FloatingLinkEditorPlugin from './plugins/FloatingLinkEditorPlugin';
import { CheckListPlugin } from '@lexical/react/LexicalCheckListPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import FloatingTextFormatToolbarPlugin from './plugins/FloatingTextFormatToolbarPlugin';
import MarkdownPlugin from './plugins/markdown-plugin';
import { ToolbarPlugin } from './plugins/ToolbarPlugin';
import { theme } from './theme';
import styles from './wysiwyg.module.scss';
import { ImagePlugin } from './plugins/ImagePlugin/ImagePlugin';

function onError(error: any) {
  console.error(error);
}

export function EditorWysiwyg({
  children
}: {
  children: JSX.Element;
}) {
  const initialConfig: InitialConfigType = {
    namespace: 'MyEditor',
    theme: theme,
    onError,
    nodes: [...InitialNodes]
  };

  return (
    <div className={styles.container}>
      <LexicalComposer initialConfig={initialConfig}>
        <ToolbarPlugin />
        <HistoryPlugin />
        <RichTextPlugin
          contentEditable={<ContentEditable />}
          placeholder={<div>Enter some text...</div>}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <LinkPlugin />
        {/* <FloatingTextFormatToolbarPlugin /> */}
        <MarkdownPlugin />
        <CheckListPlugin />
        <ListPlugin />
        <FloatingLinkEditorPlugin />

        {children}
      </LexicalComposer>
    </div>
  );
}

export default EditorWysiwyg