import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { createImage } from '@/lib/database';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    console.log('📤 POST /api/admin/upload được gọi');
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'Không có file được upload' },
        { status: 400 }
      );
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Chỉ chấp nhận file hình ảnh' },
        { status: 400 }
      );
    }
    
    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File quá lớn. Tối đa 10MB' },
        { status: 400 }
      );
    }
    
    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const filename = `${timestamp}_${randomString}.${fileExtension}`;
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (error) {
      // Directory might already exist, that's fine
    }
    
    // Save file to public/uploads
    const filePath = join(uploadsDir, filename);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    await writeFile(filePath, buffer);
    console.log('✅ File saved to:', filePath);
    
    // Create image URL
    const imageUrl = `/uploads/${filename}`;
    
    // Get image dimensions if possible (basic width/height detection)
    let width: number | undefined;
    let height: number | undefined;
    
    // For now, we'll set default dimensions
    // In production, you might want to use a library like 'sharp' to get actual dimensions
    if (file.type.includes('image')) {
      width = 600;
      height = 400;
    }
    
    // Save image to database
    const savedImage = await createImage({
      url: imageUrl,
      width: width,
      height: height
    });
    
    console.log('✅ Image saved to database:', savedImage);
    
    return NextResponse.json({
      success: true,
      message: 'Upload thành công',
      file: {
        id: savedImage.id,
        url: savedImage.url,
        name: file.name,
        originalName: file.name,
        size: file.size,
        type: file.type,
        width: savedImage.width,
        height: savedImage.height,
        uploadedAt: savedImage.id ? new Date().toISOString() : undefined
      },
      image: savedImage // Keep this for backward compatibility
    });
    
  } catch (error: any) {
    console.error('💥 Lỗi upload:', error);
    return NextResponse.json(
      { error: error.message || 'Không thể upload file' },
      { status: 500 }
    );
  }
}