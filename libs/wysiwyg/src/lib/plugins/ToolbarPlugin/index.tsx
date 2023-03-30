import { BsArrowClockwise, BsArrowCounterclockwise, BsCardImage, BsListOl, BsListUl, BsPencilFill, BsTextCenter, BsTextLeft, BsTextRight, BsType, BsTypeH1, BsTypeH2, BsTypeH3 } from 'react-icons/bs'
import Styles from './index.module.scss'
import {
  BsTypeItalic,
  BsTypeBold,
  BsTypeUnderline,
  BsTypeStrikethrough,
  BsSubscript,
  BsSuperscript,
  BsCodeSlash,
  BsLink45Deg
} from 'react-icons/bs'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  $getSelectionStyleValueForProperty,
  $isParentElementRTL,
  $patchStyleText,
  $selectAll,
  $setBlocksType,
} from '@lexical/selection';
import React, { useCallback, useEffect, useState } from 'react'
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_CRITICAL,
  FORMAT_TEXT_COMMAND,
  SELECTION_CHANGE_COMMAND,
  $isTextNode,
  LexicalEditor,
  CAN_UNDO_COMMAND,
  CAN_REDO_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
  $isRootOrShadowRoot,
  $createParagraphNode,
  FORMAT_ELEMENT_COMMAND,
  $isNodeSelection,
  COMMAND_PRIORITY_LOW,
  LexicalNode
} from 'lexical'
import {
  $isListNode,
  INSERT_CHECK_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  ListNode,
  REMOVE_LIST_COMMAND,
} from '@lexical/list';
import {
  $getNearestBlockElementAncestorOrThrow,
  $getNearestNodeOfType,
  mergeRegister,
  $findMatchingParent,
} from '@lexical/utils';
import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
  HeadingTagType,
} from '@lexical/rich-text';
import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
import { getSelectedNode } from 'libs/wysiwyg/src/utils/getSelectedNode'
import { Listbox } from '@headlessui/react'

import { Dropdown } from '../../components/dropdown';
import { ImagePlugin, PICK_IMAGE_COMMAND, SELECT_IMAGE_COMMAND } from '../ImagePlugin/ImagePlugin';
import { $isImageNode, ImageNode } from '../ImagePlugin/ImageNode';

const blockTypeToBlockName: Record<string, string> = {
  paragraph: 'Normal',
  bullet: 'Bulleted List',
  h1: 'Heading 1',
  h2: 'Heading 2',
  h3: 'Heading 3',
  number: 'Numbered List',
};

type BlockType = keyof typeof blockTypeToBlockName;

function ToolbarItem({ icon, children, onClick, isActive, isDisabled }: {
  icon?: JSX.Element,
  onClick?: () => void,
  isActive?: boolean
  isDisabled?: boolean
  children?: React.ReactNode
}) {
  return (
    <div className={`${Styles.itemTool} ${isActive ? Styles.itemToolActive : ''} ${isDisabled ? Styles.itemToolDisabled : ''}`} onClick={onClick}>
      {icon ?? icon}
      {children}
    </div>
  )
}

export function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [activeEditor, setActiveEditor] = useState(editor)
  const [blockType, setBlockType] = useState<keyof typeof blockTypeToBlockName>('paragraph')

  const [isLink, setIsLink] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isSubscript, setIsSubscript] = useState(false);
  const [isSuperscript, setIsSuperscript] = useState(false);
  const [isCode, setIsCode] = useState(false);

  const [isEditable, setIsEditable] = useState(true)
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)

  const updateToolbar = useCallback(() => {
    const selection = $getSelection()
    if (!$isRangeSelection(selection)) return;

    const node = getSelectedNode(selection);

    // Update text format
    setIsBold(selection.hasFormat('bold'));
    setIsItalic(selection.hasFormat('italic'));
    setIsUnderline(selection.hasFormat('underline'));
    setIsStrikethrough(selection.hasFormat('strikethrough'));
    setIsSubscript(selection.hasFormat('subscript'));
    setIsSuperscript(selection.hasFormat('superscript'));
    setIsCode(selection.hasFormat('code'));

    const parent = node.getParent();
    if ($isLinkNode(parent) || $isLinkNode(node)) {
      setIsLink(true);
    } else {
      setIsLink(false);
    }

    updateBlockType()
  }, [editor])

  const updateBlockType = useCallback(() => {
    const selection = $getSelection()
    if (!$isRangeSelection(selection)) return;

    const anchorNode = selection.anchor.getNode();
    let element = anchorNode.getKey() === 'root' ? anchorNode : $findMatchingParent(anchorNode, (e) => {
      const parent = e.getParent();
      return parent !== null && $isRootOrShadowRoot(parent);
    })
    if (!element) {
      element = anchorNode.getTopLevelElementOrThrow()
    }

    const elementKey = element.getKey();
    const elementDOM = activeEditor.getElementByKey(elementKey)
    if (elementDOM !== null) {
      if ($isListNode(element)) {
        const parentList = $getNearestNodeOfType<ListNode>(
          anchorNode,
          ListNode,
        );
        const type = parentList
          ? parentList.getListType()
          : element.getListType();
        setBlockType(type);
      } else {
        const type = $isHeadingNode(element)
          ? element.getTag()
          : element.getType();
        if (type in blockTypeToBlockName) {
          setBlockType(type);
        }
      }
    }
  }, [editor])

  const insertLink = useCallback(() => {
    if (!isLink) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, 'https://')
    } else {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null)
    }
  }, [editor, isLink])

  const pickImage = useCallback(() => {
    editor.dispatchCommand(PICK_IMAGE_COMMAND, null)
  }, [editor])

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      (_payload, newEditor) => {
        updateToolbar()
        setActiveEditor(newEditor)
        return false;
      },
      COMMAND_PRIORITY_CRITICAL
    )
  }, [editor, updateToolbar])

  useEffect(() => {
    return mergeRegister(
      editor.registerEditableListener((editable) => {
        setIsEditable(editable);
      }),
      activeEditor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateToolbar();
        });
      }),
      activeEditor.registerCommand<boolean>(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
      activeEditor.registerCommand<boolean>(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
      // activeEditor.registerCommand(
      //   SELECT_IMAGE_COMMAND,
      //   (payload) => {
      //     if (!payload) {
      //       setSelectedImage(undefined)
      //       return true
      //     };
      //     setSelectedImage(payload);
      //     return true;
      //   },
      //   COMMAND_PRIORITY_LOW
      // )
    );
  }, [activeEditor, editor, updateToolbar]);

  return (
    <div className={Styles.container}>
      <BlockFormatDropdown editor={activeEditor} blockType={blockType} disabled={!isEditable} />
      <ToolbarItem icon={<BsArrowCounterclockwise />} isDisabled={!canUndo} onClick={() => {
        activeEditor.dispatchCommand(UNDO_COMMAND, undefined)
      }} />
      <ToolbarItem icon={<BsArrowClockwise />} isDisabled={!canRedo} onClick={() => {
        activeEditor.dispatchCommand(REDO_COMMAND, undefined)
      }} />
      <ToolbarItem icon={<BsTypeItalic />} isActive={isItalic} onClick={() => {
        activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')
      }} />
      <ToolbarItem icon={<BsTypeBold />} isActive={isBold} onClick={() => {
        activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')
      }} />
      <ToolbarItem icon={<BsTypeUnderline />} isActive={isUnderline} onClick={() => {
        activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')
      }} />
      <ToolbarItem icon={<BsTypeStrikethrough />} isActive={isStrikethrough} onClick={() => {
        activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')
      }} />
      <ToolbarItem icon={<BsSubscript />} isActive={isSubscript} onClick={() => {
        activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'subscript')
      }} />
      <ToolbarItem icon={<BsSuperscript />} isActive={isSuperscript} onClick={() => {
        activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'superscript')
      }} />
      <ToolbarItem icon={<BsCodeSlash />} isActive={isCode} onClick={() => {
        activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code')
      }} />
      <ToolbarItem icon={<BsLink45Deg />} isActive={isLink} onClick={insertLink} />
      <AlignFormatDropdown editor={activeEditor} />
      <ToolbarItem icon={<BsCardImage />} onClick={pickImage}></ToolbarItem>
    </div>
  )
}

