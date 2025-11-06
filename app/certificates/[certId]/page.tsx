import { getDatabase } from '@/lib/mongodb';
import Link from 'next/link';
import { SiteBrand } from '@/components/layout/SiteBrand';

export const dynamic = 'force-dynamic';

export default async function CertificatePage({ params }: { params: Promise<{ certId: string }> }) {
  const { certId } = await params;
  let cert: any = null;
  try {
    const db = await getDatabase();
    cert = await db.collection('certificates').findOne({ id: certId });
  } catch {}

  if (!cert) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Certificate not found</h1>
          <Link href="/" className="text-blue-600 hover:underline">← Back to Home</Link>
        </div>
      </div>
    );
  }

  const isExpired = new Date(cert.expiresAt).getTime() < Date.now();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12">
      <header className="container mx-auto px-4 mb-8">
        <SiteBrand />
      </header>
      <main className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-12 border-4 border-indigo-600">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🎓</div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Certificate of Completion</h1>
            <p className="text-gray-600 dark:text-gray-400">This certifies that</p>
          </div>
          
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-4">{cert.userName}</h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-2">has successfully completed</p>
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">{cert.courseTitle}</h3>
          </div>

          <div className="border-t-2 border-gray-300 dark:border-gray-600 pt-8 mt-8">
            <div className="grid md:grid-cols-2 gap-8 text-sm text-gray-600 dark:text-gray-400">
              <div>
                <p className="font-semibold mb-1">Issued On</p>
                <p>{new Date(cert.issuedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              <div>
                <p className="font-semibold mb-1">Certificate ID</p>
                <p className="font-mono text-xs">{cert.id}</p>
              </div>
            </div>
            {isExpired && (
              <div className="mt-4 p-3 bg-yellow-100 dark:bg-yellow-900 rounded text-yellow-800 dark:text-yellow-200 text-sm">
                ⚠️ This certificate expired on {new Date(cert.expiresAt).toLocaleDateString()}
              </div>
            )}
          </div>

          <div className="mt-8 text-center">
            <Link href={cert.verificationUrl} className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
              Verify this certificate
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

