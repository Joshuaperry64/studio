
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(request: NextRequest) {
    try {
        const filePath = path.join(process.cwd(), 'public', 'audio', 'background_music.mp3');
        await fs.access(filePath);
        return NextResponse.json({ exists: true }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ exists: false }, { status: 200 });
    }
}
