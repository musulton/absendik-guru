import { useMemo } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAppPreferences } from "@/context/AppPreferencesContext";
import { useWorkspace } from "@/context/WorkspaceContext";
import { getStackScreenOptions } from "@/navigation/stackOptions";
import { stackScreenOptionsWithBack } from "@/navigation/headerOptions";
import { goToSettingsTab } from "@/navigation/navHelpers";
import type { ManageStackParamList } from "@/navigation/types";
import { ManageHubScreen } from "@/screens/ManageHubScreen";
import { ClassesListScreen } from "@/screens/ClassesListScreen";
import { CreateClassScreen } from "@/screens/CreateClassScreen";
import { EditClassScreen } from "@/screens/EditClassScreen";
import { ClassPickerScreen } from "@/screens/ClassPickerScreen";
import { SubjectListScreen } from "@/screens/SubjectListScreen";
import { CreateSubjectScreen } from "@/screens/CreateSubjectScreen";
import { EditSubjectScreen } from "@/screens/EditSubjectScreen";
import { ClassStudentsScreen } from "@/screens/ClassStudentsScreen";
import { CreateStudentScreen } from "@/screens/CreateStudentScreen";
import { EditStudentScreen } from "@/screens/EditStudentScreen";
import { GradePredikatSettingsScreen } from "@/screens/GradePredikatSettingsScreen";
import { StudentSortSettingsScreen } from "@/screens/StudentSortSettingsScreen";

const Stack = createNativeStackNavigator<ManageStackParamList>();

