import { NextRequest, NextResponse } from 'next/server';
import { readdir, stat } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

interface ImageInfo {
  id: string; 
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: string;
  isImage: boolean;
}

interface ImagesResponse {
  images: ImageInfo[];
  total: number;
  message: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

function generateImageId(filename: string): string {
  return `img_${filename.replace(/[^a-zA-Z0-9]/g, '_')}`;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    console.log('🔍 GET /api/images được gọi');
    
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    
    if (!existsSync(uploadsDir)) {
      console.log('📁 Thư mục uploads chưa tồn tại');
      return NextResponse.json({
        images: [],
        total: 0,
        message: 'Thư mục uploads chưa được tạo'
      });
    }
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type'); // 'image', 'all'
    
    const files = await readdir(uploadsDir);
    
    const imageInfos: ImageInfo[] = [];
    
    for (const filename of files) {

      if (filename.startsWith('.')) continue;
      
      try {
        const filepath = path.join(uploadsDir, filename);
        const stats = await stat(filepath);
        
        const ext = path.extname(filename).toLowerCase();
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
        const isImage = imageExtensions.includes(ext);
        
        let mimeType = 'application/octet-stream';
        switch (ext) {
          case '.jpg':
          case '.jpeg':
            mimeType = 'image/jpeg';
            break;
          case '.png':
            mimeType = 'image/png';
            break;
          case '.gif':
            mimeType = 'image/gif';
            break;
          case '.webp':
            mimeType = 'image/webp';
            break;
          case '.pdf':
            mimeType = 'application/pdf';
            break;
          case '.txt':
            mimeType = 'text/plain';
            break;
        }
        
        const timestampMatch = filename.match(/^(\d+)_/);
        let uploadedAt = stats.mtime.toISOString();
        if (timestampMatch) {
          uploadedAt = new Date(parseInt(timestampMatch[1])).toISOString();
        }
        
        const imageInfo: ImageInfo = {
          id: generateImageId(filename),
          name: filename,
          url: `/uploads/${filename}`,
          size: stats.size,
          type: mimeType,
          uploadedAt,
          isImage
        };
        
        if (type === 'image' && !isImage) continue;
        if (type === 'document' && isImage) continue;
        
        imageInfos.push(imageInfo);
        
      } catch (error) {
        console.error(`Lỗi khi đọc file ${filename}:`, error);
        continue;
      }
    }
    
    imageInfos.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
    
    const total = imageInfos.length;
    const skip = (page - 1) * limit;
    const paginatedImages = imageInfos.slice(skip, skip + limit);
    const pages = Math.ceil(total / limit);
    
    const response: ImagesResponse = {
      images: paginatedImages,
      total,
      message: `Tìm thấy ${total} files${type ? ` (loại: ${type})` : ''}`,
      pagination: {
        page,
        limit,
        total,
        pages
      }
    };
    
    console.log(`✅ Trả về ${paginatedImages.length}/${total} files với id fields`);
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('💥 Lỗi GET /api/images:', error);
    return NextResponse.json(
      { 
        error: 'Không thể lấy danh sách images',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  console.log('🔄 POST /api/images redirect to /api/upload');
  
  try {
    const formData = await request.formData();
    
    const response = await fetch(new URL('/api/upload', request.url).toString(), {
      method: 'POST',
      body: formData,
    });
    
    const data = await response.json();
    
    if (data.file && data.success) {
      const transformedFile = {
        ...data.file,
        id: generateImageId(data.file.name)
      };
      
      return NextResponse.json({
        ...data,
        file: transformedFile
      }, { status: response.status });
    }
    
    return NextResponse.json(data, { status: response.status });
    
  } catch (error) {
    console.error('💥 Lỗi POST /api/images:', error);
    return NextResponse.json(
      { error: 'Upload thất bại' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    console.log('🗑️ DELETE /api/images được gọi');
    
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');
    const id = searchParams.get('id');
    
    if (!filename && !id) {
      return NextResponse.json(
        { error: 'Tên file hoặc ID là bắt buộc' },
        { status: 400 }
      );
    }
    
    let targetFilename = filename;
    if (id && !filename) {
      targetFilename = id.replace('img_', '').replace(/_/g, '.');
    }
    
    if (!targetFilename) {
      return NextResponse.json(
        { error: 'Không thể xác định file để xóa' },
        { status: 400 }
      );
    }

    const filepath = path.join(process.cwd(), 'public', 'uploads', targetFilename);
    
    if (!existsSync(filepath)) {
      return NextResponse.json(
        { error: 'File không tồn tại' },
        { status: 404 }
      );
    }
    
    console.log('Xóa image thành công:', targetFilename);
    
    return NextResponse.json({
      message: 'Xóa image thành công',
      filename: targetFilename,
      id: id || generateImageId(targetFilename),
      success: true
    });
    
  } catch (error) {
    console.error('💥 Lỗi DELETE images:', error);
    return NextResponse.json(
      { error: 'Không thể xóa image' },
      { status: 500 }
    );
  }
}