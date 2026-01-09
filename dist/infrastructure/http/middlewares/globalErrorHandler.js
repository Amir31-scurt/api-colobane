"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHandler = void 0;
const AppError_1 = require("../../../core/errors/AppError");
const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
    });
};
const sendErrorProd = (err, res) => {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
    }
    // Programming or other unknown error: don't leak details
    else {
        console.error('ERROR 💥', err);
        res.status(500).json({
            status: 'error',
            message: 'Une erreur inattendue s\'est produite !'
        });
    }
};
const globalErrorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res);
    }
    else {
        let error = { ...err };
        error.message = err.message;
        // Handle specific Prisma or JWT errors here if needed
        if (err.name === 'JsonWebTokenError')
            error = new AppError_1.AppError('Jeton invalide. Veuillez vous reconnecter.', 401);
        if (err.name === 'TokenExpiredError')
            error = new AppError_1.AppError('Votre session a expiré. Veuillez vous reconnecter.', 401);
        sendErrorProd(error, res);
    }
};
exports.globalErrorHandler = globalErrorHandler;
