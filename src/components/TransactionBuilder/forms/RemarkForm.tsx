"use client";

import React from "react";
import { FormField, FormTextarea } from "@/components/ui/FormField";

interface RemarkFormProps {
  data: { remark: string };
  onChange: (field: string, value: string) => void;
  errors: Record<string, string>;
  disabled?: boolean;
}

export const RemarkForm: React.FC<RemarkFormProps> = ({ 
  data, onChange, errors, disabled 
}) => (
  <FormField label="Remark" error={errors.remark}>
    <FormTextarea
      placeholder="Enter your remark text"
      value={data.remark}
      onChange={(e) => onChange("remark", e.target.value)}
      disabled={disabled}
      rows={4}
    />
  </FormField>
);
