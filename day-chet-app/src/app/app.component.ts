import { Component } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { AuthService } from "./core/auth.service";
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
  
interface User {
  name: string;
  email: string;
  rubbish_quantity: number;
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
  public currentUserRubbishQty: number;
  
  constructor(private afs: AngularFirestore, public auth: AuthService) { }
  
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
    //add new rubbish to database
    //this.afs.collection('rubbishes').add({'name': this.rubbishName, 'quantity': newQuantity, 'user': this.auth.currentUserDisplayName, 'date': now});
    //delete this.rubbishName;
    // modify user collection if user is authenticated
    if(this.auth.currentUser != null){
      let observable = this.afs.collection('users').doc(this.auth.currentUserId).valueChanges().subscribe((res) => {
          if(res != '{}') {
            this.afs.collection('users').doc(this.auth.currentUserId).set({'rubbish_quantity': (Number(res.rubbish_quantity) + newQuantity)});
            observable.unsubscribe();
          }
        }
      );
    }
  }
}