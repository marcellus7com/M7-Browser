export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  lastLogin: string;
}

export interface Extension {
  id: string;
  name: string;
  version: string;
  description?: string;
  category: string;
  icon: string;
  isActive: boolean;
  userId: string;
  scripts?: string; // JSON string
}

export interface Message {
  id: number;
  userId: string;
  text: string;
  sender: 'user' | 'admin';
  timestamp: string;
  isRead: boolean;
}

export interface Notification {
  id: number;
  userId: string;
  title: string;
  body: string;
  timestamp: string;
  isRead: boolean;
}
