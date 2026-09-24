import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ShieldCheck, Lock, Mail, Eye, EyeOff } from 'lucide-react';

export function LoginPage() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@pennypay.in');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }
    try {
      await login(email, password);
      navigate('/admin/dashboard');
    } catch {
      setError('Unable to sign in. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-pp-bg-soft flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-pp-accent rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-pp-accent/20">
            <span className="text-white font-bold text-xl">PP</span>
          </div>
          <h1 className="text-2xl font-bold text-pp-text">PENNY PAY</h1>
          <p className="text-sm text-pp-text-secondary mt-1">Admin Portal</p>
        </div>

        {/* Login card */}
        <div className="bg-white border border-pp-border rounded-xl shadow-sm p-6 sm:p-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-pp-text mb-1">Sign In</h2>
            <p className="text-sm text-pp-text-secondary">
              Enter your credentials to access the admin panel.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email / Mobile"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@pennypay.in"
              prefix={<Mail className="w-4 h-4" />}
              autoComplete="username"
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                prefix={<Lock className="w-4 h-4" />}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[34px] text-pp-text-muted hover:text-pp-text transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && (
              <div className="px-3 py-2.5 bg-pp-error-soft border border-pp-error-border rounded-lg text-sm text-pp-error">
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full"
            >
              Sign In
            </Button>
          </form>

          <div className="mt-5 text-center">
            <button className="text-sm text-pp-text-secondary hover:text-pp-accent transition-colors">
              Forgot Password?
            </button>
          </div>
        </div>

        {/* Security note */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-pp-text-muted">
          <ShieldCheck className="w-4 h-4" />
          <span>Authorized personnel only. All actions are logged.</span>
        </div>

        {/* Demo credentials note */}
        <div className="mt-4 text-center">
          <p className="text-xs text-pp-text-muted">
            Demo credentials are pre-filled. Click Sign In to continue.
          </p>
        </div>
      </div>
    </div>
  );
}
