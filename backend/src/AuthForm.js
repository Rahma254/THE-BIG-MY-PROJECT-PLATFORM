// src/components/AuthForm.js
'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { FaGoogle, FaGithub } from 'react-icons/fa'; // Menggunakan ikon untuk tombol OAuth

export default function AuthForm() {
  // State untuk form
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [day, setDay] = useState('1');
  const [month, setMonth] = useState('1');
  const [year, setYear] = useState('2000');
  const [gender, setGender] = useState('');

  // State untuk UI/UX
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false); // State untuk loading

  const router = useRouter();
  const supabase = createClientComponentClient();

  // Fungsi untuk menangani pendaftaran
  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    if (!firstName || !lastName || !gender) {
      setError("Semua field pendaftaran wajib diisi!");
      setLoading(false);
      return;
    }

    const dateOfBirth = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    const fullName = `${firstName} ${lastName}`;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Data ini akan dikirim ke trigger di database untuk mengisi tabel 'profiles'
        data: {
          full_name: fullName,
          date_of_birth: dateOfBirth,
          gender: gender,
          // Avatar default menggunakan DiceBear API berdasarkan nama depan
          avatar_url: `https://api.dicebear.com/7.x/micah/svg?seed=${firstName}`
        },
        emailRedirectTo: `${location.origin}/api/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage("Pendaftaran berhasil! Silakan cek email kamu untuk verifikasi. 💌");
      e.target.reset(); // Reset form setelah berhasil
    }
    setLoading(false);
  };

  // Fungsi untuk menangani login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      // Redirect ke halaman utama setelah login berhasil
      router.push('/');
      router.refresh(); // Penting untuk me-refresh state di server component (Next.js 13+ App Router)
    }
    setLoading(false);
  };

  // Fungsi untuk menangani login dengan OAuth (Google, GitHub, dll)
  const handleOAuthLogin = async (provider) => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider, // 'google', 'github', dll.
      options: {
        redirectTo: `${location.origin}/api/auth/callback`,
      },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  // Opsi untuk dropdown tanggal lahir
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = [
    { value: 1, name: 'Januari' }, { value: 2, name: 'Februari' }, { value: 3, name: 'Maret' },
    { value: 4, name: 'April' }, { value: 5, name: 'Mei' }, { value: 6, name: 'Juni' },
    { value: 7, name: 'Juli' }, { value: 8, name: 'Agustus' }, { value: 9, 'name': 'September' },
    { value: 10, name: 'Oktober' }, { value: 11, name: 'November' }, { value: 12, name: 'Desember' },
  ];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

  return (
    <div className="w-full max-w-md mx-auto bg-white p-6 sm:p-8 rounded-lg shadow-xl">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Nabila Platform
        </h1>
        <p className="text-gray-600 mt-2">
          {isLoginView ? 'Selamat datang kembali!' : 'Gratis dan akan selalu begitu.'}
        </p>
      </div>

      {/* Form utama */}
      <form onSubmit={isLoginView ? handleLogin : handleRegister}>
        {/* === BAGIAN REGISTER === */}
        {!isLoginView && (
          <>
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <input type="text" placeholder="Nama depan" className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" onChange={(e) => setFirstName(e.target.value)} required />
              <input type="text" placeholder="Nama belakang" className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" onChange={(e) => setLastName(e.target.value)} required />
            </div>
          </>
        )}
        
        {/* === BAGIAN BERSAMA (LOGIN & REGISTER) === */}
        <div className="mb-4">
          <input type="email" placeholder="Alamat Email" className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="mb-4">
          <input type="password" placeholder="Kata Sandi Baru" className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" onChange={(e) => setPassword(e.target.value)} required />
        </div>
        
        {/* Tautan Lupa Kata Sandi (hanya di tampilan login) */}
        {isLoginView && (
            <div className="text-right mb-4">
                <a href="/forgot-password" className="text-sm text-blue-600 hover:underline">
                    Lupa kata sandi?
                </a>
            </div>
        )}

        {/* === BAGIAN REGISTER (LANJUTAN) === */}
        {!isLoginView && (
          <>
            <div className="mb-4">
              <label className="text-sm text-gray-500 mb-1 block">Tanggal Lahir</label>
              <div className="flex gap-2">
                <select onChange={(e) => setDay(e.target.value)} defaultValue={day} className="w-full px-2 py-2 border rounded-md bg-white">
                  {days.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <select onChange={(e) => setMonth(e.target.value)} defaultValue={month} className="w-full px-2 py-2 border rounded-md bg-white">
                  {months.map(m => <option key={m.value} value={m.value}>{m.name}</option>)}
                </select>
                <select onChange={(e) => setYear(e.target.value)} defaultValue={year} className="w-full px-2 py-2 border rounded-md bg-white">
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
            <div className="mb-6">
              <label className="text-sm text-gray-500 mb-1 block">Jenis Kelamin</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 p-2 border rounded-md w-full cursor-pointer hover:bg-gray-50">
                  <input type="radio" name="gender" value="Perempuan" onChange={(e) => setGender(e.target.value)} required/> Perempuan
                </label>
                <label className="flex items-center gap-2 p-2 border rounded-md w-full cursor-pointer hover:bg-gray-50">
                  <input type="radio" name="gender" value="Laki-laki" onChange={(e) => setGender(e.target.value)} required/> Laki-laki
                </label>
              </div>
            </div>
          </>
        )}
        
        {/* Pesan error atau sukses */}
        {error && <p className="mb-4 text-center text-red-500 bg-red-100 p-2 rounded-md">{error}</p>}
        {message && <p className="mb-4 text-center text-green-500 bg-green-100 p-2 rounded-md">{message}</p>}

        {/* Tombol Aksi */}
        <button type="submit" disabled={loading} className={`w-full text-white font-bold py-3 rounded-md transition-colors duration-300 ${isLoginView ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'} disabled:bg-gray-400 disabled:cursor-not-allowed`}>
          {loading ? 'Memproses...' : (isLoginView ? 'Masuk' : 'Daftar')}
        </button>
      </form>

      {/* Pemisah atau Login dengan Pihak Ketiga */}
      <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">atau lanjutkan dengan</span>
          </div>
      </div>
      
      {/* Tombol OAuth */}
      <div className="space-y-3">
          <button onClick={() => handleOAuthLogin('google')} disabled={loading} className="w-full flex items-center justify-center gap-3 py-2.5 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:bg-gray-200 disabled:cursor-not-allowed">
              <FaGoogle className="text-red-500" />
              <span className="text-gray-700 font-semibold">Google</span>
          </button>
          <button onClick={() => handleOAuthLogin('github')} disabled={loading} className="w-full flex items-center justify-center gap-3 py-2.5 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:bg-gray-200 disabled:cursor-not-allowed">
              <FaGithub className="text-gray-800" />
              <span className="text-gray-700 font-semibold">GitHub</span>
          </button>
      </div>

      <div className="mt-6 border-t border-gray-200 pt-4 text-center">
        <button onClick={() => { setIsLoginView(!isLoginView); setError(null); setMessage(null); }} className="text-blue-600 hover:underline font-semibold">
          {isLoginView ? 'Belum punya akun? Buat Akun Baru' : 'Sudah punya akun? Masuk di sini'}
        </button>
      </div>
    </div>
  );
}
