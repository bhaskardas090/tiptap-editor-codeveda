import React from "react";
import { Editor } from "@tiptap/react";
import { Button } from "../../ui/button";
import { Lock, LockOpen, Terminal, Moon, Sun } from "lucide-react";

interface ControlPanelProps {
  editor: Editor;
  isReadOnly: boolean;
  setIsReadOnly: (readOnly: boolean) => void;
  onLogContent: () => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  isReadOnly,
  setIsReadOnly,
  onLogContent,
  isDarkMode,
  onToggleDarkMode,
}) => {
  return (
    <div className="mb-4 flex justify-end gap-2">
      {onToggleDarkMode && (
        <Button
          type="button"
          onClick={onToggleDarkMode}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          aria-pressed={isDarkMode}
        >
          {isDarkMode ? (
            <>
              <Sun className="h-4 w-4" />
              Light
            </>
          ) : (
            <>
              <Moon className="h-4 w-4" />
              Dark
            </>
          )}
        </Button>
      )}
      <Button
        type="button"
        onClick={onLogContent}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
        title="Log content to console for backend storage"
      >
        <Terminal className="h-4 w-4" />
        Log Content
      </Button>
      <Button
        type="button"
        onClick={() => setIsReadOnly(!isReadOnly)}
        variant={isReadOnly ? "default" : "outline"}
        size="sm"
        className="flex items-center gap-2"
      >
        {isReadOnly ? (
          <>
            <Lock className="h-4 w-4" />
            Read Only
          </>
        ) : (
          <>
            <LockOpen className="h-4 w-4" />
            Editable
          </>
        )}
      </Button>
    </div>
  );
};

export default ControlPanel;
