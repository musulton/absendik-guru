import type { Purchase, ProductSubscriptionAndroid } from "react-native-iap";
import { GURU_PRO_ANDROID_PRODUCT_ID } from "@/lib/iap/config";
import {
  disableAndroidIapModule,
  getIapModule,
  isAndroidIapSupported,
} from "@/lib/iap/native-module";
import { apiVerifyAndroidPurchase } from "@/lib/api";
import {
  getAppLocale,
  translate,
  type TranslationKey,
} from "@/lib/i18n/translations";

async function iapText(key: TranslationKey): Promise<string> {
  return translate(await getAppLocale(), key);
}

export type ProProductInfo = {
  productId: string;
  title: string;
  description: string;
  price: string;
};

export type AndroidProPurchaseResult =
  | { ok: true }
  | { ok: false; code: string; message: string };

let connectionReady = false;
let connecting: Promise<boolean> | null = null;
let listenersAttached = false;
let pendingPurchase:
  | {
      resolve: (result: AndroidProPurchaseResult) => void;
    }
  | null = null;

function productPrice(product: ProductSubscriptionAndroid): string {
  if ("displayPrice" in product && typeof product.displayPrice === "string") {
    return product.displayPrice;
  }
  if ("localizedPrice" in product && typeof product.localizedPrice === "string") {
    return product.localizedPrice;
  }
  return "";
}

function pickOfferToken(product: ProductSubscriptionAndroid): string | null {
  const offers = product.subscriptionOfferDetailsAndroid;
  if (offers?.length) return offers[0]?.offerToken ?? null;
  const cross = product.subscriptionOffers;
  if (cross?.length) return cross[0]?.offerTokenAndroid ?? null;
  return null;
}

async function ensureConnection(): Promise<boolean> {
  const m = getIapModule();
  if (!m || !isAndroidIapSupported()) return false;
  if (connectionReady) return true;
  if (connecting) return connecting;

  connecting = (async () => {
    try {
      await m.initConnection();
      attachPurchaseListeners(m);
      connectionReady = true;
      return true;
    } catch (error) {
      disableAndroidIapModule(error);
      connectionReady = false;
      return false;
    } finally {
      connecting = null;
    }
  })();

  return connecting;
}

function attachPurchaseListeners(m: NonNullable<ReturnType<typeof getIapModule>>): void {
  if (listenersAttached) return;
  listenersAttached = true;

  m.purchaseUpdatedListener((purchase) => {
    void handlePurchaseUpdate(m, purchase);
  });

  m.purchaseErrorListener((error) => {
    if (!pendingPurchase) return;
    const current = pendingPurchase;
    pendingPurchase = null;
    void (async () => {
      if (error.code === "user-cancelled") {
        current.resolve({
          ok: false,
          code: "cancelled",
          message: await iapText("iap.cancelled"),
        });
        return;
      }
      current.resolve({
        ok: false,
        code: error.code ?? "purchase_error",
        message: error.message || (await iapText("iap.purchaseFailed")),
      });
    })();
  });
}

async function handlePurchaseUpdate(
  m: NonNullable<ReturnType<typeof getIapModule>>,
  purchase: Purchase,
): Promise<void> {
  const token = purchase.purchaseToken?.trim();
  if (!token) {
    pendingPurchase?.resolve({
      ok: false,
      code: "missing_token",
      message: await iapText("iap.tokenMissing"),
    });
    pendingPurchase = null;
    return;
  }

  const verify = await apiVerifyAndroidPurchase({
    purchaseToken: token,
    productId: purchase.productId,
  });

  if (!verify.ok) {
    pendingPurchase?.resolve({
      ok: false,
      code: verify.error.code,
      message: verify.error.message,
    });
    pendingPurchase = null;
    return;
  }

  try {
    await m.finishTransaction({ purchase, isConsumable: false });
  } catch {
    // Server sudah acknowledge; abaikan error finish lokal.
  }

  pendingPurchase?.resolve({ ok: true });
  pendingPurchase = null;
}

export async function fetchAndroidProProduct(): Promise<ProProductInfo | null> {
  const m = getIapModule();
  if (!m || !(await ensureConnection())) return null;

  try {
    const products = await m.fetchProducts({
      skus: [GURU_PRO_ANDROID_PRODUCT_ID],
      type: "subs",
    });
    const product = products?.[0] as ProductSubscriptionAndroid | undefined;
    if (!product) return null;
    return {
      productId: product.id,
      title: product.title,
      description: product.description,
      price: productPrice(product),
    };
  } catch {
    return null;
  }
}

export async function purchaseAndroidPro(): Promise<AndroidProPurchaseResult> {
  const m = getIapModule();
  if (!m || !(await ensureConnection())) {
    return {
      ok: false,
      code: "unavailable",
      message: await iapText("settings.iapUnavailable"),
    };
  }

  if (pendingPurchase) {
    return {
      ok: false,
      code: "in_progress",
      message: await iapText("iap.purchaseInProgress"),
    };
  }

  let offerToken: string | null = null;
  try {
    const products = await m.fetchProducts({
      skus: [GURU_PRO_ANDROID_PRODUCT_ID],
      type: "subs",
    });
    if (products?.[0]) {
      offerToken = pickOfferToken(products[0] as ProductSubscriptionAndroid);
    }
  } catch {
    // Lanjut tanpa offer token (legacy SKU).
  }

  return new Promise<AndroidProPurchaseResult>((resolve) => {
    pendingPurchase = { resolve };

    void m
      .requestPurchase({
        type: "subs",
        request: {
          google: {
            skus: [GURU_PRO_ANDROID_PRODUCT_ID],
            ...(offerToken
              ? {
                  subscriptionOffers: [
                    {
                      sku: GURU_PRO_ANDROID_PRODUCT_ID,
                      offerToken,
                    },
                  ],
                }
              : {}),
          },
        },
      })
      .catch(async (error: unknown) => {
        pendingPurchase = null;
        const message =
          error instanceof Error
            ? error.message
            : await iapText("iap.openPlayFailed");
        resolve({ ok: false, code: "purchase_error", message });
      });
  });
}

export async function restoreAndroidProPurchases(): Promise<AndroidProPurchaseResult> {
  const m = getIapModule();
  if (!m || !(await ensureConnection())) {
    return {
      ok: false,
      code: "unavailable",
      message: await iapText("settings.iapUnavailable"),
    };
  }

  try {
    const purchases = await m.getAvailablePurchases({
      onlyIncludeActiveItemsIOS: true,
    });

    const candidate = purchases.find(
      (p) => p.productId === GURU_PRO_ANDROID_PRODUCT_ID && p.purchaseToken,
    );

    if (!candidate?.purchaseToken) {
      return {
        ok: false,
        code: "not_found",
        message: await iapText("iap.noActiveSubscription"),
      };
    }

    const verify = await apiVerifyAndroidPurchase({
      purchaseToken: candidate.purchaseToken,
      productId: candidate.productId,
    });

    if (!verify.ok) {
      return {
        ok: false,
        code: verify.error.code,
        message: verify.error.message,
      };
    }

    try {
      await m.finishTransaction({ purchase: candidate, isConsumable: false });
    } catch {
      // ignore
    }

    return { ok: true };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : await iapText("iap.restoreFailed");
    return { ok: false, code: "restore_error", message };
  }
}
