'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

interface EnrollButtonProps {
    courseId: string;
    slug: string;
    price: number;
    currency?: string;
    userId: string | null;
    isEnrolled: boolean;
    className?: string;
    size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function EnrollButton({
    courseId,
    slug,
    price,
    currency = 'USD',
    userId,
    isEnrolled,
    className,
    size = 'lg'
}: EnrollButtonProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    // 1. Not Logged In
    if (!userId) {
        return (
            <Button
                asChild
                className={`w-full bg-teal-600 hover:bg-teal-700 font-bold ${className}`}
                size={size}
            >
                <Link href={`/sign-in?redirect_url=${encodeURIComponent(`/courses/${slug}`)}`}>
                    {price > 0 ? `Enroll for ${currency === 'USD' ? '$' : currency}${price}` : 'Enroll for Free'}
                </Link>
            </Button>
        );
    }

    // 2. Already Enrolled
    if (isEnrolled) {
        // We assume the parent component handles the "Continue Learning" link logic if it knows the first lesson.
        // However, if this button is used in a context where we just want to say "Enrolled", we can link to the course page root.
        // Or better, let the parent handle the "Continue" button and only use this for Enrollment action.
        // For now, let's render a disabled or "View Course" button if mistakenly used when enrolled.
        return (
            <Button
                className={`w-full bg-teal-600 hover:bg-teal-700 font-bold ${className}`}
                size={size}
                onClick={() => router.push(`/courses/${slug}`)}
            >
                Continue Learning
            </Button>
        );
    }

    const handleEnroll = async () => {
        try {
            setIsLoading(true);

            // Paid Course -> Checkout
            if (price > 0) {
                router.push(`/checkout?courseId=${courseId || slug}&amount=${price}`);
                return;
            }

            // Free Course -> Direct Enrollment
            const res = await fetch('/api/enrollments/enroll', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    courseId,
                    courseSlug: slug,
                }),
            });

            if (!res.ok) {
                throw new Error('Enrollment failed');
            }

            const data = await res.json();

            if (data.success) {
                router.refresh(); // Refresh server components to show course content
            }
        } catch (error) {
            console.error('Enrollment error:', error);
            alert('Failed to enroll. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            className={`w-full bg-teal-600 hover:bg-teal-700 font-bold ${className}`}
            size={size}
            onClick={handleEnroll}
            disabled={isLoading}
        >
            {isLoading ? (
                <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enrolling...
                </>
            ) : (
                price > 0
                    ? `Enroll for ${currency === 'USD' ? '$' : currency}${price}`
                    : 'Enroll for Free'
            )}
        </Button>
    );
}
