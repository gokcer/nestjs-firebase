import {
  DynamicModule,
  Module,
  OnApplicationShutdown,
  Provider,
} from "@nestjs/common";
import { AuthService, FirestoreService, StorageService } from "./service";
import { ConfigModule } from "@nestjs/config";
import { deleteApp, getApps, initializeApp } from "firebase/app";
import { FIREBASE_APP, FIREBASE_CONFIG } from "./firebase.constants";
import { FirebaseConfig } from "./interface";

export const createApp = async (config: FirebaseConfig) => {
  return initializeApp(config);
};

@Module({})
export class FirebaseModule implements OnApplicationShutdown {
  async onApplicationShutdown() {
    getApps().forEach((app) => {
      deleteApp(app);
    });
  }

  static forRoot(config: FirebaseConfig): DynamicModule {
    return {
      module: FirebaseModule,
      global: true,
      providers: [
        AuthService,
        FirestoreService,
        StorageService,
        {
          provide: FIREBASE_CONFIG,
          useValue: config,
        },
        {
          provide: FIREBASE_APP,
          inject: [FIREBASE_CONFIG],
          useFactory: async (config: FirebaseConfig) => createApp(config),
        },
      ],
      exports: [AuthService, FirestoreService, StorageService],
    };
  }

  static forRootAsync(configProvider): DynamicModule {
    return {
      module: FirebaseModule,
      global: true,
      imports: [ConfigModule],

      providers: [
        AuthService,
        FirestoreService,
        StorageService,
        {
          provide: FIREBASE_CONFIG,
          ...configProvider,
        } as Provider<FirebaseConfig>,
        {
          provide: FIREBASE_APP,
          inject: [FIREBASE_CONFIG],
          useFactory: async (config: FirebaseConfig) => createApp(config),
        },
      ],

      exports: [AuthService, FirestoreService, StorageService],
    };
  }
}
