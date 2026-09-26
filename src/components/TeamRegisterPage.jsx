import React, { useState } from 'react';
import { 
  Shield, 
  Upload, 
  Check, 
  AlertCircle, 
  KeyRound, 
  ArrowRight, 
  ArrowLeft,
  Mail, 
  User, 
  Phone, 
  Lock, 
  MapPin, 
  CheckCircle2, 
  Sparkles,
  Palette
} from 'lucide-react';
import { api } from '../services/api';

export default function TeamRegisterPage({
  onBackToHome,
  onNavigateLogin,
  onRegistrationComplete
}) {
  const [step, setStep] = useState(1); // 1 = Club & Manager details, 2 = 6-digit OTP verification
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form fields
  const [teamName, setTeamName] = useState('');
  const [shortCode, setShortCode] = useState('');
  const [homeGround, setHomeGround] = useState('');
  const [homeKitColor, setHomeKitColor] = useState('#00E676');
  const [awayKitColor, setAwayKitColor] = useState('#3B82F6');
  const [managerName, setManagerName] = useState('');
  const [managerEmail, setManagerEmail] = useState('');
  const [managerPhone, setManagerPhone] = useState('');
  const [password, setPassword] = useState('');
  const [crestFile, setCrestFile] = useState(null);
  const [crestPreview, setCrestPreview] = useState('');

  // OTP field
  const [otp, setOtp] = useState('');

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
      // Step A: Register Manager Account (dispatches Resend OTP)
      const authRes = await api.register({
        name: managerName.trim(),
        email: managerEmail.trim(),
        password,
        phone: managerPhone.trim(),
        role: 'manager'
      });

      if (!authRes.success) {
        setErrorMsg(authRes.error || 'Failed to create manager account');
        setLoading(false);
        return;
      }

      setStep(2);
      setSuccessMsg(`A 6-digit OTP code has been dispatched to ${managerEmail}.`);
    } catch (err) {
      setErrorMsg(err.message || 'Network error during registration');
    } finally {
      setLoading(false);
    }
  };

  const handleStep2Verify = async (e) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      setErrorMsg('Please enter the 6-digit verification code');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      // 1. Verify OTP with backend
      const verifyRes = await api.verifyOtp(managerEmail.trim(), otp.trim());
      if (!verifyRes.success) {
        setErrorMsg(verifyRes.error || 'Invalid or expired OTP code');
        setLoading(false);
        return;
      }

      // Save token in localStorage
      if (verifyRes.data?.token) {
        localStorage.setItem('skouted_token', verifyRes.data.token);
      }

      // 2. Create the Team Profile
      const formData = new FormData();
      formData.append('name', teamName.trim());
      formData.append('shortCode', shortCode.trim().toUpperCase());
      formData.append('homeGround', homeGround.trim() || 'Official Stadium');
      formData.append('homeKitColor', homeKitColor);
      formData.append('awayKitColor', awayKitColor);
      formData.append('managerName', managerName.trim());
      formData.append('managerEmail', managerEmail.trim());
      formData.append('managerPhone', managerPhone.trim());
      if (crestFile) {
        formData.append('crest', crestFile);
      }

      const teamRes = await api.registerTeam(formData);
      if (teamRes.success) {
        setSuccessMsg('Club registered and manager account verified! Directing to Team Command Center...');
        setTimeout(() => {
          if (onRegistrationComplete) {
            onRegistrationComplete(verifyRes.data?.user);
          } else if (onNavigateLogin) {
            onNavigateLogin();
          }
        }, 1500);
      } else {
        setErrorMsg(teamRes.error || 'Account verified, but club registration failed.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Verification process failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      const res = await api.resendOtp(managerEmail.trim());
      if (res.success) {
        setSuccessMsg('A fresh verification code has been dispatched to your email.');
        setTimeout(() => setSuccessMsg(''), 5000);
      } else {
        setErrorMsg(res.error || 'Failed to resend OTP');
      }
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090E] flex flex-col items-center justify-center p-4 sm:p-6 relative selection:bg-[#00E676] selection:text-black">
      
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#00E676]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Navigation Back Link */}
      <div className="w-full max-w-xl mb-4 flex items-center justify-between z-10">
        <button
          onClick={onBackToHome}
          className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>← Back to League Homepage</span>
        </button>

        <button
          onClick={onNavigateLogin}
          className="text-xs font-bold text-[#00E676] hover:underline cursor-pointer"
        >
          Already Registered? Login →
        </button>
      </div>

      <div className="w-full max-w-xl relative z-10 space-y-6">
        
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-[#00E676]/15 border border-[#00E676]/30 flex items-center justify-center mx-auto text-[#00E676] shadow-xl shadow-[#00E676]/10">
            <Shield className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-white tracking-tight">
            Register Your Club
          </h1>
          <p className="text-xs text-slate-400">
            Skouted Youth League • Under-19 Championship Season 2026/2027
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-bold border ${
            step === 1 
              ? 'bg-[#00E676]/15 border-[#00E676] text-[#00E676]' 
              : 'bg-white/5 border-white/10 text-slate-400'
          }`}>
            <span className="w-4 h-4 rounded-full bg-[#00E676] text-black text-[10px] flex items-center justify-center font-bold">1</span>
            <span>Club & Manager Details</span>
          </div>

          <span className="text-slate-600 font-mono">→</span>

          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-bold border ${
            step === 2 
              ? 'bg-[#00E676]/15 border-[#00E676] text-[#00E676]' 
              : 'bg-white/5 border-white/10 text-slate-400'
          }`}>
            <span className="w-4 h-4 rounded-full bg-white/20 text-white text-[10px] flex items-center justify-center font-bold">2</span>
            <span>Email OTP Verification</span>
          </div>
        </div>

        {/* Main Card Container */}
        <div className="bg-[#121622] border border-[#232838] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-[#00E676]/10 border border-[#00E676]/30 text-[#00E676] text-xs flex items-center gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleStep1Submit} className="space-y-5 text-xs">
              
              {/* Club Information Section */}
              <div className="space-y-3.5">
                <div className="text-[11px] font-mono text-[#00E676] font-bold uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-white/5">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Club Information</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Official Club Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      placeholder="e.g. Lagos City Stars FC"
                      className="w-full bg-[#090B10] border border-[#232838] rounded-2xl px-3.5 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-[#00E676]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Short Code (3-4) *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={5}
                      value={shortCode}
                      onChange={(e) => setShortCode(e.target.value.toUpperCase())}
                      placeholder="LCS"
                      className="w-full bg-[#090B10] border border-[#232838] rounded-2xl px-3.5 py-2.5 text-white font-mono uppercase placeholder-slate-600 focus:outline-none focus:border-[#00E676]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Home Ground / Stadium
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={homeGround}
                      onChange={(e) => setHomeGround(e.target.value)}
                      placeholder="e.g. Legacy Stadium, Surulere"
                      className="w-full bg-[#090B10] border border-[#232838] rounded-2xl pl-10 pr-3.5 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-[#00E676]"
                    />
                  </div>
                </div>

                {/* Kit Colors & Crest Upload */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  
                  {/* Kit Colors */}
                  <div className="space-y-2">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Kit Colors
                    </label>
                    <div className="flex items-center gap-3 bg-[#090B10] border border-[#232838] rounded-2xl p-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400">Home:</span>
                        <input
                          type="color"
                          value={homeKitColor}
                          onChange={(e) => setHomeKitColor(e.target.value)}
                          className="w-7 h-7 rounded-lg border-0 cursor-pointer bg-transparent"
                        />
                      </div>
                      <div className="w-px h-5 bg-white/10" />
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400">Away:</span>
                        <input
                          type="color"
                          value={awayKitColor}
                          onChange={(e) => setAwayKitColor(e.target.value)}
                          className="w-7 h-7 rounded-lg border-0 cursor-pointer bg-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Club Crest Upload */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Club Crest / Logo
                    </label>
                    <label className="flex items-center gap-3 bg-[#090B10] border border-[#232838] hover:border-[#00E676]/50 rounded-2xl p-2.5 cursor-pointer transition-colors">
                      <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                        {crestPreview ? (
                          <img src={crestPreview} alt="Crest" className="w-full h-full object-cover" />
                        ) : (
                          <Upload className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 truncate">
                        {crestFile ? crestFile.name : 'Upload PNG or JPG logo'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCrestChange}
                        className="hidden"
                      />
                    </label>
                  </div>

                </div>
              </div>

              {/* Manager Information Section */}
              <div className="space-y-3.5 pt-2">
                <div className="text-[11px] font-mono text-[#00E676] font-bold uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-white/5">
                  <User className="w-3.5 h-3.5" />
                  <span>Team Manager Credentials</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Manager Full Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={managerName}
                        onChange={(e) => setManagerName(e.target.value)}
                        placeholder="Coach John Doe"
                        className="w-full bg-[#090B10] border border-[#232838] rounded-2xl pl-10 pr-3.5 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-[#00E676]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        required
                        value={managerPhone}
                        onChange={(e) => setManagerPhone(e.target.value)}
                        placeholder="+234 801 234 5678"
                        className="w-full bg-[#090B10] border border-[#232838] rounded-2xl pl-10 pr-3.5 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-[#00E676]"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Official Email *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={managerEmail}
                        onChange={(e) => setManagerEmail(e.target.value)}
                        placeholder="manager@club.com"
                        className="w-full bg-[#090B10] border border-[#232838] rounded-2xl pl-10 pr-3.5 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-[#00E676]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Password *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-[#090B10] border border-[#232838] rounded-2xl pl-10 pr-3.5 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-[#00E676]"
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#00E676] to-[#00C853] text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-[#00E676]/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{loading ? 'Processing Registration...' : 'Continue to Email Verification'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </form>
          ) : (
            
            /* Step 2: 6-digit OTP Verification */
            <form onSubmit={handleStep2Verify} className="space-y-5 text-xs">
              <div className="text-center space-y-2 py-2">
                <div className="w-12 h-12 rounded-2xl bg-[#00E676]/15 border border-[#00E676]/30 flex items-center justify-center mx-auto text-[#00E676]">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white">Enter 6-Digit Verification Code</h3>
                <p className="text-slate-400 text-xs max-w-sm mx-auto">
                  We dispatched a 6-digit one-time passcode to <strong className="text-white">{managerEmail}</strong>. Check your inbox and spam folder.
                </p>
              </div>

              <div>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="• • • • • •"
                  className="w-full bg-[#090B10] border-2 border-[#232838] focus:border-[#00E676] rounded-2xl py-3.5 text-center text-xl font-mono tracking-[0.5em] text-white focus:outline-none transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading || otp.length < 6}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#00E676] to-[#00C853] text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-[#00E676]/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{loading ? 'Verifying Code...' : 'Verify & Launch Team Portal'}</span>
                <Check className="w-4 h-4" />
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
                  onClick={() => setStep(1)}
                  className="text-slate-400 hover:text-white"
                >
                  ← Edit Club Details
                </button>
              </div>
            </form>
          )}

          {/* Bottom Card Footer */}
          <div className="pt-3 border-t border-white/5 text-center text-xs text-slate-400">
            <span>By registering, your club agrees to the </span>
            <span className="text-slate-300 font-semibold">Skouted Youth League Under-19 Tournament Regulations</span>
          </div>

        </div>

      </div>

    </div>
  );
}
