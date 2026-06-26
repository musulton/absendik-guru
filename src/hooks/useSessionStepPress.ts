import { useCallback } from "react";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  navigateSessionStep,
  type SessionStepParams,
} from "@/navigation/sessionStepNav";
import type { HomeModule, HomeStackParamList } from "@/navigation/types";

export function useSessionStepPress(params: SessionStepParams) {
  const navigation =
    useNavigation<NativeStackNavigationProp<HomeStackParamList>>();

  return useCallback(
    (module: HomeModule) => {
      navigateSessionStep(navigation, module, params);
    },
    [
      navigation,
      params.classId,
      params.className,
      params.labelColor,
      params.subjectName,
      params.sessionDate,
      params.sessionFlow,
    ],
  );
}
