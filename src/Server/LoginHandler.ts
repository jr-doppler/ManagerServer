import { IncomingMessage, ServerResponse } from "http";
import { HTTP_CODES, HTTP_METHODS } from "../Shared/Model";
import { BaseRequestHandler } from "./BaseRequestHandler";
import { Account, TokenGenerator } from "./Model";

export class LoginHandler extends BaseRequestHandler{
    private tokenGenerator: TokenGenerator

    public constructor(tokenGenerator: TokenGenerator, req?: IncomingMessage, res?: ServerResponse) {
        super({} as any, {} as any);
        this.tokenGenerator = tokenGenerator;
    }

    public async handleRequest(): Promise<void> {
        switch (this.req.method) {
            case HTTP_METHODS.POST:
                await this.handlePost();
                break;
            case HTTP_METHODS.OPTIONS:
                this.res.writeHead(HTTP_CODES.OK);
                break;
            default:
                await this.handleNotFound();
                break;
        }  
    }

    private async handlePost(): Promise<void> {
        try {
            const body = await this.getRequestBody();
            const sessionToken = await this.tokenGenerator.generateToken(body);
            if (sessionToken) {
                this.res.statusCode = HTTP_CODES.CREATED;
                this.res.writeHead(HTTP_CODES.CREATED, {'Content-Type': 'application/json'});
                this.res.write(JSON.stringify(sessionToken));
            } else {
                this.res.statusCode = HTTP_CODES.NOT_FOUND;
                this.res.write('wrong username or password');
            }
        } catch (error) {
            if (error instanceof Error) {
                this.res.write('error: ' + error.message)
            }
        }
    }
}