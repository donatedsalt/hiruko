export interface MongooseValidatorErrorProperties {
  message?: string;
  type?: string;
  path?: string;
  value?: unknown;
  reason?: unknown;
  kind?: string;
  min?: number;
  max?: number;
  minlength?: number;
  maxlength?: number;
  enum?: string[];
  [key: string]: unknown;
}

export interface MongooseValidatorError extends Error {
  name: string;
  message: string;
  path?: string;
  value?: unknown;
  kind?: string;
  reason?: unknown;
  properties?: MongooseValidatorErrorProperties;
}

export interface MongooseValidationError extends Error {
  name: "ValidationError";
  errors: {
    [path: string]: MongooseValidatorError;
  };
  _message?: string;
}

export {};
