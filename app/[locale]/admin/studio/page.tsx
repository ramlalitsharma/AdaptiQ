import { Link } from '@/lib/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Newspaper, FileText, Video, PenTool } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

export default async function StudioPage() {
  const t = await getTranslations('Admin');

  const tools = [
    {
      title: 'News Studio',
      description: 'Create and manage news articles, announcements, and updates.',
      icon: Newspaper,
      href: '/admin/studio/news',
      color: 'bg-blue-500/10 text-blue-600',
      action: 'Manage News'
    },
    {
      title: 'Blog Studio',
      description: 'Write insightful blog posts and share knowledge with the community.',
      icon: PenTool,
      href: '/admin/studio/blogs',
      color: 'bg-purple-500/10 text-purple-600',
      action: 'Manage Blogs'
    },
    {
      title: 'Course Studio',
      description: 'Design comprehensive courses with videos, quizzes, and resources.',
      icon: Video,
      href: '/admin/studio/courses',
      color: 'bg-emerald-500/10 text-emerald-600',
      action: 'Manage Courses'
    },
  ];

  return (
    <div className="space-y-8 p-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Content Studio</h1>
        <p className="text-slate-600 dark:text-slate-400">Manage all your platform content in one place.</p>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {tools.map((tool) => (
          <Card key={tool.title} className="hover:shadow-lg transition-all duration-300 border-slate-200 dark:border-slate-800">
            <CardHeader>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${tool.color}`}>
                <tool.icon className="w-6 h-6" />
              </div>
              <CardTitle>{tool.title}</CardTitle>
              <CardDescription>{tool.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={tool.href}>
                <Button variant="outline" className="w-full group">
                  {tool.action}
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
