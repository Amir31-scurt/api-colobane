import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../../core/errors/AppError';

const sendErrorDev = (err: AppError, res: Response) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
    });
};

const sendErrorProd = (err: AppError, res: Response) => {
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

export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res);
    } else {
        let error = { ...err };
        error.message = err.message;

        // Handle specific Prisma or JWT errors here if needed
        if (err.name === 'JsonWebTokenError') error = new AppError('Jeton invalide. Veuillez vous reconnecter.', 401);
        if (err.name === 'TokenExpiredError') error = new AppError('Votre session a expiré. Veuillez vous reconnecter.', 401);

        sendErrorProd(error, res);
    }
};
