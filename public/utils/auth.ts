import { clearStorage } from "./storage";
import { auth } from "./firebase/config";
import { 
  signInWithEmailAndPassword, 
  signOut
} from "firebase/auth";

export async function getAuthToken() {
    const user = auth.currentUser;
    if (!user) {
        throw new Error('No active session');
    }
    
    try {
        const token = await user.getIdToken();
        return token;
    } catch (error) {
        console.error('Error getting auth token:', error);
        throw new Error('Failed to get auth token');
    }
}

export async function logout() {
    try {
        await signOut(auth);
        await clearStorage();
    } catch (error) {
        console.error('Error logging out:', error);
        throw error;
    }
}

export async function login(email: string, password: string) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        console.log('Firebase: Login successful for', user.email);
        
        return {id: user.uid};

    } catch (error: any) {
        console.error('Firebase login error:', error);
        throw error;
    }
}

export async function getLoggedInUser() {
    const user = auth.currentUser;
    if (!user) {
        return null;
    }
    
    console.log('logged in user: ', user);
    
    return {id: user.uid};
}