function BlockFormatDropdown({
  editor,
  blockType,
  disabled = false,
}: {
  blockType: keyof typeof blockTypeToBlockName;
  editor: LexicalEditor;
  disabled?: boolean;
}) {
  const [selected, setSelected] = useState<keyof typeof blockTypeToBlockName>(blockType)

  const formatHeading = (headingSize: HeadingTagType) => {
    if (blockType !== headingSize) {
      editor.update(() => {
        const selection = $getSelection();
        if (
          $isRangeSelection(selection)
        ) {
          $setBlocksType(selection, () => $createHeadingNode(headingSize));
        }
      });
    }
  };

  useEffect(() => {
    switch (selected) {
      case 'bullet':
        if (blockType !== 'bullet') {
          editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
        } else {
          editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
        }
        break;
      case 'h1':
        formatHeading('h1')
        break;
      case 'h2':
        formatHeading('h2')
        break;
      case 'h3':
        formatHeading('h3')
        break;
      case 'number':
        if (blockType !== 'number') {
          editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
        } else {
          editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
        }
        break;
      case 'paragraph':
        editor.update(() => {
          const selection = $getSelection();
          if (
            $isRangeSelection(selection)
          ) {
            $setBlocksType(selection, () => $createParagraphNode());
          }
        });
        break;
    }
  }, [selected])

  return (
    <Dropdown
      activator={(
        <div className={Styles.itemTool}>
          <BlockName blockType={blockType} />
        </div>
      )}
    >
      {Object.keys(blockTypeToBlockName).map((blockTypeId) => (
        <div
          key={blockTypeId}
          className={Styles.option}
          onClick={() => {
            setSelected(blockTypeId)
          }}
        >
          <BlockName blockType={blockTypeId} />
        </div>
      ))}
    </Dropdown>
  )
}

function BlockName(props: {
  blockType: BlockType;
}) {
  const { blockType } = props;
  const icons: Record<keyof typeof blockTypeToBlockName, JSX.Element> = {
    bullet: <BsListUl />,
    h1: <BsTypeH1 />,
    h2: <BsTypeH2 />,
    h3: <BsTypeH3 />,
    number: <BsListOl />,
    paragraph: <BsType />,
  }
  return (
    <div className={Styles.blockName}>
      {icons[blockType]}

      <span>
        {blockTypeToBlockName[blockType]}
      </span>
    </div>
  )
}

function AlignFormatDropdown({
  editor,
  disabled = false,
}: {
  editor: LexicalEditor;
  disabled?: boolean;
}) {
  return (
    <Dropdown
      activator={(
        <div className={Styles.itemTool}>
          <BsTextLeft />
        </div>
      )}
    >
      <div
        className={Styles.option}
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left')
        }}
      >
        <BsTextLeft />
        <span style={{ marginLeft: '8px' }}>Align Left</span>
      </div>
      <div
        className={Styles.option}
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center')
        }}
      >
        <BsTextCenter />
        <span style={{ marginLeft: '8px' }}>Align Center</span>
      </div>
      <div
        className={Styles.option}
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right')
        }}
      >
        <BsTextRight />
        <span style={{ marginLeft: '8px' }}>Align Right</span>
      </div>
    </Dropdown>
  )
}