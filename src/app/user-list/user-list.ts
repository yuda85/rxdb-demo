// user-list.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { RxDocument } from 'rxdb';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatabaseService, UserDocument } from '../database';

@Component({
  selector: 'app-user-list',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="user-container">
      <h2>Users</h2>

      <!-- Add User Form -->
      <div class="add-user-form">
        <h3>Add New User</h3>
        <form (ngSubmit)="onAddUser()">
          <input
            [(ngModel)]="newUser.name"
            name="name"
            placeholder="Name"
            required>
          <input
            [(ngModel)]="newUser.email"
            name="email"
            placeholder="Email"
            type="email"
            required>
          <input
            [(ngModel)]="newUser.age"
            name="age"
            placeholder="Age"
            type="number">
          <button type="submit">Add User</button>
        </form>
      </div>

      <!-- Users List -->
      <div class="users-list">
        <div *ngFor="let user of users$ | async" class="user-item">
          <h4>{{ user.name }}</h4>
          <p>Email: {{ user.email }}</p>
          <p *ngIf="user.age">Age: {{ user.age }}</p>
          <p>Created: {{ user.createdAt | date }}</p>
          <button (click)="deleteUser(user.id)">Delete</button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./user-list.scss']
})
export class UserListComponent implements OnInit, OnDestroy {
  users$: Observable<RxDocument<UserDocument>[]> | undefined;
  private subscription = new Subscription();

  newUser = {
    name: '',
    email: '',
    age: undefined as number | undefined
  };

  constructor(private databaseService: DatabaseService) {}

  async ngOnInit() {
    // Subscribe to users collection
    const usersQuery = await this.databaseService.getUsers();
    this.users$ = usersQuery.$;
  }

  async onAddUser() {
    if (this.newUser.name && this.newUser.email) {
      await this.databaseService.addUser({
        name: this.newUser.name,
        email: this.newUser.email,
        age: this.newUser.age
      });

      // Reset form
      this.newUser = {
        name: '',
        email: '',
        age: undefined
      };
    }
  }

  async deleteUser(id: string) {
    await this.databaseService.deleteUser(id);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
