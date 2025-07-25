import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const path = searchParams.get('path') || '';
    const queryString = searchParams.toString();
    
    // Handle specific endpoints
    let url = `${BACKEND_URL}/api/models`;
    if (path === 'active') {
      url = `${BACKEND_URL}/api/models/active`;
    } else if (queryString) {
      url = `${BACKEND_URL}/api/models?${queryString}`;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': req.headers.get('Authorization') || '',
      },
    });

    const data = await response.json();
    
    // If this is active models, ensure tilesetUrl has full backend URL
    if (path === 'active' && data.success && data.data) {
      data.data = data.data.map((model: any) => ({
        ...model,
        tilesetUrl: model.tilesetUrl.startsWith('http') 
          ? model.tilesetUrl 
          : `${BACKEND_URL}${model.tilesetUrl}`
      }));
    }
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Models GET API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

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
    console.error('Models POST API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
