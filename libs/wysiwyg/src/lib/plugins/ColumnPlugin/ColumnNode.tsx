import { EditorConfig, ElementNode, LexicalEditor, LexicalNode, SerializedElementNode, Spread } from "lexical";
import Style from './column.module.scss'

type SerializedColumnNode = Spread<
  {
    type: 'column';
    version: 1;
  },
  SerializedElementNode
>;


export class ColumnNode extends ElementNode {

  static getType(): string {
    return 'column';
  }

  static clone(node: ColumnNode): ColumnNode {
    return new ColumnNode(node.__key);
  }

  createDOM(config: EditorConfig, editor: LexicalEditor): HTMLElement {
    const container = document.createElement('div');
    container.classList.add(Style['container-column--child']);

    return container;
  }

  exportJSON(): SerializedColumnNode {
    return {
      ...super.exportJSON(),
      type: 'column',
      version: 1,
    }
  }

  static importJSON(serializedNode: SerializedColumnNode): LexicalNode {
    return $createColumnNode();
  }

  updateDOM(_prevNode: unknown, _dom: HTMLElement, _config: EditorConfig): boolean {
    return false;
  }
}

export function $createColumnNode() {
  return new ColumnNode();
}

export function $isColumnNode(node: LexicalNode | null | undefined): node is ColumnNode {
  return node instanceof ColumnNode;
}