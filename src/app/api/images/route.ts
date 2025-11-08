import { NextRequest, NextResponse } from 'next/server';
import { getAllImages, createImage, CreateImageRequest } from '@/lib/database';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    console.log('🔍 GET /api/images được gọi');
    
    // Lấy các query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    // Validate parameters
    if (page < 1) {
      return NextResponse.json(
        { error: 'Page must be >= 1' },
        { status: 400 }
      );
    }
    
    if (limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Limit must be between 1 and 100' },
        { status: 400 }
      );
    }
    
    // Lấy images từ database function
    const result = await getAllImages(page, limit);
    
    console.log(`✅ Trả về ${result.images.length} images (trang ${page}/${result.pagination.pages})`);
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('💥 Lỗi GET /api/images:', error);
    return NextResponse.json(
      { error: 'Không thể lấy danh sách hình ảnh' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    console.log('📝 POST /api/images được gọi');
    
    const body: CreateImageRequest = await request.json();
    console.log('📥 Dữ liệu nhận được:', body);
    
    // Tạo image mới thông qua database function
    const newImage = await createImage(body);
    
    console.log('✅ Tạo image mới thành công:', newImage);
    
    return NextResponse.json(
      { 
        image: newImage, 
        message: 'Tạo image thành công',
        success: true
      },
      { status: 201 }
    );
    
  } catch (error: any) {
    console.error('💥 Lỗi POST /api/images:', error);
    
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
      { error: 'Không thể tạo image mới' },
      { status: 500 }
    );
  }
}