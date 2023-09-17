import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MustMatch } from '../_helpers/must-match.validator';
import { ApiService } from '../api.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  registerForm: FormGroup;
  submitted = false;
  isAdmin = false;
  isWrong = false;
  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private api: ApiService,
    private route: ActivatedRoute
  ) {
    this.route.queryParamMap.subscribe((params: any) => {
      if (params.params.user) {
        this.registerForm = this.formBuilder.group({
          userName: [params.params.user, Validators.required],
        });
      } else if (params.params.admin) {
        this.isAdmin = true;
        this.registerForm = this.formBuilder.group({
          userName: ['', Validators.required],
          password: ['', Validators.required],
        });
      } else {
        this.registerForm = this.formBuilder.group({
          userName: ['', Validators.required],
        });
      }
    });
  }

  ngOnInit(): void {}
  get f() {
    return this.registerForm.controls;
  }

  onSubmit() {
    this.isWrong = false;
    this.submitted = true;
    if (this.registerForm.invalid) {
      return;
    }
    let formInput = this.registerForm.getRawValue();
    let data: any = {
      userName: formInput.userName,
    };
    if (this.isAdmin) {
      data['password'] = formInput.password;
      this.api.adminLoginAuth(data).subscribe((res: any) => {
        if (res.success === true) {
          this.isWrong = false;
          localStorage.setItem('userData', JSON.stringify(res.data));
          this.router.navigate(['/home']);
        } else {
          this.openSnackBar('Wrong credential');
          this.isWrong = true;
        }
      });
    } else {
      this.api.loginAuth(data).subscribe((res: any) => {
        if (res.success === true) {
          this.isWrong = false;
          localStorage.setItem('userData', JSON.stringify(res.data));
          this.router.navigate(['/home']);
        } else {
          this.openSnackBar('Wrong username');
          this.isWrong = true;
        }
      });
    }
  }

  onReset() {
    this.submitted = false;
    this.registerForm.reset();
  }
  openSnackBar(msg: string) {
    this.snackBar.open(msg, '', {
      duration: 2000,
      verticalPosition: 'top',
      horizontalPosition: 'right',
    });
  }
}
