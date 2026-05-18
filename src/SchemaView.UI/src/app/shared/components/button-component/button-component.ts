import { Component, input } from '@angular/core';

@Component({
  selector: 'app-button-component',
  imports: [],
  templateUrl: './button-component.html',
  styleUrl: './button-component.css',
})
export class ButtonComponent {
  label = input<string>('');
  type = input<'submit' | 'button' | 'reset'>('button');
  disabled = input<boolean>(false);
  variant = input<'primary' | 'secondary' | 'danger'>('primary');
  loading = input<boolean>(false);
}
