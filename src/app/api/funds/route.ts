import { NextRequest, NextResponse } from 'next/server';
import { getAllFunds, createFund, CreateFundRequest } from '@/lib/database';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const search = searchParams.get('search') || undefined;
    const result = await getAllFunds(page, limit, search);
     return NextResponse.json(result);
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Can not get funds list' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    console.log('📝 POST /api/funds được gọi');
    
    const body: CreateFundRequest = await request.json();
    console.log('📥 Dữ liệu nhận được:', body);
    
    // Tạo fund mới thông qua database function
    const newFund = await createFund(body);
    
    console.log('✅ Tạo fund mới thành công:', newFund);
    
    return NextResponse.json(
      { 
        fund: newFund, 
        message: 'Tạo fund thành công',
        success: true
      },
      { status: 201 }
    );
    
  } catch (error: any) {
    console.error('💥 Lỗi POST /api/funds:', error);
    
    // Xử lý các lỗi cụ thể
    if (error.message?.includes('bắt buộc') || error.message?.includes('không hợp lệ')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    // Xử lý lỗi JSON parsing
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Dữ liệu JSON không hợp lệ' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Không thể tạo fund mới' },
      { status: 500 }
    );
  }
}