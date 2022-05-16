import { createServer, IncomingMessage, ServerResponse } from 'http';
import { Authorizer } from '../Authorization/Authorizer';
import { LoginHandler } from './LoginHandler';
import { UsersHandler } from './UsersHandler';
import { Utils } from './Utils';

export class Server {

    private authorizer: Authorizer = new Authorizer;

    private loginHandler: LoginHandler = new LoginHandler(this.authorizer);
    private usersHandler: UsersHandler = new UsersHandler(this.authorizer);

    public createServer(){
        createServer(
            async (req : IncomingMessage, res : ServerResponse) => {
                console.log('got request from: ' + req.url);
                this.addCorsHeader(res);
                const basePath = Utils.getUrlBasePath(req.url);

                switch (basePath) {
                    case 'login':
                        this.loginHandler.setRequest(req);
                        this.loginHandler.setResponse(res);
                        await this.loginHandler.handleRequest();
                        break;
                    case 'users':
                        this.usersHandler.setRequest(req);
                        this.usersHandler.setResponse(res);
                        await this.usersHandler.handleRequest();
                        break;
                    default:
                        break;
                }
                console.log('ending');
                res.end();
            }
        ).listen(8080);
        console.log('server started');
    }

    private addCorsHeader(res: ServerResponse) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Headers', '*');
        res.setHeader("Access-Control-Allow-Methods", '*');
    }
}