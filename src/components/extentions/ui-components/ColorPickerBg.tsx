import React from "react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "../../tiptap-ui-primitive/tooltip";

interface ColorPickerBgProps {
  onColorChange: (color: string) => void;
}

const ColorPickerBg: React.FC<ColorPickerBgProps> = ({ onColorChange }) => {
  const colors = [
    "#B0B0B0",
    "#F2F0EF",
    "#e7e4de",
    "#f3e1d5",
    "#ffe4c2",
    "#fff7cc",
    "#d6f2e3",
    "#d5e6fa",
    "#ebddf5",
    "#f9d6e8",
    "#f8d0cb",
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
          <TooltipContent>Set background color to {color}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
};

export default ColorPickerBg;
