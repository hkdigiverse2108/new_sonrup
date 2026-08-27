import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ConfirmOptions = {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
};

type ConfirmContextType = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = React.createContext<ConfirmContextType | null>(null);

export function useConfirm() {
  const context = React.useContext(ConfirmContext);
  if (!context) {
    throw new Error("useConfirm must be used within a ConfirmProvider");
  }
  return context;
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
    resolve: (value: boolean) => void;
  } | null>(null);

  const confirm = React.useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setState({
        isOpen: true,
        title: options.title || "Confirm Action",
        message: options.message,
        confirmText: options.confirmText || "OK",
        cancelText: options.cancelText || "Cancel",
        resolve,
      });
    });
  }, []);

  const handleClose = () => {
    if (state) {
      state.resolve(false);
      setState(null);
    }
  };

  const handleConfirm = () => {
    if (state) {
      state.resolve(true);
      setState(null);
    }
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {state && (
        <Dialog open={state.isOpen} onOpenChange={(open) => !open && handleClose()}>
          <DialogContent className="rounded-2xl border-[#e5e1dc] bg-white p-6 shadow-xl max-w-sm [&>button]:hidden">
            <DialogHeader>
              <DialogTitle className="font-display text-lg font-bold text-[#3E332A]">
                {state.title}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-2">
                {state.message}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-6 flex flex-row gap-2 justify-end sm:justify-end">
              <button 
                onClick={handleClose}
                className="rounded-full border px-5 py-2 text-sm font-semibold hover:bg-gray-50 transition-colors"
              >
                {state.cancelText}
              </button>
              <button
                onClick={handleConfirm}
                className="rounded-full bg-[#3E332A] px-5 py-2 text-sm font-semibold text-white hover:bg-[#3E332A]/90 transition-colors"
              >
                {state.confirmText}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </ConfirmContext.Provider>
  );
}
