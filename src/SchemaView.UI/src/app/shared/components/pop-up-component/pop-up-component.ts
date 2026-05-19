import { Component, input, output } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { IconComponent } from '../icon-component/icon-component';
import { APP_ICONS } from '../../models/constants/icons';

@Component({
  selector: 'app-pop-up-component',
  imports: [DialogModule, IconComponent],
  templateUrl: './pop-up-component.html',
  styleUrl: './pop-up-component.css',
})
export class PopUpComponent {
  ICONS = APP_ICONS;
  visible = input(false);
  visibleChange = output<boolean>();

  close(): void {
    this.visibleChange.emit(false);
  }
}
