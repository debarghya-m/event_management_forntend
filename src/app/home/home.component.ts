import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MustMatch } from '../_helpers/must-match.validator';
import { ApiService } from '../api.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { SocketService } from '../socket.service';
import { Howl } from 'howler';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  userData = JSON.parse(localStorage.getItem('userData') || '{}');
  userList: any[];
  dpIssue = '';
  profilePicture: any = '';
  isAdmin = this.userData.isAdmin ? true : false;
  allList: any[];
  broadcastList: any[];
  searchKey: any;
  toast = false;
  isText = false;
  totalUserCount: any;
  deleteId = '';
  toastMsg = '';
  currentTab: any =
    localStorage.getItem('currentTab') && this.isAdmin
      ? localStorage.getItem('currentTab')
      : 'chat';
  broadCastMessage = '';
  registerForm: FormGroup;
  broadcastForm: FormGroup;
  submitted = false;
  issubmitted = false;
  quizList: any = [];
  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private api: ApiService,
    private socket: SocketService
  ) {
    // this.socket.removeListener();
    this.registerForm = this.formBuilder.group({
      question: ['', Validators.required],
      option1: ['', Validators.required],
      option2: ['', Validators.required],
      option3: ['', Validators.required],
      option4: ['', Validators.required],
      rightOption: [''],
    });
    this.broadcastForm = this.formBuilder.group({
      message: ['', Validators.required],
      profilePicture: [''],
    });
    this.api.getUserById(this.userData._id).subscribe((user: any) => {
      if (user?.status === false || !this.userData.status) {
        this.api
          .patchUserById(this.userData._id, { status: true })
          .subscribe((res) => {});
      }
    });
  }
  openToast(msg: string) {
    this.toast = true;
    this.toastMsg = msg;
    setTimeout(() => {
      this.toast = false;
      this.toastMsg = '';
    }, 1500);
  }
  ngOnInit(): void {
    // if (
    //   Notification?.permission === 'default' ||
    //   Notification?.permission === 'denied'
    // ) {
    //   Notification.requestPermission().then((permission) => {
    //     if (permission === 'default' || permission === 'denied') {
    //       this.openToast(
    //         'You have denied, please do allow to get notifications !'
    //       );
    //     }
    //   });
    // } else {
    //   Notification.requestPermission().then((permission) => {
    //     if (permission === 'default' || permission === 'denied') {
    //       this.openToast(
    //         'You have denied, please do allow to get notifications !'
    //       );
    //     }
    //   });
    // }
    this.socket.setupSocketConnection();
    this.socket.chatListener().subscribe((data: any) => {
      // if (data.hasOwnProperty('status')) {
      // }
      if (data.roomId === this.userData._id || data.roomId === 'all') {
        this.allList?.forEach((ele, index) => {
          if (ele._id === data.userId) {
            if (this.allList[index].count) {
              this.allList[index].count += 1;
            } else {
              this.allList[index].count = 1;
            }
            this.allList[index].status = true;
            this.allList.splice(index, 1);
            this.allList.unshift(ele);
            // this.notify(
            //   'New message from ' + this.allList[index].userName,
            //   data.message
            // );
          }
        });
        this.userList = this.allList;
        this.playAudio();
        console.log('msg', data);
      }
    });
    this.api.getUserList().subscribe((res: any) => {
      console.log(res);
      this.totalUserCount = res.filter((ele: any) => {
        return !ele.isAdmin;
      }).length;

      this.allList = res;
      this.userList = res;
    });
    this.getQuizes();
    this.getBroadCast();
  }
  // notify(messagetitle: string, messagebody?: string) {
  //   if (Notification.permission == 'granted') {
  //     new Notification(messagetitle, {
  //       body: messagebody ? messagebody : '',
  //       icon: '../../assets/img/logo1.jpeg',
  //     });
  //   }
  // }
  getBroadCast() {
    this.api.getBroadcast().subscribe((res: any) => {
      this.broadcastList = res.reverse();
      console.log(this.broadcastList);
    });
  }
  getQuizes() {
    this.api.getQuizesByUserId(this.userData._id).subscribe((res: any) => {
      this.quizList = res.reverse();
      console.log(this.quizList);
    });
  }
  playAudio() {
    var sound = new Howl({
      src: ['../../assets/audio/notify.mp3'],
    });
    sound.play();
  }
  logout() {
    if (this.userData?.status === true) {
      this.api
        .patchUserById(this.userData._id, { status: false })
        .subscribe((res) => {
          localStorage.removeItem('userData');
          localStorage.removeItem('currentTab');
          // localStorage.removeItem('quizArray');
          // localStorage.removeItem('deleteArray');
          this.router.navigate(['/']);
        });
    } else {
      localStorage.removeItem('userData');
      localStorage.removeItem('currentTab');
      // localStorage.removeItem('quizArray');
      // localStorage.removeItem('deleteArray');
      this.router.navigate(['/']);
    }
  }
  filterInbox() {
    this.userList = this.allList.filter((ele) => {
      return (
        ele.userName === this.searchKey || ele.userName.includes(this.searchKey)
      );
    });
  }
  openChat(data: any) {
    this.router.navigate(['/chat'], {
      queryParams: { room: data._id, user: data.userName },
    });
  }
  broadcast(bdata: any) {
    let data: any = {
      userId: this.userData._id,
      date_time: new Date().toISOString(),
      message: bdata.message,
      roomId: 'all',
    };
    if (bdata.img && bdata.img !== '') data['img'] = bdata.img;
    this.api.postChat(data).subscribe((response) => {
      this.openToast('Message broadcasted successfully!');
    });
    this.socket.chatEmitter(data);
  }
  tabChange(event: any) {
    this.currentTab = event;
    localStorage.setItem('currentTab', this.currentTab);
  }
  get f() {
    return this.registerForm.controls;
  }

  onSubmit() {
    this.submitted = true;
    let formInput = this.registerForm.getRawValue();
    if (this.registerForm.invalid && !this.isText) {
      return;
    }
    if (formInput.rightOption && formInput.rightOption !== '') {
      formInput.rightOption =
        formInput[formInput.rightOption] !== ''
          ? formInput[formInput.rightOption]
          : '';
    }
    if (
      this.isText &&
      (!this.registerForm.controls['question'].value ||
        this.registerForm.controls['question'].value === '')
    )
      return;
    formInput['userId'] = this.userData._id;
    formInput['date_time'] = new Date().toISOString();
    this.api.postQuiz(formInput).subscribe((result: any) => {
      if (result) {
        this.getQuizes();
        this.onReset();
      }
    });
  }
  broadCastQuiz(qdata: any) {
    let data: any = {
      userId: this.userData._id,
      date_time: new Date().toISOString(),
      message: 'Open Quiz',
      roomId: 'all',
      quizId: qdata._id,
    };
    if (qdata.rightOption && qdata.rightOption !== '')
      data['rightOption'] = qdata.rightOption;
    this.api.postChat(data).subscribe((response) => {
      this.openToast('Quiz broadcasted successfully!');
    });
    this.socket.chatEmitter(data);
  }

  onReset() {
    this.submitted = false;
    this.registerForm?.reset();
  }
  onbroadcastReset() {
    this.issubmitted = false;
    this.broadcastForm?.reset();
    this.profilePicture = '';
  }
  openQuiz(data: any) {
    this.router.navigate(['/quiz'], {
      queryParams: { quiz: data._id },
    });
  }
  toggleOption() {
    this.isText = !this.isText;
    console.log(this.isText);
  }
  deleteQuiz(data: any) {
    this.deleteId = data._id;
  }
  cancelDelete(data: any) {
    this.deleteId = '';
  }
  confirmDelete(data: any) {
    this.api.deleteQuizById(data._id).subscribe((res) => {
      this.deleteId = '';
      this.quizList = this.quizList.filter((ele: any) => {
        return ele._id !== data._id;
      });
    });
  }
  get b() {
    return this.broadcastForm.controls;
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
      if (thumbnailFileList[0].size / 1024 <= 50) {
        var reader = new FileReader();
        this.profilePicture = thumbnailFileList[0].name;
        reader.readAsDataURL(thumbnailFileList[0]);
        reader.onload = () => {
          console.log(reader.result);
          this.broadcastForm.controls['profilePicture'].setValue(reader.result);
        };
        reader.onerror = function (error) {
          console.log('Error: ', error);
        };
      } else {
        this.profilePicture = '';
        this.dpIssue = 'size';
        this.broadcastForm.controls['profilePicture'].setValue('');
        console.log('Image size not supported');
      }
    } else {
      this.profilePicture = '';
      this.dpIssue = 'extension';
      console.log('Image extension not supported');
    }
  }
  onBroadcastSubmit() {
    this.issubmitted = true;
    let formInput = this.broadcastForm.getRawValue();
    if (this.broadcastForm.invalid && !this.isText) {
      return;
    }
    let data: any = {
      message: formInput.message,
      userId: this.userData._id,
      date_time: new Date().toISOString(),
    };
    if (formInput.profilePicture && formInput.profilePicture !== '') {
      data['img'] = formInput.profilePicture;
    } else {
      data['img'] = '';
    }
    console.log(data);
    this.api.postBroadcast(data).subscribe(
      (result: any) => {
        if (result) {
          this.getBroadCast();
          this.onbroadcastReset();
        }
      },
      (error) => {
        this.openToast('Too large to upload !');
      }
    );
  }
  openPdf() {
    window.open('https://smartevents.co.in/pdf.html', '_blank');
  }
}
