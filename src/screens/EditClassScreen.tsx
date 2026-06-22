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
  apiDeleteClass,
  apiListClasses,
  apiListTeachingSlots,
  apiUpdateClass,
} from "@/lib/guru-repository";
import { pickDefaultLabelColorId } from "@/lib/label-colors";
import { isValidTeachingSlotDraft, groupTeachingSlotsToDrafts } from "@/lib/teaching-schedule";
import type { TeachingSlotDraft } from "@/lib/types";

type Props = {
  workspaceId: string;
  classId: string;
  initialName: string;
  onSaved: (name: string) => void;
  onDeleted: () => void;
  onCancel: () => void;
};

export function EditClassScreen({
  workspaceId,
  classId,
  initialName,
  onSaved,
  onDeleted,
  onCancel,
}: Props) {
  const { t } = useTheme();
  const [name, setName] = useState(initialName);

  useTranslatedScreenTitle(t("nav.manageClass"));
  const [labelColor, setLabelColor] = useState(
    pickDefaultLabelColorId(initialName),
  );
  const [teachingSlots, setTeachingSlots] = useState<TeachingSlotDraft[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    void apiListClasses(workspaceId).then((res) => {
      if (!res.ok) return;
      const cls = res.data.classes.find((c) => c.id === classId);
      if (!cls) return;
      setLabelColor(cls.labelColor ?? pickDefaultLabelColorId(cls.name));
    });
    void apiListTeachingSlots(workspaceId, classId, null).then((res) => {
      if (!res.ok) return;
      setTeachingSlots(groupTeachingSlotsToDrafts(res.data.slots));
    });
  }, [workspaceId, classId]);

  async function handleSave() {
    setLoading(true);
    try {
      const trimmed = name.trim();
      if (!trimmed) {
        setError(t("class.nameRequired"));
        return;
      }
      setError("");
      const validSlots = teachingSlots.filter(isValidTeachingSlotDraft);
      const result = await apiUpdateClass(workspaceId, classId, {
        name: trimmed,
        labelColor,
        teachingSlots: validSlots,
      });
      if (!result.ok) {
        setError(result.error.message);
        return;
      }
      onSaved(result.data.class.name);
    } finally {
      setLoading(false);
    }
  }

  function confirmDelete() {
    Alert.alert(t("class.deleteTitle"), t("class.deleteBody"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("class.deleteAction"),
        style: "destructive",
        onPress: () => void handleDelete(),
      },
    ]);
  }

  async function handleDelete() {
    setLoading(true);
    const result = await apiDeleteClass(workspaceId, classId);
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
            title={t("class.deleteAction")}
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
          label={t("class.nameLabel")}
          value={name}
          onChangeText={setName}
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
