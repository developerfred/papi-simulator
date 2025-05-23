"use client";

import React, { useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useSignerStore } from "@/store/useSignerStore";
import { TEST_ACCOUNTS } from "@/lib/constants/accounts";

const formatAddress = (address: string) => address ? 
  `${address.slice(0, 6)}...${address.slice(-4)}` : "";

const TestAccountModal: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  onSelect: (address: string, name: string) => void;
}> = ({ isOpen, onClose, onSelect }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-medium mb-4">Select Test Account</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {Object.entries(TEST_ACCOUNTS).map(([name, address]) => (
            <div
              key={address}
              className="p-3 border rounded-md cursor-pointer hover:bg-surface-variant transition-colors"
              onClick={() => onSelect(address, name)}
            >
              <div className="font-medium">{name}</div>
              <div className="text-xs font-mono text-theme-tertiary truncate">{address}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-end">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
        </div>
      </div>
    </div>
  );
};

const SignerSelector: React.FC<{ className?: string }> = ({ className = "" }) => {
  const { selectedSigner, setSelectedSigner } = useSignerStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const selectTestAccount = (address: string, name: string) => {
    setSelectedSigner({
      address, name, type: "test",
      sign: async () => new Uint8Array(64).fill(1)
    });
    setIsModalOpen(false);
  };

  return (
    <Card className={className}>
      <div className="space-y-3">
        <h3 className="text-sm font-medium">Select Signer</h3>

        {selectedSigner ? (
          <div className="flex items-center justify-between p-2 rounded bg-surface-variant">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full flex items-center justify-center mr-2 bg-network-primary text-white">
                {selectedSigner.name?.charAt(0) || 'S'}
              </div>
              <div>
                <div className="font-medium">{selectedSigner.name || "Signer"}</div>
                <div className="text-xs font-mono text-theme-tertiary">
                  {formatAddress(selectedSigner.address)}
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => setSelectedSigner(null)}>
              Change
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" fullWidth onClick={() => setIsModalOpen(true)}>
              Use Test Account
            </Button>
            <Button variant="outline" fullWidth disabled>
              Connect Wallet
            </Button>
          </div>
        )}

        <TestAccountModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSelect={selectTestAccount}
        />
      </div>
    </Card>
  );
};

export default SignerSelector;
