import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PopUpService {
  addDbConnectionPopupVisible = signal(false);

  showAddDbConnectionPopUp() {
    this.addDbConnectionPopupVisible.set(true);
  }
  closeAddDbConnectionPopUp() {
    this.addDbConnectionPopupVisible.set(false);
  }
}
