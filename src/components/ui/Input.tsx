"use client";
import React from "react";

interface InputProps {
  placeholder?: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Input: React.FC<InputProps> = ({
  placeholder,
  name,
  type = "text",
  value,
  onChange,
}) => {
  return (
    <input
      placeholder={placeholder}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      className="my-2 w-full rounded p-2 bg-transparent border border-gray-600 text-white"
    />
  );
};

export default Input;
