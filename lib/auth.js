import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "./firebase";

export async function login(email, password) {
  const res = await signInWithEmailAndPassword(auth, email, password);
  return res.user;
}

export async function register(email, password) {
  const res = await createUserWithEmailAndPassword(auth, email, password);
  return res.user;
}