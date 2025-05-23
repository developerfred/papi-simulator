"use client";

import React from "react";
import { FormField, FormInput } from "@/components/ui/FormField";
import { useChainStore } from "@/store/useChainStore";

interface BalanceTransferFormProps {
  data: { dest: string; value: string };
  onChange: (field: string, value: string) => void;
  errors: Record<string, string>;
  disabled?: boolean;
}

export const BalanceTransferForm: React.FC<BalanceTransferFormProps> = ({ 
  data, onChange, errors, disabled 
}) => {
  const { network } = useChainStore();
  
  return (
    <>
      <FormField label="Recipient Address" error={errors.dest}>
        <FormInput
          placeholder="Enter recipient address"
          value={data.dest}
          onChange={(e) => onChange("dest", e.target.value)}
          disabled={disabled}
        />
      </FormField>
      <FormField label={`Amount (${network.tokenSymbol})`} error={errors.value}>
        <FormInput
          placeholder={`Amount in ${network.tokenSymbol}`}
          value={data.value}
          onChange={(e) => onChange("value", e.target.value)}
          disabled={disabled}
        />
      </FormField>
    </>
  );
};
