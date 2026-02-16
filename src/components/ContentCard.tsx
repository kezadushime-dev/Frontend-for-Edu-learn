import React from 'react';
import { Link } from 'react-router-dom';

// Category-based colors for placeholder images
const categoryColors: Record<string, string> = {
  Programming: 'from-blue-500 to-blue-700',
  'Web Development': 'from-amber-500 to-amber-700',
  Frontend: 'from-purple-500 to-purple-700',
  Backend: 'from-green-500 to-green-700',
  Database: 'from-rose-500 to-rose-700',
  default: 'from-slate-500 to-slate-700',
};

// Get category color class
const getCategoryColor = (category: string) => {
  return categoryColors[category] || categoryColors.default;
};

// Get initials from title for placeholder
const getInitials = (title: string) => {
  return title
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export interface LessonCardProps {
  id: string;
  title: string;
  description?: string;
  category: string;
  createdBy?: string;
  instructor?: { name: string };
  createdAt?: string;
  updatedAt?: string;
  isPublished?: boolean;
  images?: string[];
  onEdit?: (lesson: any) => void;
  onDelete?: (id: string) => void;
  viewLink?: string;
}

export interface QuizCardProps {
  id: string;
  title: string;
  passingScore?: number;
  isActive?: boolean;
  createdAt?: string;
  lessonTitle?: string;
  questions?: any[];
  onEdit?: (quiz: any) => void;
  onDelete?: (id: string) => void;
  viewLink?: string;
}

interface ContentCardProps {
  type: 'lesson' | 'quiz';
  lesson?: LessonCardProps;
  quiz?: QuizCardProps;
}

export function LessonCard({ 
  id, 
  title, 
  description, 
  category, 
  createdBy, 
  instructor, 
  createdAt, 
  isPublished, 
  images,
  onEdit, 
  onDelete,
  viewLink 
}: LessonCardProps) {
  const categoryColor = getCategoryColor(category);
  const hasImage = images && images.length > 0;
  const authorName = createdBy || instructor?.name || 'Unknown';
  
  // Estimate duration based on description length (rough estimate)
  const estimatedMinutes = description ? Math.max(5, Math.ceil(description.length / 200)) : 10;
  const duration = `${estimatedMinutes} min`;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-md transition-all hover:shadow-xl hover:-translate-y-1">
      {/* Image Section */}
      <div className={`relative h-40 ${hasImage ? '' : `bg-gradient-to-br ${categoryColor}`}`}>
        {hasImage ? (
          <img 
            src={images[0]} 
            alt={title} 
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-5xl font-black text-white/30">
              {getInitials(title)}
            </span>
          </div>
        )}
        
        {/* Category Badge */}
        <div className="absolute right-3 top-3">
          <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
            {category}
          </span>
        </div>

        {/* Status Badge */}
        <div className="absolute left-3 top-3">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold shadow-sm ${
            isPublished === false 
              ? 'bg-amber-100 text-amber-700' 
              : 'bg-emerald-100 text-emerald-700'
          }`}>
            {isPublished === false ? 'Draft' : 'Published'}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5">
        <h3 className="line-clamp-2 text-lg font-bold text-slate-800 transition-colors group-hover:text-blue-600">
          {title}
        </h3>
        
        <p className="mt-2 line-clamp-2 text-sm text-slate-500">
          {description || 'No description available'}
        </p>

        {/* Meta Info */}
        <div className="mt-4 flex items-center gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-1">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="truncate max-w-[100px]">{authorName}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-4">
          {viewLink && (
            <Link
              to={viewLink}
              className="flex-1 rounded-lg bg-blue-50 px-3 py-2 text-center text-sm font-semibold text-blue-600 transition hover:bg-blue-100"
            >
              View
            </Link>
          )}
          {onEdit && (
            <button
              onClick={() => onEdit({ _id: id, title, description, category, createdBy, isPublished, images })}
              className="flex-1 rounded-lg border border-green-200 px-3 py-2 text-center text-sm font-semibold text-green-600 transition hover:bg-green-50"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(id)}
              className="flex-1 rounded-lg border border-red-200 px-3 py-2 text-center text-sm font-semibold text-red-600 transition hover:bg-red-50"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function QuizCard({ 
  id, 
  title, 
  passingScore, 
  isActive, 
  createdAt, 
  lessonTitle,
  questions,
  onEdit, 
  onDelete,
  viewLink 
}: QuizCardProps) {
  const questionCount = questions?.length || 0;
  const statusColor = isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700';
  
  // Estimate duration: 2 minutes per question
  const estimatedMinutes = questionCount * 2;
  const duration = `${estimatedMinutes} min`;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-md transition-all hover:shadow-xl hover:-translate-y-1">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-indigo-500 to-indigo-700 p-5">
        <div className="flex items-start justify-between">
          <div>
            <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${statusColor}`}>
              {isActive ? 'Active' : 'Paused'}
            </span>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-white">{passingScore || 70}%</p>
            <p className="text-xs text-white/70">Pass Score</p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5">
        <h3 className="line-clamp-2 text-lg font-bold text-slate-800 transition-colors group-hover:text-indigo-600">
          {title}
        </h3>
        
        {lessonTitle && (
          <p className="mt-1 text-sm text-slate-500">
            Related: {lessonTitle}
          </p>
        )}

        {/* Meta Info */}
        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-1">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{questionCount} Questions</span>
          </div>
          <div className="flex items-center gap-1">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{duration}</span>
          </div>
          {createdAt && (
            <div className="flex items-center gap-1">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{new Date(createdAt).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-4">
          {viewLink && (
            <Link
              to={viewLink}
              className="flex-1 rounded-lg bg-indigo-50 px-3 py-2 text-center text-sm font-semibold text-indigo-600 transition hover:bg-indigo-100"
            >
              View
            </Link>
          )}
          {onEdit && (
            <button
              onClick={() => onEdit({ _id: id, title, passingScore, isActive, lessonTitle, questions })}
              className="flex-1 rounded-lg border border-green-200 px-3 py-2 text-center text-sm font-semibold text-green-600 transition hover:bg-green-50"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(id)}
              className="flex-1 rounded-lg border border-red-200 px-3 py-2 text-center text-sm font-semibold text-red-600 transition hover:bg-red-50"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ContentCard({ type, lesson, quiz }: ContentCardProps) {
  if (type === 'lesson' && lesson) {
    return <LessonCard {...lesson} />;
  }
  if (type === 'quiz' && quiz) {
    return <QuizCard {...quiz} />;
  }
  return null;
}
