import { Bold, Italic, Underline, List, Type } from "lucide-react";

export default function RichTextToolbar() {
  const applyFormat = (e, command) => {
    e.preventDefault();
    if (command === 'removeFormat') {
      document.execCommand('removeFormat', false, null);
      document.execCommand('unlink', false, null);
      return;
    }
    document.execCommand(command, false, null);
  };

  return (
    <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md border border-white/10 p-1.5 rounded-lg shadow-sm">
      <div className="relative group flex items-center justify-center">
        <button
          onMouseDown={(e) => applyFormat(e, 'bold')}
          className="p-1.5 text-on-surface hover:bg-white/10 rounded transition-colors"
        >
          <Bold size={14} />
        </button>
        <div className="absolute top-full mt-2 px-2 py-1 bg-gray-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg">
          Bold (Cmd/Ctrl+B)
        </div>
      </div>

      <div className="relative group flex items-center justify-center">
        <button
          onMouseDown={(e) => applyFormat(e, 'italic')}
          className="p-1.5 text-on-surface hover:bg-white/10 rounded transition-colors"
        >
          <Italic size={14} />
        </button>
        <div className="absolute top-full mt-2 px-2 py-1 bg-gray-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg">
          Italic (Cmd/Ctrl+I)
        </div>
      </div>

      <div className="relative group flex items-center justify-center">
        <button
          onMouseDown={(e) => applyFormat(e, 'underline')}
          className="p-1.5 text-on-surface hover:bg-white/10 rounded transition-colors"
        >
          <Underline size={14} />
        </button>
        <div className="absolute top-full mt-2 px-2 py-1 bg-gray-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg">
          Underline (Cmd/Ctrl+U)
        </div>
      </div>

      <div className="w-px h-4 bg-white/10 mx-1" />

      <div className="relative group flex items-center justify-center">
        <button
          onMouseDown={(e) => applyFormat(e, 'insertUnorderedList')}
          className="p-1.5 text-on-surface hover:bg-white/10 rounded transition-colors"
        >
          <List size={14} />
        </button>
        <div className="absolute top-full mt-2 px-2 py-1 bg-gray-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg">
          Bullet List
        </div>
      </div>

      <div className="relative group flex items-center justify-center">
        <button
          onMouseDown={(e) => applyFormat(e, 'removeFormat')}
          className="p-1.5 text-on-surface hover:bg-white/10 rounded transition-colors"
        >
          <Type size={14} />
        </button>
        <div className="absolute top-full mt-2 right-0 px-2 py-1 bg-gray-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg">
          Clear Formatting
        </div>
      </div>
    </div>
  );
}
