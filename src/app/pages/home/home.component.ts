import { Component, Injector, WritableSignal, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from '../../models/task.model';
import { Filter } from '../../models/filter.model';
import {
  Validators,
  FormControl,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  filters: Filter[] = [
    { name: 'All', active: true },
    { name: 'Pending', active: false },
    { name: 'Completed', active: false },
  ];

  filter = signal<'all' | 'pending' | 'completed'>('all');

  tasksByFilter = computed(() => {
    const filter = this.filter();
    const tasks = this.taskList();

    if (filter === 'pending') {
      return tasks.filter((task) => !task.checked);
    } else if (filter === 'completed') {
      return tasks.filter((task) => task.checked);
    }

    return tasks;
  });

  taskList: WritableSignal<Task[]> = signal([]);

  newTaskCtrl = new FormControl('', {
    nonNullable: true,
    validators: [
      Validators.required,
      Validators.pattern('^\\S.*$'),
      Validators.minLength(3),
    ],
  });

  injector = inject(Injector);

  ngOnInit() {
    const storedTasksString = localStorage.getItem('tasks');
    if (storedTasksString) {
      const tasks = JSON.parse(storedTasksString);
      this.taskList.set(tasks);
    }
    this.trackTasks();
  }

  trackTasks() {
    effect(
      () => {
        const tasks = this.taskList();
        localStorage.setItem('tasks', JSON.stringify(tasks));
      },
      { injector: this.injector }
    );
  }

  addTask() {
    if (this.newTaskCtrl.valid) {
      this.taskList.update((list) => {
        const newTask = {
          id: Date.now(),
          task: this.newTaskCtrl.value,
          checked: false,
        };
        return [...list, newTask];
      });

      this.newTaskCtrl.reset();
    }
  }

  deleteTask(index: number) {
    this.taskList.update((list) => list.filter((task, i) => i !== index));
  }

  completeTask(index: number) {
    const id = this.tasksByFilter()[index].id;

    this.taskList.update((list) => {
      return list.map(task => {
        if(task.id == id) task.checked = !task.checked;
        return task;
      })
    });
  }

  deleteCompletedTasks() {
    this.taskList.update((list) => list.filter((task) => !task.checked));
  }

  editTask(index: number) {
    const id = this.tasksByFilter()[index].id;

    this.taskList.update((list) => {
      return list.map((taskInfo) => {
        taskInfo.editing = false;
        if (taskInfo.id == id && !taskInfo.checked) {
          taskInfo.editing = true;
        }
        return taskInfo;
      });
    });
  }

  saveTask(index: number) {
    const id = this.tasksByFilter()[index].id;

    this.taskList.update((list) => {
      return list.map((taskInfo) => {
        if (taskInfo.id == id && !taskInfo.checked) {
          taskInfo.editing = false;
        }
        return taskInfo;
      });
    });
  }

  changeFilter(index: number) {
    this.filters.forEach((filter, i) => {
      filter.active = i === index;
    });

    const selectedFilter = this.filters[index].name.toLowerCase();

    if (
      selectedFilter === 'all' ||
      selectedFilter === 'pending' ||
      selectedFilter === 'completed'
    ) {
      this.filter.set(selectedFilter);
    }
  }

  countTasksLeft(): number {
    const currentTasks = this.tasksByFilter();
    return currentTasks.length;
  }
}
