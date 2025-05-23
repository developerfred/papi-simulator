"use client";

import React from "react";
import { motion } from "framer-motion";
import { STATUS_CONFIG, UI_CLASSES } from "@/lib/constants/ui";

const StatusIcon: React.FC<{ status: string }> = ({ status }) => {
  const icons = {
    idle: "○", preparing: "◐", signed: "✎", broadcasting: "📡", 
    inBlock: "📦", finalized: "✓", error: "✗"
  };
  return <span className="text-xl">{icons[status] || icons.idle}</span>;
};

export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.idle;
  return (
    <span 
      className={UI_CLASSES.badge}
      style={{ backgroundColor: `${config.color}20`, color: config.color }}
    >
      {config.label}
    </span>
  );
};

export const StatusProgress: React.FC<{ status: string }> = ({ status }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.idle;
  return (
    <div className="flex items-center space-x-3">
      <div style={{ color: config.color }}>
        <StatusIcon status={status} />
      </div>
      <div className="flex-1">
        <div className="h-2 bg-surface-variant rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: config.color }}
            initial={{ width: 0 }}
            animate={{ width: `${config.progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>
      <span className="text-sm font-medium">{config.label}</span>
    </div>
  );
};
