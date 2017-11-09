import { Component } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { AuthService } from "./core/auth.service";
import { UserService } from "./core/user.service";
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
  
interface User {
  name: string;
  email: string;
  rubbish_quantity: number;
  id: string;
};

interface Rubbish {
  name: string;
  date: Date;
  quantity: number;
  user: string;
};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  usersCol: AngularFirestoreCollection<User>;
  users: Observable<User[]>;
  rubbishesCol: AngularFirestoreCollection<Rubbish>;
  rubbishes: Observable<Rubbish[]>;
  public rubbishList = [];
  public rubbishName: string;
  public myRubbishQty: number;
  
  constructor(private afs: AngularFirestore, public auth: AuthService, public userValue: UserService) { }
  
  search = (text$: Observable<string>) =>
    text$
      .debounceTime(200)
      .distinctUntilChanged()
      .map(term => term.length < 2 ? []
        : this.rubbishList.filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10));


  ngOnInit() {
    this.usersCol = this.afs.collection<User>('users');
    this.users = this.usersCol.valueChanges();
    this.rubbishesCol = this.afs.collection<Rubbish>('rubbishes');
    this.rubbishes = this.rubbishesCol.valueChanges();
    this.rubbishes.subscribe(val => {
      for (let value of val){
        if(this.rubbishList.indexOf(value.name) === -1){
          this.rubbishList.push(value.name);
        }
      }
    });
  }
  
  addRubbish(){
    let now = new Date();
    let newQuantity = 1;
    //this.afs.collection('rubbishes').add({'name': this.rubbishName, 'quantity': newQuantity, 'user': this.auth.currentUserDisplayName, 'date': now});
    //delete this.rubbishName;
    console.log(this.userValue.getInfo);
    if(this.auth.currentUser != null){
      let userDB = this.afs.collection('users', ref => ref.where('name', '==', this.auth.currentUserDisplayName).where('email', '==', this.auth.currentUser.email));
      //userDB.doc(this.auth.currentUserId).set({'rubbish_quantity': (Number(userList[0]['rubbish_quantity']) + newQuantity)});
      //this.afs.doc('users/' + this.auth.currentUserId).set({'name': this.auth.currentUserDisplayName, 'email': this.auth.currentUser.email, 'rubbish_quantity': 3});
      
      /*let subscriptionMeta = userDB.snapshotChanges().subscribe(userMetadatas => {
        if (userMetadatas.length === 1){
          let subscriptionValue = userDB.valueChanges().subscribe(userList =>{
            userDB.doc(userMetadatas[0].payload.doc.id).update({'rubbish_quantity': (Number(userList[0]['rubbish_quantity']) + newQuantity)});
          });
          subscriptionValue.unsubscribe();
        }
        else{
          this.afs.collection('users').add({'name': this.auth.currentUserDisplayName, 'rubbish_quantity': newQuantity, 'email': this.auth.currentUser.email});
        }
      });*/
      //subscriptionMeta.unsubscribe();
    }
  }
}