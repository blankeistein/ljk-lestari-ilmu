import {
  collection,
  query,
  where,
  limit,
  startAfter,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  type DocumentData,
  type QueryDocumentSnapshot,
  orderBy,
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { db, functions } from "@/lib/firebase";
import type { UserProfile } from "@/types/user";

const USERS_COLLECTION = "users";

export interface FetchUsersParams {
  limitCount: number;
  lastVisible: QueryDocumentSnapshot<DocumentData> | null;
  searchQuery?: string;
  role?: string;
  schoolId?: string;
}

export interface FetchUsersResult {
  users: UserProfile[];
  lastVisible: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
}

export const UserService = {
  async fetchUsers({ limitCount, lastVisible, searchQuery, role, schoolId }: FetchUsersParams): Promise<FetchUsersResult> {
    const usersRef = collection(db, USERS_COLLECTION);
    let q;

    if (searchQuery) {
      if (searchQuery.length > 20) {
        // Try to find by UID
        const docRef = doc(db, USERS_COLLECTION, searchQuery);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const userData = docSnap.data();
          // Filter by role if specified
          if (role && role !== "all" && userData?.role !== role) {
            return { users: [], lastVisible: null, hasMore: false };
          }
          // Filter by schoolId if specified
          if (schoolId && userData?.schoolId !== schoolId) {
            return { users: [], lastVisible: null, hasMore: false };
          }
          return {
            users: [{ uid: docSnap.id, ...userData } as UserProfile],
            lastVisible: null,
            hasMore: false,
          };
        }
      }

      // Search by email prefix
      const constraints = [
        where("email", ">=", searchQuery),
        where("email", "<=", searchQuery + "\uf8ff"),
        orderBy("email"),
        limit(limitCount)
      ];

      if (role && role !== "all") {
        constraints.unshift(where("role", "==", role));
      }

      if (schoolId) {
        constraints.unshift(where("schoolId", "==", schoolId));
      }

      q = query(usersRef, ...constraints);
    } else {
      const queryConstraints = [];
      if (role && role !== "all") {
        queryConstraints.push(where("role", "==", role));
      }

      if (schoolId) {
        queryConstraints.push(where("schoolId", "==", schoolId));
      }

      // Order by createdAt by default for better experience
      queryConstraints.push(orderBy("createdAt", "desc"));
      queryConstraints.push(limit(limitCount));

      if (lastVisible) {
        queryConstraints.push(startAfter(lastVisible));
      }

      q = query(usersRef, ...queryConstraints);
    }

    const querySnapshot = await getDocs(q);
    const users: UserProfile[] = [];
    querySnapshot.forEach((doc) => {
      users.push({ uid: doc.id, ...doc.data() } as UserProfile);
    });

    const newLastVisible = querySnapshot.docs[querySnapshot.docs.length - 1] || null;
    const hasMore = querySnapshot.docs.length === limitCount;

    return {
      users,
      lastVisible: newLastVisible,
      hasMore,
    };
  },

  async updateUser(uid: string, data: Partial<UserProfile>): Promise<void> {
    const userRef = doc(db, USERS_COLLECTION, uid);
    await updateDoc(userRef, data);
  },

  async deleteUser(targetUid: string): Promise<{ success: boolean }> {
    const deleteUserFn = httpsCallable<{ targetUid: string }, { success: boolean }>(
      functions,
      "deleteUser"
    );
    const result = await deleteUserFn({ targetUid });
    return result.data;
  },

  async assignRole(targetUid: string, newRole: string): Promise<{ success: boolean; message: string }> {
    const updateUserRole = httpsCallable<{ targetUid: string; newRole: string }, { success: boolean; message: string }>(
      functions,
      "updateUserRole"
    );
    const result = await updateUserRole({ targetUid, newRole });
    return result.data;
  },

  async createUser(data: { email: string; password?: string; name: string; role: string }): Promise<{ success: boolean; uid: string }> {
    const createUserFn = httpsCallable<{ email: string; password?: string; name: string; role: string }, { success: boolean; uid: string }>(
      functions,
      "createUser"
    );
    const result = await createUserFn(data);
    return result.data;
  },

  async fetchUserExams(userId: string): Promise<import("@/types/user").UserExam[]> {
    const userExamsRef = collection(db, USERS_COLLECTION, userId, "exams");
    const q = query(userExamsRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as import("@/types/user").UserExam));
  },

  async getUserById(uid: string): Promise<UserProfile> {
    const docRef = doc(db, USERS_COLLECTION, uid);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      throw new Error("User tidak ditemukan");
    }
    return { uid: docSnap.id, ...docSnap.data() } as UserProfile;
  },
};