export function ManageStackNavigator() {
  const { colors, t, isDark, fontSize } = useAppPreferences();
  const { workspace } = useWorkspace();
  const stackOptions = useMemo(
    () => getStackScreenOptions(colors, fontSize),
    [colors, isDark, fontSize],
  );

  return (
    <Stack.Navigator
      screenOptions={({ navigation, route }) =>
        stackScreenOptionsWithBack(
          stackOptions,
          navigation,
          t,
          route.name,
          "ManageHub",
        )
      }
    >
      <Stack.Screen name="ManageHub" options={{ title: t("nav.tabManage") }}>
        {({ navigation }) => (
          <ManageHubScreen
            onManageClasses={() => navigation.navigate("ClassesManageList")}
            onManageSubjects={() =>
              navigation.navigate("ClassPicker", { mode: "subjects" })
            }
            onManageStudents={() =>
              navigation.navigate("ClassPicker", { mode: "students" })
            }
            onGradePredikatSettings={() =>
              navigation.navigate("GradePredikatSettings")
            }
            onStudentSortSettings={() =>
              navigation.navigate("StudentSortSettings")
            }
            onUpgrade={() => goToSettingsTab(navigation)}
          />
        )}
      </Stack.Screen>

      <Stack.Screen
        name="ClassesManageList"
        options={{ title: t("manage.hubClasses") }}
      >
        {({ navigation }) => (
          <ClassesListScreen
            workspace={workspace}
            purpose="manage"
            onEditClass={(guruClass) =>
              navigation.navigate("EditClass", {
                classId: guruClass.id,
                className: guruClass.name,
              })
            }
            onCreateClass={() => navigation.navigate("CreateClass")}
          />
        )}
      </Stack.Screen>

      <Stack.Screen
        name="CreateClass"
        options={{ title: t("classes.addClass") }}
      >
        {({ navigation }) => (
          <CreateClassScreen
            workspaceId={workspace.id}
            onCreated={() => navigation.goBack()}
            onCancel={() => navigation.goBack()}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="EditClass" options={{ title: t("nav.manageClass") }}>
        {({ navigation, route }) => (
          <EditClassScreen
            workspaceId={workspace.id}
            classId={route.params.classId}
            initialName={route.params.className}
            onSaved={() => navigation.goBack()}
            onDeleted={() => navigation.goBack()}
            onCancel={() => navigation.goBack()}
          />
        )}
      </Stack.Screen>

      <Stack.Screen
        name="ClassPicker"
        options={({ route }) => ({
          title:
            route.params.mode === "subjects"
              ? t("manage.hubSubjects")
              : t("manage.hubStudents"),
        })}
      >
        {({ navigation, route }) => (
          <ClassPickerScreen
            mode={route.params.mode}
            onUpgrade={() => goToSettingsTab(navigation)}
            onPickClass={(guruClass) => {
              if (route.params.mode === "subjects") {
                navigation.navigate("SubjectManageList", {
                  classId: guruClass.id,
                  className: guruClass.name,
                  labelColor: guruClass.labelColor,
                });
              } else {
                navigation.navigate("ClassStudents", {
                  classId: guruClass.id,
                  className: guruClass.name,
                });
              }
            }}
          />
        )}
      </Stack.Screen>

      <Stack.Screen
        name="SubjectManageList"
        options={({ route }) => ({ title: route.params.className })}
      >
        {({ navigation, route }) => (
          <SubjectListScreen
            purpose="manage"
            classId={route.params.classId}
            className={route.params.className}
            labelColor={route.params.labelColor}
            onAddSubject={() =>
              navigation.navigate("CreateSubject", {
                classId: route.params.classId,
                className: route.params.className,
              })
            }
            onEditSubject={(assignment) =>
              navigation.navigate("EditSubject", {
                classId: route.params.classId,
                className: route.params.className,
                assignmentId: assignment.id,
                subjectName: assignment.subjectName!,
                labelColor: assignment.labelColor,
                classLabelColor: route.params.labelColor,
              })
            }
          />
        )}
      </Stack.Screen>

      <Stack.Screen
        name="CreateSubject"
        options={{ title: t("nav.addSubject") }}
      >
        {({ navigation, route }) => (
          <CreateSubjectScreen
            workspaceId={workspace.id}
            classId={route.params.classId}
            className={route.params.className}
            onCreated={() => navigation.goBack()}
            onCancel={() => navigation.goBack()}
          />
        )}
      </Stack.Screen>

      <Stack.Screen
        name="EditSubject"
        options={{ title: t("nav.editSubject") }}
      >
        {({ navigation, route }) => (
          <EditSubjectScreen
            workspaceId={workspace.id}
            classId={route.params.classId}
            className={route.params.className}
            assignmentId={route.params.assignmentId}
            initialName={route.params.subjectName}
            initialLabelColor={route.params.labelColor}
            onSaved={() => navigation.goBack()}
            onDeleted={() => navigation.goBack()}
            onCancel={() => navigation.goBack()}
          />
        )}
      </Stack.Screen>

      <Stack.Screen
        name="ClassStudents"
        options={({ route }) => ({
          title: `${t("nav.students")} — ${route.params.className}`,
        })}
      >
        {({ navigation, route }) => (
          <ClassStudentsScreen
            workspaceId={workspace.id}
            classId={route.params.classId}
            className={route.params.className}
            purpose="manage"
            onUpgrade={() => goToSettingsTab(navigation)}
            onAddStudent={() =>
              navigation.navigate("CreateStudentManage", {
                classId: route.params.classId,
                className: route.params.className,
              })
            }
            onEditStudent={(student) =>
              navigation.navigate("EditStudent", {
                classId: route.params.classId,
                studentId: student.id,
                fullName: student.fullName,
                studentNumber: student.studentNumber ?? "",
              })
            }
          />
        )}
      </Stack.Screen>

      <Stack.Screen
        name="CreateStudentManage"
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
        name="EditStudent"
        options={{ title: t("nav.editStudent") }}
      >
        {({ navigation, route }) => (
          <EditStudentScreen
            workspaceId={workspace.id}
            classId={route.params.classId}
            studentId={route.params.studentId}
            initialFullName={route.params.fullName}
            initialStudentNumber={route.params.studentNumber}
            onSaved={() => navigation.goBack()}
            onDeleted={() => navigation.goBack()}
            onCancel={() => navigation.goBack()}
          />
        )}
      </Stack.Screen>

      <Stack.Screen
        name="GradePredikatSettings"
        options={{ title: t("gradePredikat.title") }}
      >
        {() => <GradePredikatSettingsScreen />}
      </Stack.Screen>

      <Stack.Screen
        name="StudentSortSettings"
        options={{ title: t("studentSort.title") }}
      >
        {() => <StudentSortSettingsScreen />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
