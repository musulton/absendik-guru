import type { TranslationKey } from "@/lib/i18n/translations";

export type OnboardingStepDef = {
  id: string;
  titleKey: TranslationKey;
  bodyKey: TranslationKey;
  bulletKeys?: TranslationKey[];
  showQuota?: boolean;
  interactive?: "modules";
  /** Lewati langkah interaktif saat ulangi panduan dari Pengaturan. */
  skipOnReplay?: boolean;
};

export const ONBOARDING_STEP_DEFS: OnboardingStepDef[] = [
  {
    id: "welcome",
    titleKey: "onboarding.welcome.title",
    bodyKey: "onboarding.welcome.body",
  },
  {
    id: "school",
    titleKey: "onboarding.school.title",
    bodyKey: "onboarding.school.body",
    bulletKeys: ["onboarding.school.bullet1", "onboarding.school.bullet2"],
  },
  {
    id: "class",
    titleKey: "onboarding.class.title",
    bodyKey: "onboarding.class.body",
    bulletKeys: [
      "onboarding.class.bullet1",
      "onboarding.class.bullet2",
      "onboarding.class.bullet3",
    ],
  },
  {
    id: "modules",
    titleKey: "onboarding.modules.title",
    bodyKey: "onboarding.modules.body",
    interactive: "modules",
    skipOnReplay: true,
  },
  {
    id: "session",
    titleKey: "onboarding.session.title",
    bodyKey: "onboarding.session.body",
    bulletKeys: [
      "onboarding.session.bullet1",
      "onboarding.session.bullet2",
      "onboarding.session.bullet3",
    ],
  },
  {
    id: "attendance",
    titleKey: "onboarding.attendance.title",
    bodyKey: "onboarding.attendance.body",
    bulletKeys: [
      "onboarding.attendance.bullet1",
      "onboarding.attendance.bullet2",
      "onboarding.attendance.bullet3",
    ],
  },
  {
    id: "more",
    titleKey: "onboarding.more.title",
    bodyKey: "onboarding.more.body",
    bulletKeys: [
      "onboarding.more.bullet1",
      "onboarding.more.bullet2",
      "onboarding.more.bullet3",
      "onboarding.more.bullet4",
    ],
  },
  {
    id: "start",
    titleKey: "onboarding.startStep.title",
    bodyKey: "onboarding.startStep.body",
    bulletKeys: ["onboarding.startStep.bullet1"],
  },
];
