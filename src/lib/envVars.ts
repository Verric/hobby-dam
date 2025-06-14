export interface AppConfigInterface {
  MONGO_URL: string;
  MONGO_DB_NAME: string;
  MEILI_URL: string;
  MEILI_KEY: string;
  ALGOLIA_APP_ID: string;
  ALGOLIA_ADMIN_KEY: string;
}

export class AppConfig implements AppConfigInterface {
  public readonly MONGO_URL: string;
  public readonly MONGO_DB_NAME: string;
  public readonly MEILI_URL: string;
  public readonly MEILI_KEY: string;
  public readonly ALGOLIA_APP_ID: string;
  public readonly ALGOLIA_ADMIN_KEY: string;

  constructor() {
    this.validateEnvironmentVariables();

    this.MONGO_URL = process.env.MONGO_URL!;
    this.MONGO_DB_NAME = process.env.MONGO_DB_NAME!;
    this.MEILI_URL = process.env.MEILI_URL!;
    this.MEILI_KEY = process.env.MEILI_KEY!;
    this.ALGOLIA_APP_ID = process.env.ALGOLIA_APP_ID!;
    this.ALGOLIA_ADMIN_KEY = process.env.ALGOLIA_ADMIN_KEY!;
  }

  private validateEnvironmentVariables(): void {
    const requiredVars = [
      "MONGO_URL",
      "MONGO_DB_NAME",
      "MEILI_URL",
      "MEILI_KEY",
      "ALGOLIA_APP_ID",
      "ALGOLIA_ADMIN_KEY",
    ] as const;

    const missingVars = requiredVars.filter((varName) => !process.env[varName]);

    if (missingVars.length > 0) {
      const errorMessage = `Missing required environment variables:\n${missingVars.join("\n")}`;
      throw new Error(errorMessage);
    }
  }
}


