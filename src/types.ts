/*
Defines the format of the data required to be submitted by the user in
POST requests.
*/

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
  [key: string]: string;
}

interface RequestHeader {
  'Content-Type': string;
  [key: string]: string;
}

export type { RequestHeader, UserData };
