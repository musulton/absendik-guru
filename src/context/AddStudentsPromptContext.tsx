import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { AddStudentsPromptModal } from "@/components/students/AddStudentsPromptModal";
import { useTheme } from "@/context/AppPreferencesContext";

type PromptOptions = {
  isSchoolWorkspace: boolean;
  onAddStudent: () => void;
};

type AddStudentsPromptContextValue = {
  showAddStudentsPrompt: (options: PromptOptions) => void;
};

const AddStudentsPromptContext =
  createContext<AddStudentsPromptContextValue | null>(null);

export function AddStudentsPromptProvider({ children }: { children: ReactNode }) {
  const { t } = useTheme();
  const [options, setOptions] = useState<PromptOptions | null>(null);

  const close = useCallback(() => setOptions(null), []);

  const showAddStudentsPrompt = useCallback((next: PromptOptions) => {
    setOptions(next);
  }, []);

  const handleConfirm = useCallback(() => {
    const onAddStudent = options?.onAddStudent;
    close();
    onAddStudent?.();
  }, [close, options]);

  const value = useMemo(
    () => ({ showAddStudentsPrompt }),
    [showAddStudentsPrompt],
  );

  return (
    <AddStudentsPromptContext.Provider value={value}>
      {children}
      <AddStudentsPromptModal
        visible={options !== null}
        readonly={options?.isSchoolWorkspace ?? false}
        title={
          options?.isSchoolWorkspace
            ? t("school.readonlyTitle")
            : t("subjects.noStudents")
        }
        body={
          options?.isSchoolWorkspace
            ? t("school.noStudentsHint")
            : t("subjects.addStudentPrompt")
        }
        confirmLabel={t("subjects.addStudent")}
        onClose={close}
        onConfirm={handleConfirm}
      />
    </AddStudentsPromptContext.Provider>
  );
}

export function useAddStudentsPrompt(): AddStudentsPromptContextValue {
  const ctx = useContext(AddStudentsPromptContext);
  if (!ctx) {
    throw new Error(
      "useAddStudentsPrompt must be used within AddStudentsPromptProvider",
    );
  }
  return ctx;
}
