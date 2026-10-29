/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppDatabase, SchoolProfile, Student, Teacher, LetterRecord } from '../types';
import { INITIAL_DATABASE } from '../data/defaultData';

const STORAGE_KEY = 'esurat_school_database_v1';

export class StorageService {
  static getDatabase(): AppDatabase {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        this.saveDatabase(INITIAL_DATABASE);
        return INITIAL_DATABASE;
      }
      const parsed = JSON.parse(data);
      let profile = parsed.schoolProfile || INITIAL_DATABASE.schoolProfile;
      if (profile.namaSekolah === 'SMA NEGERI 1 KOTA BANDUNG' && INITIAL_DATABASE.schoolProfile.namaSekolah !== 'SMA NEGERI 1 KOTA BANDUNG') {
        profile = { ...INITIAL_DATABASE.schoolProfile };
      }

      return {
        schoolProfile: profile,
        students: Array.isArray(parsed.students) ? parsed.students : INITIAL_DATABASE.students,
        teachers: Array.isArray(parsed.teachers) ? parsed.teachers : INITIAL_DATABASE.teachers,
        letters: Array.isArray(parsed.letters) ? parsed.letters : INITIAL_DATABASE.letters,
        lastLetterNumber: typeof parsed.lastLetterNumber === 'number' ? parsed.lastLetterNumber : 23
      };
    } catch (e) {
      console.error('Error loading database from localStorage:', e);
      return INITIAL_DATABASE;
    }
  }

  static saveDatabase(db: AppDatabase): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    } catch (e) {
      console.error('Error saving database to localStorage:', e);
    }
  }

  static resetDatabase(): AppDatabase {
    this.saveDatabase(INITIAL_DATABASE);
    return INITIAL_DATABASE;
  }

  static exportDatabaseToJson(db: AppDatabase): void {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(db, null, 2));
    const downloadAnchor = document.createElement('a');
    const today = new Date().toISOString().split('T')[0];
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `backup_database_esurat_sekolah_${today}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  static importDatabaseFromJson(jsonString: string): AppDatabase {
    const parsed = JSON.parse(jsonString);
    if (!parsed.schoolProfile || !parsed.students || !parsed.teachers || !parsed.letters) {
      throw new Error('Format file JSON tidak valid. Struktur database tidak lengkap.');
    }
    const validatedDb: AppDatabase = {
      schoolProfile: parsed.schoolProfile,
      students: parsed.students,
      teachers: parsed.teachers,
      letters: parsed.letters,
      lastLetterNumber: parsed.lastLetterNumber || 20
    };
    this.saveDatabase(validatedDb);
    return validatedDb;
  }
}
