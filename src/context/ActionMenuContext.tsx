import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import {
  ActionMenuSheet,
  type ActionMenuItem,
} from "@/components/ui/ActionMenuSheet";

export type { ActionMenuItem } from "@/components/ui/ActionMenuSheet";

export type ShowActionMenuParams = {
  title?: string;
  subtitle?: string;
  items: ActionMenuItem[];
};

type ActionMenuContextValue = {
  showActionMenu: (params: ShowActionMenuParams) => void;
};

const ActionMenuContext = createContext<ActionMenuContextValue | null>(null);

export function ActionMenuProvider({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [menu, setMenu] = useState<ShowActionMenuParams | null>(null);

  const showActionMenu = useCallback((params: ShowActionMenuParams) => {
    setMenu(params);
    setVisible(true);
  }, []);

  const close = useCallback(() => {
    setVisible(false);
    setMenu(null);
  }, []);

  const handleItemPress = useCallback(
    (item: ActionMenuItem) => {
      close();
      requestAnimationFrame(() => {
        item.onPress();
      });
    },
    [close],
  );

  return (
    <ActionMenuContext.Provider value={{ showActionMenu }}>
      {children}
      <ActionMenuSheet
        visible={visible}
        title={menu?.title}
        subtitle={menu?.subtitle}
        items={menu?.items ?? []}
        onClose={close}
        onItemPress={handleItemPress}
      />
    </ActionMenuContext.Provider>
  );
}

export function useActionMenu() {
  const ctx = useContext(ActionMenuContext);
  if (!ctx) {
    throw new Error("useActionMenu must be used within ActionMenuProvider");
  }
  return ctx;
}

export function useActionMenuOptional() {
  return useContext(ActionMenuContext);
}
