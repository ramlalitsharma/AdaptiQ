import "@/styles/news.css";

export default function NewsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="news-paper-theme font-serif">
            {children}
        </div>
    );
}
