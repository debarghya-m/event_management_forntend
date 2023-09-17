import { Injectable } from '@angular/core';
import { io } from 'socket.io-client';
import { environment } from '../environments/environment';
import { from, Observable, Observer } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class SocketService {
  socket: any;
  constructor() {}
  setupSocketConnection() {
    if (this.socket) return;
    this.socket = io(environment.BaseURL);
    console.log(this.socket);
  }
  checkSocketStatus() {
    if (!this.socket) {
      return false;
    } else {
      return true;
    }
  }
  chatListener() {
    return new Observable((observer: Observer<any>) => {
      this.socket.on('new-chat', (data: object) => {
        if (data) {
          observer.next(data);
        } else {
          observer.error('Unable To Reach Server');
        }
      });
    });
  }
  removeListener() {
    this.socket?.emit('disconnected');
    this.socket?.disconnect();
  }
  chatEmitter(data: any) {
    this.socket.emit('new-chat', data);
  }
}
