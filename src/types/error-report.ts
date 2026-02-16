import { FieldValue } from "firebase/firestore";

export interface ErrorReport {
  id?: string;
  message: string;
  stack?: string;
  url: string;
  userAgent: string;
  timestamp: FieldValue;
  userId?: string;
  userEmail?: string;
  status: 'pending' | 'investigating' | 'resolved';
  resolvedAt?: FieldValue;
  metadata?: Record<string, unknown>;
}
