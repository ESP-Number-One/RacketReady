import React, { useState } from 'react';

interface InputProps {
  type: 'text' | 'textarea' | 'time' | 'date';
  placeholder: string;
  icon?: React.ReactElement<IconProps>;
  backgroundColor?: string;
  textColor?: string;
}

const Input: React.FC<InputProps> = ({
  type,
  placeholder,
  icon,
  backgroundColor = 'bg-p-grey-100',
  textColor = 'text-white',
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    if (inputValue === '') {
      setIsFocused(false);
    }
  };

  // Common styles for all input types
  const commonStyles = `font-body text-2xl font-bold text-white w-full bg-transparent focus:outline-none pl-8
 inline-flex items-center w-full transform transition duration-150 ease-in-out m-0 ${
    isFocused ? '' : 'placeholder-white'
  }`;

  return (
    <div className={`relative ${backgroundColor} ${textColor} rounded-md p-2`}>
      {icon && (
        <div className="absolute left-2 top-1/2 transform -translate-y-1/2">
          {icon}
        </div>
      )}
      {type === 'text' && (
        <input
          type="text"
          placeholder={isFocused ? '' : placeholder}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={commonStyles}
        />
      )}
      {type === 'textarea' && (
        <textarea
          placeholder={isFocused ? '' : placeholder}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={`${commonStyles} resize-none`}
        />
      )}
      {type === 'time' && (
        <input
          type="time"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={commonStyles}
        />
      )}
      {type === 'date' && (
        <input
          type="date"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={commonStyles}
        />
      )}
    </div>
  );
};

export default Input; // Export the Input component as default

export { Input }; // Export the Input component as named export
