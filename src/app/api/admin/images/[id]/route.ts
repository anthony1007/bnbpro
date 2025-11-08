import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function DELETE(
  request: NextRequest, context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    // Check if image is being used by any fund
    const fund = await prisma.fund.findFirst({
      where: { imageId: id }
    })

    if (fund) {
      return NextResponse.json(
        { error: 'Cannot delete image. It is being used by a fund.' },
        { status: 400 }
      )
    }

    await prisma.image.delete({
      where: { id: id }
    })

    return NextResponse.json({ message: 'Image deleted successfully' })
  } catch (error) {
    console.error('Delete image error:', error)
    return NextResponse.json(
      { error: 'Failed to delete image' },
      { status: 500 }
    )
  }
}