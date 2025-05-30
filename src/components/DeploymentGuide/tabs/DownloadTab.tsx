/* eslint-disable  @typescript-eslint/no-unused-vars  */
import type React from 'react';
import type { DeploymentGuide } from '@/lib/deployment/types';
import { DeploymentGuideSystem } from '@/lib/deployment/DeploymentGuideSystem';

interface DownloadTabProps {
    guide: DeploymentGuide;
    onDownloadFile: (filename: string, content: string) => void;
    onDownloadAll: () => void;
    getColor: (key: string) => string;
}

export const DownloadTab: React.FC<DownloadTabProps> = ({
    guide,
    onDownloadFile,
    onDownloadAll,
    getColor
}) => (
    <div className="download-tab">
        <div className="download-all-section">
            <h3 className="download-title">📦 Complete Package</h3>
            <p className="download-subtitle">
                Download all files and configuration in one package
            </p>
            <button
                onClick={onDownloadAll}
                className="btn-primary download-all-btn"
            >
                📦 Download Complete Package
            </button>
        </div>

        <div className="individual-files-section">
            <h3 className="download-title">📄 Individual Files</h3>
            <div className="files-list">
                {[
                    ...guide.configFiles,
                    {
                        path: 'DEPLOYMENT.md',
                        content: DeploymentGuideSystem['formatGuideAsMarkdown'](guide),
                        description: 'Complete deployment guide'
                    }
                ].map((file, i) => (
                    <div key={i} className="file-item">
                        <div className="file-info">
                            <div className="file-name">{file.path}</div>
                            <div className="file-description">{file.description}</div>
                        </div>
                        <button
                            onClick={() => onDownloadFile(file.path, file.content)}
                            className="btn-outline file-download-btn"
                        >
                            Download
                        </button>
                    </div>
                ))}
            </div>
        </div>

        <div className="quick-setup-section">
            <h4 className="quick-setup-title">🚀 Quick Setup</h4>
            <ol className="quick-setup-steps">
                <li>Download the complete package</li>
                <li>Extract files to your project</li>
                <li>Follow the deployment steps in DEPLOYMENT.md</li>
                <li>Configure environment variables</li>
                <li>Deploy to your chosen platform</li>
            </ol>
        </div>
    </div>
);