import { LinkNode } from '@lexical/link';
import { MarkNode } from '@lexical/mark';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListItemNode, ListNode } from '@lexical/list';
import { HorizontalRuleNode } from '@lexical/react/LexicalHorizontalRuleNode';
import { CodeHighlightNode, CodeNode } from '@lexical/code';
import { ImageNode } from '../plugins/ImagePlugin/ImageNode';
import { ContainerColumnNode } from '../plugins/ColumnPlugin/ContainerColumnNode';
import { ColumnNode } from '../plugins/ColumnPlugin/ColumnNode';

export const InitialNodes = [
  HeadingNode,
  QuoteNode,
  ListNode,
  ListItemNode,
  LinkNode,
  MarkNode,
  HorizontalRuleNode,
  CodeNode,
  CodeHighlightNode,
  ContainerColumnNode,
  ColumnNode,
  ImageNode,
]