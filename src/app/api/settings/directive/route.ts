
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth-server';
import fs from 'fs/promises';
import path from 'path';

const DIRECTIVE_PATH = path.resolve(process.cwd(), 'docs/AlphaCore.txt');

async function checkPermissions(request: NextRequest) {
    const auth = await verifyAuth(request);
    if (!auth.user || auth.user.role !== 'admin') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    return null;
}

export async function GET(request: NextRequest) {
  const permissionError = await checkPermissions(request);
  if (permissionError) return permissionError;

  try {
    const content = await fs.readFile(DIRECTIVE_PATH, 'utf-8');
    return NextResponse.json({ content });
  } catch (error) {
    console.error('Error reading directive file:', error);
    return NextResponse.json({ message: 'Could not read AI directive file.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const permissionError = await checkPermissions(request);
  if (permissionError) return permissionError;
  
  try {
    const { content } = await request.json();
    if (typeof content !== 'string') {
        return NextResponse.json({ message: 'Invalid content format.' }, { status: 400 });
    }
    await fs.writeFile(DIRECTIVE_PATH, content, 'utf-8');
    return NextResponse.json({ message: 'Directive saved successfully.' });
  } catch (error) {
    console.error('Error writing directive file:', error);
    return NextResponse.json({ message: 'Could not save AI directive file.' }, { status: 500 });
  }
}
