import React, { useState } from 'react'
import adminAPI from '../services/apiService'
import logo from '../assets/images/logo.png'

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await adminAPI.login(formData.username, formData.password)

      if (result.success) {
        console.log('Login successful, token stored:', !!result.data.token)
        console.log('User data:', result.data.user)
        onLogin()
      } else {
        console.error('Login failed:', result.error)
        setError(result.error)
      }
    } catch (error) {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-bg-shape shape1"></div>
      <div className="login-bg-shape shape2"></div>
      <div className="login-bg-shape shape3"></div>

      <div
        className="login-box"
        style={{
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
        }}
      >
        <div className="login-logo">
          <img
            src={logo}
            alt="PAMSFORCE Logo"
            className="login-logo-img"
            style={{ width: '120px', height: 'auto', marginBottom: '10px' }}
          />
          <h2>PAMSFORCE</h2>
          <p>Admin Portal</p>
        </div>

        <div className="card" style={{ borderRadius: '12px' }}>
          <div className="card-body login-card-body">
            <p className="login-box-msg">Sign in to start your session</p>

            {error && (
              <div className="alert alert-danger alert-dismissible">
                <button type="button" className="close" data-dismiss="alert" aria-hidden="true">&times;</button>
                <i className="icon fas fa-ban"></i> {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="input-group mb-3">
                <input
                  type="text"
                  id="username"
                  name="username"
                  className="form-control"
                  placeholder="Username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                />
                <div className="input-group-append">
                  <div className="input-group-text">
                    <span className="fas fa-user"></span>
                  </div>
                </div>
              </div>

              <div className="input-group mb-3">
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="form-control"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                />
                <div className="input-group-append">
                  <div className="input-group-text">
                    <span className="fas fa-lock"></span>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-12">
                  <button
                    type="submit"
                    className="btn btn-primary btn-block"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        Signing In...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </button>
                </div>
              </div>
            </form>

            {/* Removed Google Sign-In and Dark Mode sections */}

            <p className="mb-1 mt-3">
              <a href="#">I forgot my password</a>
            </p>
            <p className="mb-0">
              <a href="#" className="text-center">Register a new membership</a>
            </p>
          </div>
        </div>
      </div>

      {/* Background shapes for visual appeal */}
      <div className="login-bg-shape shape1"></div>
      <div className="login-bg-shape shape2"></div>
      <div className="login-bg-shape shape3"></div>
    </div>
  )
}

export default Login
