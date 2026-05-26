'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function TestPage() {
  const [result, setResult] = useState('')

  const testSignup = async () => {
    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email: 'test123@example.com',
      password: 'testpassword123',
    })
    setResult(JSON.stringify({ data, error }, null, 2))
  }

  return (
    <div className="p-8">
      <button
        onClick={testSignup}
        className="bg-orange-500 text-white px-4 py-2 rounded"
      >
        Test Signup
      </button>
      <pre className="mt-4 text-sm bg-gray-100 p-4 rounded overflow-auto">
        {result}
      </pre>
    </div>
  )
}
