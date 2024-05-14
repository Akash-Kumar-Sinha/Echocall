import React from "react";
import { FieldErrors, FieldValues, UseFormRegister } from "react-hook-form";
interface InputProps {
  id: string;
  type: string;
  required?: boolean;
  placeholder: string;
  register: UseFormRegister<FieldValues>;
  title?: string;
  errors?: FieldErrors;
  disabled?: boolean;
  onClick?: ()=>void;
  width?: string
}

const Input: React.FC<InputProps> = ({
  id,
  type,
  required,
  placeholder,
  register,
  title,
  errors,
  disabled,
  onClick,
  width
}) => {
  const errorMessage: string | undefined = errors[id]?.message;
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };
  return (
    <div className="flex flex-col">
      <input
        className={` p-2 mb-0 text-yellow-800 font-semibold tracking-widest rounded-lg focus:outline-none hover:bg-black ${
          errors[id] && "focus:ring-rose-500"
        }
        ${width? (`lg:${width}`):("lg:w-80")}
        `}
        id={id}
        type={type}
        {...register(id, { required })}
        placeholder={placeholder}
        title={title}
        aria-invalid={errorMessage ? "true" : "false"}
        disabled={disabled}
        onClick={handleClick}
      />
      {errorMessage && (
        <span className="text-black text-sm text-wrap">{errorMessage}</span>
      )}
    </div>
  );
};

export default Input;
