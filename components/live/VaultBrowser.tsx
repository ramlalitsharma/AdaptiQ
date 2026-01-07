'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, Filter, X, ArrowUpDown } from 'lucide-react';

interface VaultBrowserProps {
  categories: { id: string; name: string; courses: any[] }[];
  uncategorizedCourses: any[];
}

export function VaultBrowser({ categories, uncategorizedCourses }: VaultBrowserProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'az' | 'za'>('newest');
  const [showFilters, setShowFilters] = useState(false);

  // Flatten all courses for search and analysis
  const allCourses = useMemo(() => [
    ...categories.flatMap(c => c.courses.map(course => ({ ...course, categoryName: c.name }))),
    ...uncategorizedCourses.map(c => ({ ...c, categoryName: 'General' }))
  ], [categories, uncategorizedCourses]);

  // Extract unique levels
  const levels = useMemo(() => {
    const uniqueLevels = new Set(allCourses.map(c => c.level).filter(Boolean));
    return Array.from(uniqueLevels);
  }, [allCourses]);

  const filteredCourses = useMemo(() => {
    let result = allCourses.filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            course.summary?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory ? course.categoryName === selectedCategory : true;
      const matchesLevel = selectedLevel ? course.level === selectedLevel : true;
      return matchesSearch && matchesCategory && matchesLevel;
    });

    return result.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        case 'oldest':
          return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        case 'az':
          return a.title.localeCompare(b.title);
        case 'za':
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });
  }, [allCourses, searchQuery, selectedCategory, selectedLevel, sortBy]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    setSelectedLevel(null);
    setSortBy('newest');
  };

  const activeFiltersCount = (selectedCategory ? 1 : 0) + (selectedLevel ? 1 : 0) + (searchQuery ? 1 : 0);

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row gap-8 justify-between items-end">
        <div className="space-y-4">
          <h2 className="text-5xl font-black tracking-tight">Video Courses</h2>
          <div className="w-20 h-1.5 bg-gradient-to-r from-blue-600 to-teal-500 rounded-full"></div>
          <p className="text-slate-400 text-xl font-medium max-w-3xl">
            Browse our curated video course library organized by discipline and technical depth.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-center">
           <div className="relative w-full sm:w-auto">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
             <Input 
              placeholder="Search video courses..." 
              className="pl-10 bg-white/5 border-white/10 text-white w-full sm:w-64 focus:ring-blue-500/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
             />
           </div>
           
           <Button 
             variant="outline" 
             className={`gap-2 border-white/10 text-white hover:bg-white/10 ${showFilters ? 'bg-white/10' : ''}`}
             onClick={() => setShowFilters(!showFilters)}
           >
             <Filter className="w-4 h-4" />
             Filters
             {activeFiltersCount > 0 && (
               <Badge className="bg-blue-600 text-white ml-1 px-1.5 py-0.5 text-[10px]">{activeFiltersCount}</Badge>
             )}
           </Button>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6 animate-in slide-in-from-top-2 fade-in">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Sort */}
            <div className="space-y-3 min-w-[200px]">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <ArrowUpDown className="w-3 h-3" /> Sort By
              </label>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full bg-[#0a0c10] border border-white/10 text-white rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 transition-colors appearance-none cursor-pointer"
              >
                <option value="newest">Newest Added</option>
                <option value="oldest">Oldest First</option>
                <option value="az">Alphabetical (A-Z)</option>
                <option value="za">Alphabetical (Z-A)</option>
              </select>
            </div>

            {/* Level Filter */}
            {levels.length > 0 && (
              <div className="space-y-3 min-w-[200px]">
                 <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  Expertise Level
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedLevel(null)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      selectedLevel === null 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    Any Level
                  </button>
                  {levels.map(level => (
                    <button
                      key={level}
                      onClick={() => setSelectedLevel(level)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        selectedLevel === level 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4 border-t border-white/5">
            <Button 
              variant="ghost" 
              onClick={clearFilters}
              className="text-slate-400 hover:text-white hover:bg-white/5 gap-2 text-xs uppercase tracking-widest"
            >
              <X className="w-3 h-3" /> Clear All Filters
            </Button>
          </div>
        </div>
      )}

      {/* Category Pills (Primary Navigation) */}
      <div className="flex flex-wrap gap-2">
        <Button 
          variant={selectedCategory === null ? 'default' : 'outline'}
          onClick={() => setSelectedCategory(null)}
          className={`rounded-full px-6 transition-all ${selectedCategory === null ? 'bg-white text-black hover:bg-slate-200' : 'border-white/20 text-white hover:bg-white/10'}`}
        >
          All Collections
        </Button>
        {categories.map(cat => (
          <Button
            key={cat.id}
            variant={selectedCategory === cat.name ? 'default' : 'outline'}
            onClick={() => setSelectedCategory(cat.name)}
            className={`rounded-full px-6 transition-all ${selectedCategory === cat.name ? 'bg-white text-black hover:bg-slate-200' : 'border-white/20 text-white hover:bg-white/10'}`}
          >
            {cat.name}
          </Button>
        ))}
         {uncategorizedCourses.length > 0 && (
          <Button
            variant={selectedCategory === 'General' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('General')}
            className={`rounded-full px-6 transition-all ${selectedCategory === 'General' ? 'bg-white text-black hover:bg-slate-200' : 'border-white/20 text-white hover:bg-white/10'}`}
          >
            General
          </Button>
        )}
      </div>

      <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
        {filteredCourses.length > 0 ? (
          filteredCourses.map((course: any) => (
            <CourseCard key={course._id} course={course} />
          ))
        ) : (
          <div className="col-span-full py-32 text-center space-y-4 bg-white/5 rounded-[3rem] border border-white/5">
            <div className="text-4xl">🔍</div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white">No courses found</h3>
              <p className="text-slate-500">Try adjusting your search or filters to find what you're looking for.</p>
            </div>
            <Button variant="outline" onClick={clearFilters} className="mt-4 border-white/10 text-white hover:bg-white/10">
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function CourseCard({ course }: { course: any }) {
  return (
    <Link href={`/courses/${course.slug}`}>
      <div className="group relative space-y-6">
        <div className="aspect-[4/5] bg-[#161b22] rounded-[2.5rem] overflow-hidden border border-white/5 relative">
          <img
            src={course.thumbnail || "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070"}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 opacity-80"
            alt={course.title}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0c10] via-transparent to-transparent"></div>

          <div className="absolute bottom-8 left-8 right-8 space-y-3">
            <div className="flex items-center gap-3">
              <Badge className="bg-blue-600/80 backdrop-blur-md border-none text-[8px] font-black uppercase tracking-tighter">
                {course.level || 'Expertise'}
              </Badge>
              <span className="text-[10px] font-bold text-white/60">
                {course.units?.length || 0} Units
              </span>
            </div>
            <h4 className="text-3xl font-black leading-none group-hover:text-blue-400 transition-colors uppercase italic tracking-tighter border-l-4 border-blue-500 pl-4">
              {course.title}
            </h4>
          </div>
        </div>

        <div className="px-4 space-y-2">
          <p className="text-slate-500 text-sm font-medium line-clamp-2 leading-relaxed">
            {course.summary || "Explore the deep mechanics of this technical discipline through our multi-layered curriculum."}
          </p>
          <div className="flex items-center gap-4 text-[10px] font-black text-blue-400 uppercase tracking-widest pt-2">
            <span>Level {course.level || 'N/A'}</span>
            <span>•</span>
            <span>{(course.metadata?.lessonsCount || course.units?.reduce((acc: number, u: any) => acc + (u.chapters?.reduce((cacc: number, c: any) => cacc + c.lessons.length, 0) || 0), 0)) || 0} Lessons</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
