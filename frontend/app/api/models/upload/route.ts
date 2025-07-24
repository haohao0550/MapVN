import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    const response = await fetch(`${BACKEND_URL}/api/models/upload`, {
      method: 'POST',
      headers: {
        'Authorization': req.headers.get('Authorization') || '',
      },
      body: formData,
    });

    const data = await response.json();
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Models upload API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
