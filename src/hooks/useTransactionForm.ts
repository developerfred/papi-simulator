import { useState } from "react";
import { z } from "zod";
import { useTheme } from "@/lib/theme/ThemeProvider";
import { useChainStore } from "@/store/useChainStore";
import { useTransaction } from "@/hooks/useTransaction";
import { useSignerStore } from "@/store/useSignerStore";
import { MultiAddress } from "@polkadot-api/descriptors";
import { toChainAmount } from "@/lib/utils/formatters";

// Schemas for different transaction types
export const schemas = {
  balanceTransfer: z.object({
    dest: z.string().min(1, "Recipient address is required"),
    value: z.string().refine(
      (val) => {
        const num = Number(val);
        return !isNaN(num) && num > 0;
      },
      { message: "Amount must be a positive number" }
    ),
  }),
  remarkWithEvent: z.object({
    remark: z.string().min(1, "Remark text is required"),
  }),
  custom: z.object({
    pallet: z.string().min(1, "Pallet is required"),
    call: z.string().min(1, "Call is required"),
    params: z.string().refine(
      (val) => {
        try {
          JSON.parse(val);
          return true;
        } catch {
          return false;
        }
      },
      { message: "Invalid JSON format" }
    ),
  }),
};

export type TransactionType = keyof typeof schemas;

export const useTransactionForm = (transactionId: string) => {
  const { network, typedApi } = useChainStore();
  const { selectedSigner } = useSignerStore();
  const { execute, isPending } = useTransaction(transactionId);
  
  const [transactionType, setTransactionType] = useState<TransactionType>("balanceTransfer");
  const [formData, setFormData] = useState({
    dest: "",
    value: "0.1",
    remark: "",
    pallet: "System",
    call: "remark",
    params: "{}",
  });
  const [formError, setFormError] = useState<string>("");
  
  // Get available pallets and calls
  const availablePallets = typedApi ? 
    Object.keys(typedApi.tx).filter(key => 
      typeof typedApi.tx[key] === 'object' && 
      Object.keys(typedApi.tx[key]).length > 0
    ) : [];
    
  const availableCalls = (typedApi && formData.pallet) ? 
    Object.keys(typedApi.tx[formData.pallet] || {}) : [];

  // Handle form field changes
  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Special case for pallet selection
    if (field === 'pallet' && typedApi && typedApi.tx[value]) {
      const calls = Object.keys(typedApi.tx[value]);
      setFormData(prev => ({ 
        ...prev, 
        call: calls.length > 0 ? calls[0] : "",
        params: "{}" 
      }));
    }
  };

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!selectedSigner) {
      setFormError("Please select a signer first");
      return;
    }

    if (!typedApi) {
      setFormError("API not available");
      return;
    }

    try {
      const schema = schemas[transactionType];
      const validationData = transactionType === "balanceTransfer" 
        ? { dest: formData.dest, value: formData.value }
        : transactionType === "remarkWithEvent" 
          ? { remark: formData.remark }
          : { pallet: formData.pallet, call: formData.call, params: formData.params };
          
      const result = schema.safeParse(validationData);
      
      if (!result.success) {
        setFormError(result.error.errors[0].message);
        return;
      }

      // Execute transaction based on type
      switch (transactionType) {
        case "balanceTransfer": {
          const value = toChainAmount(network, parseFloat(formData.value));
          await execute(
            (api) => api.tx.Balances.transfer_keep_alive({
              dest: MultiAddress.Id(formData.dest),
              value
            }),
            [],
            selectedSigner,
            {
              metadata: {
                title: `Transfer ${formData.value} ${network.tokenSymbol}`,
                recipient: formData.dest,
                amount: formData.value
              }
            }
          );
          break;
        }
        case "remarkWithEvent":
          await execute(
            (api) => api.tx.System.remark_with_event({
              remark: Array.from(new TextEncoder().encode(formData.remark))
            }),
            [],
            selectedSigner,
            {
              metadata: {
                title: "Add Remark",
                remark: formData.remark
              }
            }
          );
          break;
        case "custom": {
          const params = JSON.parse(formData.params);
          await execute(
            (api) => api.tx[formData.pallet][formData.call](params),
            [],
            selectedSigner,
            {
              metadata: {
                title: `${formData.pallet}.${formData.call}`,
                params: formData.params
              }
            }
          );
          break;
        }
      }
    } catch (error) {
      console.error("Transaction error:", error);
      setFormError(error instanceof Error ? error.message : String(error));
    }
  };

  return {
    transactionType,
    setTransactionType,
    formData,
    handleChange,
    handleSubmit,
    formError,
    isPending,
    availablePallets,
    availableCalls,
  };
};