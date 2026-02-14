import { db } from "@/lib/firebase";
import { collection, query, where, limit, getDocs, orderBy, startAfter, doc, getDoc, updateDoc, addDoc, setDoc, deleteDoc, type DocumentData, type QueryDocumentSnapshot } from "firebase/firestore";
import type { School, Province, Regency, District } from "@/types/school";

export const SchoolService = {
  async getSchools(filters?: {
    provinceId?: number;
    regencyId?: number;
    districtId?: number;
    search?: string;
    lastVisible?: QueryDocumentSnapshot<DocumentData>;
    limitCount?: number;
  }): Promise<{ schools: School[]; lastVisible: QueryDocumentSnapshot<DocumentData> | undefined }> {
    const schoolsRef = collection(db, "schools");
    const pageSize = filters?.limitCount || 20;

    let q = query(schoolsRef, orderBy("name"), limit(pageSize));

    if (filters?.provinceId && filters.provinceId !== 0) {
      q = query(q, where("provinceId", "==", filters.provinceId));
    }
    if (filters?.regencyId && filters.regencyId !== 0) {
      q = query(q, where("regencyId", "==", filters.regencyId));
    }
    if (filters?.districtId && filters.districtId !== 0) {
      q = query(q, where("districtId", "==", filters.districtId));
    }

    if (filters?.lastVisible) {
      q = query(q, startAfter(filters.lastVisible));
    }

    const snapshot = await getDocs(q);
    const schools = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as School));
    const lastVisible = snapshot.docs[snapshot.docs.length - 1];

    return { schools, lastVisible };
  },

  async getAllSchools(filters: {
    provinceId?: number;
    regencyId?: number;
    districtId?: number;
  }): Promise<School[]> {
    const schoolsRef = collection(db, "schools");
    let q = query(schoolsRef, orderBy("name"));

    if (filters.provinceId && filters.provinceId !== 0) {
      q = query(q, where("provinceId", "==", filters.provinceId));
    }
    if (filters.regencyId && filters.regencyId !== 0) {
      q = query(q, where("regencyId", "==", filters.regencyId));
    }
    if (filters.districtId && filters.districtId !== 0) {
      q = query(q, where("districtId", "==", filters.districtId));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as School));
  },

  async getSchoolById(id: string): Promise<School> {
    const docRef = doc(db, "schools", id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      throw new Error("School not found");
    }
    return { id: docSnap.id, ...docSnap.data() } as School;
  },

  async createSchool(data: Omit<School, "id">, customId?: string): Promise<string> {
    if (customId) {
      const docRef = doc(db, "schools", customId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        throw new Error("ID Sekolah sudah digunakan");
      }
      await setDoc(docRef, data);
      return customId;
    }

    const schoolsRef = collection(db, "schools");
    const docRef = await addDoc(schoolsRef, data);
    return docRef.id;
  },

  async updateSchool(id: string, data: Partial<School>): Promise<void> {
    const docRef = doc(db, "schools", id);
    await updateDoc(docRef, data);
  },

  async deleteSchool(id: string): Promise<void> {
    const docRef = doc(db, "schools", id);
    await deleteDoc(docRef);
  },

  async getProvinces(): Promise<Province[]> {
    const provincesRef = collection(db, "provinces");
    const snapshot = await getDocs(query(provincesRef, orderBy("name")));
    return snapshot.docs.map(doc => ({ ...doc.data() } as Province));
  },

  async getRegencies(provinceId: number): Promise<Regency[]> {
    const regenciesRef = collection(db, "regencies");
    const q = query(regenciesRef, where("provinceId", "==", provinceId), orderBy("name"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...doc.data() } as Regency));
  },

  async getDistricts(regencyId: number): Promise<District[]> {
    const districtsRef = collection(db, "districts");
    const q = query(districtsRef, where("regencyId", "==", regencyId), orderBy("name"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...doc.data() } as District));
  }
};
