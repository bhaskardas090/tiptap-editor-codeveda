import React from "react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "../../tiptap-ui-primitive/tooltip";

interface ColorPickerFontProps {
  onColorChange: (color: string) => void;
}

const ColorPickerFont: React.FC<ColorPickerFontProps> = ({ onColorChange }) => {
  const colors = [
    "#000000",
    "#ffffff",
    "#7d7a75",
    "#9f765a",
    "#d27b2d",
    "#fdd835",
    "#50946e",
    "#377dc9",
    "#9a6bb4",
    "#c14c8a",
    "#cf5148",
  ];

  return (
    <div className="flex flex-wrap gap-1 w-32">
      {colors.map((color) => (
        <Tooltip key={color} delay={300} closeDelay={0}>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="w-6 h-6 rounded border border-gray-300 cursor-pointer hover:scale-110 transition-transform"
              style={{ backgroundColor: color }}
              onClick={() => onColorChange(color)}
            />
          </TooltipTrigger>
          <TooltipContent>Set color to {color}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
};

export default ColorPickerFont;

