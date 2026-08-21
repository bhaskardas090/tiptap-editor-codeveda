import React from "react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "../../tiptap-ui-primitive/tooltip";
import { TEXT_PALETTE, textValue } from "./textPalette";

interface ColorPickerFontProps {
  onColorChange: (color: string) => void;
}

const ColorPickerFont: React.FC<ColorPickerFontProps> = ({ onColorChange }) => {
  return (
    <div className="flex flex-wrap gap-1 w-32">
      {TEXT_PALETTE.map((color) => (
        <Tooltip key={color.name} delay={300} closeDelay={0}>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="w-6 h-6 rounded border border-gray-300 cursor-pointer hover:scale-110 transition-transform flex items-center justify-center text-sm font-semibold"
              // The swatch reads the same variable the document will, so it
              // previews the colour for the theme actually in effect rather
              // than a hard-coded light-mode chip.
              style={{ color: `var(--tt-palette-text-${color.name})` }}
              onClick={() => onColorChange(textValue(color))}
            >
              A
            </button>
          </TooltipTrigger>
          <TooltipContent>{color.label}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
};

export default ColorPickerFont;
