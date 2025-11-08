// import { NextRequest, NextResponse } from 'next/server';
// import { 
//   getAllFunds, 
//   createFund, 
//   updateFund, 
//   deleteFund,
//   CreateFundRequest,
//   UpdateFundRequest 
// } from '@/lib/database';

// export async function GET(request: NextRequest): Promise<NextResponse> {
//   try {
//     console.log('🔍 GET /api/admin/funds được gọi');
    
//     // Lấy các query parameters từ URL
//     const { searchParams } = new URL(request.url);
//     const page = parseInt(searchParams.get('page') || '1');
//     const limit = parseInt(searchParams.get('limit') || '12');
//     const search = searchParams.get('search') || undefined;
    
//     console.log('📄 Pagination:', { page, limit, search });
    
//     // Lấy dữ liệu từ database thực
//     const result = await getAllFunds(page, limit, search);
    
//     console.log(`✅ Trả về ${result.funds.length} funds (trang ${page}/${result.pagination.pages})`);
//     return NextResponse.json(result);
    
//   } catch (error) {
//     console.error('💥 Lỗi GET /api/admin/funds:', error);
//     return NextResponse.json(
//       { error: 'Không thể lấy danh sách funds' },
//       { status: 500 }
//     );
//   }
// }

// export async function POST(request: NextRequest): Promise<NextResponse> {
//   try {
//     console.log('📝 POST /api/admin/funds được gọi');
    
//     const body: CreateFundRequest = await request.json();
//     console.log('📥 Dữ liệu nhận được:', body);
    
//     // Tạo fund mới thông qua database function
//     const newFund = await createFund(body);
    
//     console.log('✅ Tạo fund mới thành công:', newFund);
    
//     return NextResponse.json(
//       { 
//         fund: newFund, 
//         message: 'Tạo fund thành công',
//         success: true
//       },
//       { status: 201 }
//     );
    
//   } catch (error: any) {
//     console.error('💥 Lỗi POST /api/admin/funds:', error);
    
//     // Xử lý các lỗi cụ thể
//     if (error.message?.includes('bắt buộc') || error.message?.includes('không hợp lệ')) {
//       return NextResponse.json(
//         { error: error.message },
//         { status: 400 }
//       );
//     }
    
//     // Xử lý lỗi JSON parsing
//     if (error instanceof SyntaxError) {
//       return NextResponse.json(
//         { error: 'Dữ liệu JSON không hợp lệ' },
//         { status: 400 }
//       );
//     }
    
//     return NextResponse.json(
//       { error: 'Không thể tạo fund mới' },
//       { status: 500 }
//     );
//   }
// }

// // PUT method để cập nhật fund
// export async function PUT(request: NextRequest): Promise<NextResponse> {
//   try {
//     console.log('✏️ PUT /api/admin/funds được gọi');
    
//     const body = await request.json();
//     const { id, ...updateData }: { id: string } & UpdateFundRequest = body;
    
//     if (!id) {
//       return NextResponse.json(
//         { error: 'ID fund là bắt buộc' },
//         { status: 400 }
//       );
//     }
    
//     // Cập nhật fund thông qua database function
//     const updatedFund = await updateFund(id, updateData);
    
//     if (!updatedFund) {
//       return NextResponse.json(
//         { error: 'Fund không tồn tại' },
//         { status: 404 }
//       );
//     }
    
//     console.log('✅ Cập nhật fund thành công:', updatedFund);
    
//     return NextResponse.json({
//       fund: updatedFund,
//       message: 'Cập nhật fund thành công',
//       success: true
//     });
    
//   } catch (error: any) {
//     console.error('💥 Lỗi PUT /api/admin/funds:', error);
    
//     if (error.message?.includes('không tồn tại') || error.message?.includes('không hợp lệ')) {
//       return NextResponse.json(
//         { error: error.message },
//         { status: 400 }
//       );
//     }
    
//     return NextResponse.json(
//       { error: 'Không thể cập nhật fund' },
//       { status: 500 }
//     );
//   }
// }

// // DELETE method để xóa fund
// export async function DELETE(request: NextRequest): Promise<NextResponse> {
//   try {
//     console.log('🗑️ DELETE /api/admin/funds được gọi');
    
//     const { searchParams } = new URL(request.url);
//     const id = searchParams.get('id');
    
//     if (!id) {
//       return NextResponse.json(
//         { error: 'ID fund là bắt buộc' },
//         { status: 400 }
//       );
//     }
    
//     // Xóa fund thông qua database function
//     const success = await deleteFund(id);
    
//     if (!success) {
//       return NextResponse.json(
//         { error: 'Fund không tồn tại' },
//         { status: 404 }
//       );
//     }
    
//     console.log('✅ Xóa fund thành công, ID:', id);
    
//     return NextResponse.json({
//       message: 'Xóa fund thành công',
//       success: true,
//       deletedId: id
//     });
    
//   } catch (error: any) {
//     console.error('💥 Lỗi DELETE /api/admin/funds:', error);
    
//     if (error.message?.includes('không tồn tại')) {
//       return NextResponse.json(
//         { error: error.message },
//         { status: 404 }
//       );
//     }
    
//     return NextResponse.json(
//       { error: 'Không thể xóa fund' },
//       { status: 500 }
//     );
//   }
// }



// src/app/api/admin/funds/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyUser } from "@/lib/verify";

export async function GET() {
  // list funds (public admin)
  try {
    const funds = await prisma.fund.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ funds });
  } catch (err: any) {
    console.error("GET /api/admin/funds error:", err);
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  /**
   * Create fund => only ADMIN
   * Body: { plan, package, perday, quarter, imageId? }
   */
  try {
    const token = (await (await import("next/headers")).cookies()).get("token")?.value ?? null;
    const auth = await verifyUser();
    if (!auth?.userId || auth.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const plan = String(body?.plan ?? "").trim();
    const pkg = Number(body?.package ?? 0);
    const perday = body?.perday ? Number(body.perday) : null;
    const quarter = body?.quarter ? Number(body.quarter) : 0;
    const imageId = body?.imageId ?? null;

    if (!plan || !pkg || !quarter) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const created = await prisma.fund.create({
      data: {
        plan,
        package: pkg,
        perday,
        quarter,
        imageId,
      },
    });

    return NextResponse.json({ success: true, fund: created });
  } catch (err: any) {
    console.error("POST /api/admin/funds error:", err);
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 });
  }
}
