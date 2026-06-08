// src/core/usecases/services/bookings/createBooking.ts
import { prisma } from "../../../../infrastructure/prisma/prismaClient";
import { UrgencyLevel, ServicePaymentMethod } from "@prisma/client";

interface CreateBookingInput {
  customerId: number;
  serviceId: number;
  address: string;
  description: string;
  scheduledDate?: Date;
  isDateFlexible?: boolean;
  urgency?: UrgencyLevel;
  zoneId?: number;
  contactPhone?: string;
  paymentMethod?: ServicePaymentMethod;
  images?: string[];
}

export async function createBookingUsecase(input: CreateBookingInput) {
  const service = await prisma.service.findUnique({
    where: { id: input.serviceId, isActive: true },
    include: { provider: true },
  });
  if (!service) throw new Error("SERVICE_NOT_FOUND");

  // Can't book your own service
  if (service.provider.userId === input.customerId) {
    throw new Error("CANNOT_BOOK_OWN_SERVICE");
  }

  return prisma.booking.create({
    data: {
      serviceId: input.serviceId,
      customerId: input.customerId,
      providerId: service.providerId,
      address: input.address,
      description: input.description,
      scheduledDate: input.scheduledDate,
      isDateFlexible: input.isDateFlexible ?? false,
      urgency: input.urgency ?? "NORMAL",
      zoneId: input.zoneId,
      contactPhone: input.contactPhone,
      paymentMethod: input.paymentMethod,
      images: input.images ?? [],
    },
    include: {
      service: { include: { category: true } },
      provider: { select: { name: true, phone: true, whatsappNumber: true } },
    },
  });
}
