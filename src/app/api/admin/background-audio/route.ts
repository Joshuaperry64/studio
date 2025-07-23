
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth-server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
    const auth = await verifyAuth(request);
    if (!auth.user || auth.user.role !== 'admin') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const formData = await request.formData();
        const audioFile = formData.get('audio') as File | null;

        if (!audioFile) {
            return NextResponse.json({ message: 'No audio file provided.' }, { status: 400 });
        }
        
        // Define the path and ensure the directory exists
        const publicDir = path.join(process.cwd(), 'public');
        const audioDir = path.join(publicDir, 'audio');
        await fs.mkdir(audioDir, { recursive: true });
        
        // Save the file with a standard name
        const filePath = path.join(audioDir, 'background_music.mp3');
        
        // Convert file to buffer and write to disk
        const buffer = Buffer.from(await audioFile.arrayBuffer());
        await fs.writeFile(filePath, buffer);

        return NextResponse.json({ message: 'Background audio uploaded successfully.' }, { status: 200 });

    } catch (error) {
        console.error('Error uploading background audio:', error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}
