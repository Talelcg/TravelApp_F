import { useState, useEffect } from 'react';
import { login, register } from '../api';
import { useNavigate } from 'react-router-dom';
import { Container, Form, Button, Card, Row, Col } from 'react-bootstrap';
import '../styles/Auth.css';
import { GoogleLogin } from '@react-oauth/google';
import '../styles/Auth.css';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) navigate('/trips');
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isRegister) {
        await register({ email, username, password });
        alert('Account created! Please log in.');
        setIsRegister(false);
      } else {
        const res = await login({ email, password });
        const data = res.data as { accessToken: string; _id: string };
        localStorage.setItem('token', data.accessToken);
        localStorage.setItem('user', JSON.stringify(data._id));
        navigate('/trips');
      }
    } catch (error) {
      alert('Error: ' + ((error as any).data || 'Something went wrong'));
    }
  };

  return (
    <div className="auth-full-background">
      <div className="auth-glass-card">
        <h2 className="text-center mb-4">{isRegister ? 'Sign Up' : 'Log In'}</h2>

        <Form onSubmit={handleSubmit}>
          {isRegister && (
            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </Form.Group>
          )}

          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Form.Group>

          <Button variant="warning" type="submit" className="w-100">
            {isRegister ? 'Create Account' : 'Log In'}
          </Button>
        </Form>

        <Row className="mt-3">
          <Col className="text-center">
            {isRegister ? (
              <p>
                Already have an account?{' '}
                <span className="auth-toggle" onClick={() => setIsRegister(false)}>
                  Log in
                </span>
              </p>
            ) : (
              <p>
                Don’t have an account?{' '}
                <span className="auth-toggle" onClick={() => setIsRegister(true)}>
                  Sign up
                </span>
              </p>
            )}
          </Col>
        </Row>

        <div className="mt-4 w-100">
        <div className="google-login-wrapper">
           <GoogleLogin
            onSuccess={async (credentialResponse) => {
              const res = await fetch("http://localhost:3000/users/google", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ credential: credentialResponse.credential }),
              });

              const data = await res.json();
              if (data.accessToken) {
                localStorage.setItem("token", data.accessToken);
                localStorage.setItem("user", JSON.stringify(data.user._id));
                navigate("/trips");
              } else {
                alert("Google login failed");
              }
            }}
            onError={() => alert("Google Sign-In Failed")}
            width="100%"

          />
        </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
