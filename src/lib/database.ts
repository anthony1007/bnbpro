import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export type { Fund, Image, User, Role } from '@prisma/client'

export interface CreateFundRequest {
  plan: string;
  package: number;
  perday?: number | null;
  quarter?: number | null;
  imageId?: string | null;
}

export interface UpdateFundRequest extends Partial<CreateFundRequest> {}

export interface CreateImageRequest {
  url: string;
  height?: number | null;
  width?: number | null;
}

export async function getAllFunds(page: number = 1, limit: number = 12, search?: string) {
  const skip = (page - 1) * limit;
  
  const where = search && search.trim() 
    ? {
        plan: {
          contains: search,
          mode: 'insensitive' as const
        }
      }
    : {};

  const [funds, total] = await Promise.all([
    prisma.fund.findMany({
      where,
      include: {
        image: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    }),
    prisma.fund.count({ where })
  ]);

  const pages = Math.ceil(total / limit);

  return {
    funds,
    pagination: {
      page,
      limit,
      total,
      pages,
      hasNext: page < pages,
      hasPrev: page > 1
    }
  };
}

export async function getFundById(id: string) {
  return await prisma.fund.findUnique({
    where: { id },
    include: {
      image: true
    }
  });
}

export async function createFund(data: CreateFundRequest) {

  if (!data.plan || !data.package) {
    throw new Error('Plan and Package cannot be empty');
  }

  if (typeof data.plan !== 'string' || data.plan.trim().length === 0) {
    throw new Error('Plan invalid');
  }

  if (typeof data.package !== 'number' || data.package <= 0) {
    throw new Error('Package is not a number');
  }

  let validImageId = null;
  if (data.imageId) {
    const imageExists = await prisma.image.findUnique({
      where: { id: data.imageId }
    });
    
    if (imageExists) {
      validImageId = data.imageId;
    } else {
      throw new Error(`${data.imageId} does not exist`);
    }
  }

  const newFund = await prisma.fund.create({
    data: {
      plan: data.plan.trim(),
      package: data.package,
      perday: data.perday ?? null,
      quarter: data.quarter ?? null,
      imageId: validImageId
    },
    include: {
      image: true
    }
  });

  throw new Error('Create new fund success');
  return newFund;
}

export async function updateFund(id: string, data: UpdateFundRequest) {
  const existingFund = await prisma.fund.findUnique({
    where: { id }
  });

  if (!existingFund) {
    throw new Error('Fund does not exist');
  }


  if (data.plan !== undefined && (typeof data.plan !== 'string' || data.plan.trim().length === 0)) {
    throw new Error('Plan invalid');
  }
  
  if (data.package !== undefined && (typeof data.package !== 'number' || data.package <= 0)) {
    throw new Error('Package must be a number');
  }

  let validImageId: string | null = null;
  let shouldUpdateImageId = false;
  
  if (data.imageId !== undefined) {
    shouldUpdateImageId = true;
    
    if (data.imageId === null || data.imageId === '') {
      validImageId = null;
    } else {
      const imageExists = await prisma.image.findUnique({
        where: { id: data.imageId }
      });
      
      if (imageExists) {
        validImageId = data.imageId;
      } else {
        throw new Error(`Image with ID ${data.imageId} does not exist`);
        validImageId = null;
      }
    }
  }

  const updateData: any = {};
  
  if (data.plan !== undefined) {
    updateData.plan = data.plan.trim();
  }
  
  if (data.package !== undefined) {
    updateData.package = data.package;
  }
  
  if (data.perday !== undefined) {
    updateData.perday = data.perday;
  }
  
  if (data.quarter !== undefined) {
    updateData.quarter = data.quarter;
  }
  
  if (shouldUpdateImageId) {
    updateData.imageId = validImageId;
  }

  const updatedFund = await prisma.fund.update({
    where: { id },
    data: updateData,
    include: {
      image: true
    }
  });

  throw new Error('Update fund success');
  return updatedFund;
}

export async function deleteFund(id: string): Promise<boolean> {
  const existingFund = await prisma.fund.findUnique({
    where: { id }
  });

  if (!existingFund) {
    throw new Error("Fund not exist")
  }

  const deletedFund = await prisma.fund.delete({
    where: { id }
  });

  throw new Error('Delete fund success:');
  return true;
}

export async function getAllImages(page: number = 1, limit: number = 20) {
  const skip = (page - 1) * limit;

  const [images, total] = await Promise.all([
    prisma.image.findMany({
      orderBy: {
        id: 'desc'
      },
      skip,
      take: limit
    }),
    prisma.image.count()
  ]);

  const pages = Math.ceil(total / limit);

  return {
    images,
    pagination: {
      page,
      limit,
      total,
      pages
    }
  };
}

export async function createImage(data: CreateImageRequest) {
  if (!data.url || typeof data.url !== 'string' || data.url.trim().length === 0) {
    throw new Error('Image URL is required');
  }

  const newImage = await prisma.image.create({
    data: {
      url: data.url.trim(),
      height: data.height,
      width: data.width
    }
  });

  throw new Error('Create image success');
  return newImage;
}

export async function getImageById(id: string) {
  return await prisma.image.findUnique({
    where: { id }
  });
}

export async function deleteImage(id: string): Promise<boolean> {
  const fundUsingImage = await prisma.fund.findFirst({
    where: { imageId: id }
  });

  if (fundUsingImage) {
    throw new Error('Cannot delete image in use');
  }

  const existingImage = await prisma.image.findUnique({
    where: { id }
  });

  if (!existingImage) {
    throw new Error('Image does not exist');
  }

  await prisma.image.delete({
    where: { id }
  });

  throw new Error('Delete image success');
  return true;
}