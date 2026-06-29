import { CommonActions } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { HomeModule, HomeStackParamList } from "@/navigation/types";

const SESSION_ORIGIN_SCREENS = [
  "ClassModuleHub",
  "SubjectList",
  "HomeHub",
] as const satisfies readonly (keyof HomeStackParamList)[];

type HomeNav = NativeStackNavigationProp<HomeStackParamList>;

export type SessionStepParams = {
  classId: string;
  className: string;
  labelColor?: string | null;
  subjectName?: string | null;
  sessionDate: string;
  sessionFlow?: boolean;
};

/** Gabungkan flag alur pertemuan ke params navigasi. */
export function withSessionFlow<T extends Record<string, unknown>>(
  sessionFlow: boolean | undefined,
  params: T,
): T & { sessionFlow?: boolean } {
  return sessionFlow ? { ...params, sessionFlow: true } : params;
}

/** Kembali ke hub kelas / daftar mata pelajaran / beranda — untuk tombol selesai alur pertemuan. */
function findSessionOriginIndex(
  routes: ReturnType<HomeNav["getState"]>["routes"],
  currentIndex: number,
): number {
  for (let i = currentIndex - 1; i >= 0; i--) {
    if (routes[i].name === "ClassModuleHub") return i;
  }
  for (let i = currentIndex - 1; i >= 0; i--) {
    const name = routes[i].name;
    if (
      SESSION_ORIGIN_SCREENS.includes(
        name as (typeof SESSION_ORIGIN_SCREENS)[number],
      )
    ) {
      return i;
    }
  }
  return -1;
}

function popStackToIndex(navigation: HomeNav, targetIndex: number): void {
  const state = navigation.getState();
  if (targetIndex < 0 || targetIndex >= state.routes.length) return;
  if (state.index === targetIndex) return;

  navigation.dispatch(
    CommonActions.reset({
      index: targetIndex,
      routes: state.routes.slice(0, targetIndex + 1),
    }),
  );
}

export function goBackToSessionOrigin(navigation: HomeNav): boolean {
  const state = navigation.getState();
  const targetIndex = findSessionOriginIndex(state.routes, state.index);
  if (targetIndex < 0) return false;
  popStackToIndex(navigation, targetIndex);
  return true;
}

/** Buka langkah dari daftar mata pelajaran — alur pertemuan mengganti SubjectList agar tidak tertinggal di stack. */
export function openSubjectListStep<K extends keyof HomeStackParamList>(
  navigation: HomeNav,
  screen: K,
  params: HomeStackParamList[K],
  sessionFlow?: boolean,
): void {
  if (sessionFlow) {
    navigation.replace(screen, params);
  } else {
    navigation.navigate(screen, params);
  }
}

function sessionStepTarget(
  module: HomeModule,
  params: SessionStepParams,
): {
  screen: keyof HomeStackParamList;
  screenParams: HomeStackParamList[keyof HomeStackParamList];
} {
  const base = {
    classId: params.classId,
    className: params.className,
    labelColor: params.labelColor,
  };
  const flow = params.sessionFlow ? { sessionFlow: true as const } : {};
  switch (module) {
    case "attendance":
      return {
        screen: "Attendance",
        screenParams: {
          ...base,
          subjectName: params.subjectName,
          sessionDate: params.sessionDate,
          ...flow,
        },
      };
    case "teachingJournal":
      return {
        screen: "TeachingJournal",
        screenParams: {
          ...base,
          subjectName: params.subjectName,
          sessionDate: params.sessionDate,
          ...flow,
        },
      };
    case "grades":
      return {
        screen: "GradeEntry",
        screenParams: {
          ...base,
          subjectName: params.subjectName,
          sessionDate: params.sessionDate,
          ...flow,
        },
      };
    case "studentNotes":
      return {
        screen: "ClassStudentsHome",
        screenParams: {
          ...base,
          subjectName: params.subjectName,
          sessionDate: params.sessionDate,
          ...flow,
        },
      };
  }
}

/** Pindah langkah pertemuan (progress strip, menu) — stack biasa. */
export function navigateSessionStep(
  navigation: HomeNav,
  module: HomeModule,
  params: SessionStepParams,
) {
  const { screen, screenParams } = sessionStepTarget(module, params);
  navigation.navigate(screen, screenParams as never);
}

/** Setelah simpan & lanjut modul berikutnya — ganti layar saat ini agar back tidak kembali ke form simpan. */
export function navigateSessionStepAfterSave(
  navigation: HomeNav,
  module: HomeModule,
  params: SessionStepParams,
) {
  const { screen, screenParams } = sessionStepTarget(module, params);
  if (params.sessionFlow) {
    navigation.replace(screen, screenParams as never);
  } else {
    navigation.navigate(screen, screenParams as never);
  }
}

export function navigateAfterSessionSave<K extends keyof HomeStackParamList>(
  navigation: HomeNav,
  screen: K,
  params: HomeStackParamList[K],
  sessionFlow?: boolean,
): void {
  if (sessionFlow) {
    navigation.replace(screen, params);
  } else {
    navigation.navigate(screen, params);
  }
}

export type SessionClassRoute = {
  classId: string;
  className: string;
  labelColor?: string | null;
  activeStudentCount?: number;
};

function findClassModuleHubIndex(
  routes: ReturnType<HomeNav["getState"]>["routes"],
  currentIndex: number,
): number {
  for (let i = currentIndex; i >= 0; i--) {
    if (routes[i].name === "ClassModuleHub") return i;
  }
  return -1;
}

function resetToClassModuleHub(
  navigation: HomeNav,
  classRoute: SessionClassRoute,
): void {
  const state = navigation.getState();
  const homeIndex = state.routes.findIndex((route) => route.name === "HomeHub");
  const baseIndex = homeIndex >= 0 ? homeIndex : 0;
  const routes = state.routes.slice(0, baseIndex + 1);
  routes.push({
    name: "ClassModuleHub",
    params: {
      classId: classRoute.classId,
      className: classRoute.className,
      labelColor: classRoute.labelColor,
      activeStudentCount: classRoute.activeStudentCount ?? 0,
    },
  });
  navigation.dispatch(
    CommonActions.reset({
      index: routes.length - 1,
      routes,
    }),
  );
}

/** Selesai alur pertemuan — kembali ke list modul kelas. */
export function finishSessionFlow(
  navigation: HomeNav,
  classRoute?: SessionClassRoute,
): void {
  const state = navigation.getState();
  const hubIndex = findClassModuleHubIndex(state.routes, state.index);
  if (hubIndex >= 0) {
    popStackToIndex(navigation, hubIndex);
    return;
  }

  if (classRoute) {
    resetToClassModuleHub(navigation, classRoute);
    return;
  }

  if (goBackToSessionOrigin(navigation)) return;
  if (navigation.canGoBack()) {
    navigation.popToTop();
  }
}
