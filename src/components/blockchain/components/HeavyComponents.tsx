"use client";

import dynamic from "next/dynamic";


export const AccountBalance = dynamic(() => import("./AccountBalance"));
export const EnhancedTransactionForm = dynamic(() => import("./EnhancedTransactionForm"));
export const BlockExplorer = dynamic(() => import("./BlockExplorer"));
export const TransactionMonitor = dynamic(() => import("./TransactionMonitor"));


const HeavyComponents = {
    AccountBalance,
    EnhancedTransactionForm,
    BlockExplorer,
    TransactionMonitor
};

export default HeavyComponents;