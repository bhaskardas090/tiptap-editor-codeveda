import React from "react";

interface PresetCodeBlockColorProps {
  onColorChange: (color: string) => void;
}

/**
 * The same three hues as the background presets, but at full opacity: a
 * background sits behind the text and can be washed out, whereas the text is
 * the thing being read and has to hold up against the code block's dark
 * surface.
 */
const PRESET_COLORS = [
  { label: "Red", value: "#f44336" },
  { label: "Green", value: "#4caf50" },
  { label: "Grey", value: "#9e9e9e" },
];

const PresetCodeBlockColor: React.FC<PresetCodeBlockColorProps> = ({
  onColorChange,
}) => {
  return (
    <div className="flex gap-2">
      {PRESET_COLORS.map(({ label, value }) => (
        <button
          key={value}
          type="button"
          className="flex flex-col items-center text-xs text-gray-600"
          onClick={() => onColorChange(value)}
        >
          {/* A letter rather than a filled chip, so this reads as "text
              colour" next to the background swatches it sits beside. */}
          <span
            className="w-6 h-6 rounded border border-gray-300 cursor-pointer hover:scale-110 transition-transform flex items-center justify-center font-semibold bg-gray-900"
            style={{ color: value }}
          >
            A
          </span>
          {label}
        </button>
      ))}
    </div>
  );
};

export default PresetCodeBlockColor;
