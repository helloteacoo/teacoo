import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { collection, doc, type Firestore } from "firebase/firestore";
import { db } from "./firebase";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateQuizId(): string {
  return doc(collection(db, "quizzes")).id;
} 