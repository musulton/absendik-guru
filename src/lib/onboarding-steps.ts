import type { TranslationKey } from "@/lib/i18n/translations";

export type OnboardingStepDef = {
  id: string;
  titleKey: TranslationKey;
  bodyKey: TranslationKey;
  bulletKeys?: TranslationKey[];
  showQuota?: boolean;
};

export const ONBOARDING_STEP_DEFS: OnboardingStepDef[] = [
  {
    id: "welcome",
    titleKey: "onboarding.welcome.title",
    bodyKey: "onboarding.welcome.body",
  },
  {
    id: "storage",
    titleKey: "onboarding.storage.title",
    bodyKey: "onboarding.storage.body",
    bulletKeys: ["onboarding.storage.bullet1", "onboarding.storage.bullet2"],
    showQuota: true,
  },
  {
    id: "school",
    titleKey: "onboarding.school.title",
    bodyKey: "onboarding.school.body",
    bulletKeys: ["onboarding.school.bullet1", "onboarding.school.bullet2"],
  },
  {
    id: "schoolLink",
    titleKey: "onboarding.schoolLink.title",
    bodyKey: "onboarding.schoolLink.body",
    bulletKeys: [
      "onboarding.schoolLink.bullet1",
      "onboarding.schoolLink.bullet2",
      "onboarding.schoolLink.bullet3",
    ],
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
    id: "grades",
    titleKey: "onboarding.grades.title",
    bodyKey: "onboarding.grades.body",
    bulletKeys: [
      "onboarding.grades.bullet1",
      "onboarding.grades.bullet2",
      "onboarding.grades.bullet3",
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
