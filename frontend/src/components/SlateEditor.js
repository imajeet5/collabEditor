import React, { useCallback, useMemo } from 'react';
import { createEditor, Transforms, Editor, Element as SlateElement } from 'slate';
import { Slate, Editable, withReact } from 'slate-react';
import { withHistory } from 'slate-history';

// Helper functions for formatting
const isMarkActive = (editor, format) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};

const toggleMark = (editor, format) => {
  const isActive = isMarkActive(editor, format);
  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

const isBlockActive = (editor, format) => {
  const { selection } = editor;
  if (!selection) return false;

  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: n =>
        !Editor.isEditor(n) &&
        SlateElement.isElement(n) &&
        n.type === format,
    })
  );

  return !!match;
};

const toggleBlock = (editor, format) => {
  const isActive = isBlockActive(editor, format);
  const isList = ['numbered-list', 'bulleted-list'].includes(format);

  Transforms.unwrapNodes(editor, {
    match: n =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      ['numbered-list', 'bulleted-list'].includes(n.type),
    split: true,
  });

  const newProperties = {
    type: isActive ? 'paragraph' : isList ? 'list-item' : format,
  };

  Transforms.setNodes(editor, newProperties);

  if (!isActive && isList) {
    const block = { type: format, children: [] };
    Transforms.wrapNodes(editor, block);
  }
};

// Component for rendering elements
const Element = ({ attributes, children, element }) => {
  const style = { textAlign: element.align };
  
  switch (element.type) {
    case 'block-quote':
      return (
        <blockquote 
          style={style} 
          {...attributes}
          className="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-4"
        >
          {children}
        </blockquote>
      );
    case 'bulleted-list':
      return (
        <ul style={style} {...attributes} className="list-disc list-inside my-4">
          {children}
        </ul>
      );
    case 'heading':
      return (
        <h2 
          style={style} 
          {...attributes}
          className="text-2xl font-bold mt-6 mb-4 text-gray-900"
        >
          {children}
        </h2>
      );
    case 'list-item':
      return (
        <li style={style} {...attributes} className="my-1">
          {children}
        </li>
      );
    case 'numbered-list':
      return (
        <ol style={style} {...attributes} className="list-decimal list-inside my-4">
          {children}
        </ol>
      );
    default:
      return (
        <p style={style} {...attributes} className="my-2 leading-relaxed">
          {children}
        </p>
      );
  }
};

// Component for rendering leaves (text formatting)
const Leaf = ({ attributes, children, leaf }) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }

  if (leaf.code) {
    children = (
      <code className="bg-gray-100 text-red-600 px-1 py-0.5 rounded text-sm font-mono">
        {children}
      </code>
    );
  }

  if (leaf.italic) {
    children = <em>{children}</em>;
  }

  if (leaf.underline) {
    children = <u>{children}</u>;
  }

  return <span {...attributes}>{children}</span>;
};

// Toolbar component
const Toolbar = ({ editor }) => {
  return (
    <div className="border-b border-gray-200 p-3 flex flex-wrap gap-2 bg-gray-50">
      {/* Text formatting buttons */}
      <div className="flex gap-1">
        <MarkButton format="bold" editor={editor}>
          <span className="font-bold">B</span>
        </MarkButton>
        <MarkButton format="italic" editor={editor}>
          <span className="italic">I</span>
        </MarkButton>
        <MarkButton format="underline" editor={editor}>
          <span className="underline">U</span>
        </MarkButton>
        <MarkButton format="code" editor={editor}>
          <span className="font-mono bg-gray-100 px-1 rounded text-xs">Code</span>
        </MarkButton>
      </div>
      
      <div className="w-px h-6 bg-gray-300"></div>
      
      {/* Block formatting buttons */}
      <div className="flex gap-1">
        <BlockButton format="heading" editor={editor}>
          <span className="font-bold text-lg">H1</span>
        </BlockButton>
        <BlockButton format="block-quote" editor={editor}>
          <span className="text-lg">"</span>
        </BlockButton>
        <BlockButton format="numbered-list" editor={editor}>
          <span className="font-mono">1.</span>
        </BlockButton>
        <BlockButton format="bulleted-list" editor={editor}>
          <span className="font-bold">•</span>
        </BlockButton>
      </div>
      
      <div className="w-px h-6 bg-gray-300"></div>
      
      {/* Help text */}
      <div className="flex items-center text-xs text-gray-500 ml-auto">
        <span>Rich text editing enabled • Use toolbar or keyboard shortcuts</span>
      </div>
    </div>
  );
};

