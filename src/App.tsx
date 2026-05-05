import { useState, useEffect } from 'react'
import type { User } from '@supabase/supabase-js'
import './App.css'
import { supabase } from './lib/supabaseClient'
import type { View } from './types'
import NavBar from './components/NavBar'
import HomeView from './components/HomeView'
import ProductListView from './components/ProductListView'
import SignInView from './components/SignInView'
import SignUpView from './components/SignUpView'

function App() {

  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

  const [view, setView] = useState<View>('home')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setAuthLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)

      if (event === 'SIGNED_IN') setView('list')
      if (event === 'SIGNED_OUT') setView('home')
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) console.error('Error signing out:', error.message)
  }

  if (authLoading) {
    return (
      <div className="app">
        <p className="loading-msg">Loading...</p>
      </div>
    )
  }

  return (
    <div className="app">
      <NavBar
        currentView={view}
        setView={setView}
        user={user}
        onSignOut={handleSignOut}
      />

      {/* Render exactly one view at a time. */}
      {view === 'home' && <HomeView user={user} setView={setView} />}
      {view === 'list' && <ProductListView user={user} />}
      {view === 'signin' && <SignInView setView={setView} />}
      {view === 'signup' && <SignUpView setView={setView} />}
    </div>
  )
}

export default App
