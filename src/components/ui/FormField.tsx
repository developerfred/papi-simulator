"use client";

import React from "react";
import { UI_CLASSES } from "@/lib/constants/ui";

interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  error?: string;
}

export const FormField: React.FC<FormFieldProps> = ({ label, children, error }) => (
  <div>
    <label className={UI_CLASSES.label}>{label}</label>
    {children}
    {error && <div className="text-red-500 text-xs mt-1">{error}</div>}
  </div>
);

export const FormInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input className={UI_CLASSES.input} {...props} />
);

export const FormTextarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => (
  <textarea className={UI_CLASSES.textarea} {...props} />
);

export const FormSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
  <select className={UI_CLASSES.select} {...props} />
);
