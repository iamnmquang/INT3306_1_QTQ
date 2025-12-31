import { AlertTriangle } from 'lucide-react';

export default function ConfirmModal({
    open,
    title = 'Xác nhận',
    description = 'Bạn có chắc chắn muốn thực hiện hành động này?',
    confirmText = 'Xác nhận',
    cancelText = 'Huỷ',
    variant = 'danger', // danger | primary
    loading = false,
    onConfirm,
    onClose
}) {
    if (!open) return null;

    const confirmStyle =
        variant === 'danger'
            ? 'bg-red-600 hover:bg-red-700'
            : 'bg-blue-600 hover:bg-blue-700';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 animate-scaleIn">
                {/* Icon */}
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-semibold">{title}</h3>
                </div>

                {/* Content */}
                <p className="text-sm text-gray-600 mb-6">
                    {description}
                </p>

                {/* Actions */}
                <div className="flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="px-4 py-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50"
                    >
                        {cancelText}
                    </button>

                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className={`px-4 py-2 rounded-lg text-white ${confirmStyle} disabled:opacity-50`}
                    >
                        {loading ? 'Đang xử lý...' : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
