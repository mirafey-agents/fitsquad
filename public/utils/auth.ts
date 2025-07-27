import { clearStorage } from "./storage";
import { auth } from "./firebase/config";
import { 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  User
} from "firebase/auth";

// Helper function to await auth state initialization
async function waitForAuthUser(): Promise<User | null> {
    return new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            unsubscribe(); // Unsubscribe after first call
            resolve(user);
        });
    });
}

export async function getAuthToken() {
    const user = await waitForAuthUser();
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

export async function getLoggedInUser(): Promise<{id: string} | null> {
    const user = await waitForAuthUser();
    if (!user) {
        return null;
    }
    
    console.log('logged in user: ', user);
    
    return {id: user.uid};
}