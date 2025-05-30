/* eslint-disable  @typescript-eslint/no-unused-vars, @typescript-eslint/ban-ts-comment  */
// @ts-nocheck
import type React from 'react';
import { useState } from 'react';
import type { DeploymentGuide } from '@/lib/deployment/types';

interface GuideTabProps {
    guide: DeploymentGuide;
    getColor: (key: string) => string;
}

export const GuideTab: React.FC<GuideTabProps> = ({ guide, getColor }) => {
    const [selectedFile, setSelectedFile] = useState<string>('deployment');

    const files = {
        deployment: { name: 'Deployment Steps', content: guide.deploymentSteps.join('\n') },
        ...Object.fromEntries(
            guide.configFiles.map(f => [
                f.path.replace(/[^a-zA-Z0-9]/g, '_'),
                { name: f.path, content: f.content }
            ])
        )
    };

    return (
        <div className="guide-tab">
            <div className="guide-header">
                <h3 className="guide-title">{guide.title}</h3>
                <p className="guide-description">{guide.description}</p>
            </div>

            <div className="file-selector">
                {Object.entries(files).map(([key, file]) => (
                    <button
                        key={key}
                        onClick={() => setSelectedFile(key)}
                        className={`file-button ${selectedFile === key ? 'active' : ''}`}
                    >
                        {file.name}
                    </button>
                ))}
            </div>

            <div className="file-viewer">
                <div className="file-header">
                    {files[selectedFile]?.name}
                </div>
                <pre className="file-content">
                    <code>{files[selectedFile]?.content}</code>
                </pre>
            </div>

            {guide.troubleshooting.length > 0 && (
                <div className="troubleshooting">
                    <h4 className="troubleshooting-title">🔧 Troubleshooting</h4>
                    <div className="troubleshooting-items">
                        {guide.troubleshooting.map((item, i) => (
                            <div key={i} className="troubleshooting-item">
                                <div className="troubleshooting-issue">{item.issue}</div>
                                <div className="troubleshooting-solution">{item.solution}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};