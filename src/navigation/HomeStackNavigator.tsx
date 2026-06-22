import { useMemo } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAppPreferences } from "@/context/AppPreferencesContext";
import { useWorkspace } from "@/context/WorkspaceContext";
import { useWorkspaceModules } from "@/context/WorkspaceModulesContext";
import { getStackScreenOptions } from "@/navigation/stackOptions";
import { withHeaderBackButton } from "@/navigation/headerOptions";
import { goToManageTab } from "@/navigation/navHelpers";
import {
  navigateHomeClassModule,
  openHomeClassFromList,
} from "@/navigation/homeClassFlow";
import type { HomeModule, HomeStackParamList } from "@/navigation/types";
import { ClassesListScreen } from "@/screens/ClassesListScreen";
import { ClassModuleHubScreen } from "@/screens/ClassModuleHubScreen";
import { SubjectListScreen } from "@/screens/SubjectListScreen";
import { AttendanceScreen } from "@/screens/AttendanceScreen";
import { StudentAttendanceDetailScreen } from "@/screens/StudentAttendanceDetailScreen";
import { ClassRecapScreen } from "@/screens/ClassRecapScreen";
import { ClassGradeRecapScreen } from "@/screens/ClassGradeRecapScreen";
import { GradeEntryScreen } from "@/screens/GradeEntryScreen";
import { StudentGradeDetailScreen } from "@/screens/StudentGradeDetailScreen";
import { useParsedAssignments } from "@/navigation/useParsedAssignments";
import { ManageStackNavigator } from "@/navigation/ManageStackNavigator";
import { SettingsStackNavigator } from "@/navigation/SettingsStackNavigator";
import { CreateStudentScreen } from "@/screens/CreateStudentScreen";

const Stack = createNativeStackNavigator<HomeStackParamList>();

