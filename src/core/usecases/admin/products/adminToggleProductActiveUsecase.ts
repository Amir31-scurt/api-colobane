import { prisma } from "../../../../infrastructure/prisma/prismaClient";


export async function adminToggleProductActiveUsecase(params: {
  actorId: number;
  productId: number;
  isActive: boolean;
}) {
  const { actorId, productId, isActive } = params;

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new Error("PRODUCT_NOT_FOUND");

  const updated = await prisma.product.update({
    where: { id: productId },
    data: { isActive },
  });

  await prisma.auditLog.create({
    data: {
      action: "PRODUCT_TOGGLED",
      actorId,
      entityType: "Product",
      entityId: String(productId),
      meta: { from: product.isActive, to: isActive },
    },
  });

  return updated;
}
