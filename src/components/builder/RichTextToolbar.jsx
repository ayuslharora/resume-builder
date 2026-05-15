import { Bold, Italic, Underline, List, Type } from "lucide-react";

export default function RichTextToolbar({ flat = false }) {
  const applyFormat = (e, command) => {
    e.preventDefault();
    if (command === 'removeFormat') {
      document.execCommand('removeFormat', false, null);
      document.execCommand('unlink', false, null);
      return;
    }
    document.execCommand(command, false, null);
  };

  const buttonClass = flat
    ? "h-6 w-6 inline-flex items-center justify-center rounded-md text-on-surface-variant hover:text-on-surface hover:bg-surface-lowest border border-transparent hover:border-surface-container-high transition-colors"
    : "h-8 w-8 inline-flex items-center justify-center rounded-md text-on-surface-variant hover:text-on-surface hover:bg-surface-lowest border border-transparent hover:border-surface-container-high transition-colors";
  const iconSize = flat ? 12 : 14;

  return (
    <div className={flat ? "flex items-center gap-0.5" : "builder-richtext-toolbar flex flex-wrap sm:flex-nowrap items-center gap-1.5 bg-surface-container border border-surface-container-high p-1.5 rounded-lg shadow-[0_8px_20px_-14px_rgba(15,15,20,0.3),0_1px_2px_rgba(15,15,20,0.06)]"}>
      <div className="relative group flex items-center justify-center">
        <button
          onMouseDown={(e) => applyFormat(e, 'bold')}
          className={buttonClass}
        >
          <Bold size={iconSize} />
        </button>
        <div className="absolute top-full mt-2 px-2 py-1 bg-gray-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg">
          Bold (Cmd/Ctrl+B)
        </div>
      </div>

      <div className="relative group flex items-center justify-center">
        <button
          onMouseDown={(e) => applyFormat(e, 'italic')}
          className={buttonClass}
        >
          <Italic size={iconSize} />
        </button>
        <div className="absolute top-full mt-2 px-2 py-1 bg-gray-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg">
          Italic (Cmd/Ctrl+I)
        </div>
      </div>

      <div className="relative group flex items-center justify-center">
        <button
          onMouseDown={(e) => applyFormat(e, 'underline')}
          className={buttonClass}
        >
          <Underline size={iconSize} />
        </button>
        <div className="absolute top-full mt-2 px-2 py-1 bg-gray-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg">
          Underline (Cmd/Ctrl+U)
        </div>
      </div>

      <div className="w-px h-4 bg-surface-container-highest mx-0.5" />

      <div className="relative group flex items-center justify-center">
        <button
          onMouseDown={(e) => applyFormat(e, 'insertUnorderedList')}
          className={buttonClass}
        >
          <List size={iconSize} />
        </button>
        <div className="absolute top-full mt-2 px-2 py-1 bg-gray-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg">
          Bullet List
        </div>
      </div>

      <div className="relative group flex items-center justify-center">
        <button
          onMouseDown={(e) => applyFormat(e, 'removeFormat')}
          className={buttonClass}
        >
          <Type size={iconSize} />
        </button>
        <div className="absolute top-full mt-2 right-0 px-2 py-1 bg-gray-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg">
          Clear Formatting
        </div>
      </div>
    </div>
  );
}
