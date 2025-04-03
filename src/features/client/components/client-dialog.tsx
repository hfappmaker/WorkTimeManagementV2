import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogPortal,
    DialogOverlay,
} from "@/components/ui/dialog";

type DialogType = "details" | "create" | "edit" | "delete" | null;

type ClientDialogProps = {
    type: DialogType;
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
};

export const ClientDialog = ({ type, isOpen, onClose, children }: ClientDialogProps) => (
    <Dialog
        open={isOpen}
        onOpenChange={(open) => {
            if (!open) {
                onClose();
            }
        }}
    >
        <DialogPortal>
            <DialogOverlay />
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {type === "details" && "クライアント詳細"}
                        {type === "create" && "新規クライアント作成"}
                        {type === "edit" && "クライアント編集"}
                        {type === "delete" && "クライアント削除の確認"}
                    </DialogTitle>
                </DialogHeader>
                {children}
            </DialogContent>
        </DialogPortal>
    </Dialog>
);

export type { DialogType, ClientDialogProps }; 