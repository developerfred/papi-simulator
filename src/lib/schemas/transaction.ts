import { z } from 'zod';

export const transactionSchemas = {
  balanceTransfer: z.object({
    dest: z.string().min(1, "Recipient address required"),
    value: z.string().regex(/^\d+$/, "Must be a valid number"),
  }),
  remarkWithEvent: z.object({
    remark: z.string().min(1, "Remark text required"),
  }),
  custom: z.object({
    pallet: z.string().min(1, "Pallet required"),
    call: z.string().min(1, "Call required"),
    params: z.string().refine(val => {
      try { JSON.parse(val); return true; } 
      catch { return false; }
    }, "Must be valid JSON"),
  }),
};
