import { Component } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { AuthService } from "./core/auth.service";
import { TranslateService } from '@ngx-translate/core';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
  
interface User {
  name: string;
  photoURL: string;
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
  public dataUpdated: boolean = false;
  
  constructor(private afs: AngularFirestore, public auth: AuthService, private translate: TranslateService) {
    let userLang = navigator.language; 
    translate.setDefaultLang('en');
    translate.use(userLang);
  }

  switchLanguage(language: string) {
    this.translate.use(language);
  }
  
  search = (text$: Observable<string>) =>
    text$
      .debounceTime(200)
      .distinctUntilChanged()
      .map(term => term.length < 2 ? []
        : this.rubbishList.filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10));


  ngOnInit() {
    //get user's ranking
    this.usersCol = this.afs.collection<User>('users', ref => ref.orderBy('rubbish_quantity', 'desc').limit(6));
    this.users = this.usersCol.valueChanges();
    //get names of rubbishes already in database
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
    if(this.auth.currentUser != null){
      let userColDB = this.afs.collection('users').doc(this.auth.currentUserId);
      let observable = userColDB.valueChanges().subscribe((res: any) => {
        let user_rubbish_quantity = 0;
        if(res != null) {
          user_rubbish_quantity = res.rubbish_quantity;
        };
        if(user_rubbish_quantity == 0){
          //add new rubbish to database
          this.afs.collection('rubbishes').add({'name': this.rubbishName, 'quantity': newQuantity, 'user': this.auth.currentUserDisplayName, 'date': now});
          delete this.rubbishName;
          // modify user collection if user is authenticated
          userColDB.set({'name': this.auth.currentUserDisplayName, 'email': this.auth.currentUser.email, 'rubbish_quantity': (Number(user_rubbish_quantity) + newQuantity), 'photoURL': this.auth.currentUser.photoURL});
          this.dataUpdated = true;
        }
        else{
          //add new rubbish to database
          this.afs.collection('rubbishes').add({'name': this.rubbishName, 'quantity': newQuantity, 'user': this.auth.currentUserDisplayName, 'date': now});
          delete this.rubbishName;
          // modify user collection if user is authenticated
          userColDB.set({'name': this.auth.currentUserDisplayName, 'email': this.auth.currentUser.email, 'rubbish_quantity': (Number(user_rubbish_quantity) + newQuantity), 'photoURL': this.auth.currentUser.photoURL});
          this.dataUpdated = true;
        }
        observable.unsubscribe();
      });
    } else {
        //add new rubbish to database with user == guest
        this.afs.collection('rubbishes').add({'name': this.rubbishName, 'quantity': newQuantity, 'user': this.auth.currentUserDisplayName, 'date': now});
        delete this.rubbishName;
        this.dataUpdated = true;
    }
  }
}