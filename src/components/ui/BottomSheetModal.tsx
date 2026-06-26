import type { ReactNode } from "react";
import type { ModalProps } from "react-native";
import { ModalScrim } from "@/components/ui/ModalScrim";

export {
  BOTTOM_SHEET_BACKDROP_DARK,
  BOTTOM_SHEET_BACKDROP_LIGHT,
} from "@/components/ui/modal-backdrop";

type Props = {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  animationType?: ModalProps["animationType"];
  backdropColor?: string;
};

/** Bottom sheet dengan backdrop gelap + tap di area atas untuk tutup. */
export function BottomSheetModal(props: Props) {
  return <ModalScrim {...props} layout="bottom" />;
}
