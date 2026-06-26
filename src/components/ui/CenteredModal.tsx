import type { ReactNode } from "react";
import type { ModalProps } from "react-native";
import { ModalScrim } from "@/components/ui/ModalScrim";

type Props = {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  animationType?: ModalProps["animationType"];
  backdropColor?: string;
  dismissOnBackdropPress?: boolean;
};

/** Dialog tengah layar dengan backdrop gelap + tap di luar untuk tutup. */
export function CenteredModal(props: Props) {
  return <ModalScrim {...props} layout="center" />;
}
