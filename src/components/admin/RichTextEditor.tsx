import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Link as LinkIcon,
  Undo,
  Redo
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, className }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Initial value sync
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      // Only update if content is significantly different to avoid cursor jumping
      // This is a simple check; for production, a more robust comparison is better
      if (Math.abs(editorRef.current.innerHTML.length - value.length) > 5 || value === '') {
        editorRef.current.innerHTML = value;
      }
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const execCommand = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  const ToolbarButton = ({ 
    icon: Icon, 
    command, 
    arg, 
    title 
  }: { 
    icon: any, 
    command: string, 
    arg?: string, 
    title: string 
  }) => (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
      onClick={(e) => {
        e.preventDefault();
        execCommand(command, arg);
      }}
      title={title}
    >
      <Icon className="h-4 w-4" />
    </Button>
  );

  return (
    <div className={cn("border rounded-md overflow-hidden bg-white dark:bg-gray-950", className, isFocused && "ring-2 ring-blue-500 ring-offset-2")}>
      <div className="flex flex-wrap items-center gap-1 p-1 border-b bg-gray-50 dark:bg-gray-900">
        <ToolbarButton icon={Bold} command="bold" title="Kalın" />
        <ToolbarButton icon={Italic} command="italic" title="İtalik" />
        <ToolbarButton icon={Underline} command="underline" title="Altı Çizili" />
        <div className="w-px h-4 bg-gray-300 mx-1" />
        <ToolbarButton icon={List} command="insertUnorderedList" title="Liste" />
        <ToolbarButton icon={ListOrdered} command="insertOrderedList" title="Sıralı Liste" />
        <div className="w-px h-4 bg-gray-300 mx-1" />
        <ToolbarButton icon={AlignLeft} command="justifyLeft" title="Sola Yasla" />
        <ToolbarButton icon={AlignCenter} command="justifyCenter" title="Ortala" />
        <ToolbarButton icon={AlignRight} command="justifyRight" title="Sağa Yasla" />
        <div className="w-px h-4 bg-gray-300 mx-1" />
        <ToolbarButton icon={Undo} command="undo" title="Geri Al" />
        <ToolbarButton icon={Redo} command="redo" title="İleri Al" />
      </div>
      <div
        ref={editorRef}
        className="p-4 min-h-[150px] max-h-[400px] overflow-y-auto outline-none prose prose-sm max-w-none dark:prose-invert"
        contentEditable
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        dangerouslySetInnerHTML={{ __html: value }}
      />
    </div>
  );
};
