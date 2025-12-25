import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://borejak-backend.vercel.app';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const path = searchParams.get('path') || '';
  
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch from API' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const path = searchParams.get('path') || '';
  
  try {
    const body = await request.json();
    
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    const data = await response.json();
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch from API' },
      { status: 500 }
    );
  }
}