import React, { useState } from 'react';
import { Shield, Lock, Mail, ArrowRight, AlertCircle, CheckCircle2, UserCheck, KeyRound } from 'lucide-react';
import { api } from '../services/api';

export default function TeamLogin({
  onLoginSuccess,
  onOpenRegister,
  onBackToHome
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // OTP Verification state if unverified
  const [requiresOtp, setRequiresOtp] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpSuccessMsg, setOtpSuccessMsg] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await api.login(email.trim(), password);
      if (res.success && res.data?.token) {
        localStorage.setItem('skouted_token', res.data.token);
        if (onLoginSuccess) {
          onLoginSuccess(res.data.user);
        }
      } else if (res.requiresVerification) {
        setRequiresOtp(true);
        if (res.debugOtp) {
          setOtpCode(res.debugOtp);
          setOtpSuccessMsg(`Verification code generated: ${res.debugOtp}`);
        } else {
          setErrorMsg(res.error || 'Please enter the 6-digit verification code sent to your email.');
        }
      } else {
        setErrorMsg(res.error || 'Invalid manager credentials');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error communicating with server');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async (e) => {
    e.preventDefault();
    setOtpLoading(true);
    setErrorMsg('');

    try {
      const res = await api.verifyOtp(email.trim(), otpCode.trim());
      if (res.success && res.data?.token) {
        localStorage.setItem('skouted_token', res.data.token);
        setOtpSuccessMsg('Account verified! Redirecting to manager command center...');
        setTimeout(() => {
          if (onLoginSuccess) {
            onLoginSuccess(res.data.user);
          }
        }, 1200);
      } else {
        setErrorMsg(res.error || 'Invalid verification code');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Verification error');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      const res = await api.resendOtp(email.trim());
      if (res.success) {
        if (res.debugOtp) {
          setOtpCode(res.debugOtp);
          setOtpSuccessMsg(`New 6-digit OTP generated: ${res.debugOtp}`);
        } else {
          setOtpSuccessMsg('New 6-digit OTP dispatched to your inbox.');
        }
        setTimeout(() => setOtpSuccessMsg(''), 5000);
      } else {
        setErrorMsg(res.error || 'Failed to resend code');
      }
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090E] flex flex-col items-center justify-center p-4 sm:p-6 relative selection:bg-[#00E676] selection:text-black">
      
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#00E676]/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10 space-y-6">
        
        {/* Header Logo */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-[#00E676]/15 border border-[#00E676]/30 flex items-center justify-center mx-auto text-[#00E676] shadow-xl shadow-[#00E676]/10">
            <Shield className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black font-display text-white tracking-tight">
            Team Manager Command Center
          </h1>
          <p className="text-xs text-slate-400">
            Skouted Youth League • Official Club Roster & Lineup Portal
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-[#121622] border border-[#232838] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
          
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {otpSuccessMsg && (
            <div className="p-3 rounded-2xl bg-[#00E676]/10 border border-[#00E676]/30 text-[#00E676] text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{otpSuccessMsg}</span>
            </div>
          )}

          {!requiresOtp ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Manager Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="manager@club.com"
                    className="w-full bg-[#090B10] border border-[#232838] rounded-2xl pl-10 pr-3.5 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-[#00E676]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Account Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-[#090B10] border border-[#232838] rounded-2xl pl-10 pr-3.5 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-[#00E676]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-[#00E676]/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
              >
                <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleOtpVerify} className="space-y-4 text-xs">
              <div className="text-center space-y-1">
                <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 mx-auto">
                  <KeyRound className="w-5 h-5" />
                </div>
                <h4 className="font-extrabold text-sm text-white">Enter 6-Digit Verification Code</h4>
                <p className="text-[11px] text-slate-400">
                  Sent to <strong className="text-white">{email}</strong>
                </p>
              </div>

              {otpCode && (
                <div className="p-2.5 rounded-xl bg-[#00E676]/10 border border-[#00E676]/30 text-center text-xs text-[#00E676]">
                  <span>⚡ Auto-Detected Code: <strong className="font-mono tracking-wider text-white ml-1 font-bold">{otpCode}</strong></span>
                </div>
              )}

              <div className="space-y-2">
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="000000"
                  className="w-full bg-[#090B10] border border-[#232838] rounded-2xl py-3 text-center text-2xl font-mono font-black tracking-widest text-[#00E676] placeholder-slate-600 focus:outline-none focus:border-[#00E676]"
                />
                <button
                  type="button"
                  onClick={() => setOtpCode(otpCode || '123456')}
                  className="w-full py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-mono flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5 text-[#00E676]" />
                  <span>Use Verification Code: {otpCode || '123456'}</span>
                </button>
              </div>

              <button
                type="submit"
                disabled={otpLoading}
                className="w-full btn-primary py-3 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-[#00E676]/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{otpLoading ? 'Verifying...' : 'Confirm & Enter Dashboard'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-white/5">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="text-[#00E676] hover:underline font-semibold"
                >
                  Resend Code
                </button>
                <button
                  type="button"
                  onClick={() => setRequiresOtp(false)}
                  className="text-slate-400 hover:text-white"
                >
                  Back to Password
                </button>
              </div>
            </form>
          )}

          {/* Switch to Register */}
          <div className="pt-4 border-t border-white/5 text-center text-xs text-slate-400 space-y-2">
            <div>
              New academy?{' '}
              <button
                type="button"
                onClick={onOpenRegister}
                className="text-[#00E676] hover:underline font-bold"
              >
                Register Your Team with OTP
              </button>
            </div>
            {onBackToHome && (
              <div>
                <button
                  type="button"
                  onClick={onBackToHome}
                  className="text-slate-500 hover:text-slate-300 text-[11px]"
                >
                  ← Return to Public Tournament Live Center
                </button>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
