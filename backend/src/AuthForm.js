// src/components/AuthForm.js
'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

export default function AuthForm() {
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  // Untuk tanggal lahir
  const [day, setDay] = useState('1');
  const [month, setMonth] = useState('1');
  const [year, setYear] = useState('2000');
  const [gender, setGender] = useState('');

  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!firstName || !lastName || !gender) {
      setError("Semua field pendaftaran wajib diisi!");
      return;
    }

    const dateOfBirth = `${year}-${month}-${day}`;
    const fullName = `${firstName} ${lastName}`;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Data ini akan dikirim ke trigger yang kita buat tadi!
        data: {
          full_name: fullName,
          date_of_birth: dateOfBirth,
          gender: gender,
          // Avatar default bisa ditambahkan di sini
          avatar_url: `https://api.dicebear.com/7.x/micah/svg?seed=${firstName}`
        },
        emailRedirectTo: `${location.origin}/api/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage("Pendaftaran berhasil! Silakan cek email kamu untuk verifikasi. 💌");
      // Reset form
      e.target.reset();
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      // Redirect ke halaman utama setelah login berhasil
      router.push('/');
      router.refresh(); // Penting untuk me-refresh state server
    }
  };
  
  // Opsi untuk dropdown tanggal lahir
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = [
    { value: 1, name: 'Jan' }, { value: 2, name: 'Feb' }, { value: 3, name: 'Mar' },
    { value: 4, name: 'Apr' }, { value: 5, name: 'Mei' }, { value: 6, name: 'Jun' },
    { value: 7, name: 'Jul' }, { value: 8, name: 'Ags' }, { value: 9, name: 'Sep' },
    { value: 10, name: 'Okt' }, { value: 11, name: 'Nov' }, { value: 12, name: 'Des' },
  ];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

  return (
    <div className="w-full max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-2">
        {isLoginView ? 'Masuk ke Platform Kamu' : 'Buat Akun Baru'}
      </h2>
      <p className="text-center text-gray-600 mb-6">
        {isLoginView ? 'Selamat datang kembali!' : 'Gratis dan akan selalu begitu.'}
      </p>

      {/* Form utama */}
      <form onSubmit={isLoginView ? handleLogin : handleRegister}>
        {/* === BAGIAN REGISTER === */}
        {!isLoginView && (
          <>
            <div className="flex gap-4 mb-4">
              <input
                type="text"
                placeholder="Nama depan"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Nama belakang"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </>
        )}
        
        {/* === BAGIAN BERSAMA (LOGIN & REGISTER) === */}
        <div className="mb-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <input
            type="password"
            placeholder="Kata Sandi"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {/* === BAGIAN REGISTER (LANJUTAN) === */}
        {!isLoginView && (
          <>
            <div className="mb-4">
              <label className="text-sm text-gray-500">Tanggal Lahir</label>
              <div className="flex gap-2 mt-1">
                <select onChange={(e) => setDay(e.target.value)} className="w-full px-2 py-2 border rounded-md">
                  {days.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <select onChange={(e) => setMonth(e.target.value)} className="w-full px-2 py-2 border rounded-md">
                  {months.map(m => <option key={m.value} value={m.value}>{m.name}</option>)}
                </select>
                <select onChange={(e) => setYear(e.target.value)} className="w-full px-2 py-2 border rounded-md">
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
            <div className="mb-6">
              <label className="text-sm text-gray-500">Jenis Kelamin</label>
              <div className="flex gap-4 mt-1">
                <label className="flex items-center gap-2 p-2 border rounded-md w-full">
                  <input type="radio" name="gender" value="Perempuan" onChange={(e) => setGender(e.target.value)} required/> Perempuan
                </label>
                <label className="flex items-center gap-2 p-2 border rounded-md w-full">
                  <input type="radio" name="gender" value="Laki-laki" onChange={(e) => setGender(e.target.value)} required/> Laki-laki
                </label>
              </div>
            </div>
          </>
        )}
        
        {/* Tombol Aksi */}
        <button
          type="submit"
          className={`w-full text-white font-bold py-3 rounded-md transition-colors ${
            isLoginView
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {isLoginView ? 'Masuk' : 'Daftar'}
        </button>

        {/* Pesan error atau sukses */}
        {error && <p className="mt-4 text-center text-red-500">{error}</p>}
        {message && <p className="mt-4 text-center text-green-500">{message}</p>}

      </form>

      <div className="my-6 border-t border-gray-300"></div>

      {/* Tombol untuk ganti mode */}
      <div className="text-center">
        <button
          onClick={() => {
            setIsLoginView(!isLoginView);
            setError(null);
            setMessage(null);
          }}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-md"
        >
          {isLoginView ? 'Belum punya akun? Buat Baru' : 'Sudah punya akun? Masuk'}
        </button>
      </div>
    </div>
  );
}
