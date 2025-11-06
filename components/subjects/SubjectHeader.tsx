'use client';

export function SubjectHeader({ name, description, chaptersCount }: { name: string; description?: string; chaptersCount: number }) {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 md:p-8 text-white shadow-md mb-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{name}</h1>
          {description ? <p className="opacity-90 mt-1 max-w-2xl">{description}</p> : null}
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold">{chaptersCount}</div>
          <div className="text-sm opacity-90">Chapters</div>
        </div>
      </div>
    </div>
  );
}


