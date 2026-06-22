import { useState } from "react";
import { PrimaryButton } from "@/components/PrimaryButton";
import { StudentQuotaBanner, checkStudentQuotaAvailable } from "@/components/StudentQuotaBanner";
import { FormActions } from "@/components/ui/FormActions";
import { FormField } from "@/components/ui/FormField";
import { FormFieldBlock } from "@/components/ui/FormFieldBlock";
import { FormScreen } from "@/components/ui/FormScreen";
import { useTheme } from "@/context/AppPreferencesContext";
import { useTranslatedScreenTitle } from "@/hooks/useTranslatedScreenTitle";
import { apiCreateStudent } from "@/lib/guru-repository";

import type { GuruStudent } from "@/lib/types";

type Props = {
  workspaceId: string;
  classId: string;
  className: string;
  onCreated: (student: GuruStudent) => void;
  onCancel: () => void;
};

export function CreateStudentScreen({
  workspaceId,
  classId,
  className,
  onCreated,
  onCancel,
}: Props) {
  const { t } = useTheme();

  useTranslatedScreenTitle(t("subjects.addStudent"));
  const [fullName, setFullName] = useState("");
  const [studentNumber, setStudentNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [quotaBlocked, setQuotaBlocked] = useState(false);

  async function handleSubmit() {
    setLoading(true);
    try {
      const trimmed = fullName.trim();
      if (!trimmed) {
        setError(t("student.nameRequired"));
        return;
      }

      const quota = await checkStudentQuotaAvailable();
      if (!quota.ok) {
        setError(quota.message);
        setQuotaBlocked(true);
        return;
      }

      setError("");
      const result = await apiCreateStudent(workspaceId, classId, {
        fullName: trimmed,
        studentNumber: studentNumber.trim() || undefined,
      });
      if (!result.ok) {
        setError(result.error.message);
        if (result.error.code === "limit") setQuotaBlocked(true);
        return;
      }
      onCreated(result.data.student);
    } finally {
      setLoading(false);
    }
  }

  return (
    <FormScreen
      footer={
        <FormActions>
          <PrimaryButton
            title={t("common.save")}
            size="compact"
            loading={loading}
            disabled={quotaBlocked}
            onPress={() => void handleSubmit()}
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
      <StudentQuotaBanner onQuotaFull={() => setQuotaBlocked(true)} />
      <FormFieldBlock
        hint={t("student.classLabel", { name: className })}
        error={error}
      >
        <FormField
          label={t("student.fullName")}
          value={fullName}
          onChangeText={setFullName}
          placeholder={t("student.fullName")}
          autoCapitalize="words"
          editable={!quotaBlocked}
        />
        <FormField
          label={t("student.number")}
          value={studentNumber}
          onChangeText={setStudentNumber}
          placeholder="001"
          editable={!quotaBlocked}
        />
      </FormFieldBlock>
    </FormScreen>
  );
}
