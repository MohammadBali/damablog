export class AppError extends Error {
    public statusCode: number;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        Object.setPrototypeOf(this, new.target.prototype); // Restore prototype chain
    }
}

export class BadRequestError extends AppError {
    constructor(message = "Bad Request") {
        super(message, 400);
    }
}

export class NotFoundError extends AppError {
    constructor(message = "Not Found") {
        super(message, 404);
    }
}

export class InternalServerError extends AppError {
    constructor(message = "Internal Server Error") {
        super(message, 500);
    }
}
