"use client";

import { InputHTMLAttributes, forwardRef, useState, ReactNode } from "react";
import { FormField } from "@/components/ui/form-field";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  labelExtra?: ReactNode;
};

export const PasswordInput = forwardRef<HTMLInputElement, Props>(function PasswordInput(
  { label, required, hint, error, labelExtra, className, ...props },
  ref,
) {
  const [visible, setVisible] = useState(false);

  return (
    <FormField
      label={label}
      required={required}
      hint={hint}
      error={error}
      labelExtra={labelExtra}
    >
      <div className="password-field-normal auth-focus-wrap">
        <input
          ref={ref}
          {...props}
          type={visible ? "text" : "password"}
          className={`input auth-focus-input ${className ?? ""}`}
        />
        <button
          type="button"
          className="password-show-link"
          onClick={() => setVisible((v) => !v)}
          aria-pressed={visible}
        >
          {visible ? "Gizle" : "Göster"}
        </button>
      </div>
    </FormField>
  );
});
