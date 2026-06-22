import {
  Alert,
  PermissionsAndroid,
  Platform,
} from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { getAppLocale, translate, type Locale } from "@/lib/i18n/translations";

const BASE64_CHUNK = 0x8000;

/** Konversi ArrayBuffer → base64 tanpa stack overflow (file Excel bisa besar). */
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const parts: string[] = [];
  for (let i = 0; i < bytes.length; i += BASE64_CHUNK) {
    const slice = bytes.subarray(i, i + BASE64_CHUNK);
    let chunk = "";
    for (let j = 0; j < slice.length; j++) {
      chunk += String.fromCharCode(slice[j]!);
    }
    parts.push(chunk);
  }
  return btoa(parts.join(""));
}

function confirmExportAccess(locale: Locale): Promise<boolean> {
  return new Promise((resolve) => {
    Alert.alert(
      translate(locale, "export.confirmTitle"),
      translate(
        locale,
        Platform.OS === "android"
          ? "export.confirmMessageAndroid"
          : "export.confirmMessage",
      ),
      [
        {
          text: translate(locale, "common.cancel"),
          style: "cancel",
          onPress: () => resolve(false),
        },
        {
          text: translate(locale, "export.confirmContinue"),
          onPress: () => resolve(true),
        },
      ],
      { cancelable: true, onDismiss: () => resolve(false) },
    );
  });
}

async function ensureAndroidStorageAccess(locale: Locale): Promise<boolean> {
  if (Platform.OS !== "android") return true;
  if (typeof Platform.Version === "number" && Platform.Version >= 29) {
    return true;
  }

  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      {
        title: translate(locale, "export.storagePermissionTitle"),
        message: translate(locale, "export.storagePermissionMessage"),
        buttonPositive: translate(locale, "export.confirmContinue"),
        buttonNegative: translate(locale, "common.cancel"),
      },
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) return true;
    Alert.alert(
      translate(locale, "export.confirmTitle"),
      translate(locale, "export.storagePermissionDenied"),
    );
    return false;
  } catch {
    return false;
  }
}

export async function shareXlsxFile(
  buffer: ArrayBuffer,
  filename: string,
  dialogTitle?: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const locale = await getAppLocale();
  const title = dialogTitle ?? translate(locale, "export.shareRecap");

  const confirmed = await confirmExportAccess(locale);
  if (!confirmed) {
    return { ok: false, message: translate(locale, "export.exportCancelled") };
  }

  const storageOk = await ensureAndroidStorageAccess(locale);
  if (!storageOk) {
    return {
      ok: false,
      message: translate(locale, "export.storagePermissionDenied"),
    };
  }

  try {
    const destDir = `${FileSystem.cacheDirectory ?? ""}rekap/`;
    await FileSystem.makeDirectoryAsync(destDir, { intermediates: true }).catch(
      () => {},
    );
    const path = `${destDir}${filename}`;
    await FileSystem.writeAsStringAsync(path, arrayBufferToBase64(buffer), {
      encoding: FileSystem.EncodingType.Base64,
    });

    const canShare = await Sharing.isAvailableAsync();
    if (!canShare) {
      return {
        ok: false,
        message: translate(locale, "export.shareUnsupported"),
      };
    }

    await Sharing.shareAsync(path, {
      mimeType:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      dialogTitle: title,
      UTI: "com.microsoft.excel.xlsx",
    });

    return { ok: true };
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : translate(locale, "export.createFileFailed");
    return { ok: false, message };
  }
}

export function sanitizeXlsxFilename(str: string): string {
  return str
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}
