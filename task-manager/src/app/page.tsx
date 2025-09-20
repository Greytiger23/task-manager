'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'
import { Button } from '@/components/ui/button'
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  if (user) {
    return null // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Task Manager
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Organize your tasks, boost your productivity, and achieve your goals with our intuitive task management system.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" className="w-full sm:w-auto">
                Get Started
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="text-center">
            <CardHeader>
              <CheckSquare className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <CardTitle className="text-lg">Task Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Create, edit, and organize your tasks with ease. Mark them as complete when done.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Users className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <CardTitle className="text-lg">Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Organize tasks by categories and projects for better structure and focus.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Calendar className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <CardTitle className="text-lg">Due Dates</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Set deadlines and reminders to stay on track with your important tasks.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Zap className="w-12 h-12 text-orange-600 mx-auto mb-4" />
              <CardTitle className="text-lg">Responsive</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Access your tasks anywhere with our mobile-friendly responsive design.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Ready to get organized?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-6">
                Join thousands of users who have transformed their productivity with our task management system.
              </p>
              <Link href="/auth/signup">
                <Button size="lg">
                  Start Managing Tasks Today
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
