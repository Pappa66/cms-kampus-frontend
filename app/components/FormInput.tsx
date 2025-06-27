// cms-kampus-frontend/app/components/FormInput.tsx

import React from 'react';

interface FormInputProps {
  label: string;
  name: string;
  type: string;
  value: string | number; // Bisa string atau number untuk input type number
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void; // <--- PERBAIKAN DI SINI
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  min?: string; // Untuk type="date" atau "number"
  max?: string; // Untuk type="date" atau "number"
  rows?: number; // Untuk textarea
  options?: { value: string; label: string }[]; // Untuk select
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  name,
  type,
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  min,
  max,
  rows,
  options,
}) => {
  const inputId = name.replace(/\./g, '-'); // Simple ID for nesting

  let inputElement;
  if (type === 'textarea') {
    inputElement = (
      <textarea
        id={inputId}
        name={name}
        rows={rows}
        value={value as string} // value untuk textarea selalu string
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      />
    );
  } else if (type === 'select' && options) {
    inputElement = (
      <select
        id={inputId}
        name={name}
        value={value as string}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  } else if (type === 'file') {
    inputElement = (
      <input
        type="file"
        id={inputId}
        name={name}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className="mt-1 block w-full text-sm text-gray-900 border border-gray-300 rounded-md cursor-pointer bg-gray-50 focus:outline-none"
      />
    );
  } else {
    inputElement = (
      <input
        type={type}
        id={inputId}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        min={min}
        max={max}
        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      />
    );
  }

  return (
    <div>
      <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {inputElement}
    </div>
  );
};

export default FormInput;
