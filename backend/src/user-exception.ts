export class UserException extends Error {
    constructor(message: string, public readonly statusCode: number = 500) {
        super(message);
        this.name = "UserException";
    }
}