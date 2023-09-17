import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MustMatch } from '../_helpers/must-match.validator';
import { ApiService } from '../api.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  submitted = false;
  uniqueUser = true;
  dpIssue = '';
  profilePicture: any = '';
  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private api: ApiService
  ) {}

  ngOnInit(): void {
    this.registerForm = this.formBuilder.group({
      name: ['', Validators.required],
      userName: ['', Validators.required],
      profilePicture: [''],
    });
  }
  get f() {
    return this.registerForm.controls;
  }

  onSubmit() {
    this.uniqueUser = true;
    this.submitted = true;
    if (this.registerForm.invalid) {
      return;
    }
    let formInput = this.registerForm.getRawValue();
    let data: any = {
      name: formInput.name,
      userName: formInput.userName,
      password: formInput.password,
      createdAt: new Date().toISOString(),
    };
    if (this.profilePicture) {
      data['profilePicture'] = formInput.profilePicture;
    }
    this.api.postUser(data).subscribe((res: any) => {
      if (res.success === true) {
        this.onReset();
        this.router.navigate(['/'], {
          queryParams: { user: res.data.userName },
        });
      } else {
        this.uniqueUser = false;
      }
    });
  }

  onReset() {
    this.submitted = false;
    this.registerForm.reset();
  }

  uploadDp(event: any) {
    this.dpIssue = '';
    let thumbnailFileList = event.target.files;
    let imageExtension = thumbnailFileList[0].name
      .substr(thumbnailFileList[0].name.lastIndexOf('.') + 1)
      .toLocaleLowerCase();
    if (
      imageExtension === 'jpeg' ||
      imageExtension === 'jpg' ||
      imageExtension === 'png'
    ) {
      if (thumbnailFileList[0].size / 1024 / 1024 < 1) {
        var reader = new FileReader();
        this.profilePicture = thumbnailFileList[0].name;
        reader.readAsDataURL(thumbnailFileList[0]);
        reader.onload = () => {
          this.registerForm.controls['profilePicture'].setValue(reader.result);
        };
        reader.onerror = function (error) {
          console.log('Error: ', error);
        };
      } else {
        this.profilePicture = '';
        this.dpIssue = 'size';
        console.log('Image size not supported');
      }
    } else {
      this.profilePicture = '';
      this.dpIssue = 'extension';
      console.log('Image extension not supported');
    }
  }
}
