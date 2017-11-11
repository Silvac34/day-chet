import { Component, OnInit } from '@angular/core';
import { AuthService } from "../../core/auth.service";
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css'],
  providers: [AuthService]
})
export class UserProfileComponent implements OnInit {

  constructor(public auth: AuthService, private translate: TranslateService) { 
    let userLang = navigator.language; 
    translate.setDefaultLang('en');
    translate.use(userLang);
  }

  logout() {
    this.auth.signOut();
  }

  ngOnInit() {
  }

}

