import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { AuthenticationService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';
import { first } from 'rxjs/operators';
import { UserProfileService } from '../../../core/services/user.service';
import { Store } from '@ngrx/store';
import { Register } from 'src/app/store/Authentication/authentication.actions';
import { CommonModule } from '@angular/common';
import { getError } from 'src/app/store/Authentication/authentication-selector';
import { AlertModule } from 'ngx-bootstrap/alert';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, AlertModule, RouterModule]
})
export class SignupComponent implements OnInit {

  signupForm: UntypedFormGroup;
  submitted: any = false;
  error: any = '';
  successmsg: any = false;
  fieldTextType: boolean;

  // set the currenr year
  year: number = new Date().getFullYear();

  // tslint:disable-next-line: max-line-length
  constructor(private formBuilder: UntypedFormBuilder, private route: ActivatedRoute, private router: Router, private authenticationService: AuthenticationService,
    private userService: UserProfileService, public store: Store) { }

  ngOnInit() {
    this.signupForm = this.formBuilder.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });

    this.store.select(getError).subscribe(err => {
      this.error = err ? err : '';
    });
  }

  // convenience getter for easy access to form fields
  get f() { return this.signupForm.controls; }

  toggleFieldTextType() {
    this.fieldTextType = !this.fieldTextType;
  }

  /**
   * On submit form
   */
  onSubmit() {
    this.submitted = true;

    // stop here if form is invalid

    const email = this.f['email'].value;
    const name = this.f['username'].value;
    const password = this.f['password'].value;

    //Dispatch Action
    this.store.dispatch(Register({ email: email, username: name, password: password }));
  }
}
