'use client';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import Link from 'next/link';

const ALL_TOOLS = [
  {
    id: 'code-editor',
    name: 'Code Editor',
    icon: '💻',
    description: 'Interactive JavaScript code editor. Write, test, and debug code in real-time.',
    href: '/shop/code-editor',
    color: 'from-blue-500 to-cyan-500',
    price: 'FREE'
  },
  {
    id: 'whiteboard',
    name: 'Digital Whiteboard',
    icon: '🖍️',
    description: 'Sketch diagrams, solve math problems, or create visual notes.',
    href: '/shop/whiteboard',
    color: 'from-purple-500 to-pink-500',
    price: 'FREE'
  },
  {
    id: 'ai-analyzer',
    name: 'Neural Insight Analyzer',
    icon: '🧠',
    price: '$49.99',
    description: 'AI analysis tool for learning patterns and knowledge gaps',
    color: 'from-orange-500 to-red-500'
  },
  {
    id: 'proctor-shield',
    name: 'Proctor Shield v2',
    icon: '🛡️',
    price: '$129.00',
    description: 'Enterprise-grade proctoring with biometric verification',
    color: 'from-green-500 to-emerald-500'
  }
];

export default function ToolsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-elite-bg py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-black mb-4">🛠️ Tools & Resources</h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            Access all your tools in one unified dashboard
          </p>
        </div>

        {/* All Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ALL_TOOLS.map((tool, idx) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Link href={tool.href || '#'}>
                <Card className="h-full cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:scale-105 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                  <div className="p-8">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${tool.color} flex items-center justify-center text-4xl mb-4`}>
                      {tool.icon}
                    </div>
                    <h3 className="text-2xl font-black mb-2">{tool.name}</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      {tool.description}
                    </p>
                    <div className="flex items-center justify-between gap-4">
                      <span className={`text-lg font-black ${
                        tool.price === 'FREE' 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500'
                      }`}>
                        {tool.price}
                      </span>
                      <Button className={`${tool.price === 'FREE' ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700' : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'}`}>
                        {tool.price === 'FREE' ? 'Open →' : 'Get Now →'}
                      </Button>
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
