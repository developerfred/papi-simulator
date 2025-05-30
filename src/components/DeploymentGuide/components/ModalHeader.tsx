/* eslint-disable @typescript-eslint/no-unused-vars */
import type React from 'react';

interface ModalHeaderProps {
    onClose: () => void;
    getColor: (key: string) => string;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({ onClose, getColor }) => (
    <div className="modal-header">
        <div>
            <h2 className="modal-title">🚀 Deployment Guide</h2>
            <p className="modal-subtitle">
                Generate production-ready deployment configuration
            </p>
        </div>
        <button
            onClick={onClose}
            className="modal-close-btn"
            aria-label="Close modal"
        >
            ×
        </button>
    </div>
);