import {
  collection,
  query,
  where,
  limit,
  startAfter,
  getDocs,
  getDoc,
  doc,
  deleteDoc,
  updateDoc,
  type DocumentData,
  type QueryDocumentSnapshot,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { UserProfile } from "@/types/user";

const USERS_COLLECTION = "users";

export interface FetchUsersParams {
  limitCount: number;
  lastVisible: QueryDocumentSnapshot<DocumentData> | null;
  searchQuery?: string;
  role?: string;
}

export interface FetchUsersResult {
  users: UserProfile[];
  lastVisible: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
}

export const UserService = {
  async fetchUsers({ limitCount, lastVisible, searchQuery, role }: FetchUsersParams): Promise<FetchUsersResult> {
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
          return {
            users: [{ uid: docSnap.id, ...userData } as UserProfile],
            lastVisible: null,
            hasMore: false,
          };
        }
      }

      // Search by email prefix
      // Note: Adding a role filter here would requires a composite index (email, role)
      const constraints = [
        where("email", ">=", searchQuery),
        where("email", "<=", searchQuery + "\uf8ff"),
        orderBy("email"),
        limit(limitCount)
      ];

      if (role && role !== "all") {
        constraints.unshift(where("role", "==", role));
      }

      q = query(usersRef, ...constraints);
    } else {
      const queryConstraints = [];
      if (role && role !== "all") {
        queryConstraints.push(where("role", "==", role));
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

  async deleteUser(uid: string): Promise<void> {
    const userRef = doc(db, USERS_COLLECTION, uid);
    await deleteDoc(userRef);
  },
};