// Mark button component
const MarkButton = ({ format, editor, children }) => {
  const isActive = isMarkActive(editor, format);
  
  return (
    <button
      type="button"
      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors min-w-[32px] ${
        isActive 
          ? 'bg-blue-600 text-white shadow-sm' 
          : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
      }`}
      onMouseDown={(event) => {
        event.preventDefault();
        toggleMark(editor, format);
      }}
    >
      {children}
    </button>
  );
};

// Block button component
const BlockButton = ({ format, editor, children }) => {
  const isActive = isBlockActive(editor, format);
  
  return (
    <button
      type="button"
      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors min-w-[32px] ${
        isActive 
          ? 'bg-blue-600 text-white shadow-sm' 
          : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
      }`}
      onMouseDown={(event) => {
        event.preventDefault();
        toggleBlock(editor, format);
      }}
    >
      {children}
    </button>
  );
};

// Main SlateEditor component
const SlateEditor = ({ value, onChange, placeholder = "Start typing..." }) => {
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);
  
  // Parse the value - if it's a string, convert to Slate format
  const slateValue = useMemo(() => {
    if (typeof value === 'string') {
      // Convert plain text to Slate format
      const lines = value.split('\n');
      return lines.map(line => ({
        type: 'paragraph',
        children: [{ text: line }],
      }));
    }
    
    // If value is already in Slate format or empty
    if (Array.isArray(value) && value.length > 0) {
      return value;
    }
    
    // Default empty document
    return [
      {
        type: 'paragraph',
        children: [{ text: '' }],
      },
    ];
  }, [value]);

  const renderElement = useCallback(props => <Element {...props} />, []);
  const renderLeaf = useCallback(props => <Leaf {...props} />, []);

  const handleChange = useCallback((newValue) => {
    // Convert Slate value to plain text for backend compatibility
    const plainText = newValue
      .map(n => {
        if (n.type && n.children) {
          return n.children.map(child => child.text || '').join('');
        }
        return '';
      })
      .join('\n');
    
    onChange(plainText, newValue);
  }, [onChange]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((event) => {
    if (event.ctrlKey || event.metaKey) {
      switch (event.key) {
        case 'b':
          event.preventDefault();
          toggleMark(editor, 'bold');
          break;
        case 'i':
          event.preventDefault();
          toggleMark(editor, 'italic');
          break;
        case 'u':
          event.preventDefault();
          toggleMark(editor, 'underline');
          break;
        case '`':
          event.preventDefault();
          toggleMark(editor, 'code');
          break;
        default:
          // No default action needed
          break;
      }
    }
  }, [editor]);

  return (
    <div className="h-full flex flex-col">
      <Slate editor={editor} initialValue={slateValue} onChange={handleChange}>
        <Toolbar editor={editor} />
        <div className="flex-1 overflow-y-auto bg-white">
          <Editable
            renderElement={renderElement}
            renderLeaf={renderLeaf}
            placeholder={placeholder}
            onKeyDown={handleKeyDown}
            className="h-full p-6 focus:outline-none prose prose-slate max-w-none"
            style={{ 
              minHeight: '500px',
              lineHeight: '1.6',
              fontSize: '16px'
            }}
          />
        </div>
      </Slate>
    </div>
  );
};

export default SlateEditor;
