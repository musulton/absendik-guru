import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { PrimaryButton } from "@/components/PrimaryButton";
import { FormActions } from "@/components/ui/FormActions";
import { FormField } from "@/components/ui/FormField";
import { FormFieldBlock } from "@/components/ui/FormFieldBlock";
import { FormScreen } from "@/components/ui/FormScreen";
import { LabelColorPicker } from "@/components/ui/LabelColorPicker";
import { TeachingScheduleEditor } from "@/components/ui/TeachingScheduleEditor";
import { useTheme } from "@/context/AppPreferencesContext";
import { useTranslatedScreenTitle } from "@/hooks/useTranslatedScreenTitle";
import {
  apiDeleteAssignment,
  apiListTeachingSlots,
  apiUpdateSubjectAssignment,
} from "@/lib/guru-repository";
import { pickDefaultLabelColorId } from "@/lib/label-colors";
import { isValidTeachingSlotDraft, groupTeachingSlotsToDrafts } from "@/lib/teaching-schedule";
import type { TeachingSlotDraft } from "@/lib/types";

type Props = {
  workspaceId: string;
  classId: string;
  className: string;
  assignmentId: string;
  initialName: string;
  initialLabelColor?: string | null;
  onSaved: (subjectName: string, unchanged?: boolean) => void;
  onDeleted: () => void;
  onCancel: () => void;
};

export function EditSubjectScreen({
  workspaceId,
  classId,
  className,
  assignmentId,
  initialName,
  initialLabelColor,
  onSaved,
  onDeleted,
  onCancel,
}: Props) {
  const { t } = useTheme();
  const initialColor =
    initialLabelColor ?? pickDefaultLabelColorId(initialName);

  useTranslatedScreenTitle(t("nav.editSubject"));
  const [subjectName, setSubjectName] = useState(initialName);
  const [labelColor, setLabelColor] = useState(initialColor);
  const [teachingSlots, setTeachingSlots] = useState<TeachingSlotDraft[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    void apiListTeachingSlots(workspaceId, classId, initialName).then((res) => {
      if (!res.ok) return;
      setTeachingSlots(groupTeachingSlotsToDrafts(res.data.slots));
    });
  }, [workspaceId, classId, initialName]);

  async function handleSave() {
    setLoading(true);
    try {
      const trimmed = subjectName.trim();
      if (!trimmed) {
        setError(t("subject.nameRequired"));
        return;
      }
      setError("");

      const validSlots = teachingSlots.filter(isValidTeachingSlotDraft);
      const result = await apiUpdateSubjectAssignment(
        workspaceId,
        classId,
        assignmentId,
        { subjectName: trimmed, labelColor, teachingSlots: validSlots },
      );
      if (!result.ok) {
        setError(result.error.message);
        return;
      }
      onSaved(result.data.assignment.subjectName!, false);
    } finally {
      setLoading(false);
    }
  }

  function confirmDelete() {
    Alert.alert(
      t("subject.deleteTitle").replace("{name}", initialName),
      t("subject.deleteBody"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("subject.deleteAction"),
          style: "destructive",
          onPress: () => void handleDelete(),
        },
      ],
    );
  }

  async function handleDelete() {
    setLoading(true);
    const result = await apiDeleteAssignment(
      workspaceId,
      classId,
      assignmentId,
    );
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
            title={t("subject.deleteAction")}
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
      <FormFieldBlock
        hint={t("student.classLabel", { name: className })}
        error={error}
      >
        <FormField
          label={t("subject.nameLabel")}
          value={subjectName}
          onChangeText={setSubjectName}
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
