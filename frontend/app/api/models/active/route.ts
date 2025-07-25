import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

export async function GET(req: NextRequest) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/models/active`, {
      method: 'GET',
      headers: {
        'Authorization': req.headers.get('Authorization') || '',
      },
    });

    const data = await response.json();
    
    // Ensure tilesetUrl has full backend URL
    if (data.success && data.data) {
      data.data = data.data.map((model: any) => ({
        ...model,
        tilesetUrl: model.tilesetUrl.startsWith('http') 
          ? model.tilesetUrl 
          : `${BACKEND_URL}${model.tilesetUrl}`
      }));
    }
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Active models GET API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
