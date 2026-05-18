import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-icon-component',
  imports: [],
  templateUrl: './icon-component.html',
  styleUrl: './icon-component.css',
})
export class IconComponent {
  path = input<string>();
  size = input<number>(6);
  iconSize = computed(() => `${this.size() * 4}px`);
}
