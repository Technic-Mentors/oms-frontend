import { ReactNode } from "react";

type InputFieldProps = {
  type?: string;
  labelName?: string;
  placeHolder?: string;
  handlerChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  name?: string;
  value?: string | number;
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
  min?: string;
    max?: string;
  icon?: ReactNode;
  minLength?: number;
  maxLength?: number;
  
  autoComplete?: string; // Add this line
};

export const InputField = ({
  type,
  labelName,
  placeHolder,
  handlerChange,
  onKeyDown,
  name,
  value,
  disabled,
  className,
  readOnly,
  icon,
  minLength,
  maxLength,
   min,    // ADD THIS LINE
  max,
  autoComplete, // Add this line
}: InputFieldProps) => {
  return (
    <div className="flex flex-col">
      <label className="text-gray-600 text-xs font-semibold">{labelName}</label>

      <div className="relative flex items-center w-full">
        {icon && (
          <div className="absolute left-3 flex items-center pointer-events-none text-black z-10">
            {icon}
          </div>
        )}

        <input
          type={type}
          autoComplete={autoComplete || "off"} // Use the prop with fallback to "off"
          className={`w-full p-2.5 ${icon ? "pl-10" : "pl-3"} border border-gray-200 rounded-lg shadow text-gray-800
            ${disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"}
            focus:outline-none focus:ring-1 focus:ring-blue-500
            ${type === "date" ? "relative" : ""}
            ${className || ""}`}
          placeholder={placeHolder}
          onChange={handlerChange}
          onKeyDown={onKeyDown}
          name={name}
          value={value}
          disabled={disabled}
          readOnly={readOnly}
          minLength={minLength}
          maxLength={maxLength}
          min={min}    // ADD THIS LINE
  max={max}    // ADD THIS LINE
        />
      </div>
    </div>
  );
};
