"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationType = void 0;
var NotificationType;
(function (NotificationType) {
    NotificationType["ORDER_CREATED"] = "ORDER_CREATED";
    NotificationType["ORDER_PAID"] = "ORDER_PAID";
    NotificationType["ORDER_SHIPPED"] = "ORDER_SHIPPED";
    NotificationType["ORDER_STATUS_CHANGED"] = "ORDER_STATUS_CHANGED";
    NotificationType["DELIVERY_ASSIGNED"] = "DELIVERY_ASSIGNED";
    NotificationType["DELIVERY_IN_TRANSIT"] = "DELIVERY_IN_TRANSIT";
    NotificationType["ORDER_DELIVERED"] = "ORDER_DELIVERED";
    NotificationType["LOW_STOCK"] = "LOW_STOCK";
    NotificationType["NEW_ORDER_FOR_SELLER"] = "NEW_ORDER_FOR_SELLER";
    NotificationType["PAYMENT_FAILED"] = "PAYMENT_FAILED";
    NotificationType["DISPUTE_OPENED"] = "DISPUTE_OPENED";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
