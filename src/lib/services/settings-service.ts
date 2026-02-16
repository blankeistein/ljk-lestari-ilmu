import { functions } from "@/lib/firebase";
import { httpsCallable } from "firebase/functions";

export interface AppSettings {
  privacy_policy_url: string;
  help_url: string;
}

export const SettingsService = {
  async getAppSettings(): Promise<AppSettings> {
    const getFn = httpsCallable<unknown, AppSettings>(
      functions,
      "getAppSettings"
    );
    const result = await getFn();
    return result.data;
  },

  async updateAppSettings(settings: AppSettings): Promise<{ success: boolean }> {
    const updateFn = httpsCallable<AppSettings, { success: boolean }>(
      functions,
      "updateAppSettings"
    );
    const result = await updateFn(settings);
    return result.data;
  },
};
