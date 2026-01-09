"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateDistance = calculateDistance;
exports.calculateDeliveryFee = calculateDeliveryFee;
/**
 * Calculates the distance between two geographic coordinates in kilometers
 * using the Haversine formula.
 *
 * @param lat1 Latitude of point 1
 * @param lon1 Longitude of point 1
 * @param lat2 Latitude of point 2
 * @param lon2 Longitude of point 2
 * @returns Distance in Kilometers
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
function toRad(value) {
    return value * Math.PI / 180;
}
/**
 * Calculates delivery fee based on distance and zone rules.
 * Currently uses simple logic: Base + (Distance * Rate)
 */
function calculateDeliveryFee(distanceKm, baseFee, perKmFee = 100) {
    // Round distance up to nearest 0.5km
    const chargeableDistance = Math.ceil(distanceKm * 2) / 2;
    // First 2km might be included in base fee (configured policy example)
    // For now, simple linear:
    const variableFee = chargeableDistance * perKmFee;
    // Round to nearest 50 for currency niceness XOF
    const total = baseFee + variableFee;
    return Math.ceil(total / 50) * 50;
}
