import { $applyNodeReplacement, DecoratorNode, DOMConversionMap, DOMConversionOutput, DOMExportOutput, EditorConfig, LexicalNode, NodeKey, SerializedLexicalNode, Spread } from "lexical";
import React, { ReactNode, Suspense } from "react";
import { ImageComponentProps } from "./ImageComponent";
import Styles from './image.module.scss';

const ImageComponent = React.lazy(() => import("./ImageComponent"));

export class ImageNode extends DecoratorNode<ReactNode> {
  __src: string;
  __caption?: string;
  __isLoading?: boolean;

  getSrc() {
    return this.__src;
  }

  static getType(): string {
    return 'Image';
  }

  static clone(node: ImageNode): ImageNode {
    return new ImageNode({
      src: node.__src,
      caption: node.__caption,
      isLoading: node.__isLoading,
    }, node.__key);
  }

  constructor(props: ImageComponentProps, key?: NodeKey) {
    super(key);
    this.__src = props.src;
    this.__caption = props.caption;
    this.__isLoading = props.isLoading;
  }

  createDOM(config: EditorConfig): HTMLElement {
    const span = document.createElement('span');
    const className = `${config.theme.image} ${Styles.container}`
    if (className) {
      span.className = className
    }
    return span
  }

  updateDOM(): false {
    return false;
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('img');
    element.setAttribute('src', this.__src);
    element.setAttribute('alt', this.__caption || '');
    return { element };
  }

  static importDOM(): DOMConversionMap | null {
    return {
      img: (node: Node) => ({
        conversion: convertImageElement,
        priority: 0,
      }),
    };
  }

  exportJSON(): SerializedImageNode {
    return {
      src: this.getSrc(),
      type: 'Image',
      version: 1,
    };
  }

  static importJSON(_serializedNode: SerializedImageNode): LexicalNode {
    const { src } = _serializedNode;
    const node = $createImageNode({
      src
    });
    return node;
  }

  decorate(): ReactNode {
    return (
      <Suspense>
        <ImageComponent
          src={this.__src}
          caption={this.__caption}
          isLoading={this.__isLoading}
          nodeKey={this.getKey()}
        />
      </Suspense>
    );
  }
}

export function $createImageNode(props: ImageComponentProps): ImageNode {
  return $applyNodeReplacement(new ImageNode(props));
}

export function $isImageNode(node?: LexicalNode | null | undefined): node is ImageNode {
  return node instanceof ImageNode;
}

function convertImageElement(domNode: Node): null | DOMConversionOutput {
  if (domNode instanceof HTMLImageElement) {
    const { alt: altText, src, width, height } = domNode;
    const node = $createImageNode({ src, caption: altText });
    return { node };
  }
  return null;
}


export type SerializedImageNode = Spread<
  {
    src: string;
    type: 'Image';
    version: 1;
  },
  SerializedLexicalNode
>;