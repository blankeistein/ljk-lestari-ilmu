import { db } from "@/lib/firebase";
import { collection, doc, serverTimestamp, writeBatch } from "firebase/firestore";

export const DevService = {
  async generateMockUsers(count: number, role: string = "user"): Promise<void> {
    const roles = ["admin", "teacher", "headmaster", "user"];
    const batch = writeBatch(db);
    const usersRef = collection(db, "users");

    for (let i = 0; i < count; i++) {
      const id = doc(usersRef).id;
      const randomRole = role === "random" ? roles[Math.floor(Math.random() * roles.length)] : role;
      const firstName = ["Budi", "Siti", "Agus", "Dewi", "Eko", "Ani", "Bambang", "Rina"][Math.floor(Math.random() * 8)];
      const lastName = ["Santoso", "Wijaya", "Saputra", "Lestari", "Kusuma", "Hidayat"][Math.floor(Math.random() * 6)];
      const name = `${firstName} ${lastName}`;
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${Math.floor(Math.random() * 1000)}@example.com`;

      const userProfile: Record<string, string | ReturnType<typeof serverTimestamp>> = {
        name,
        email,
        role: randomRole,
        photoUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`,
        createdAt: serverTimestamp(),
      };

      batch.set(doc(db, "users", id), userProfile);
    }

    await batch.commit();
  }
};
