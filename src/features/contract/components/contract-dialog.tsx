import { Dialog, DialogContent, DialogHeader, DialogOverlay, DialogPortal, DialogTitle } from "@/components/ui/dialog";

export type DialogType = "create" | "edit" | "delete" | "details" | null;

type ContractDialogProps = {
    type: DialogType;
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
};

export const ContractDialog = ({
    type,
    isOpen,
    onClose,
    children
}: ContractDialogProps) => (
    <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open) {
            onClose();
        }
    }}>
        <DialogPortal>
            <DialogOverlay />
            <DialogContent className="max-h-[90vh] w-[95vw] max-w-[1400px] overflow-y-auto p-8">
                <DialogHeader>
                    <DialogTitle>
                        {type === "create" && "契約を作成"}
                        {type === "edit" && "契約を編集"}
                        {type === "delete" && "契約の削除確認"}
                        {type === "details" && "契約詳細"}
                    </DialogTitle>
                </DialogHeader>
                {children}
            </DialogContent>
        </DialogPortal>
    </Dialog>
); 