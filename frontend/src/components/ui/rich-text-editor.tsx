import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { TextStyle, FontFamily, FontSize } from '@tiptap/extension-text-style';
import { Extension } from '@tiptap/core';
import { Bold, Italic, List, ListOrdered, Quote, Heading2, Image as ImageIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { apiUploadFile } from '@/lib/api';
import { toast } from 'sonner';

const BlockStyle = Extension.create({
  name: 'blockStyle',
  addGlobalAttributes() {
    return [
      {
        types: ['paragraph', 'heading', 'textStyle'],
        attributes: {
          fontSize: {
            default: null,
            parseHTML: element => element.style.fontSize.replace(/['"]+/g, '') || null,
            renderHTML: attributes => {
              if (!attributes.fontSize) return {};
              return { style: `font-size: ${attributes.fontSize}` };
            },
          },
          fontFamily: {
            default: null,
            parseHTML: element => element.style.fontFamily.replace(/['"]+/g, '') || null,
            renderHTML: attributes => {
              if (!attributes.fontFamily) return {};
              return { style: `font-family: ${attributes.fontFamily}` };
            },
          },
          lineHeight: {
            default: null,
            parseHTML: element => element.style.lineHeight.replace(/['"]+/g, '') || null,
            renderHTML: attributes => {
              if (!attributes.lineHeight) return {};
              return { style: `line-height: ${attributes.lineHeight}` };
            },
          }
        },
      },
    ];
  },
});

export function RichTextEditor({ value, onChange }: { value: string; onChange: (val: string) => void }) {
  const [uploading, setUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      TextStyle,
      FontFamily,
      FontSize,
      BlockStyle,
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[200px] p-4',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;

    setUploading(true);
    try {
      const data = await apiUploadFile(file);
      // Assuming apiUploadFile returns { url: "..." }
      editor.chain().focus().setImage({ src: data.url }).run();
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  if (!editor) {
    return null;
  }

  const toggleBold = () => editor.chain().focus().toggleBold().run();
  const toggleItalic = () => editor.chain().focus().toggleItalic().run();
  const toggleH2 = () => editor.chain().focus().toggleHeading({ level: 2 }).run();
  const toggleBulletList = () => editor.chain().focus().toggleBulletList().run();
  const toggleOrderedList = () => editor.chain().focus().toggleOrderedList().run();
  const toggleBlockquote = () => editor.chain().focus().toggleBlockquote().run();

  const ToolbarButton = ({ onClick, isActive, icon: Icon, disabled }: any) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`p-2 rounded-md hover:bg-gray-100 transition-colors ${
        isActive ? 'bg-gray-200 text-[#3E332A]' : 'text-gray-600'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <Icon className="w-4 h-4" />
    </button>
  );

  const fontFamilies = [
    { name: 'Default Font', value: '' },
    { name: 'Arial', value: 'Arial, Helvetica, sans-serif' },
    { name: 'Georgia', value: 'Georgia, serif' },
    { name: 'Times New Roman', value: '"Times New Roman", Times, serif' },
    { name: 'Courier New', value: '"Courier New", Courier, monospace' },
    { name: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
    { name: 'Montserrat', value: '"Montserrat", sans-serif' },
    { name: 'Outfit', value: '"Outfit", sans-serif' },
    { name: 'Playfair Display', value: '"Playfair Display", serif' },
  ];

  const fontSizes = [
    { name: 'Default Size', value: '' },
    { name: '12px', value: '12px' },
    { name: '14px', value: '14px' },
    { name: '16px', value: '16px' },
    { name: '18px', value: '18px' },
    { name: '20px', value: '20px' },
    { name: '24px', value: '24px' },
    { name: '30px', value: '30px' },
    { name: '36px', value: '36px' },
    { name: '48px', value: '48px' },
    { name: '64px', value: '64px' },
  ];

  const lineHeights = [
    { name: 'Default Spacing', value: '' },
    { name: 'Single (1.0)', value: '1' },
    { name: 'Tight (1.15)', value: '1.15' },
    { name: 'Normal (1.5)', value: '1.5' },
    { name: 'Double (2.0)', value: '2' },
  ];

  const currentFontFamily = editor.getAttributes('textStyle').fontFamily || editor.getAttributes('paragraph').fontFamily || editor.getAttributes('heading').fontFamily || '';
  const currentFontSize = editor.getAttributes('textStyle').fontSize || editor.getAttributes('paragraph').fontSize || editor.getAttributes('heading').fontSize || '';
  const currentLineHeight = editor.getAttributes('textStyle').lineHeight || editor.getAttributes('paragraph').lineHeight || editor.getAttributes('heading').lineHeight || '';

  const displayedFontFamilies = [...fontFamilies];
  if (currentFontFamily && !fontFamilies.find(f => f.value === currentFontFamily)) {
    displayedFontFamilies.push({ name: currentFontFamily, value: currentFontFamily });
  }

  const displayedFontSizes = [...fontSizes];
  if (currentFontSize && !fontSizes.find(s => s.value === currentFontSize)) {
    displayedFontSizes.push({ name: currentFontSize, value: currentFontSize });
  }

  const displayedLineHeights = [...lineHeights];
  if (currentLineHeight && !lineHeights.find(s => s.value === currentLineHeight)) {
    displayedLineHeights.push({ name: currentLineHeight, value: currentLineHeight });
  }

  const applyAttribute = (attribute: string, value: string) => {
    const chain = editor.chain().focus();
    if (value) {
      if (editor.isActive('heading')) chain.updateAttributes('heading', { [attribute]: value });
      else if (editor.isActive('paragraph')) chain.updateAttributes('paragraph', { [attribute]: value });
      else chain.setMark('textStyle', { [attribute]: value });
    } else {
      if (editor.isActive('heading')) chain.updateAttributes('heading', { [attribute]: null });
      else if (editor.isActive('paragraph')) chain.updateAttributes('paragraph', { [attribute]: null });
      else chain.setMark('textStyle', { [attribute]: null });
    }
    chain.run();
  };

  return (
    <div className="border border-[#e5e1dc] rounded-xl overflow-hidden bg-white flex flex-col">
      <div className="border-b border-[#e5e1dc] p-2 flex flex-wrap gap-2 items-center bg-gray-50">
        <select
          className="text-xs py-1.5 px-2 rounded-md border border-gray-300 bg-white hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-[#3E332A] cursor-pointer max-w-[120px]"
          onChange={(e) => applyAttribute('fontFamily', e.target.value)}
          value={currentFontFamily}
        >
          {displayedFontFamilies.map((font, idx) => (
            <option key={`${font.value}-${idx}`} value={font.value}>{font.name}</option>
          ))}
        </select>

        <select
          className="text-xs py-1.5 px-2 rounded-md border border-gray-300 bg-white hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-[#3E332A] cursor-pointer max-w-[100px]"
          onChange={(e) => applyAttribute('fontSize', e.target.value)}
          value={currentFontSize}
        >
          {displayedFontSizes.map((size, idx) => (
            <option key={`${size.value}-${idx}`} value={size.value}>{size.name}</option>
          ))}
        </select>

        <select
          className="text-xs py-1.5 px-2 rounded-md border border-gray-300 bg-white hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-[#3E332A] cursor-pointer max-w-[120px]"
          onChange={(e) => applyAttribute('lineHeight', e.target.value)}
          value={currentLineHeight}
        >
          {displayedLineHeights.map((lh, idx) => (
            <option key={`${lh.value}-${idx}`} value={lh.value}>{lh.name}</option>
          ))}
        </select>
        
        <div className="w-px h-6 bg-gray-300 mx-1" />

        <div className="flex gap-1 items-center">
          <ToolbarButton onClick={toggleBold} isActive={editor.isActive('bold')} icon={Bold} />
          <ToolbarButton onClick={toggleItalic} isActive={editor.isActive('italic')} icon={Italic} />
        </div>
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <ToolbarButton onClick={toggleH2} isActive={editor.isActive('heading', { level: 2 })} icon={Heading2} />
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <div className="flex gap-1 items-center">
          <ToolbarButton onClick={toggleBulletList} isActive={editor.isActive('bulletList')} icon={List} />
          <ToolbarButton onClick={toggleOrderedList} isActive={editor.isActive('orderedList')} icon={ListOrdered} />
        </div>
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <ToolbarButton onClick={toggleBlockquote} isActive={editor.isActive('blockquote')} icon={Quote} />
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <label className={`p-2 rounded-md hover:bg-gray-100 transition-colors cursor-pointer text-gray-600 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
          {uploading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" /> : <ImageIcon className="w-4 h-4" />}
          <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
        </label>
      </div>
      <div className="flex-1 bg-white cursor-text" onClick={() => editor.commands.focus()}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
