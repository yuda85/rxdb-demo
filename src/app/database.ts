// database.service.ts
import { Injectable } from '@angular/core';
import {
  createRxDatabase,
  RxDatabase,
  RxCollection,
  RxJsonSchema,
  RxDocument,
  addRxPlugin
} from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';

// Add dev-mode plugin in development
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode';
import { wrappedValidateAjvStorage } from 'rxdb/plugins/validate-ajv';

// Add Environment
// if (!environment.production) {
  addRxPlugin(RxDBDevModePlugin);
// }

// Define your document interface
export interface UserDocument {
  id: string;
  name: string;
  email: string;
  age?: number;
  createdAt: string; // Store as ISO string for JSON schema compatibility
}

// Define the schema
const userSchema: RxJsonSchema<UserDocument> = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 100
    },
    name: {
      type: 'string'
    },
    email: {
      type: 'string'
    },
    age: {
      type: 'number',
      minimum: 0,
      maximum: 150
    },
    createdAt: {
      type: 'string'
    }
  },
  required: ['id', 'name', 'email', 'createdAt']
};

// Collection interface
export interface UserCollection extends RxCollection<UserDocument> {}

// Database interface - properly typed
export type MyDatabase = RxDatabase<{
  users: UserCollection;
}>;

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private database: MyDatabase | null = null;

  constructor() {
    this.initDatabase();
  }

  private async initDatabase(): Promise<void> {
    try {
      // Create the database with schema validation wrapper
      this.database = await createRxDatabase<MyDatabase>({
        name: 'myapp_database',
        storage: wrappedValidateAjvStorage({
          storage: getRxStorageDexie()
        }),
        ignoreDuplicate: true
      });

      // Add collections
      await this.database.addCollections({
        users: {
          schema: userSchema
        }
      });

      console.log('RXDB Database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database:', error);
    }
  }

  async getDatabase(): Promise<MyDatabase> {
    if (!this.database) {
      await this.initDatabase();
    }
    if (!this.database) {
      throw new Error('Failed to initialize database');
    }
    return this.database;
  }

  async addUser(userData: Omit<UserDocument, 'id' | 'createdAt'>): Promise<RxDocument<UserDocument> | null> {
    try {
      const db = await this.getDatabase();
      const user = await db.users.insert({
        id: this.generateId(),
        ...userData,
        createdAt: new Date().toISOString() // Convert to ISO string
      });
      return user;
    } catch (error) {
      console.error('Failed to add user:', error);
      return null;
    }
  }

  async getUsers() {
    const db = await this.getDatabase();
    return db.users.find();
  }

  async getUserById(id: string) {
    const db = await this.getDatabase();
    return db.users.findOne({ selector: { id } });
  }

  async updateUser(id: string, updateData: Partial<UserDocument>): Promise<boolean> {
    try {
      const db = await this.getDatabase();
      const user = await db.users.findOne({ selector: { id } }).exec();
      if (user) {
        await user.update({ $set: updateData });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to update user:', error);
      return false;
    }
  }

  async deleteUser(id: string): Promise<boolean> {
    try {
      const db = await this.getDatabase();
      const user = await db.users.findOne({ selector: { id } }).exec();
      if (user) {
        await user.remove();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to delete user:', error);
      return false;
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  async destroy(): Promise<void> {
    if (this.database) {
      await this.database.remove();
    }
  }
}
