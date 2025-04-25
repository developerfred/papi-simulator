import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        
        const versionFilePath = path.join(process.cwd(), 'src/version.json');

        if (fs.existsSync(versionFilePath)) {
            const versionInfo = JSON.parse(fs.readFileSync(versionFilePath, 'utf8'));
            return NextResponse.json(versionInfo);
        }

        return NextResponse.json({
            version: process.env.NEXT_PUBLIC_VERSION || "0.0.0",
            gitHash: process.env.NEXT_PUBLIC_GIT_HASH || "unknown",
            gitBranch: "main",
            buildTime: process.env.NEXT_PUBLIC_BUILD_TIME || new Date().toISOString(),
            environment: process.env.NODE_ENV || "development",
        });
    } catch (error) {
        console.error('Error fetching version info:', error);
        return NextResponse.json({
            version: "0.0.0",
            gitHash: "unknown",
            gitBranch: "main",
            buildTime: new Date().toISOString(),
            environment: process.env.NODE_ENV || "development",
        });
    }
}