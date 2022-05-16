import { UserCredentials } from "../Shared/Model";
import * as Nedb from 'nedb';

export class UserCredentialsDBAccess {

    private nedb:Nedb = new Nedb('database/UserCredentials.db');

    constructor(){
        this.nedb.loadDatabase();
    }

    public async putUserCredential(userCredentials: UserCredentials) : Promise<any> {
        return new Promise((resolve, reject)=>{
            this.nedb.insert(userCredentials, (err:Error | null, docs:any)=>{
                if (err) {
                    reject(err);
                }
                else {
                    resolve(docs);
                }
            })
        });
    }

    public async getUserCredential(username:string, password: string) : Promise<UserCredentials | undefined> {
        return new Promise((resolve, reject)=>{
            this.nedb.find({username:username, password:password}, 
                (err:Error, docs:UserCredentials[])=> {
                    if (err) {
                        reject(err)
                    }
                    else {
                        if (docs.length == 0) {
                            resolve(undefined);
                        } else {
                            resolve(docs[0])
                        }
                    }
                })
        });
    }
}