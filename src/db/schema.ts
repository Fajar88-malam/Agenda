/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { boolean, integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// 1. Users table (linked to Firebase Auth UID)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  displayName: text('display_name'),
  role: text('role').default('operator'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 2. School Profile table
export const schoolProfile = pgTable('school_profile', {
  id: serial('id').primaryKey(),
  namaSekolah: text('nama_sekolah').notNull(),
  npsn: text('npsn').notNull(),
  namaPemerintah: text('nama_pemerintah'),
  namaDinas: text('nama_dinas'),
  namaCabangDinas: text('nama_cabang_dinas'),
  akreditasi: text('akreditasi'),
  alamatJalan: text('alamat_jalan'),
  kelurahan: text('kelurahan'),
  kecamatan: text('kecamatan'),
  kotaKab: text('kota_kab'),
  provinsi: text('provinsi'),
  kodePos: text('kode_pos'),
  telepon: text('telepon'),
  email: text('email'),
  website: text('website'),
  kepalaSekolahNama: text('kepala_sekolah_nama'),
  kepalaSekolahNip: text('kepala_sekolah_nip'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 3. Students table
export const students = pgTable('students', {
  id: text('id').primaryKey(),
  nis: text('nis'),
  nisn: text('nisn').notNull(),
  nama: text('nama').notNull(),
  jenisKelamin: text('jenis_kelamin').notNull(),
  tempatLahir: text('tempat_lahir'),
  tanggalLahir: text('tanggal_lahir'),
  kelas: text('kelas').notNull(),
  jurusan: text('jurusan'),
  namaAyah: text('nama_ayah'),
  namaIbu: text('nama_ibu'),
  namaWali: text('nama_wali'),
  pekerjaanOrtu: text('pekerjaan_ortu'),
  alamat: text('alamat'),
  noHpOrtu: text('no_hp_ortu'),
  status: text('status').notNull().default('Aktif'),
  tahunMasuk: text('tahun_masuk'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 4. Teachers table
export const teachers = pgTable('teachers', {
  id: text('id').primaryKey(),
  nip: text('nip'),
  nuptk: text('nuptk'),
  nama: text('nama').notNull(),
  jenisKelamin: text('jenis_kelamin'),
  pangkatGolongan: text('pangkat_golongan'),
  jabatan: text('jabatan').notNull(),
  mataPelajaran: text('mata_pelajaran'),
  noHp: text('no_hp'),
  email: text('email'),
  isActive: boolean('is_active').default(true),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 5. Letters table
export const letters = pgTable('letters', {
  id: text('id').primaryKey(),
  nomorSurat: text('nomor_surat').notNull(),
  nomorUrut: integer('nomor_urut').notNull(),
  kodeKlasifikasi: text('kode_klasifikasi'),
  jenisSurat: text('jenis_surat').notNull(),
  perihal: text('perihal').notNull(),
  sifat: text('sifat').default('Biasa'),
  lampiran: text('lampiran'),
  tanggalSurat: text('tanggal_surat'),
  tempatDibuat: text('tempat_dibuat'),
  kepadaYth: text('kepada_yth'),
  content: text('content'),
  penandatanganNama: text('penandatangan_nama'),
  penandatanganNip: text('penandatangan_nip'),
  penandatanganPangkat: text('penandatangan_pangkat'),
  penandatanganJabatan: text('penandatangan_jabatan'),
  includeStempel: boolean('include_stempel').default(true),
  includeTtd: boolean('include_ttd').default(true),
  status: text('status').notNull().default('Draft'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const usersRelations = relations(users, () => ({}));