export function HomeStackNavigator() {
  const { colors, t, isDark, fontSize } = useAppPreferences();
  const { workspace, isSchoolWorkspace } = useWorkspace();
  const { modules } = useWorkspaceModules();
  const stackOptions = useMemo(
    () => getStackScreenOptions(colors, fontSize),
    [colors, isDark, fontSize],
  );

  return (
    <Stack.Navigator
      screenOptions={({ navigation, route }) => {
        if (route.name === "HomeHub") return stackOptions;
        if (route.name === "Manage" || route.name === "Settings") {
          return { ...stackOptions, headerShown: false };
        }
        return withHeaderBackButton(stackOptions, navigation, t, "stack");
      }}
    >
      <Stack.Screen
        name="HomeHub"
        options={{ title: workspace.name || t("nav.tabHome") }}
      >
        {({ navigation }) => (
          <ClassesListScreen
            workspace={workspace}
            purpose="home"
            onOpenClass={(guruClass) =>
              openHomeClassFromList(
                navigation,
                workspace,
                modules,
                guruClass,
                {
                  t,
                  isSchoolWorkspace,
                  onAddStudent: () =>
                    navigation.navigate("CreateStudent", {
                      classId: guruClass.id,
                      className: guruClass.name,
                    }),
                },
              )
            }
            onOpenManage={() =>
              navigation.navigate("Manage", { screen: "ManageHub" })
            }
            onOpenSettings={() =>
              navigation.navigate("Settings", { screen: "Settings" })
            }
          />
        )}
      </Stack.Screen>

      <Stack.Screen
        name="ClassModuleHub"
        options={({ route }) => ({ title: route.params.className })}
      >
        {({ navigation, route }) => (
          <ClassModuleHubScreen
            className={route.params.className}
            labelColor={route.params.labelColor}
            activeStudentCount={route.params.activeStudentCount}
            onOpenModule={(module: HomeModule) =>
              navigateHomeClassModule(navigation, workspace, route.params, module)
            }
            onAddStudent={() =>
              navigation.navigate("CreateStudent", {
                classId: route.params.classId,
                className: route.params.className,
              })
            }
          />
        )}
      </Stack.Screen>

      <Stack.Screen
        name="SubjectList"
        options={({ route }) => ({ title: route.params.className })}
      >
        {({ navigation, route }) => (
          <SubjectListScreen
            purpose="home"
            module={route.params.module}
            classId={route.params.classId}
            className={route.params.className}
            labelColor={route.params.labelColor}
            onAttendance={(subjectName) =>
              navigation.navigate("Attendance", {
                classId: route.params.classId,
                className: route.params.className,
                subjectName,
              })
            }
            onAddSubject={() =>
              goToManageTab(navigation, "CreateSubject", {
                classId: route.params.classId,
                className: route.params.className,
              })
            }
            onEditSubject={(assignment) =>
              goToManageTab(navigation, "EditSubject", {
                classId: route.params.classId,
                className: route.params.className,
                assignmentId: assignment.id,
                subjectName: assignment.subjectName!,
                labelColor: assignment.labelColor,
                classLabelColor: route.params.labelColor,
              })
            }
            onStudents={() =>
              goToManageTab(navigation, "ClassStudents", {
                classId: route.params.classId,
                className: route.params.className,
              })
            }
            onRecap={(assignments) =>
              navigation.navigate("ClassRecap", {
                classId: route.params.classId,
                className: route.params.className,
                assignmentsJson: JSON.stringify(assignments),
              })
            }
            onGrades={(subjectName) =>
              navigation.navigate("GradeEntry", {
                classId: route.params.classId,
                className: route.params.className,
                subjectName,
              })
            }
            onGradeRecap={(assignments) =>
              navigation.navigate("ClassGradeRecap", {
                classId: route.params.classId,
                className: route.params.className,
                assignmentsJson: JSON.stringify(assignments),
              })
            }
            onEditClass={() =>
              goToManageTab(navigation, "EditClass", {
                classId: route.params.classId,
                className: route.params.className,
              })
            }
            onAddStudent={() =>
              navigation.navigate("CreateStudent", {
                classId: route.params.classId,
                className: route.params.className,
              })
            }
          />
        )}
      </Stack.Screen>

      <Stack.Screen
        name="Attendance"
        options={({ route }) => ({
          title: route.params.subjectName
            ? `${t("nav.attendance")} — ${route.params.subjectName}`
            : t("nav.attendanceToday"),
        })}
      >
        {({ navigation, route }) => (
          <AttendanceScreen
            workspaceId={workspace.id}
            classId={route.params.classId}
            className={route.params.className}
            subjectName={route.params.subjectName}
            onAddStudent={() =>
              navigation.navigate("CreateStudent", {
                classId: route.params.classId,
                className: route.params.className,
              })
            }
            onStudentDetail={(student) =>
              navigation.navigate("StudentAttendanceDetail", {
                classId: route.params.classId,
                className: route.params.className,
                studentId: student.studentId,
                fullName: student.fullName,
                studentNumber: student.studentNumber ?? "",
                subjectName: route.params.subjectName,
              })
            }
            onStudents={() =>
              goToManageTab(navigation, "ClassStudents", {
                classId: route.params.classId,
                className: route.params.className,
              })
            }
            onRecap={(assignments) =>
              navigation.navigate("ClassRecap", {
                classId: route.params.classId,
                className: route.params.className,
                assignmentsJson: JSON.stringify(assignments),
              })
            }
            onGrades={() =>
              navigation.navigate("GradeEntry", {
                classId: route.params.classId,
                className: route.params.className,
              })
            }
            onGradeRecap={(assignments) =>
              navigation.navigate("ClassGradeRecap", {
                classId: route.params.classId,
                className: route.params.className,
                assignmentsJson: JSON.stringify(assignments),
              })
            }
            onEditClass={() =>
              goToManageTab(navigation, "EditClass", {
                classId: route.params.classId,
                className: route.params.className,
              })
            }
          />
        )}
      </Stack.Screen>

      <Stack.Screen
        name="StudentAttendanceDetail"
        options={({ route }) => ({ title: route.params.fullName })}
      >
        {({ route }) => (
          <StudentAttendanceDetailScreen
            workspaceId={workspace.id}
            classId={route.params.classId}
            className={route.params.className}
            studentId={route.params.studentId}
            fullName={route.params.fullName}
            studentNumber={route.params.studentNumber}
            subjectName={route.params.subjectName}
          />
        )}
      </Stack.Screen>

      <Stack.Screen
        name="CreateStudent"
        options={{ title: t("subjects.addStudent") }}
      >
        {({ navigation, route }) => (
          <CreateStudentScreen
            workspaceId={workspace.id}
            classId={route.params.classId}
            className={route.params.className}
            onCreated={() => navigation.goBack()}
            onCancel={() => navigation.goBack()}
          />
        )}
      </Stack.Screen>

      <Stack.Screen
        name="ClassRecap"
        options={({ route }) => ({
          title: `${t("nav.recap")} — ${route.params.className}`,
        })}
      >
        {({ navigation, route }) => (
          <ClassRecapRoute
            workspace={workspace}
            classId={route.params.classId}
            className={route.params.className}
            assignmentsJson={route.params.assignmentsJson}
            onStudentDetail={(student, subjectName) =>
              navigation.navigate("StudentAttendanceDetail", {
                classId: route.params.classId,
                className: route.params.className,
                studentId: student.studentId,
                fullName: student.fullName,
                studentNumber: student.studentNumber ?? "",
                subjectName,
              })
            }
          />
        )}
      </Stack.Screen>

      <Stack.Screen
        name="GradeEntry"
        options={({ route }) => ({
          title: route.params.subjectName
            ? `${t("nav.grades")} — ${route.params.subjectName}`
            : t("nav.grades"),
        })}
      >
        {({ navigation, route }) => (
          <GradeEntryScreen
            workspaceId={workspace.id}
            classId={route.params.classId}
            className={route.params.className}
            subjectName={route.params.subjectName}
            onStudents={() =>
              goToManageTab(navigation, "ClassStudents", {
                classId: route.params.classId,
                className: route.params.className,
              })
            }
            onGradeRecap={(assignments) =>
              navigation.navigate("ClassGradeRecap", {
                classId: route.params.classId,
                className: route.params.className,
                assignmentsJson: JSON.stringify(assignments),
              })
            }
            onEditClass={() =>
              goToManageTab(navigation, "EditClass", {
                classId: route.params.classId,
                className: route.params.className,
              })
            }
            onStudentDetail={(student) =>
              navigation.navigate("StudentGradeDetail", {
                classId: route.params.classId,
                className: route.params.className,
                studentId: student.studentId,
                fullName: student.fullName,
                studentNumber: student.studentNumber ?? "",
                subjectName: route.params.subjectName,
              })
            }
          />
        )}
      </Stack.Screen>

      <Stack.Screen
        name="ClassGradeRecap"
        options={({ route }) => ({
          title: `${t("nav.gradeRecap")} — ${route.params.className}`,
        })}
      >
        {({ navigation, route }) => (
          <ClassGradeRecapRoute
            workspace={workspace}
            classId={route.params.classId}
            className={route.params.className}
            assignmentsJson={route.params.assignmentsJson}
            onStudentDetail={(student, subjectName) =>
              navigation.navigate("StudentGradeDetail", {
                classId: route.params.classId,
                className: route.params.className,
                studentId: student.studentId,
                fullName: student.fullName,
                studentNumber: student.studentNumber ?? "",
                subjectName,
              })
            }
          />
        )}
      </Stack.Screen>

      <Stack.Screen
        name="StudentGradeDetail"
        options={({ route }) => ({ title: route.params.fullName })}
      >
        {({ route }) => (
          <StudentGradeDetailScreen
            workspaceId={workspace.id}
            classId={route.params.classId}
            className={route.params.className}
            studentId={route.params.studentId}
            fullName={route.params.fullName}
            studentNumber={route.params.studentNumber}
            subjectName={route.params.subjectName}
          />
        )}
      </Stack.Screen>

      <Stack.Screen
        name="Manage"
        component={ManageStackNavigator}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="Settings"
        component={SettingsStackNavigator}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

function ClassRecapRoute({
  workspace,
  classId,
  className,
  assignmentsJson,
  onStudentDetail,
}: {
  workspace: import("@/lib/types").GuruWorkspace;
  classId: string;
  className: string;
  assignmentsJson: string;
  onStudentDetail: (
    student: {
      studentId: string;
      fullName: string;
      studentNumber: string | null;
    },
    subjectName?: string | null,
  ) => void;
}) {
  const assignments = useParsedAssignments(assignmentsJson);
  return (
    <ClassRecapScreen
      workspaceId={workspace.id}
      classId={classId}
      className={className}
      attendanceMode={workspace.attendanceMode}
      assignments={assignments}
      onStudentDetail={onStudentDetail}
    />
  );
}

function ClassGradeRecapRoute({
  workspace,
  classId,
  className,
  assignmentsJson,
  onStudentDetail,
}: {
  workspace: import("@/lib/types").GuruWorkspace;
  classId: string;
  className: string;
  assignmentsJson: string;
  onStudentDetail: (
    student: {
      studentId: string;
      fullName: string;
      studentNumber: string | null;
    },
    subjectName?: string | null,
  ) => void;
}) {
  const assignments = useParsedAssignments(assignmentsJson);
  return (
    <ClassGradeRecapScreen
      workspaceId={workspace.id}
      classId={classId}
      className={className}
      attendanceMode={workspace.attendanceMode}
      assignments={assignments}
      onStudentDetail={onStudentDetail}
    />
  );
}
