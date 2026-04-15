'use client';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {

    return (
        <html>
            <body>
                <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
                    <h2 className="text-2xl font-bold mb-4 text-slate-900">Something went wrong!</h2>
                    <button
                        onClick={() => reset()}
                        className="rounded-xl bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-700 transition-colors"
                    >
                        Try again
                    </button>
                </div>
            </body>
        </html>
    );
}
