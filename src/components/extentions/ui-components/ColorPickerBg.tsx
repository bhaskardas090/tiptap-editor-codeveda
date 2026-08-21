import React from "react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "../../tiptap-ui-primitive/tooltip";
import { TEXT_PALETTE, backgroundValue } from "./textPalette";

interface ColorPickerBgProps {
  onColorChange: (color: string) => void;
}

const ColorPickerBg: React.FC<ColorPickerBgProps> = ({ onColorChange }) => {
  return (
    <div className="flex flex-wrap gap-1 w-32">
      {TEXT_PALETTE.map((color) => (
        <Tooltip key={color.name} delay={300} closeDelay={0}>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="w-6 h-6 rounded border border-gray-300 cursor-pointer hover:scale-110 transition-transform"
              // Same variable the document will resolve, so the swatch previews
              // the colour for the theme actually in effect.
              style={{
                backgroundColor: `var(--tt-palette-bg-${color.name})`,
              }}
              onClick={() => onColorChange(backgroundValue(color))}
            />
          </TooltipTrigger>
          <TooltipContent>{color.label}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
};

export default ColorPickerBg;
