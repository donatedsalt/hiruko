import { Mongoose } from "mongoose";

declare global {
  var mongoose: {
    conn: Mongoose | null;
    promise: Promise<Mongoose> | null;
  };

  interface CustomJwtSessionClaims {
    metadata: {
      onboardingComplete?: boolean;
    };
  }
}

export {};
