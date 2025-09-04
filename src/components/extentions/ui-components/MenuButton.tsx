import React from "react";
import { Button } from "../../ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "../../tiptap-ui-primitive/tooltip";

interface MenuButtonProps {
  onClick: () => void;
  isActive?: boolean;
  children: React.ReactNode;
  title?: string;
  className?: string;
}

const MenuButton: React.FC<MenuButtonProps> = ({
  onClick,
  isActive = false,
  children,
  title,
  className = "",
}) => {
  const button = (
    <Button
      type="button"
      onClick={onClick}
      variant={isActive ? "default" : "outline"}
      size="sm"
      className={`h-8 w-8 p-0 transition-all cursor-pointer ${
        isActive
          ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
          : "bg-white hover:bg-gray-50"
      } ${className}`}
    >
      {children}
    </Button>
  );

  if (title) {
    return (
      <Tooltip delay={500} closeDelay={0}>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent>{title}</TooltipContent>
      </Tooltip>
    );
  }

  return button;
};

export default MenuButton;
