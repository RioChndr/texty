import { $createParagraphNode, EditorConfig, ElementNode, LexicalEditor, LexicalNode, SerializedElementNode, SerializedLexicalNode, Spread } from "lexical";
import Style from './column.module.scss'
import { $createColumnNode } from "./ColumnNode";

type SerializedContainerColumnNode = Spread<
  {
    columnCount: number;
    type: 'conatainer-column';
    version: 1;
  },
  SerializedElementNode
>;

export class ContainerColumnNode extends ElementNode {
  __columnCount: number;

  constructor(columnCount: number, key?: string) {
    super(key);
    this.__columnCount = columnCount ?? 1;
  }

  static getType(): string {
    return 'conatainer-column';
  }

  static clone(node: ContainerColumnNode): ContainerColumnNode {
    return new ContainerColumnNode(node.__columnCount, node.__key);
  }

  createDOM(config: EditorConfig, editor: LexicalEditor): HTMLElement {
    const container = document.createElement('div');
    container.classList.add(Style['container-column']);
    container.classList.add(Style[`container-column--${this.__columnCount}`]);
    return container;
  }

  exportJSON(): SerializedContainerColumnNode {
    return {
      ...super.exportJSON(),
      columnCount: this.__columnCount,
      type: 'conatainer-column',
      version: 1,
    }
  }

  static importJSON(serializedNode: SerializedContainerColumnNode): LexicalNode {
    return $createContainerColumnNode({
      totalColumns: serializedNode.columnCount,
    });
  }

  updateDOM(_prevNode: unknown, _dom: HTMLElement, _config: EditorConfig): boolean {
    return false;
  }
}

export function $createContainerColumnNode(props: {
  totalColumns?: number;
}) {
  return new ContainerColumnNode(props.totalColumns ?? 2);
}

export function $isContainerColumnNode(node: LexicalNode | null | undefined): node is ContainerColumnNode {
  return node instanceof ContainerColumnNode;
}