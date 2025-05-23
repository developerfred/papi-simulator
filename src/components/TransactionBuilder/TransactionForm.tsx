"use client";

import React from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { FormField, FormSelect } from "@/components/ui/FormField";
import { useSignerStore } from "@/store/useSignerStore";
import { useTransactionForm, TransactionType } from "@/hooks/useTransactionForm";
import { BalanceTransferForm } from "./forms/BalanceTransferForm";
import { RemarkForm } from "./forms/RemarkForm";
import { CustomTransactionForm } from "./forms/CustomTransactionForm";
import { UI_CLASSES } from "@/lib/constants/ui";

interface TransactionFormProps {
  transactionId: string;
  className?: string;
}

const FORM_COMPONENTS = {
  balanceTransfer: BalanceTransferForm,
  remarkWithEvent: RemarkForm,
  custom: CustomTransactionForm,
};

const TransactionForm: React.FC<TransactionFormProps> = ({ transactionId, className = "" }) => {
  const { selectedSigner } = useSignerStore();
  const {
    transactionType, setTransactionType, formData, handleChange, handleSubmit,
    formError, isPending, availablePallets, availableCalls, errors
  } = useTransactionForm(transactionId);

  const FormComponent = FORM_COMPONENTS[transactionType];

  return (
    <Card className={className}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Transaction Type">
          <FormSelect
            value={transactionType}
            onChange={(e) => setTransactionType(e.target.value as TransactionType)}
            disabled={isPending}
          >
            <option value="balanceTransfer">Balance Transfer</option>
            <option value="remarkWithEvent">Add Remark</option>
            <option value="custom">Custom Transaction</option>
          </FormSelect>
        </FormField>

        <FormComponent
          data={formData}
          onChange={handleChange}
          errors={errors}
          disabled={isPending}
          {...(transactionType === 'custom' && { availablePallets, availableCalls })}
        />

        {formError && <div className={UI_CLASSES.error}>{formError}</div>}

        <Button
          type="submit"
          variant="primary"
          fullWidth
          disabled={isPending || !selectedSigner}
          networkColored
        >
          {isPending ? "Processing..." : "Submit Transaction"}
        </Button>
      </form>
    </Card>
  );
};

export default TransactionForm;
