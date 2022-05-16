import { UserCredentialsDBAccess } from "../src/Authorization/UserCredentialsDBAccess";
import { UsersDBAccess } from "../src/User/UsersDBAccess";


class DbTest {

    public dbAccess: UserCredentialsDBAccess = new UserCredentialsDBAccess();
    public userDbAccess: UsersDBAccess = new UsersDBAccess();
}

// new DbTest().dbAccess.putUserCredential( {
//     username: 'user1',
//     password: 'password1',
//     accessRights: [0, 1 ,2 ,3]
// });

new DbTest().userDbAccess.putUser({
   age: 30,
   email: 'some@email.com',
   id: 'asd23234',
   name: 'John Abc',
   workingPosition: 3
});

new DbTest().userDbAccess.putUser({
    age: 45,
    email: 'some@otheremail.com',
    id: 'newidadsasdsgsdf',
    name: 'barosanu',
    workingPosition: 1
 });