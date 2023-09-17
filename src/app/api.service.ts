import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../environments/environment';
@Injectable({
  providedIn: 'root',
})
export class ApiService {
  baseUrl = environment.BaseURL;
  constructor(private _httpClient: HttpClient) {}
  // getForcedBusy(userId, query?) {
  //   let url;
  //   if (query && query !== "") {
  //     url = `${environment.api_url}/admin-forced-busy-events?${query}`;
  //   } else {
  //     url = `${environment.api_url}/admin-forced-busy-events?filter[where][userId]=${userId}`;
  //   }
  //   return this._httpClient.get(url);
  // }
  getUserList() {
    let url = `${this.baseUrl}/users`;
    return this._httpClient.get(url);
  }
  getUserById(id: string) {
    let url = `${this.baseUrl}/users/${id}`;
    return this._httpClient.get(url);
  }
  postUser(data: any) {
    let url = `${this.baseUrl}/users`;
    return this._httpClient.post(url, data);
  }
  patchUserById(id: string, data: any) {
    let url = `${this.baseUrl}/users/${id}`;
    return this._httpClient.patch(url, data);
  }
  loginAuth(data: any) {
    let url = `${this.baseUrl}/login`;
    return this._httpClient.post(url, data);
  }
  adminLoginAuth(data: any) {
    let url = `${this.baseUrl}/admin-login`;
    return this._httpClient.post(url, data);
  }
  getChatByUserId(id: string) {
    let url = `${this.baseUrl}/chats?filter[where][roomId]=${id}}}`;
    return this._httpClient.get(url);
  }
  postChat(data: any) {
    let url = `${this.baseUrl}/chats`;
    return this._httpClient.post(url, data);
  }
  postQuiz(data: any) {
    let url = `${this.baseUrl}/quiz`;
    return this._httpClient.post(url, data);
  }
  getQuizesByUserId(id: string) {
    let url = `${this.baseUrl}/quiz?filter={"where":{"userId":"${id}"}}`;
    return this._httpClient.get(url);
  }
  getBroadcast() {
    let url = `${this.baseUrl}/broadcast`;
    return this._httpClient.get(url);
  }
  postBroadcast(data: any) {
    let url = `${this.baseUrl}/broadcast`;
    return this._httpClient.post(url, data);
  }
  getQuizById(id: string) {
    let url = `${this.baseUrl}/quiz/${id}`;
    return this._httpClient.get(url);
  }
  deleteQuizById(id: string) {
    let url = `${this.baseUrl}/quiz/${id}`;
    return this._httpClient.delete(url);
  }
  getQuizAnalyticById(id: string) {
    let url = `${this.baseUrl}/quiz-analytics?filter={"where":{"quizId":"${id}"}}`;
    return this._httpClient.get(url);
  }
  postQuizAnalytics(data: any) {
    let url = `${this.baseUrl}/quiz-analytics`;
    return this._httpClient.post(url, data);
  }
}
