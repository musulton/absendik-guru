import { useCallback, useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/context/AppPreferencesContext";
import { useListMutations } from "@/hooks/useListMutations";
import { useRefreshOnFocus } from "@/hooks/useRefreshOnFocus";
import { getGuruLimitsForMode, isQuotaUnlimited } from "@/lib/guru-limits";
import { getAppLocale, translate } from "@/lib/i18n/translations";
import { localGetUsage } from "@/lib/local-store";
import { isCloudSubscriptionActive } from "@/lib/storage-mode";
import { radius, space } from "@/lib/theme";

type Props = {
  onQuotaFull?: () => void;
};

export function StudentQuotaBanner({ onQuotaFull }: Props) {
  const { colors, font, t } = useTheme();
  const [text, setText] = useState("");
  const [isFull, setIsFull] = useState(false);
  const [isPro, setIsPro] = useState(false);

  const loadQuota = useCallback(async () => {
    const [usage, subscribed] = await Promise.all([
      localGetUsage(),
      isCloudSubscriptionActive(),
    ]);
    const limits = getGuruLimitsForMode(subscribed ? "cloud" : "local");
    setIsPro(subscribed);

    if (isQuotaUnlimited(limits.maxActiveStudents)) {
      setText(t("student.quotaPro", { count: usage.activeStudentCount }));
      setIsFull(false);
      return;
    }

    const full = usage.activeStudentCount >= limits.maxActiveStudents;
    setIsFull(full);
    setText(
      t("student.quotaUsage", {
        used: usage.activeStudentCount,
        max: limits.maxActiveStudents,
      }),
    );
    if (full) onQuotaFull?.();
  }, [t, onQuotaFull]);

  useEffect(() => {
    void loadQuota();
  }, [loadQuota]);

  useRefreshOnFocus(() => {
    void loadQuota();
  }, { staleMs: 0 });

  useListMutations((event) => {
    switch (event.type) {
      case "student-created":
      case "student-deleted":
      case "class-deleted":
        void loadQuota();
        break;
      default:
        break;
    }
  });

  if (!text) return null;

  return (
    <View
      style={[
        styles.box,
        {
          backgroundColor: isFull ? colors.dangerBg : colors.primaryMuted,
          borderColor: isFull ? colors.danger : colors.primaryBorder,
        },
      ]}
    >
      <Text
        style={[
          font.label,
          { color: isFull ? colors.danger : colors.primary, marginBottom: 4 },
        ]}
      >
        {t("student.quotaTitle")}
      </Text>
      <Text
        style={[
          font.caption,
          {
            color: isFull ? colors.danger : colors.text,
            fontWeight: "600",
            lineHeight: 18,
          },
        ]}
      >
        {text}
      </Text>
      {isFull && !isPro ? (
        <Text style={[font.caption, { color: colors.danger, marginTop: 4 }]}>
          {t("student.quotaLimit")}
        </Text>
      ) : null}
    </View>
  );
}

export async function checkStudentQuotaAvailable(): Promise<
  { ok: true } | { ok: false; message: string }
> {
  const [usage, subscribed] = await Promise.all([
    localGetUsage(),
    isCloudSubscriptionActive(),
  ]);
  const limits = getGuruLimitsForMode(subscribed ? "cloud" : "local");
  if (
    !isQuotaUnlimited(limits.maxActiveStudents) &&
    usage.activeStudentCount >= limits.maxActiveStudents
  ) {
    const locale = await getAppLocale();
    return {
      ok: false,
      message: translate(locale, "student.quotaAtMax", {
        max: limits.maxActiveStudents,
      }),
    };
  }
  return { ok: true };
}

const styles = StyleSheet.create({
  box: {
    borderRadius: radius.md,
    padding: space.md,
    marginBottom: space.md,
    borderWidth: 1,
  },
});
