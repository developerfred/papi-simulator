import type { ExportedComponent, ExportMetrics, ExportOptions } from "../component-exporter/types";
import type { Network } from "../types/network";


export interface ExportModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly code: string;
  readonly network: Network;
  readonly componentName?: string;
}

export type TabType = 'options' | 'preview' | 'download';

export interface TabProps {
  options?: ExportOptions;
  exportedComponent?: ExportedComponent;
  metrics?: ExportMetrics | null;
  updateOptions?: (updates: Partial<ExportOptions>) => void;
  onExport?: () => void;
  isExporting?: boolean;
  exportError?: string;
  onDownloadFile?: (filename: string, content: string) => void;
  onDownloadAll?: () => void;
  inputStyle?: React.CSSProperties;
  getColor: (key: string) => string;
}
