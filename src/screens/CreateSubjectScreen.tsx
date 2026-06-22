import { useState } from "react";
import { PrimaryButton } from "@/components/PrimaryButton";
import { FormActions } from "@/components/ui/FormActions";
import { FormField } from "@/components/ui/FormField";
import { FormFieldBlock } from "@/components/ui/FormFieldBlock";
import { FormScreen } from "@/components/ui/FormScreen";
import { LabelColorPicker } from "@/components/ui/LabelColorPicker";
import { TeachingScheduleEditor } from "@/components/ui/TeachingScheduleEditor";
import { useTheme } from "@/context/AppPreferencesContext";
import { useTranslatedScreenTitle } from "@/hooks/useTranslatedScreenTitle";
import { apiCreateSubjectAssignment } from "@/lib/guru-repository";
import { DEFAULT_LABEL_COLOR_ID } from "@/lib/label-colors";
import { isValidTeachingSlotDraft } from "@/lib/teaching-schedule";
import type { TeachingSlotDraft } from "@/lib/types";

import type { GuruAssignment } from "@/lib/types";

type Props = {
  workspaceId: string;
  classId: string;
  className: string;
  onCreated: (assignment: GuruAssignment) => void;
  onCancel: () => void;
};

export function CreateSubjectScreen({
  workspaceId,
  classId,
  className,
  onCreated,
  onCancel,
}: Props) {
  const { t } = useTheme();

  useTranslatedScreenTitle(t("nav.addSubject"));
  const [subjectName, setSubjectName] = useState("");
  const [labelColor, setLabelColor] = useState(DEFAULT_LABEL_COLOR_ID);
  const [teachingSlots, setTeachingSlots] = useState<TeachingSlotDraft[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    setLoading(true);
    try {
      const trimmed = subjectName.trim();
      if (!trimmed) {
        setError(t("subject.nameRequired"));
        return;
      }
      setError("");
      const validSlots = teachingSlots.filter(isValidTeachingSlotDraft);
      const result = await apiCreateSubjectAssignment(
        workspaceId,
        classId,
        trimmed,
        labelColor,
        validSlots,
      );
      if (!result.ok) {
        setError(result.error.message);
        return;
      }
      onCreated(result.data.assignment);
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
      <FormFieldBlock
        hint={t("student.classLabel", { name: className })}
        error={error}
      >
        <FormField
          label={t("subject.nameLabel")}
          value={subjectName}
          onChangeText={setSubjectName}
          placeholder="Matematika"
          autoCapitalize="words"
        />
        <LabelColorPicker value={labelColor} onChange={setLabelColor} />
        <TeachingScheduleEditor
          value={teachingSlots}
          onChange={setTeachingSlots}
        />
      </FormFieldBlock>
    </FormScreen>
  );
}
