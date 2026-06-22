import { useState } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { PrimaryButton } from "@/components/PrimaryButton";
import { FormActions } from "@/components/ui/FormActions";
import { FormField } from "@/components/ui/FormField";
import { FormFieldBlock } from "@/components/ui/FormFieldBlock";
import { FormLabel } from "@/components/ui/FormLabel";
import { FormScreen } from "@/components/ui/FormScreen";
import { SchoolLevelPicker } from "@/components/ui/SchoolLevelPicker";
import { SegmentedChoice } from "@/components/ui/SegmentedChoice";
import { useTheme } from "@/context/AppPreferencesContext";
import { apiCreateWorkspace } from "@/lib/guru-repository";
import { getSchoolLinkSnapshot } from "@/lib/school-link";
import { linkedSchoolNameMatches } from "@/lib/workspace-kind";
import { space } from "@/lib/theme";
import type { GuruSchoolLevel, GuruWorkspace } from "@/lib/types";

type Props = {
  onCreated: (workspace: GuruWorkspace) => void;
  onCancel: () => void;
};

export function CreateWorkspaceScreen({ onCreated, onCancel }: Props) {
  const { colors, font, t } = useTheme();
  const [name, setName] = useState("");
  const [schoolLevel, setSchoolLevel] = useState<GuruSchoolLevel | "">("");
  const [city, setCity] = useState("");
  const [npsn, setNpsn] = useState("");
  const [province, setProvince] = useState("");
  const [address, setAddress] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [attendanceMode, setAttendanceMode] = useState<"class" | "subject">(
    "class",
  );
  const [showExtra, setShowExtra] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    setLoading(true);
    try {
      const trimmedName = name.trim();
      if (!trimmedName) {
        setError(t("createWorkspace.nameRequired"));
        return;
      }
      if (!schoolLevel) {
        setError(t("createWorkspace.levelRequired"));
        return;
      }
      if (!city.trim()) {
        setError(t("createWorkspace.cityRequired"));
        return;
      }
      setError("");
      const link = getSchoolLinkSnapshot();
      if (linkedSchoolNameMatches(trimmedName, link)) {
        setError(t("createWorkspace.linkedSchoolExists"));
        return;
      }

      const result = await apiCreateWorkspace({
        name: trimmedName,
        schoolLevel,
        city: city.trim(),
        npsn: npsn.trim() || undefined,
        province: province.trim() || undefined,
        address: address.trim() || undefined,
        contactName: contactName.trim() || undefined,
        contactPhone: contactPhone.trim() || undefined,
        contactEmail: contactEmail.trim() || undefined,
        attendanceMode,
      });
      if (!result.ok) {
        setError(result.error.message);
        return;
      }
      onCreated(result.data.workspace);
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
      <FormFieldBlock hint={t("createWorkspace.hint")} error={error}>
      <FormField
        label={t("createWorkspace.nameLabel")}
        value={name}
        onChangeText={setName}
        placeholder={t("createWorkspace.namePlaceholder")}
        autoCapitalize="words"
      />
      <FormLabel>{t("createWorkspace.levelLabel")}</FormLabel>
      <SchoolLevelPicker
        value={schoolLevel}
        onChange={(level) => {
          setSchoolLevel(level);
          setError("");
        }}
      />
      <FormField
        label={t("createWorkspace.cityLabel")}
        value={city}
        onChangeText={setCity}
        placeholder={t("createWorkspace.cityPlaceholder")}
        autoCapitalize="words"
      />

      <Pressable
        style={styles.toggle}
        onPress={() => setShowExtra((v) => !v)}
      >
        <Text style={[font.caption, styles.toggleText, { color: colors.primary, fontWeight: "600" }]}>
          {showExtra ? t("createWorkspace.hideExtra") : t("createWorkspace.showExtra")}
        </Text>
      </Pressable>

      {showExtra ? (
        <>
          <FormField
            label={t("createWorkspace.npsn")}
            value={npsn}
            onChangeText={setNpsn}
            placeholder={t("common.optional")}
            keyboardType="number-pad"
          />
          <FormField
            label={t("createWorkspace.province")}
            value={province}
            onChangeText={setProvince}
            placeholder={t("common.optional")}
            autoCapitalize="words"
          />
          <FormField
            label={t("createWorkspace.address")}
            value={address}
            onChangeText={setAddress}
            placeholder={t("common.optional")}
            autoCapitalize="sentences"
          />
          <FormField
            label={t("createWorkspace.pic")}
            value={contactName}
            onChangeText={setContactName}
            placeholder={t("common.optional")}
            autoCapitalize="words"
          />
          <FormField
            label={t("createWorkspace.phone")}
            value={contactPhone}
            onChangeText={setContactPhone}
            placeholder={t("common.optional")}
            keyboardType="phone-pad"
          />
          <FormField
            label={t("createWorkspace.email")}
            value={contactEmail}
            onChangeText={setContactEmail}
            placeholder={t("common.optional")}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </>
      ) : null}

      <FormLabel>{t("createWorkspace.attendanceSection")}</FormLabel>
      <SegmentedChoice
        options={[
          { key: "class", label: t("nav.modeClass") },
          { key: "subject", label: t("createWorkspace.modeSubject") },
        ]}
        value={attendanceMode}
        onChange={(k) => setAttendanceMode(k as "class" | "subject")}
      />
      </FormFieldBlock>
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  toggle: { marginBottom: space.sm },
  toggleText: {},
});
