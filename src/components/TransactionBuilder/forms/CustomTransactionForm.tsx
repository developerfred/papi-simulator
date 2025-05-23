"use client";

import React from "react";
import { FormField, FormSelect, FormTextarea } from "@/components/ui/FormField";

interface CustomTransactionFormProps {
  data: { pallet: string; call: string; params: string };
  onChange: (field: string, value: string) => void;
  errors: Record<string, string>;
  disabled?: boolean;
  availablePallets: string[];
  availableCalls: string[];
}

export const CustomTransactionForm: React.FC<CustomTransactionFormProps> = ({ 
  data, onChange, errors, disabled, availablePallets, availableCalls 
}) => (
  <>
    <div className="grid grid-cols-2 gap-4">
      <FormField label="Pallet" error={errors.pallet}>
        <FormSelect
          value={data.pallet}
          onChange={(e) => onChange("pallet", e.target.value)}
          disabled={disabled}
        >
          {availablePallets.map(pallet => (
            <option key={pallet} value={pallet}>{pallet}</option>
          ))}
        </FormSelect>
      </FormField>
      <FormField label="Call" error={errors.call}>
        <FormSelect
          value={data.call}
          onChange={(e) => onChange("call", e.target.value)}
          disabled={disabled || !data.pallet}
        >
          {availableCalls.map(call => (
            <option key={call} value={call}>{call}</option>
          ))}
        </FormSelect>
      </FormField>
    </div>
    <FormField label="Parameters (JSON)" error={errors.params}>
      <FormTextarea
        placeholder='{"param1": "value1", "param2": 123}'
        value={data.params}
        onChange={(e) => onChange("params", e.target.value)}
        disabled={disabled}
        rows={4}
      />
      <div className="mt-1 text-xs text-theme-tertiary">
        Enter parameters as a JSON object matching the call signature
      </div>
    </FormField>
  </>
);
