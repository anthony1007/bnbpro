import { NextRequest, NextResponse } from 'next/server';
import { getImageById, deleteImage } from '@/lib/database';

// GET method để lấy image theo ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    console.log('🔍 GET /api/images/[id] được gọi với ID:', params.id);
    
    const imageId = params.id;
    if (!imageId || typeof imageId !== 'string') {
      return NextResponse.json(
        { error: 'ID image không hợp lệ' },
        { status: 400 }
      );
    }

    // Lấy image từ database thông qua function
    const image = await getImageById(imageId);
    
    if (!image) {
      return NextResponse.json(
        { error: 'Image không tồn tại' },
        { status: 404 }
      );
    }
    
    console.log('✅ Trả về image:', image);
    
    return NextResponse.json({
      image,
      success: true
    });
    
  } catch (error) {
    console.error('💥 Lỗi GET /api/images/[id]:', error);
    return NextResponse.json(
      { error: 'Không thể lấy thông tin image' },
      { status: 500 }
    );
  }
}

// DELETE method để xóa image
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    console.log('🗑️ DELETE /api/images/[id] được gọi với ID:', params.id);
    
    const imageId = params.id;
    if (!imageId || typeof imageId !== 'string') {
      return NextResponse.json(
        { error: 'ID image không hợp lệ' },
        { status: 400 }
      );
    }

    // Xóa image thông qua database function
    const success = await deleteImage(imageId);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Image không tồn tại' },
        { status: 404 }
      );
    }
    
    console.log('✅ Xóa image thành công, ID:', imageId);
    
    return NextResponse.json({
      message: 'Xóa image thành công',
      success: true,
      deletedId: imageId
    });
    
  } catch (error: any) {
    console.error('💥 Lỗi DELETE /api/images/[id]:', error);
    
    // Xử lý các lỗi cụ thể
    if (error.message?.includes('không tồn tại') || error.message?.includes('đang được sử dụng')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Không thể xóa image' },
      { status: 500 }
    );
  }
}