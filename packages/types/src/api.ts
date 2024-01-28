interface Success<T> {
  success: true;
  data: T;
}

interface Error {
  success: false;
  error: string;
}

export type WithError<T> = Success<T> | Error;

export function newAPISuccess<T>(data: T): WithError<T> {
  return { success: true, data };
}

export function newAPIError<T>(message: string): WithError<T> {
  return { success: false, error: message };
}
