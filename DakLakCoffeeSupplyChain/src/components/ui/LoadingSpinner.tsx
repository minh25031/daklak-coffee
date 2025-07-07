export default function LoadingSpinner() {
    return (
        <div className="flex justify-center items-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
        </div>
    );
}
