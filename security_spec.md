# Security Specification for e-Surat Sekolah

## Data Invariants
1. **School Profile**: Only verified administrators can update the school identity, official letterhead, and principal signature configs.
2. **Letters Archive**: Letters must have valid sequential numbers (`nomorUrut`), non-empty classifications, valid types, and status. Document IDs must match strict ID patterns (`^[a-zA-Z0-9_\\-]+$`).
3. **Draft Auto-save**: Draft documents created during realtime typing must belong to the active session/user and contain valid string properties within size limits (<= 500KB).
4. **Students & Teachers Database**: NISN and NIP identifiers must not exceed 64 characters, names must be bounded string values, and status must be one of allowed values.
5. **No Orphaned or Ghost Updates**: Schema keys must be rigorously validated so arbitrary junk properties cannot be injected.

## The Dirty Dozen Payloads (Designed to break laws of Identity, Integrity, and State)
1. **Payload 1 (ID Poisoning Attack)**: Injecting 2000-character malicious path variable ID to trigger Denial of Wallet. (Rejected by `isValidId()`).
2. **Payload 2 (Ghost Field Privilege Escalation)**: Modifying `school_profile` with an unapproved injected key `isAdmin: true` or `overridePermissions: true`. (Rejected by key validation).
3. **Payload 3 (Unverified Email Spoofing)**: Submitting write with unverified email token (`email_verified: false`). (Rejected by `isVerified()`).
4. **Payload 4 (Negative Letter Sequence)**: Saving letter with negative sequence `nomorUrut: -999` to break sequential counter integrity. (Rejected by `nomorUrut > 0`).
5. **Payload 5 (Unbounded Payload Flooding)**: Sending student name of 500,000 characters to consume Firestore document limits. (Rejected by string size bounds).
6. **Payload 6 (Arbitrary Enum Value Injection)**: Sending Student status as `"HackedStatus"`. (Rejected by enum check `Aktif`, `Mutasi Keluar`, `Lulus`).
7. **Payload 7 (Cross-User Draft Overwrite)**: Attempting to overwrite another user's draft ID without authorization. (Rejected by author validation).
8. **Payload 8 (Letter Number Wipeout)**: Attempting to reset `counters/letters` with negative or zero value. (Rejected by `lastLetterNumber >= 0`).
9. **Payload 9 (Blanket Read Scraping)**: Attempting to query non-public collections without signed-in session. (Rejected by authentication requirement).
10. **Payload 10 (Delete Master Counter)**: Attempting to delete `counters/letters` document to disable auto-numbering. (Rejected: `allow delete: if false`).
11. **Payload 11 (Invalid Letter Type)**: Sending letter record with `jenisSurat: "SURAT_ILEGAL"`. (Rejected by letter type validation).
12. **Payload 12 (Empty Letter Subject)**: Sending letter record without required perihal or nomorSurat. (Rejected by non-empty requirement).
