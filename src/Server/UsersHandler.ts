import { IncomingMessage, ServerResponse } from "http";
import { AccessRight, HTTP_CODES, HTTP_METHODS, User } from "../Shared/Model";
import { UsersDBAccess } from "../User/UsersDBAccess";
import { BaseRequestHandler } from "./BaseRequestHandler";
import { TokenValidator } from "./Model";
import { Utils } from "./Utils";

export class UsersHandler extends BaseRequestHandler {
    private usersDbAccess: UsersDBAccess = new UsersDBAccess();
    private tokenValidator: TokenValidator;

    public constructor(tokenValidator: TokenValidator, req?: IncomingMessage, res?: ServerResponse) {
        super({} as any, {} as any);
        this.tokenValidator = tokenValidator;
    }

    async handleRequest(): Promise<void> {
        switch (this.req.method) {
            case HTTP_METHODS.OPTIONS:
                this.res.writeHead(HTTP_CODES.OK);
                break;
            case HTTP_METHODS.GET:
                console.log('got user get request');
                await this.handleGet();
                break;
            case HTTP_METHODS.PUT:
                await this.handlePut();
                break;
            case HTTP_METHODS.DELETE:
                await this.handleDelete();
                break;
            default:
                this.handleNotFound();
                break;
        }
    }

    private async handleDelete() {
        const operationAuthorized = await this.operationAuthorized(AccessRight.DELETE);
        if (operationAuthorized) {
            const parsedUrl = Utils.getUrlParameters(this.req.url);
            if (parsedUrl) {
                if (parsedUrl.query.id) {
                    const deleteResult = await this.usersDbAccess.deleteUser(parsedUrl.query.id as string);
                    if (deleteResult) {
                        this.respondText(HTTP_CODES.OK, `user ${parsedUrl.query.id} deleted`)
                    } else {
                        this.respondText(HTTP_CODES.NOT_FOUND, `user ${parsedUrl.query.id} was not deleted`)
                    }
                }
            } else {
                this.respondBadRequest('missing id in the request')
            }
        }
    }

    private async handlePut() {
        const operationAuthorized = await this.operationAuthorized(AccessRight.CREATE);
        if (operationAuthorized) {
            try {
                const user:User = await this.getRequestBody();
                await this.usersDbAccess.putUser(user);
                this.respondText(HTTP_CODES.CREATED, `user ${user.name} created`);
            } catch (error) {
                if (error instanceof Error) {
                    this.respondBadRequest(error.message)
                }
            }
        } else {
            this.respondUnauthorized('missing or invalid authentication');
        }
    }

    private async handleGet() {
        const operationAuthorized = await this.operationAuthorized(AccessRight.READ);
        if (operationAuthorized) {
            const parsedUrl = Utils.getUrlParameters(this.req.url);
            if (parsedUrl) {
                console.log(`url parsed with ${JSON.stringify(parsedUrl.query)}`);
                 if (parsedUrl.query.name) {
                    console.log(`Fetching user database...`);
                    const users = await this.usersDbAccess.getUserByName(parsedUrl.query.name as string)
                    console.log(`got users ${JSON.stringify(users)}`);
                    this.respondJsonObject(HTTP_CODES.OK, users)
                } else if (parsedUrl.query.id) {
                    const user = await this.usersDbAccess.getUserById(parsedUrl.query.id as string);
                    if (user) {
                        this.respondJsonObject(HTTP_CODES.OK, user);
                    } else {
                        this.handleNotFound();
                    }
                } else {
                    this.respondBadRequest('userId or name not present in request')
                }
            }
        } else {
            this.respondUnauthorized('missing or invalid authentication');
        }
    }

    private async operationAuthorized(operation: AccessRight): Promise<boolean> {
        const tokenId = this.req.headers.authorization;
        if (tokenId) {
            const tokenRights = await this.tokenValidator.validateToken(tokenId);
            if (tokenRights.accessRights.includes(operation)) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }
}