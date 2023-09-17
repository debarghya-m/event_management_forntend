import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../api.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SocketService } from '../socket.service';
import { Howl } from 'howler';
@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit {
  guestDetails: any = [];
  chatList: any = [];
  roomId: any;
  messageKey: any;
  popUpQuiz: any;
  userData = JSON.parse(localStorage.getItem('userData') || '{}');
  answerList = JSON.parse(localStorage.getItem('quizArray') || '[]');
  deleteList = JSON.parse(localStorage.getItem('deleteArray') || '[]');
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private api: ApiService,
    private socket: SocketService
  ) {
    // this.socket.removeListener();
  }

  ngOnInit(): void {
    if (performance.navigation.type == performance.navigation.TYPE_RELOAD) {
      this.socket.setupSocketConnection();
    }
    this.route.queryParamMap.subscribe((params: any) => {
      this.roomId = params.params.room;
      if (this.roomId) {
        this.api.getUserById(this.roomId).subscribe((res: any) => {
          this.guestDetails = res;
        });
        this.api.getChatByUserId(this.roomId).subscribe((chats: any) => {
          console.log(chats);
          this.chatList = chats ? chats : [];
          this.scrollDown();
        });
        // this.socket.setupSocketConnection();
        this.socket.chatListener().subscribe((message: any) => {
          // if (message.hasOwnProperty('status')) {
          //   return;
          // }
          if (
            message.roomId === this.userData._id ||
            message.roomId === 'all'
          ) {
            this.chatList.push(message);
            this.playAudio();
            console.log('chat', message);
          }
        });
      }
    });
  }
  playAudio() {
    var sound = new Howl({
      src: ['../../assets/audio/notify.mp3'],
    });
    sound.play();
  }
  sendMessage() {
    if (this.messageKey === '' || !this.messageKey) return;
    let data = {
      userId: this.userData._id,
      date_time: new Date().toISOString(),
      message: this.messageKey,
      roomId: this.roomId,
    };
    this.messageKey = '';
    this.api.postChat(data).subscribe((response) => {});
    this.chatList.push(data);
    this.socket.chatEmitter(data);
    console.log(data);
    // let body = document.getElementById('inbox') as HTMLElement;
    // body.scrollTo(0, body.scrollHeight + 100);
    this.scrollDown();
  }
  leaveChat() {
    this.router.navigate(['/home']);
  }
  openQuiz(id: string) {
    console.log(id);
    this.api.getQuizById(id).subscribe(
      (res: any) => {
        if (!res) {
          this.deleteList.push(id);
          localStorage.setItem('deleteArray', JSON.stringify(this.deleteList));
        }
        this.popUpQuiz = res;
        console.log(res);
      },
      (error) => {
        this.deleteList.push(id);
        localStorage.setItem('deleteArray', JSON.stringify(this.deleteList));
      }
    );
  }
  closePopUp() {
    this.popUpQuiz = null;
  }
  compareTime(atime: any, btime: any) {
    return new Date(atime).getTime() >= new Date(btime).getTime();
  }
  scrollDown() {
    setTimeout(() => {
      var lenbody = document.getElementsByClassName('msg').length;
      if (lenbody != null && lenbody > 1) {
        document.getElementsByClassName('msg')[lenbody - 1].scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'start',
        });
      }
    }, 100);
  }
  savePopup() {
    let ans: any;
    if (
      (!this.popUpQuiz.option1 || this.popUpQuiz.option1 === '') &&
      (!this.popUpQuiz.option2 || this.popUpQuiz.option2 === '') &&
      (!this.popUpQuiz.option3 || this.popUpQuiz.option3 === '') &&
      (!this.popUpQuiz.option4 || this.popUpQuiz.option4 === '')
    ) {
      ans = document.getElementById('check-input') as HTMLInputElement;
    } else {
      ans = document.querySelector(
        'input[name="answer"]:checked'
      ) as HTMLInputElement;
    }
    if (ans?.value && ans?.value !== '') {
      let data = {
        userName: this.userData.userName,
        date_time: new Date().toISOString(),
        answer: ans.value,
        quizId: this.popUpQuiz._id,
      };
      this.api.postQuizAnalytics(data).subscribe((res: any) => {
        this.answerList.push(this.popUpQuiz._id);
        localStorage.setItem('quizArray', JSON.stringify(this.answerList));
        this.popUpQuiz = null;
      });
    }
  }
}
