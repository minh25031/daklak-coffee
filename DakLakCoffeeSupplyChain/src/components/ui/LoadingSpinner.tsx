export default function LoadingSpinner() {
    return (
        <div className="flex justify-center items-center py-8">
            <div className="relative">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-200 border-t-orange-600" />
                <div className="absolute inset-0 h-8 w-8 animate-ping rounded-full border-2 border-orange-400 opacity-20" />
            </div>
        </div>
    );
}
