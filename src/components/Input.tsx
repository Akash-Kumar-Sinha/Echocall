import React from "react";
import { FieldErrors, FieldValues, UseFormRegister } from "react-hook-form";
interface InputProps {
  id: string;
  type: string;
  required?: boolean;
  placeholder: string;
  register?: UseFormRegister<FieldValues>;
  title?: string;
  errors?: FieldErrors;
  disabled?: boolean;
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
}) => {
  const errorMessage: string | undefined = errors[id]?.message;

  return (
    <div className="flex flex-col">
      <input
        className={`lg:w-80 p-2 mb-0 text-yellow-800 font-semibold tracking-widest rounded-lg focus:outline-none hover:bg-black ${
          errors[id] && "focus:ring-rose-500"
        }`}
        id={id}
        type={type}
        {...register(id, { required })}
        placeholder={placeholder}
        title={title}
        aria-invalid={errorMessage ? "true" : "false"}
        disabled={disabled}
      />
      {errorMessage && (
        <span className="text-black text-sm text-wrap">{errorMessage}</span>
      )}
    </div>
  );
};

export default Input;
