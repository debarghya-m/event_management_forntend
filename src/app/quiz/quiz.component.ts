import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MustMatch } from '../_helpers/must-match.validator';
import { ApiService } from '../api.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { SocketService } from '../socket.service';
@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.css'],
})
export class QuizComponent implements OnInit {
  quizDetails: any = {};
  quizAnalytics: any = [];
  allAnalytics: any = [];
  searchKey: any;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private api: ApiService,
    private socket: SocketService
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params: any) => {
      if (params.params.quiz) {
        this.api.getQuizById(params.params.quiz).subscribe(
          (quiz: any) => {
            this.quizDetails = quiz;
            console.log(this.quizDetails);
          },
          (error) => {}
        );
        this.api
          .getQuizAnalyticById(params.params.quiz)
          .subscribe((res: any) => {
            console.log(res);
            this.quizAnalytics = res.reverse().filter((ele: any) => {
              return ele.quizId === params.params.quiz;
            });
            this.allAnalytics = this.quizAnalytics;
          });
      }
    });
  }
  exitQuizAnalytics() {
    this.router.navigate(['/home']);
  }
  filterInbox() {
    this.quizAnalytics = this.allAnalytics.filter((ele: any) => {
      return (
        ele.answer === this.searchKey || ele.answer.includes(this.searchKey)
      );
    });
  }
}
