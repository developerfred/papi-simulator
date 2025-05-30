/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */
import type React from 'react';
import type { DeploymentConfig } from '@/lib/deployment/types';

interface ConfigurationTabProps {
    config: DeploymentConfig;
    updateConfig: (updates: Partial<DeploymentConfig>) => void;
    getColor: (key: string) => string;
}

export const ConfigurationTab: React.FC<ConfigurationTabProps> = ({
    config,
    updateConfig,
    getColor
}) => (
    <div className="config-tab">
        <section className="config-section">
            <h3 className="config-section-title">Framework & Platform</h3>
            <div className="config-grid">
                <div className="config-field">
                    <label className="config-label">Framework</label>
                    <select
                        value={config.framework}
                        onChange={e => updateConfig({ framework: e.target.value as any })}
                        className="config-input"
                    >
                        <option value="next">Next.js</option>
                        <option value="vite">Vite</option>
                        <option value="create-react-app">Create React App</option>
                        <option value="remix">Remix</option>
                        <option value="gatsby">Gatsby</option>
                        <option value="react">React</option>
                    </select>
                </div>

                <div className="config-field">
                    <label className="config-label">Deployment Target</label>
                    <select
                        value={config.target}
                        onChange={e => updateConfig({ target: e.target.value as any })}
                        className="config-input"
                    >
                        <option value="vercel">Vercel</option>
                        <option value="netlify">Netlify</option>
                        <option value="github-pages">GitHub Pages</option>
                        <option value="aws-amplify">AWS Amplify</option>
                        <option value="firebase">Firebase</option>
                        <option value="docker">Docker</option>
                    </select>
                </div>
            </div>
        </section>

        <section className="config-section">
            <h3 className="config-section-title">Build Configuration</h3>
            <div className="config-fields">
                <div className="config-field">
                    <label className="config-label">Build Command</label>
                    <input
                        type="text"
                        value={config.buildCommand}
                        onChange={e => updateConfig({ buildCommand: e.target.value })}
                        className="config-input"
                        placeholder="npm run build"
                    />
                </div>

                <div className="config-grid">
                    <div className="config-field">
                        <label className="config-label">Output Directory</label>
                        <input
                            type="text"
                            value={config.outputDirectory}
                            onChange={e => updateConfig({ outputDirectory: e.target.value })}
                            className="config-input"
                            placeholder="dist"
                        />
                    </div>

                    <div className="config-field">
                        <label className="config-label">Node.js Version</label>
                        <select
                            value={config.nodeVersion}
                            onChange={e => updateConfig({ nodeVersion: e.target.value })}
                            className="config-input"
                        >
                            <option value="18">Node.js 18</option>
                            <option value="20">Node.js 20</option>
                            <option value="21">Node.js 21</option>
                        </select>
                    </div>
                </div>
            </div>
        </section>
    </div>
);