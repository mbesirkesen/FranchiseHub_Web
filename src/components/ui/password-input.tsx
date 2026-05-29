"use client";

import { InputHTMLAttributes, forwardRef, useState } from "react";
import { FormField } from "@/components/ui/form-field";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
};

export const PasswordInput = forwardRef<HTMLInputElement, Props>(function PasswordInput(
  { label, required, hint, error, className, ...props },
  ref,
) {
  const [visible, setVisible] = useState(false);

  return (
    <FormField label={label} required={required} hint={hint} error={error}>
      <div className="password-field-normal">
        <input
          ref={ref}
          {...props}
          type={visible ? "text" : "password"}
          className={`input ${className ?? ""}`}
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
