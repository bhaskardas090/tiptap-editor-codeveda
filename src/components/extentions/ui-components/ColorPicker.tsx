import React from "react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "../../tiptap-ui-primitive/tooltip";

interface ColorPickerProps {
  onColorChange: (color: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ onColorChange }) => {
  const colors = [
    "#000000",
    "#FF0000",
    "#00FF00",
    "#0000FF",
    "#FFFF00",
    "#FF00FF",
    "#00FFFF",
    "#FFA500",
    "#800080",
    "#008000",
    "#000080",
    "#800000",
    "#808000",
    "#FFC0CB",
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

export default ColorPicker;
