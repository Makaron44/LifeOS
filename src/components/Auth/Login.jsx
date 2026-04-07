import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import './Login.css'

export const Login = () => {
  const { signIn, signUp } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)
    
    try {
      if (isSignUp) {
        const { error } = await signUp({ email, password })
        if (error) throw error
        setMessage('Sprawdź pocztę email, aby potwierdzić rejestrację!')
      } else {
        const { error } = await signIn({ email, password })
        if (error) throw error
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>{isSignUp ? 'Utwórz konto LifeOS' : 'Zaloguj się do LifeOS'}</h2>
        
        {error && <div className="auth-alert error">{error}</div>}
        {message && <div className="auth-alert success">{message}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" 
              required 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>
          <div className="form-group">
            <label>Hasło</label>
            <input 
              type="password" 
              required 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
          </div>
          <button type="submit" className="primary-btn submit-btn" disabled={loading}>
            {loading ? 'Ładowanie...' : (isSignUp ? 'Zarejestruj' : 'Zaloguj')}
          </button>
        </form>

        <p className="auth-switch">
          {isSignUp ? 'Masz już konto?' : 'Nie masz konta?'}
          <button type="button" className="switch-btn" onClick={() => setIsSignUp(!isSignUp)}>
            {isSignUp ? 'Zaloguj się' : 'Zarejestruj się'}
          </button>
        </p>
      </div>
    </div>
  )
}
