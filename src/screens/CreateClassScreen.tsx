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
import { apiCreateClass } from "@/lib/guru-repository";
import { DEFAULT_LABEL_COLOR_ID } from "@/lib/label-colors";
import { isValidTeachingSlotDraft } from "@/lib/teaching-schedule";
import type { GuruClass, TeachingSlotDraft } from "@/lib/types";

type Props = {
  workspaceId: string;
  onCreated: (guruClass: GuruClass) => void;
  onCancel: () => void;
};

export function CreateClassScreen({
  workspaceId,
  onCreated,
  onCancel,
}: Props) {
  const { t } = useTheme();
  const [name, setName] = useState("");

  useTranslatedScreenTitle(t("classes.addClass"));
  const [labelColor, setLabelColor] = useState(DEFAULT_LABEL_COLOR_ID);
  const [teachingSlots, setTeachingSlots] = useState<TeachingSlotDraft[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    setLoading(true);
    try {
      const trimmed = name.trim();
      if (!trimmed) {
        setError(t("class.nameRequired"));
        return;
      }
      setError("");
      const validSlots = teachingSlots.filter(isValidTeachingSlotDraft);
      const result = await apiCreateClass(
        workspaceId,
        trimmed,
        labelColor,
        validSlots,
      );
      if (!result.ok) {
        setError(result.error.message);
        return;
      }
      onCreated(result.data.class);
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
      <FormFieldBlock hint={t("classes.addClassHint")} error={error}>
        <FormField
          label={t("class.nameLabel")}
          value={name}
          onChangeText={setName}
          placeholder="VII-A"
          autoCapitalize="characters"
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
