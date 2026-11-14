/**
 * Google Apps Script Lengkap untuk DIPERIKSA
 * Termasuk doPost dan auto-generate URL foto siswa
 * 
 * CARA PENGGUNAAN:
 * 1. Copy SEMUA kode ini
 * 2. Paste ke Apps Script di Google Sheets
 * 3. Simpan dan Deploy
 */

// KONFIGURASI FOTO SISWA
const FOLDER_ID = '16gs_h8dOKYhDzkuScIaruF1djltSKz5e';
const SHEET_NAME = 'Siswa';

// ============================================
// FUNGSI UTAMA doPost
// ============================================

function doPost(e) {
  try {
    const action = e.parameter.action || "add_pelanggaran";
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // 1. FORM DATA TATA TERTIB
    if (action === "add_rule") {
      const sheetTataTertib = ss.getSheetByName("TATA TERTIB");
      const kategori = e.parameter.kategori || "";
      const nama = e.parameter.nama || "";
      const poin = e.parameter.poin || "0";
      
      const lastRow = sheetTataTertib.getLastRow();
      let no = 1;
      if (lastRow > 1) {
        const lastNo = sheetTataTertib.getRange(lastRow, 1).getValue();
        no = (Number(lastNo) || 0) + 1;
      }
      
      if (nama !== "") {
        sheetTataTertib.appendRow([no, kategori, nama, poin]);
        return ContentService.createTextOutput(JSON.stringify({"result":"success"}))
          .setMimeType(ContentService.MimeType.JSON);
      } else {
        throw new Error("Nama Pelanggaran kosong");
      }
    }
    
    // 2. FORM DATA PRESTASI (JENIS PRESTASI)
    else if (action === "add_rule_prestasi") {
      const sheetDataPrestasi = ss.getSheetByName("Data Prestasi");
      const kategori = e.parameter.kategori || "";
      const nama = e.parameter.nama || "";
      const poin = e.parameter.poin || "0";
      
      const lastRow = sheetDataPrestasi.getLastRow();
      let no = 1;
      if (lastRow > 1) {
        const lastNo = sheetDataPrestasi.getRange(lastRow, 1).getValue();
        no = (Number(lastNo) || 0) + 1;
      }
      
      if (nama !== "") {
        sheetDataPrestasi.appendRow([no, kategori, nama, poin]);
        return ContentService.createTextOutput(JSON.stringify({"result":"success"}))
          .setMimeType(ContentService.MimeType.JSON);
      } else {
        throw new Error("Nama Prestasi kosong");
      }
    }

    // 3. FORM CATAT PRESTASI SISWA
    else if (action === "add_prestasi") {
      const sheetPrestasi = ss.getSheetByName("Prestasi");
      const nisn = e.parameter.nisn || "";
      const namaSiswa = e.parameter.nama_siswa || "";
      const tanggal = e.parameter.tanggal || "";
      const kategori = e.parameter.kategori || "";
      const prestasi = e.parameter.prestasi || ""; 
      const poin = e.parameter.poin || "0";
      const keterangan = e.parameter.keterangan || "";
      
      if (nisn !== "" && prestasi !== "") {
        sheetPrestasi.appendRow([nisn, namaSiswa, tanggal, kategori, prestasi, poin, keterangan]);
        return ContentService.createTextOutput(JSON.stringify({"result":"success"}))
          .setMimeType(ContentService.MimeType.JSON);
      } else {
        throw new Error("Data prestasi tidak lengkap");
      }
    }
    
    // 4. FORM PELANGGARAN SISWA
    else if (action === "add_pelanggaran") {
      const sheetPelanggaran = ss.getSheetByName("Pelanggaran");
      const nisn = e.parameter.nisn || "";
      const namaSiswa = e.parameter.nama_siswa || "";
      const tanggal = e.parameter.tanggal || "";
      const kategori = e.parameter.kategori || "";
      const pelanggaran = e.parameter.pelanggaran || "";
      const poin = e.parameter.poin || "0";
      const keterangan = e.parameter.keterangan || "";
      
      if (nisn !== "" && pelanggaran !== "") {
        sheetPelanggaran.appendRow([nisn, namaSiswa, tanggal, kategori, pelanggaran, poin, keterangan]);
        return ContentService.createTextOutput(JSON.stringify({"result":"success"}))
          .setMimeType(ContentService.MimeType.JSON);
      } else {
        throw new Error("Data pelanggaran tidak lengkap");
      }
    }
    
    // 5. GENERATE PHOTO URLS (TAMBAHAN BARU)
    else if (action === "generate_photo_urls") {
      return generatePhotoUrlsAction();
    }
    
    // 6. HAPUS PELANGGARAN SISWA
    else if (action === "delete_pelanggaran") {
      const sheet = ss.getSheetByName("Pelanggaran");
      const nisn = e.parameter.nisn || "";
      const tanggal = e.parameter.tanggal || "";
      const pelanggaran = e.parameter.pelanggaran || "";
      
      const data = sheet.getDataRange().getValues();
      let deleted = false;
      
      // Loop dari bawah ke atas agar index baris tidak bergeser jika dihapus
      for (let i = data.length - 1; i > 0; i--) {
        const row = data[i];
        let rowNisn = String(row[0]).replace(/^'/, "").trim(); // Bersihkan prefix ' jika ada
        let inputNisn = String(nisn).replace(/^'/, "").trim();
        
        // Samakan format NISN (atasi masalah angka nol di depan)
        if (Number(rowNisn) === Number(inputNisn) && String(row[4]).trim() === pelanggaran.trim()) {
            sheet.deleteRow(i + 1);
            deleted = true;
            break; // Hapus data pertama yang cocok lalu berhenti
        }
      }
      
      if (deleted) {
        return ContentService.createTextOutput(JSON.stringify({"result":"success"})).setMimeType(ContentService.MimeType.JSON);
      } else {
        throw new Error("Data pelanggaran tidak ditemukan");
      }
    }

    // 7. HAPUS PRESTASI SISWA
    else if (action === "delete_prestasi") {
      const sheet = ss.getSheetByName("Prestasi");
      const nisn = e.parameter.nisn || "";
      const tanggal = e.parameter.tanggal || "";
      const prestasi = e.parameter.prestasi || "";
      
      const data = sheet.getDataRange().getValues();
      let deleted = false;
      
      for (let i = data.length - 1; i > 0; i--) {
        const row = data[i];
        let rowNisn = String(row[0]).replace(/^'/, "").trim();
        let inputNisn = String(nisn).replace(/^'/, "").trim();
        
        // Samakan format NISN (atasi masalah angka nol di depan)
        if (Number(rowNisn) === Number(inputNisn) && String(row[4]).trim() === prestasi.trim()) {
            sheet.deleteRow(i + 1);
            deleted = true;
            break;
        }
      }
      
      if (deleted) {
        return ContentService.createTextOutput(JSON.stringify({"result":"success"})).setMimeType(ContentService.MimeType.JSON);
      } else {
        throw new Error("Data prestasi tidak ditemukan");
      }
    }
    // 8. EDIT PELANGGARAN SISWA
    else if (action === "edit_pelanggaran") {
      const sheet = ss.getSheetByName("Pelanggaran");
      const nisn = e.parameter.nisn || "";
      const oldTanggal = e.parameter.old_tanggal || "";
      const oldPelanggaran = e.parameter.old_pelanggaran || "";
      
      const newTanggal = e.parameter.new_tanggal || "";
      const newKategori = e.parameter.new_kategori || "";
      const newPelanggaran = e.parameter.new_pelanggaran || "";
      const newPoin = e.parameter.new_poin || "0";
      const newKeterangan = e.parameter.new_keterangan || "";
      const namaSiswa = e.parameter.nama_siswa || "";
      
      const data = sheet.getDataRange().getValues();
      let updated = false;
      
      for (let i = data.length - 1; i > 0; i--) {
        const row = data[i];
        let rowNisn = String(row[0]).replace(/^'/, "").trim();
        let inputNisn = String(nisn).replace(/^'/, "").trim();
        
        if (Number(rowNisn) === Number(inputNisn) && String(row[4]).trim() === oldPelanggaran.trim()) {
            const cleanNisn = String(nisn).replace(/^'+/, "").trim();
            sheet.getRange(i + 1, 1, 1, 7).setValues([["'"+cleanNisn, namaSiswa, newTanggal, newKategori, newPelanggaran, newPoin, newKeterangan]]);
            updated = true;
            break;
        }
      }
      
      if (updated) {
        return ContentService.createTextOutput(JSON.stringify({"result":"success"})).setMimeType(ContentService.MimeType.JSON);
      } else {
        throw new Error("Data pelanggaran tidak ditemukan");
      }
    }

    // 9. EDIT PRESTASI SISWA
    else if (action === "edit_prestasi") {
      const sheet = ss.getSheetByName("Prestasi");
      const nisn = e.parameter.nisn || "";
      const oldTanggal = e.parameter.old_tanggal || "";
      const oldPrestasi = e.parameter.old_prestasi || "";
      
      const newTanggal = e.parameter.new_tanggal || "";
      const newKategori = e.parameter.new_kategori || "";
      const newPrestasi = e.parameter.new_prestasi || "";
      const newPoin = e.parameter.new_poin || "0";
      const newKeterangan = e.parameter.new_keterangan || "";
      const namaSiswa = e.parameter.nama_siswa || "";
      
      const data = sheet.getDataRange().getValues();
      let updated = false;
      
      for (let i = data.length - 1; i > 0; i--) {
        const row = data[i];
        let rowNisn = String(row[0]).replace(/^'/, "").trim();
        let inputNisn = String(nisn).replace(/^'/, "").trim();
        
        if (Number(rowNisn) === Number(inputNisn) && String(row[4]).trim() === oldPrestasi.trim()) {
            const cleanNisn = String(nisn).replace(/^'+/, "").trim();
            sheet.getRange(i + 1, 1, 1, 7).setValues([["'"+cleanNisn, namaSiswa, newTanggal, newKategori, newPrestasi, newPoin, newKeterangan]]);
            updated = true;
            break;
        }
      }
      
      if (updated) {
        return ContentService.createTextOutput(JSON.stringify({"result":"success"})).setMimeType(ContentService.MimeType.JSON);
      } else {
        throw new Error("Data prestasi tidak ditemukan");
      }
    }

    // 10. TAMBAH SISWA BARU
    else if (action === "add_student") {
      const sheetSiswa = ss.getSheetByName("Siswa");
      const nisn = String(e.parameter.nisn || "").replace(/^'/, "").trim();
      const nama = String(e.parameter.nama || "").trim();
      const kelas = String(e.parameter.kelas || "").trim();
      const noWa = String(e.parameter.no_wa || "").replace(/^'/, "").trim();
      const fotoUrl = String(e.parameter.foto_url || "").trim();
      
      if (!nisn || !nama) {
        throw new Error("NISN dan Nama Siswa wajib diisi");
      }
      
      // Cek apakah NISN sudah terdaftar
      const data = sheetSiswa.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        let rowNisn = String(data[i][0]).replace(/^'/, "").trim();
        if (rowNisn === nisn || Number(rowNisn) === Number(nisn)) {
          throw new Error("NISN " + nisn + " sudah terdaftar atas nama: " + data[i][1]);
        }
      }
      
      // Simpan NISN & No. WA dengan tanda petik tunggal agar leading zero tetap utuh
      sheetSiswa.appendRow(["'" + nisn, nama, kelas, noWa ? ("'" + noWa) : "", fotoUrl]);
      return ContentService.createTextOutput(JSON.stringify({"result":"success"}))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // 11. EDIT DATA SISWA, WA & FOTO
    else if (action === "edit_student") {
      const sheetSiswa = ss.getSheetByName("Siswa");
      const oldNisn = String(e.parameter.old_nisn || "").replace(/^'/, "").trim();
      const newNisn = String(e.parameter.nisn || oldNisn).replace(/^'/, "").trim();
      const nama = String(e.parameter.nama || "").trim();
      const kelas = String(e.parameter.kelas || "").trim();
      const noWa = String(e.parameter.no_wa || "").replace(/^'/, "").trim();
      const fotoUrl = String(e.parameter.foto_url || "").trim();
      
      if (!oldNisn || !nama) {
        throw new Error("NISN dan Nama Siswa wajib diisi");
      }
      
      const data = sheetSiswa.getDataRange().getValues();
      let updated = false;
      
      for (let i = 1; i < data.length; i++) {
        let rowNisn = String(data[i][0]).replace(/^'/, "").trim();
        if (rowNisn === oldNisn || Number(rowNisn) === Number(oldNisn)) {
          sheetSiswa.getRange(i + 1, 1, 1, 5).setValues([["'" + newNisn, nama, kelas, noWa ? ("'" + noWa) : "", fotoUrl]]);
          updated = true;
          break;
        }
      }
      
      if (updated) {
        // Jika NISN atau nama berubah, sinkronkan juga nama/NISN di sheet Pelanggaran dan Prestasi
        if (oldNisn !== newNisn || nama) {
          const syncOtherSheet = (sheetName) => {
            const sh = ss.getSheetByName(sheetName);
            if (!sh) return;
            const shData = sh.getDataRange().getValues();
            for (let j = 1; j < shData.length; j++) {
              let rNisn = String(shData[j][0]).replace(/^'/, "").trim();
              if (rNisn === oldNisn || Number(rNisn) === Number(oldNisn)) {
                sh.getRange(j + 1, 1, 1, 2).setValues([["'" + newNisn, nama]]);
              }
            }
          };
          syncOtherSheet("Pelanggaran");
          syncOtherSheet("Prestasi");
        }
        
        return ContentService.createTextOutput(JSON.stringify({"result":"success"}))
          .setMimeType(ContentService.MimeType.JSON);
      } else {
        throw new Error("Data siswa dengan NISN " + oldNisn + " tidak ditemukan");
      }
    }

    // 12. HAPUS DATA SISWA
    else if (action === "delete_student") {
      const sheetSiswa = ss.getSheetByName("Siswa");
      const nisn = String(e.parameter.nisn || "").replace(/^'/, "").trim();
      
      if (!nisn) {
        throw new Error("NISN siswa wajib diisi");
      }
      
      const data = sheetSiswa.getDataRange().getValues();
      let deleted = false;
      
      for (let i = data.length - 1; i > 0; i--) {
        let rowNisn = String(data[i][0]).replace(/^'/, "").trim();
        if (rowNisn === nisn || Number(rowNisn) === Number(nisn)) {
          sheetSiswa.deleteRow(i + 1);
          deleted = true;
          break;
        }
      }
      
      if (deleted) {
        return ContentService.createTextOutput(JSON.stringify({"result":"success"}))
          .setMimeType(ContentService.MimeType.JSON);
      } else {
        throw new Error("Data siswa dengan NISN " + nisn + " tidak ditemukan");
      }
    }
    
  } catch(error) {
    return ContentService.createTextOutput(JSON.stringify({"result":"error", "error": error.message}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ============================================
// FUNGSI AUTO-GENERATE URL FOTO SISWA
// ============================================

function generatePhotoUrls() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const folder = DriveApp.getFolderById(FOLDER_ID);
  
  // Pastikan Header Kolom D (No. WA) dan Kolom E (Foto) ada label jika belum
  const headerD = sheet.getRange(1, 4).getValue();
  if (!headerD || String(headerD).trim() === "") {
    sheet.getRange(1, 4).setValue("No. WA");
  }
  const headerE = sheet.getRange(1, 5).getValue();
  if (!headerE || String(headerE).trim() === "") {
    sheet.getRange(1, 5).setValue("Foto");
  }

  // Ambil semua file dari folder
  const files = folder.getFiles();
  const fileMap = {};
  
  // Buat mapping nama file → file ID
  while (files.hasNext()) {
    const file = files.next();
    const fileName = file.getName();
    // Hapus ekstensi file untuk mendapatkan NISN
    const nisn = fileName.replace(/\.[^/.]+$/, "").trim();
    fileMap[nisn] = file.getId();
    // Dukung juga variasi NISN tanpa leading 0 atau dengan leading 0
    if (nisn.length === 9) fileMap["0" + nisn] = file.getId();
    if (nisn.startsWith("0")) fileMap[nisn.substring(1)] = file.getId();
  }
  
  // Ambil data dari sheet
  const data = sheet.getDataRange().getValues();
  const updatedRows = [];
  
  // Skip header row (row 1)
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    let nisn = String(row[0]).replace(/[,. '"]/g, '').trim(); // Kolom A: NISN
    if (nisn.length === 9) nisn = "0" + nisn;

    const currentPhotoUrl = row[4]; // Kolom E: Foto URL (Index 4)
    
    // Cek apakah ada file yang cocok dengan NISN
    const fileId = fileMap[nisn] || (nisn.startsWith("0") ? fileMap[nisn.substring(1)] : fileMap["0" + nisn]);
    
    if (fileId) {
      const newPhotoUrl = `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;
      
      // Update kolom E (Kolom ke-5 di Google Sheet) jika kosong atau berbeda
      if (!currentPhotoUrl || String(currentPhotoUrl).trim() !== newPhotoUrl) {
        sheet.getRange(i + 1, 5).setValue(newPhotoUrl);
        updatedRows.push({
          nisn: nisn,
          nama: row[1] || "",
          kelas: row[2] || "",
          fileName: nisn + '.jpg',
          fileId: fileId,
          url: newPhotoUrl
        });
      }
    }
  }
  
  // Tampilkan hasil
  if (updatedRows.length > 0) {
    Logger.log(`Berhasil update ${updatedRows.length} foto siswa di Kolom E:`);
    updatedRows.forEach(row => {
      Logger.log(`NISN: ${row.nisn}, Nama: ${row.nama}, Kelas: ${row.kelas}, URL: ${row.url}`);
    });
  } else {
    Logger.log('Tidak ada foto yang diupdate di Kolom E. Semua sudah up-to-date atau tidak ada file yang cocok.');
  }
  
  return updatedRows;
}

function generatePhotoUrlsAction() {
  try {
    const result = generatePhotoUrls();
    return ContentService.createTextOutput(JSON.stringify({
      "result": "success",
      "updated": result.length,
      "details": result
    })).setMimeType(ContentService.MimeType.JSON);
  } catch(error) {
    return ContentService.createTextOutput(JSON.stringify({
      "result": "error",
      "error": error.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Fungsi untuk menampilkan daftar file yang tidak match dengan NISN
 */
function showUnmatchedFiles() {
  const folder = DriveApp.getFolderById(FOLDER_ID);
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  
  // Ambil semua NISN dari sheet
  const data = sheet.getDataRange().getValues();
  const nisnSet = new Set();
  for (let i = 1; i < data.length; i++) {
    nisnSet.add(String(data[i][0]));
  }
  
  // Scan folder
  const files = folder.getFiles();
  const unmatchedFiles = [];
  
  while (files.hasNext()) {
    const file = files.next();
    const fileName = file.getName();
    const nisn = fileName.replace(/\.[^/.]+$/, "");
    
    if (!nisnSet.has(nisn)) {
      unmatchedFiles.push({
        fileName: fileName,
        nisn: nisn
      });
    }
  }
  
  Logger.log(`File yang tidak match dengan NISN di sheet (${unmatchedFiles.length}):`);
  unmatchedFiles.forEach(file => {
    Logger.log(`File: ${file.fileName}, NISN: ${file.nisn}`);
  });
  
  return unmatchedFiles;
}

/**
 * Fungsi untuk menampilkan NISN yang tidak memiliki foto
 */
function showMissingPhotos() {
  const folder = DriveApp.getFolderById(FOLDER_ID);
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  
  // Ambil semua file dari folder
  const files = folder.getFiles();
  const fileNisnSet = new Set();
  
  while (files.hasNext()) {
    const file = files.next();
    const fileName = file.getName();
    const nisn = fileName.replace(/\.[^/.]+$/, "").trim();
    fileNisnSet.add(nisn);
    if (nisn.length === 9) fileNisnSet.add("0" + nisn);
    if (nisn.startsWith("0")) fileNisnSet.add(nisn.substring(1));
  }
  
  // Scan sheet
  const data = sheet.getDataRange().getValues();
  const missingPhotos = [];
  
  for (let i = 1; i < data.length; i++) {
    let nisn = String(data[i][0]).replace(/[,. '"]/g, '').trim();
    if (nisn.length === 9) nisn = "0" + nisn;
    const nama = data[i][1];
    const kelas = data[i][2]; // Kolom C: Kelas
    const photoUrl = data[i][4]; // Kolom E: Foto URL
    
    if (!fileNisnSet.has(nisn) && (!photoUrl || String(photoUrl).trim() === "")) {
      missingPhotos.push({
        nisn: nisn,
        nama: nama,
        kelas: kelas
      });
    }
  }
  
  Logger.log(`Siswa yang tidak memiliki foto di Kolom E (${missingPhotos.length}):`);
  missingPhotos.forEach(student => {
    Logger.log(`NISN: ${student.nisn}, Nama: ${student.nama}, Kelas: ${student.kelas}`);
  });
  
  return missingPhotos;
}
