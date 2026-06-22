import { useState } from "react";
import { Alert } from "react-native";
import { PrimaryButton } from "@/components/PrimaryButton";
import { FormActions } from "@/components/ui/FormActions";
import { FormField } from "@/components/ui/FormField";
import { FormFieldBlock } from "@/components/ui/FormFieldBlock";
import { FormScreen } from "@/components/ui/FormScreen";
import { useTheme } from "@/context/AppPreferencesContext";
import { useTranslatedScreenTitle } from "@/hooks/useTranslatedScreenTitle";
import { apiDeleteStudent, apiUpdateStudent } from "@/lib/guru-repository";

type Props = {
  workspaceId: string;
  classId: string;
  studentId: string;
  initialFullName: string;
  initialStudentNumber: string;
  onSaved: () => void;
  onDeleted: () => void;
  onCancel: () => void;
};

export function EditStudentScreen({
  workspaceId,
  classId,
  studentId,
  initialFullName,
  initialStudentNumber,
  onSaved,
  onDeleted,
  onCancel,
}: Props) {
  const { t } = useTheme();

  useTranslatedScreenTitle(t("nav.editStudent"));
  const [fullName, setFullName] = useState(initialFullName);
  const [studentNumber, setStudentNumber] = useState(initialStudentNumber);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    setLoading(true);
    try {
      const trimmed = fullName.trim();
      if (!trimmed) {
        setError(t("student.nameRequired"));
        return;
      }
      setError("");
      const result = await apiUpdateStudent(workspaceId, classId, studentId, {
        fullName: trimmed,
        studentNumber: studentNumber.trim() || undefined,
      });
      if (!result.ok) {
        setError(result.error.message);
        return;
      }
      onSaved();
    } finally {
      setLoading(false);
    }
  }

  function confirmDelete() {
    Alert.alert(t("student.deleteTitle"), t("student.deleteBody"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("student.deleteAction"),
        style: "destructive",
        onPress: () => void handleDelete(),
      },
    ]);
  }

  async function handleDelete() {
    setLoading(true);
    const result = await apiDeleteStudent(workspaceId, classId, studentId);
    setLoading(false);
    if (!result.ok) {
      setError(result.error.message);
      return;
    }
    onDeleted();
  }

  return (
    <FormScreen
      footer={
        <FormActions>
          <PrimaryButton
            title={t("common.save")}
            size="compact"
            loading={loading}
            onPress={() => void handleSave()}
          />
          <PrimaryButton
            title={t("student.deleteAction")}
            variant="secondary"
            size="compact"
            disabled={loading}
            onPress={confirmDelete}
          />
          <PrimaryButton
            title={t("common.cancel")}
            variant="secondary"
            size="compact"
            disabled={loading}
            onPress={onCancel}
          />
        </FormActions>
      }
    >
      <FormFieldBlock error={error}>
        <FormField
          label={t("student.fullName")}
          value={fullName}
          onChangeText={setFullName}
          autoCapitalize="words"
        />
        <FormField
          label={t("student.number")}
          value={studentNumber}
          onChangeText={setStudentNumber}
        />
      </FormFieldBlock>
    </FormScreen>
  );
}
