import {
  useConfirmStore,
  type ConfirmRequest,
} from "@/store/confirm.store";

/** In-app confirmation — replaces window.confirm */
export function confirmAction(options: ConfirmRequest): Promise<boolean> {
  return useConfirmStore.getState().request(options);
}
