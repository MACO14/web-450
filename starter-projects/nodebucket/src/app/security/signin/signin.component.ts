/**
 * Title: signin.component.ts
 * Author: Mackenzie Lubben-Ortiz
 * Date: 6/6/24
 * Description: sign in component
 */

import { Component } from '@angular/core';
import {FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { SecurityService } from '../security.service';

export interface SessionUser {
  empId: number;
  firstName: string;
  lastName: string;
}

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SigninComponent {
  errorMessage: string // This is the error message
  sessionUser: SessionUser // This is the session user
  isLoading: boolean = false // This is the isLoading boolean

 // This is the signin form with the empId field
  signinForm = this.fb.group({
    empId: [null, Validators.compose([Validators.required, Validators.pattern('^[0-9]*$')])]
  })

  // This is the constructor with the FormBuilder, Router, CookieService, SecurityService, and ActivatedRoute injected
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private cookieService: CookieService,
    private secService: SecurityService,
    private route: ActivatedRoute) {
      this.sessionUser = {} as SessionUser;
      this.errorMessage = '';
    }

    // This is the signin function
    signin() {
      this.isLoading = true;

      console.log('signinForm', this.signinForm.value)

      const empId = this.signinForm.controls['empId'].value;

    // check if empId is valid
      if (!empId || isNaN(parseInt(empId, 10))) {
        this.errorMessage = 'The employee ID is invalid, please try again.';
        this.isLoading = false; // set isLoading to false to hide the loading spinner
        return;
      }

      // call the findEmployeeById() function from the SecurityService
      this.secService.findEmployeeById(empId).subscribe({
        // if successful, set the session_user cookie and redirect user to the homepage
        next: (employee: any ) => {
          this.sessionUser = employee; // set the session user
          this.cookieService.set('session_user', empId, 1); // set the session_user cookie
          this.cookieService.set('session_name', `${employee.firstName} ${employee.lastName}`, 1); // set the session_name cookie

          // check if there is a return URL
          const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/'; // if there is no return URL, redirect user to homepage

          this.isLoading = false; // set isLoading to false to hide the loading spinner

          this.router.navigate([returnUrl]); // redirect users to the returnUrl or homepage
        },

        // if error, display error message to user

        error: (err) => {
          this.isLoading = false; // set isLoading to false to hide the loading spinner


          // check if there is an err.error.message property
          // if so, display the custom error message from the Security API
          if ( err.error.message ) {
            this.errorMessage = err.error.message; // display error message
            return;
          }

          // if not, display the standard error message
          this.errorMessage = err.message;
        }
      })
}

}
