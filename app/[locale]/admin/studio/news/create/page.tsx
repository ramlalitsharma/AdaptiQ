import { requireContentWriter } from '@/lib/admin-check';
import { NewsEditor } from '@/components/news/NewsEditor';

export default async function CreateNewsPage() {
    await requireContentWriter();

    return <NewsEditor mode="create" />;
}
