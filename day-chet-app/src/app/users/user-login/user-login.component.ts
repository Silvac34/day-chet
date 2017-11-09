import { Component, OnInit } from '@angular/core';
import { AuthService } from "../../core/auth.service";

@Component({
  selector: 'app-user-login',
  templateUrl: './user-login.component.html',
  styleUrls: ['./user-login.component.css'],
  providers: [AuthService]
})
export class UserLoginComponent implements OnInit {

  constructor(public auth: AuthService) { }

  ngOnInit() {
  }

  private afterSignIn(): void {
  // Do after login stuff here, such router redirects, toast messages, etc.
  }
  
  signInWithGoogle(): void {
    this.auth.googleLogin()
      .then(() => this.afterSignIn());
  }
  signInWithFacebook(): void {
    this.auth.facebookLogin()
      .then(() => this.afterSignIn());
  }
  
}
