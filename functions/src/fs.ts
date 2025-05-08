import * as admin from "firebase-admin";

admin.initializeApp({});

export const storageBucket = admin.storage()
  .bucket("fit-squad-club.firebasestorage.app");
