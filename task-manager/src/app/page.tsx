'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'
import { Button } from '@/components/ui/button'
import Navbar from '@/components/ui/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckSquare, Users, Calendar, Zap } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500 text-xl">Loading...</div>
      </div>
    )
  }

  if (user) {
    return null // Will redirect to dashboard
  }

  return (
    <>
      <Navbar />
   
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col justify-center pt-24">
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">Task Manager</h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Organize your tasks, boost your productivity, and achieve your goals with our intuitive task management system.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/dashboard">
              <Button size="lg" className="w-full sm:w-auto px-8 py-4">
                Get Started
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="w-full sm:w-auto px-8 py-4">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {/* Feature Card */}
          {[
            {
              icon: <CheckSquare className="w-12 h-12 text-blue-600 mx-auto mb-4" />,
              title: 'Task Management',
              description:
                'Create, edit, and organize your tasks with ease. Mark them as complete when done.',
            },
            {
              icon: <Users className="w-12 h-12 text-green-600 mx-auto mb-4" />,
              title: 'Categories',
              description:
                'Organize tasks by categories and projects for better structure and focus.',
            },
            {
              icon: <Calendar className="w-12 h-12 text-purple-600 mx-auto mb-4" />,
              title: 'Due Dates',
              description:
                'Set deadlines and reminders to stay on track with your important tasks.',
            },
            {
              icon: <Zap className="w-12 h-12 text-orange-600 mx-auto mb-4" />,
              title: 'Responsive',
              description:
                'Access your tasks anywhere with our mobile-friendly responsive design.',
            },
          ].map((feature, index) => (
            <Card key={index} className="text-center shadow hover:shadow-lg transition-shadow duration-300 rounded-lg bg-white p-6">
              <CardHeader>
                {feature.icon}
                <CardTitle className="text-xl font-semibold mt-2">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action Section */}
        <div className="flex justify-center mb-12">
          <div className="max-w-2xl w-full bg-white p-8 rounded-lg shadow-lg text-center space-y-4">
            <h2 className="text-3xl font-bold mb-4">Ready to get organized?</h2>
            <p className="text-gray-600 mb-6">
              Join thousands of users who have transformed their productivity with our task management system.
            </p>
            <Link href="/dashboard">
              <Button size="lg" className="px-8 py-4">
                Start Managing Tasks Today
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
   </>
  )
}