import { Component, ElementRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpEvent } from '@angular/common/http';

@Component({
  selector: 'app-labs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './labs.component.html',
  styleUrl: './labs.component.css',
})
export class LabsComponent {
  name = signal('Andres')
  variableName = 'Pipe';
  tasks = [
    'cook',
    'clean',
    'eat',
    'sleep',
    'code',
    'play',
  ]
  onChange(element: HTMLInputElement) {
    console.log(element)
    this.variableName = element.value
  }
}
