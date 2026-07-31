import React from 'react';

const AuthInput = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  id,
  name,
  icon,
  minLength,
  maxLength,
  required = true,
  autoComplete,
}) => {
  return (
    <label className="auth-input" htmlFor={id}>
      <span className="auth-input__label">{label}</span>
      <span className="auth-input__field">
        <span className="auth-input__icon" aria-hidden="true">
          {icon}
        </span>
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          minLength={minLength}
          maxLength={maxLength}
          required={required}
          autoComplete={autoComplete}
        />
      </span>
    </label>
  );
};

export default AuthInput;
