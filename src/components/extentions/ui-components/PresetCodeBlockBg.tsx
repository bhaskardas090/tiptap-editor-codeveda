import React from "react";

interface PresetCodeBlockBgProps {
  onColorChange: (color: string) => void;
}

const PRESET_COLORS = [
  { label: "Green", value: "#4caf5040" },
  { label: "Red", value: "#f4433640" },
  { label: "Grey", value: "#9e9e9e40" },
];

const PresetCodeBlockBg: React.FC<PresetCodeBlockBgProps> = ({
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
          <span
            className="w-6 h-6 rounded border border-gray-300 cursor-pointer hover:scale-110 transition-transform"
            style={{ backgroundColor: value }}
          />
          {label}
        </button>
      ))}
    </div>
  );
};

export default PresetCodeBlockBg;
