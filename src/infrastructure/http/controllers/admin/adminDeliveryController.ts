import { Request, Response } from "express";
import { createDeliveryZoneUsecase } from "../../../../core/usecases/delivery/createDeliveryZoneUsecase";
import { listDeliveryZonesUsecase } from "../../../../core/usecases/delivery/listDeliveryZonesUsecase";


export async function adminCreateDeliveryZoneController(req: Request, res: Response) {
    try {
        const { name, city, minAmountFree, baseFee } = req.body;
        if (!name || baseFee === undefined) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const zone = await createDeliveryZoneUsecase({
            name,
            city,
            minAmountFree: minAmountFree ? Number(minAmountFree) : undefined,
            baseFee: Number(baseFee)
        });

        return res.status(201).json(zone);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "INTERNAL_ERROR" });
    }
}

export async function adminListDeliveryZonesController(req: Request, res: Response) {
    try {
        const zones = await listDeliveryZonesUsecase();
        return res.json(zones);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "INTERNAL_ERROR" });
    }
}
