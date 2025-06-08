import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CesiumMapComponent } from './components/cesium-map/cesium-map';
import { UserListComponent } from './user-list/user-list';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, CesiumMapComponent, UserListComponent],
  template: `
    <div class="app-container">
      <header>
        <h1>Angular 20 + Cesium Integration</h1>
      </header>

      <main>
        <app-cesium-map></app-cesium-map>
      </main>
      <app-user-list></app-user-list>
    </div>
  `,
  styles: [`
    .app-container {
      width: 100%;
      height: 100vh;
      display: flex;
      flex-direction: column;
    }

    header {
      background: #1976d2;
      color: white;
      padding: 1rem;
      text-align: center;
    }

    header h1 {
      margin: 0;
      font-size: 1.5rem;
    }

    main {
      flex: 1;
      overflow: hidden;
    }
  `]
})
export class AppComponent {
  title = 'angular-cesium-app';
}
