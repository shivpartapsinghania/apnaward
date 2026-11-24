import { FormEvent, useState } from 'react';
import { LockKeyhole, Mail, ShieldCheck, User, X } from 'lucide-react';
import { INDIA_STATES_AND_UTS } from '../data/indiaLocations';
import type { UserProfile } from '../types/civic';
import { recoverCloudPassword, signInCloud, signUpCloud, updateCloudProfile } from '../utils/cloud';

type Props = {
  profile?: UserProfile | null;
  cloudEmail?: string | null;
  onClose: () => void;
  onSuccess: (email: string) => void;
  onProfileUpdated?: (profile: UserProfile) => void;
};

export function CloudAccountModal({ profile, cloudEmail, onClose, onSuccess, onProfileUpdated }: Props) {
  const [mode, setMode] = useState<'signin' | 'signup' | 'recover' | 'profile'>(
    cloudEmail ? 'profile' : 'signin'
  );
  const [name, setName] = useState(profile?.display_name ?? '');
  const [email, setEmail] = useState(cloudEmail ?? '');
  const [password, setPassword] = useState('');
  const [stateCode, setStateCode] = useState(profile?.state_code ?? '');
  const [cityName, setCityName] = useState(profile?.city_name ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setMessage('');
    try {
      if (mode === 'profile') {
        if (name.trim().length < 2) throw new Error('Enter your name (at least 2 characters).');
        const updated = await updateCloudProfile({
          display_name: name.trim(),
        });
        if (updated) onProfileUpdated?.(updated);
        setMessage('Profile updated.');
      } else if (mode === 'recover') {
        await recoverCloudPassword(email.trim());
        setMessage('If an account exists for that email, a password reset link has been sent.');
      } else if (mode === 'signup') {
        if (name.trim().length < 2) throw new Error('Enter your name (at least 2 characters).');
        const user = await signUpCloud(email.trim(), password, name.trim());
        if (!user?.id) {
          setMessage('Check your email to confirm your account, then sign in.');
          setMode('signin');
          return;
        }
        onSuccess(user.email || email.trim());
      } else {
        const user = await signInCloud(email.trim(), password);
        onSuccess(user.email || email.trim());
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not complete account request.');
    } finally {
      setBusy(false);
    }
  }

  const roleLabels: Record<string, string> = {
    resident: 'Resident',
    ward_admin: 'Ward Admin',
    city_admin: 'City Admin',
    platform_admin: 'Platform Admin',
  };

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/55 p-4"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="cloud-account-title"
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-blue-600">ApnaWard Cloud</p>
            <h2 id="cloud-account-title" className="mt-1 text-xl font-bold text-slate-900">
              {mode === 'profile'
                ? 'Your ApnaWard Profile'
                : mode === 'recover'
                  ? 'Reset your password'
                  : mode === 'signin'
                    ? 'Sign in to ApnaWard'
                    : 'Create your resident account'}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {mode === 'profile'
                ? 'Roles are verified server-side and cannot be self-promoted.'
                : 'Cloud reports sync across devices. Demo data stays local.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        {mode === 'profile' && profile && (
          <div className="mb-4 flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50/70 px-3.5 py-2.5 text-xs">
            <span className="flex items-center gap-1.5 font-semibold text-blue-900">
              <ShieldCheck size={15} className="text-blue-700" />
              Role: {roleLabels[profile.role] ?? profile.role}
            </span>
            <span className="text-slate-600 truncate max-w-[180px]">{cloudEmail}</span>
          </div>
        )}

        <form onSubmit={submit} className="space-y-3">
          {(mode === 'signup' || mode === 'profile') && (
            <label className="block text-sm font-medium text-slate-700">
              <span className="flex items-center gap-2">
                <User size={14} /> Full name
              </span>
              <input
                required
                minLength={2}
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-blue-500"
                placeholder="Your name"
              />
            </label>
          )}

          {mode === 'profile' && profile && (profile.state_code || profile.city_name) && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-600">
              <span className="font-semibold text-slate-800">Assigned Scope:</span>{' '}
              {[profile.city_name, profile.state_code].filter(Boolean).join(', ')}
            </div>
          )}

          {mode !== 'profile' && (
            <label className="block text-sm font-medium text-slate-700">
              <span className="flex items-center gap-2">
                <Mail size={14} /> Email address
              </span>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-blue-500"
                placeholder="you@example.com"
              />
            </label>
          )}

          {(mode === 'signin' || mode === 'signup') && (
            <label className="block text-sm font-medium text-slate-700">
              <span className="flex items-center gap-2">
                <LockKeyhole size={14} /> Password
              </span>
              <input
                required
                type="password"
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-blue-500"
                placeholder="At least 8 characters"
              />
            </label>
          )}

          {error && (
            <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          )}
          {message && (
            <p role="status" className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">
              {message}
            </p>
          )}

          <button
            disabled={busy}
            className="w-full rounded-xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
          >
            {busy
              ? 'Please wait…'
              : mode === 'profile'
                ? 'Save profile'
                : mode === 'recover'
                  ? 'Send reset link'
                  : mode === 'signin'
                    ? 'Sign in'
                    : 'Create account'}
          </button>
        </form>

        {mode !== 'profile' && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-500">
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'signin' ? 'signup' : 'signin');
                setError('');
                setMessage('');
              }}
              className="font-semibold text-blue-700 hover:underline"
            >
              {mode === 'signin' ? 'Create resident account' : 'Back to sign in'}
            </button>
            {mode === 'signin' && (
              <button
                type="button"
                onClick={() => {
                  setMode('recover');
                  setError('');
                  setMessage('');
                }}
                className="text-xs font-medium text-slate-600 hover:text-blue-700 hover:underline"
              >
                Forgot password?
              </button>
            )}
          </div>
        )}

        <p className="mt-4 text-[11px] leading-relaxed text-slate-400">
          Use a verified Supabase project. New public accounts receive the resident role only; administrator access is assigned separately by a trusted project owner.
        </p>
      </section>
    </div>
  );
}
