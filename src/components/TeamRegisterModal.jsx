import React, { useState } from 'react';
import { X, Shield, Upload, Check, AlertCircle, KeyRound, ArrowRight } from 'lucide-react';
import { api } from '../services/api';

export default function TeamRegisterModal({
  isOpen,
  onClose,
  onRegistered
}) {
  const [step, setStep] = useState(1); // 1 = Registration form, 2 = 6-digit OTP verification
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form fields
  const [teamName, setTeamName] = useState('');
  const [shortCode, setShortCode] = useState('');
  const [homeGround, setHomeGround] = useState('');
  const [managerName, setManagerName] = useState('');
  const [managerEmail, setManagerEmail] = useState('');
  const [managerPhone, setManagerPhone] = useState('');
  const [password, setPassword] = useState('');
  const [crestFile, setCrestFile] = useState(null);
  const [crestPreview, setCrestPreview] = useState('');

  // OTP field
  const [otp, setOtp] = useState('');

  if (!isOpen) return null;

  const handleCrestChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCrestFile(file);
      setCrestPreview(URL.createObjectURL(file));
    }
  };

  const handleStep1Submit = async (e) => {
    e.preventDefault();
    if (!teamName || !shortCode || !managerName || !managerEmail || !password) {
      setErrorMsg('Please complete all required fields');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      // Step A: Register Manager Account (Triggers Resend OTP)
      const authRes = await api.register({
        name: managerName,
        email: managerEmail,
        password,
        phone: managerPhone,
        role: 'manager'
      });

      if (!authRes.success) {
        setErrorMsg(authRes.error || 'Failed to create account');
        setLoading(false);
        return;
      }

      const userId = authRes.data?.userId;
      if (authRes.data?.debugOtp) {
        setOtp(authRes.data.debugOtp);
      }

      // Step B: Create Team with optional crest file
      const formData = new FormData();
      formData.append('name', teamName);
      formData.append('shortCode', shortCode.toUpperCase());
      formData.append('homeGround', homeGround);
      formData.append('managerName', managerName);
      formData.append('managerEmail', managerEmail);
      formData.append('managerPhone', managerPhone);
      if (userId) formData.append('userId', userId);
      if (crestFile) formData.append('crest', crestFile);

      const teamRes = await api.createTeam(formData);
      if (teamRes.success) {
        setSuccessMsg(authRes.data?.debugOtp 
          ? `Verification code generated: ${authRes.data.debugOtp}`
          : `A 6-digit confirmation code has been sent to ${managerEmail}`);
        setStep(2); // Advance to OTP step
      } else {
        setErrorMsg(teamRes.error || 'Failed to register team');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Registration error');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setErrorMsg('Please enter the 6-digit code sent to your email');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await api.verifyOtp(managerEmail, otp);
      if (res.success) {
        if (res.data?.token) {
          localStorage.setItem('skouted_token', res.data.token);
        }
        setSuccessMsg('Account verified! Welcome to Skouted League.');
        if (onRegistered) onRegistered(res.data?.user);
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setErrorMsg(res.error || 'Verification code invalid or expired');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Verification error');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setLoading(true);
      const res = await api.resendOtp(managerEmail);
      if (res.success) {
        if (res.debugOtp) {
          setOtp(res.debugOtp);
          setSuccessMsg(`New 6-digit verification code: ${res.debugOtp}`);
        } else {
          setSuccessMsg('New 6-digit verification code dispatched!');
        }
        setTimeout(() => setSuccessMsg(''), 5000);
      } else {
        setErrorMsg(res.error || 'Failed to resend code');
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="w-full max-w-lg bg-[#141720] border border-[#252A38] rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#1E2330] flex items-center justify-between bg-[#10131B]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#00E676]/15 border border-[#00E676]/30 flex items-center justify-center text-[#00E676]">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-black text-white text-base">Club Onboarding & Registration</h3>
              <p className="text-[11px] text-slate-400">
                {step === 1 ? 'Step 1 of 2: Club & Manager Profile' : 'Step 2 of 2: 6-Digit Resend OTP Verification'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          
          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-[#00E676]/15 border border-[#00E676]/30 rounded-xl text-xs text-[#00E676] font-bold flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleStep1Submit} className="space-y-4">
              
              {/* Crest Upload Dropzone */}
              <div className="flex items-center gap-4 p-3 bg-[#0D0F14] border border-[#222735] rounded-2xl">
                <div className="relative w-16 h-16 rounded-2xl bg-[#1A1D28] border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                  {crestPreview ? (
                    <img src={crestPreview} alt="Crest preview" className="w-full h-full object-cover" />
                  ) : (
                    <Shield className="w-7 h-7 text-slate-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-white mb-0.5">Team Crest / Logo</div>
                  <p className="text-[11px] text-slate-400 mb-2">Upload square PNG or JPG badge (Cloudinary CDN)</p>
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 transition-all">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Choose Badge</span>
                    <input type="file" accept="image/*" onChange={handleCrestChange} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Club Name & Short Code */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Club Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lagos Rising Stars"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="w-full bg-[#0D0F14] border border-[#252A38] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00E676]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Short Code *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={4}
                    placeholder="LRS"
                    value={shortCode}
                    onChange={(e) => setShortCode(e.target.value.toUpperCase())}
                    className="w-full bg-[#0D0F14] border border-[#252A38] rounded-xl px-3 py-2 text-xs text-white font-mono uppercase focus:outline-none focus:border-[#00E676]"
                  />
                </div>
              </div>

              {/* Home Ground */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Home Ground / Stadium
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mobolaji Johnson Arena, Onikan"
                  value={homeGround}
                  onChange={(e) => setHomeGround(e.target.value)}
                  className="w-full bg-[#0D0F14] border border-[#252A38] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00E676]"
                />
              </div>

              {/* Manager Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Manager / Coach Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Coach Babatunde"
                    value={managerName}
                    onChange={(e) => setManagerName(e.target.value)}
                    className="w-full bg-[#0D0F14] border border-[#252A38] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00E676]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Manager Phone
                  </label>
                  <input
                    type="tel"
                    placeholder="+234 803 000 0000"
                    value={managerPhone}
                    onChange={(e) => setManagerPhone(e.target.value)}
                    className="w-full bg-[#0D0F14] border border-[#252A38] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00E676]"
                  />
                </div>
              </div>

              {/* Manager Email & Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Manager Email (Receives OTP) *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="coach@club.com"
                    value={managerEmail}
                    onChange={(e) => setManagerEmail(e.target.value)}
                    className="w-full bg-[#0D0F14] border border-[#252A38] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00E676]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Account Password *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Min 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#0D0F14] border border-[#252A38] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00E676]"
                  />
                </div>
              </div>

              {/* Submit Step 1 */}
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 rounded-xl font-bold text-xs uppercase tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-[#00E676]/20 disabled:opacity-50"
              >
                <span>{loading ? 'Submitting Club Details...' : 'Continue to Email OTP Verification'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            // STEP 2: 6-DIGIT OTP VERIFICATION
            <form onSubmit={handleOtpVerify} className="space-y-5 py-4">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-2xl bg-[#00E676]/15 border border-[#00E676]/30 flex items-center justify-center mx-auto text-[#00E676]">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-white">Enter 6-Digit Verification Code</h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  We dispatched a 6-digit security code to <strong className="text-white">{managerEmail}</strong>
                </p>
              </div>

              {otp && (
                <div className="p-2.5 rounded-xl bg-[#00E676]/10 border border-[#00E676]/30 text-center text-xs text-[#00E676] max-w-xs mx-auto">
                  <span>⚡ Auto-Detected Code: <strong className="font-mono tracking-wider text-white ml-1 font-bold">{otp}</strong></span>
                </div>
              )}

              {/* OTP Digits Input */}
              <div className="max-w-[240px] mx-auto">
                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="• • • • • •"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-[#0D0F14] border-2 border-[#00E676] rounded-2xl py-3 px-4 text-center text-2xl font-mono font-black tracking-[10px] text-[#00E676] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full btn-primary py-3 rounded-xl font-bold text-xs uppercase tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-[#00E676]/20 disabled:opacity-50"
              >
                {loading ? 'Verifying Code...' : 'Confirm OTP & Activate Club Portal'}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="text-xs text-slate-400 hover:text-[#00E676] underline transition-colors"
                >
                  Didn't receive email? Resend 6-digit OTP
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}
