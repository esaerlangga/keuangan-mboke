// ==============================================
// PENGGANTI PROMPT KUSTOM
// ==============================================
window.prompt = function (judul, petunjuk = "") {
  if (!document.getElementById("wadah-input-kustom")) {
    const wadah = document.createElement("div");
    wadah.id = "wadah-input-kustom";
    wadah.className = "wadah-input-kustom";
    wadah.innerHTML = `
      <div class="kotak-input-kustom">
        <h4 id="judul-input"></h4>
        <p id="petunjuk-input"></p>
        <input type="text" id="nilai-input" placeholder="Contoh: 750000" inputmode="numeric">
        <div class="tombol-input">
          <button type="button" id="btn-batal-input" class="btn-batal">Batal</button>
          <button type="button" id="btn-ok-input" class="btn-ya">OK</button>
        </div>
      </div>
    `;
    document.body.appendChild(wadah);
  }

  const wadah = document.getElementById("wadah-input-kustom");
  document.getElementById("judul-input").textContent = judul;
  document.getElementById("petunjuk-input").textContent = petunjuk;
  const input = document.getElementById("nilai-input");
  input.value = "";
  wadah.classList.add("tampil");
  input.focus();

  return new Promise((resolve) => {
    const tutup = () => {
      wadah.classList.remove("tampil");
      resolve(null);
    };
    const ok = () => {
      wadah.classList.remove("tampil");
      resolve(input.value.trim());
    };

    document.getElementById("btn-batal-input").onclick = tutup;
    document.getElementById("btn-ok-input").onclick = ok;
    input.onkeydown = (e) => {
      if (e.key === "Enter") ok();
      if (e.key === "Escape") tutup();
    };
  });
};

// ==============================================
// FUNGSI UTAMA HITUNG DASHBOARD & RENDER KEDUA TABEL
// ==============================================
function muatDashboardUtama() {
  const dataLaporan = JSON.parse(localStorage.getItem("laporanHarian") || "[]");
  const dataRiwayat = JSON.parse(
    localStorage.getItem("data_transaksi_sambel_tempong") || "[]",
  );

  // 1. Hitung Total Ringkasan Akumulasi Juli
  let totalOmset = 0;
  let totalLabaKotor = 0;
  let totalLabaBersih = 0;

  dataLaporan.forEach((item) => {
    totalOmset += Number(item.omset || 0);
    totalLabaKotor += Number(item.labaKotor || 0);
    totalLabaBersih += Number(item.labaBersih || 0);
  });

  // Tampilkan Nilai Ringkasan ke Kartu Dashboard
  const elOmset = document.getElementById("nilai-omset");
  const elLabaKotor = document.getElementById("nilai-labakotor");
  const elLabaBersih = document.getElementById("nilai-lababersih");

  if (elOmset) elOmset.innerText = `Rp ${totalOmset.toLocaleString("id-ID")}`;
  if (elLabaKotor)
    elLabaKotor.innerText = `Rp ${totalLabaKotor.toLocaleString("id-ID")}`;
  if (elLabaBersih)
    elLabaBersih.innerText = `Rp ${totalLabaBersih.toLocaleString("id-ID")}`;

  // 2. Beri jeda singkat agar DOM siap, lalu isi KEDUA TABEL
  setTimeout(() => {
    const tbodyLaporan = document.getElementById("isi-tabel-laporan");
    const elWaktu = document.getElementById("waktu-perbarui");

    // A. ISI TABEL 1: LAPORAN HARIAN LENGKAP
    if (tbodyLaporan) {
      if (dataLaporan.length === 0) {
        tbodyLaporan.innerHTML = `<tr><td colspan="15" class="tabel-kosong">Belum ada data laporan harian.</td></tr>`;
      } else {
        tbodyLaporan.innerHTML = dataLaporan
          .map((row) => {
            const namaKasbonFix =
              row.namaKaryawanKasbon || row.namaKasbon || "-";
            return `
              <tr>
                <td>${row.tanggal || "-"}</td>
                <td>Rp ${(row.tunai || 0).toLocaleString("id-ID")}</td>
                <td>Rp ${(row.qrisMasuk || 0).toLocaleString("id-ID")}</td>
                <td>Rp ${(row.transfer || 0).toLocaleString("id-ID")}</td>
                <td>Rp ${(row.tabunganWajib || 0).toLocaleString("id-ID")}</td>
                <td>Rp ${(row.kasbon || 0).toLocaleString("id-ID")}</td>
                <td>${namaKasbonFix}</td>
                <td>Rp ${(row.belanjaPasar || 0).toLocaleString("id-ID")}</td>
                <td>Rp ${(row.opsRiil || 0).toLocaleString("id-ID")}</td>
                <td>Rp ${(row.qrisKeluar || 0).toLocaleString("id-ID")}</td>
                <td><strong>Rp ${(row.omset || 0).toLocaleString("id-ID")}</strong></td>
                <td><strong>Rp ${(row.labaKotor || 0).toLocaleString("id-ID")}</strong></td>
                <td><strong>Rp ${(row.labaBersih || 0).toLocaleString("id-ID")}</strong></td>
                <td style="max-width: 250px; font-size: 12px;">${row.keterangan || "-"}</td>
                <td><span style="color:#22c55e; font-weight:bold; font-size:12px;">✓ Sukses</span></td>
              </tr>
            `;
          })
          .join("");
      }
    }

    // B. BUAT ATAU TAMPILKAN TABEL 2: DETAIL RIWAYAT TRANSAKSI SATUAN
    const wadahTabel = document.getElementById("wadah-tabel-transaksi");
    if (wadahTabel && !document.getElementById("wadah-tabel-riwayat-satuan")) {
      const elemenRiwayat = document.createElement("div");
      elemenRiwayat.id = "wadah-tabel-riwayat-satuan";
      elemenRiwayat.style.marginTop = "35px";
      elemenRiwayat.style.paddingTop = "20px";
      elemenRiwayat.style.borderTop = "2px dashed #cbd5e1";

      elemenRiwayat.innerHTML = `
        <h3>📜 Detail Riwayat Input Transaksi Satuan</h3>
        <div class="tabel-responsif" style="margin-top: 12px;">
          <table class="tabel-transaksi">
            <thead>
              <tr>
                <th>No</th>
                <th>Tanggal</th>
                <th>Jenis</th>
                <th>Kategori</th>
                <th class="rata-kanan">Nominal</th>
                <th>Keterangan</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody id="isi-tabel-riwayat"></tbody>
          </table>
        </div>
      `;
      wadahTabel.appendChild(elemenRiwayat);
    }

    // C. ISI TABEL RIWAYAT TRANSAKSI SATUAN (OTOMATIS KONVERSI DATA HARIAN BILA MANUAL KOSONG)
    const tbodyRiwayat = document.getElementById("isi-tabel-riwayat");
    if (tbodyRiwayat) {
      let sumberRiwayat = dataRiwayat;

      if (sumberRiwayat.length === 0 && dataLaporan.length > 0) {
        sumberRiwayat = dataLaporan.map((item, idx) => ({
          id: idx + 1,
          tanggal: item.tanggal,
          jenis: "masuk",
          kategori: "Omset Harian",
          jumlah: item.omset,
          keterangan: item.keterangan || "Rekapan Laporan Harian",
        }));
      }

      if (sumberRiwayat.length === 0) {
        tbodyRiwayat.innerHTML = `<tr><td colspan="7" class="tabel-kosong">Belum ada transaksi satuan baru yang diinput manual.</td></tr>`;
      } else {
        tbodyRiwayat.innerHTML = sumberRiwayat
          .map((t, i) => {
            const warna =
              t.jenis === "masuk" ? "color:#16a34a;" : "color:#dc2626;";
            const jenisTeks = t.jenis === "masuk" ? "🟢 MASUK" : "🔴 KELUAR";
            return `
              <tr>
                <td>${i + 1}</td>
                <td>${t.tanggal}</td>
                <td>${jenisTeks}</td>
                <td>${t.kategori || "-"}</td>
                <td class="rata-kanan" style="font-weight:bold; ${warna}">Rp ${(t.jumlah || 0).toLocaleString("id-ID")}</td>
                <td style="max-width:280px; font-size:12px;">${t.keterangan || "—"}</td>
                <td>
                  <button onclick="hapusTransaksi(${t.id})" style="background:#ef4444; color:white; border:none; padding:4px 8px; border-radius:4px; cursor:pointer; font-size:12px;">🗑️ Hapus</button>
                </td>
              </tr>
            `;
          })
          .join("");
      }
    }

    if (elWaktu) {
      const skr = new Date();
      elWaktu.innerText = `${skr.getDate()}/${skr.getMonth() + 1}/${skr.getFullYear()}, ${String(skr.getHours()).padStart(2, "0")}:${String(skr.getMinutes()).padStart(2, "0")}`;
    }
  }, 100);
}

// ==============================================
// INSIALISASI SISTEM & EVENT LISTENERS
// ==============================================
document.addEventListener("DOMContentLoaded", function () {
  const PASSWORD = { manajer: "Esa91", owner: "owner123" };
  let roleYangDipilih = null;

  // 1. INJEKSI / UPDATE DATA EXCEL JULI 2026 KETIKA LOGS PERTAMA
  const dataExcelJuli = [
    {
      tanggal: "2026-07-01",
      tunai: 663000,
      qrisMasuk: 236000,
      transfer: 0,
      tabunganWajib: 495000,
      kasbon: 0,
      namaKaryawanKasbon: "-",
      belanjaPasar: 233800,
      opsRiil: 28000,
      qrisKeluar: 0,
      omset: 899000,
      labaKotor: 607200,
      labaBersih: 112200,
      keterangan:
        "Uang Makan Staf: Rp 30.000. Belanja Pasar : Minyak, Elpiji, Galon, Terasi, Tempe, Terigu, dan Es Batu. Ops Rill : Cleantex 18.000 + Bensin 10.000",
    },
    {
      tanggal: "2026-07-02",
      tunai: 874000,
      qrisMasuk: 855000,
      transfer: 0,
      tabunganWajib: 495000,
      kasbon: 0,
      namaKaryawanKasbon: "-",
      belanjaPasar: 697000,
      opsRiil: 81000,
      qrisKeluar: 0,
      omset: 1729000,
      labaKotor: 921000,
      labaBersih: 426000,
      keterangan:
        "Uang Makan Staf: Rp 30.000. Belanja Pasar : Gula, Telur ayam, Elpiji, 3kg, Galon, Beras 5 kg, Jeruk manis,Timun,Sawi putih,Kol / gubis, Wortel, Kembang kol, Bawang bombay, Kangkung, Sawi, hijau, Kerupuk. Ops Rill : Tempat sambal 25 mL, Panci mie, Karet pentil",
    },
    {
      tanggal: "2026-07-03",
      tunai: 1981000,
      qrisMasuk: 268000,
      transfer: 0,
      tabunganWajib: 495000,
      kasbon: 0,
      namaKaryawanKasbon: "-",
      belanjaPasar: 290100,
      opsRiil: 0,
      qrisKeluar: 0,
      omset: 2249000,
      labaKotor: 1928900,
      labaBersih: 1433900,
      keterangan:
        "Uang Makan Staf: Rp 30.000. Belanja Pasar : Micin Sasa 250gr, Terigu Segitiga Biru, Terigu Kunci Biru, Minyak Goreng Fortune, Kopi Kapal Api, Minyak Goreng Alfa, Kecap Bango, Es Batu, Tempe, Kerupuk Nasgor, Pentol Bakso, Pentol Ikan, Nanas. Ops Riil : Tambahan modal 4/7.",
    },
    {
      tanggal: "2026-07-04",
      tunai: 1378000,
      qrisMasuk: 1006000,
      transfer: 0,
      tabunganWajib: 495000,
      kasbon: 0,
      namaKaryawanKasbon: "-",
      belanjaPasar: 681200,
      opsRiil: 58000,
      qrisKeluar: 335000,
      omset: 2384000,
      labaKotor: 1279800,
      labaBersih: 784800,
      keterangan:
        "Uang Makan Staf: Rp 30.000. Belanja Pasar : Minyak goreng Sovia, Margarin Filma, Gula, Beras sushi, Telur, Terigu, Elpiji 3kg, Galon, Kangkung, Sawi hijau, Sawi putih, Kembang kol, Jeruk manis, Telur asin, Tempe, Bumbu rujak, Jagung baby, Timun. Ops Riil : Wipol, Sedotan hitam steril, Bensin.. . QRIS: Kerupuk (180k), Kunir (80k), Kencur (75k)",
    },
    {
      tanggal: "2026-07-05",
      tunai: 516000,
      qrisMasuk: 520000,
      transfer: 0,
      tabunganWajib: 495000,
      kasbon: 0,
      namaKaryawanKasbon: "-",
      belanjaPasar: 309000,
      opsRiil: 8700,
      qrisKeluar: 0,
      omset: 1036000,
      labaKotor: 688300,
      labaBersih: 193300,
      keterangan:
        "Uang Makan Staf: Rp 30.000. Belanja Pasar : Tomat, Lombok besar merah, Lombok kecil merah, Jeruk nipis, Bawang bombay, Timun, Kangkung, Tempe, Ayam sayap, Es batu. Ops Riil : Obat (Oskadon, Paramex, Decolgen).",
    },
    {
      tanggal: "2026-07-06",
      tunai: 986000,
      qrisMasuk: 760000,
      transfer: 0,
      tabunganWajib: 495000,
      kasbon: 0,
      namaKaryawanKasbon: "-",
      belanjaPasar: 425400,
      opsRiil: 70900,
      qrisKeluar: 0,
      omset: 1746000,
      labaKotor: 1229700,
      labaBersih: 734700,
      keterangan:
        "Uang Makan Staf: Rp 20.000. Belanja Pasar : Sirup Marjan merah, Beras Alfamart 5kg, Racik ayam goreng, Minyak goreng Sovia, Telur ayam, Terigu, Nasi putih, Saos 3 anak, Minyak wijen, Ladaku, Bubuk ketumbar, Susu Carnation. Ops Riil : Vape, Elpiji 3kg",
    },
    {
      tanggal: "2026-07-07",
      tunai: 975000,
      qrisMasuk: 249000,
      transfer: 0,
      tabunganWajib: 495000,
      kasbon: 0,
      namaKaryawanKasbon: "-",
      belanjaPasar: 574800,
      opsRiil: 65000,
      qrisKeluar: 687000,
      omset: 1224000,
      labaKotor: -132800,
      labaBersih: -627800,
      keterangan:
        "Uang Makan Staf: Rp 30.000. Belanja Pasar : Gula Gmp, Minyak goreng Fortune, Es batu, Sosis salam 500gr, Kentang, Tepung panir, Jeruk manis, Kweatiau, Kangkung, Lombok merah besar, Bawang putih kupas, Bawang merah biasa, Sereh, Bawang prei, Timun, Daun jeruk, Lombok lalap hijau. Ops Riil : Elpiji 3kg, Galon, Bensin. Pengeluaran Qris: Pe merah, Lele",
    },
    {
      tanggal: "2026-07-08",
      tunai: 352000,
      qrisMasuk: 513000,
      transfer: 0,
      tabunganWajib: 495000,
      kasbon: 0,
      namaKaryawanKasbon: "-",
      belanjaPasar: 1178000,
      opsRiil: 50000,
      qrisKeluar: 0,
      omset: 865000,
      labaKotor: -383000,
      labaBersih: -878000,
      keterangan:
        "Uang Makan Staf: Rp 20.000. Belanja Pasar : Bayar pak geo , Margarin Forvita, Telur ayam, Sawi putih, Wortel, Kol gubis, Tempe, Marjan hijau. Ops Riil : Trasak besar",
    },
    {
      tanggal: "2026-07-09",
      tunai: 1003000,
      qrisMasuk: 410000,
      transfer: 0,
      tabunganWajib: 495000,
      kasbon: 0,
      namaKaryawanKasbon: "-",
      belanjaPasar: 698200,
      opsRiil: 172500,
      qrisKeluar: 0,
      omset: 1413000,
      labaKotor: 512300,
      labaBersih: 17300,
      keterangan:
        "Uang Makan Staf: Rp 30.000. Belanja Pasar : Bebek utuh, Usus ayam, Ayam dada fillet, Ati ampela ayam, Pentol bakso, Telur ayam, Galon, Es batu, Jeruk manis. Ops Riil : Elpiji 3kg, Tinta prinnt, Parkir BCA. Bayar Pak Geo Rp. 110.000 (Kurang Beli Bebek di Bu Sri Rp 120.000)",
    },
    {
      tanggal: "2026-07-10",
      tunai: 756000,
      qrisMasuk: 593000,
      transfer: 0,
      tabunganWajib: 495000,
      kasbon: 0,
      namaKaryawanKasbon: "-",
      belanjaPasar: 511500,
      opsRiil: 0,
      qrisKeluar: 0,
      omset: 1349000,
      labaKotor: 807500,
      labaBersih: 312500,
      keterangan:
        "Uang Makan Staf: Rp 30.000. Belanja Pasar : Bayar Pak Geo (Daging Bebek 120.000), Minyak Goreng Sovia, Tepung Terigu Segitiga Biru, Kopi Kapal Api, Saos Sambal 3 Anak, Galon, Es batu, Tempe, Sawi hijau, Kangkung, Kol gubis, Jeruk manis, Bensin.",
    },
    {
      tanggal: "2026-07-11",
      tunai: 957000,
      qrisMasuk: 1369000,
      transfer: 0,
      tabunganWajib: 495000,
      kasbon: 500000,
      namaKaryawanKasbon: "Fitri (Rp 500.000)",
      belanjaPasar: 652500,
      opsRiil: 1143500,
      qrisKeluar: 0,
      omset: 2326000,
      labaKotor: 500000,
      labaBersih: -495000,
      keterangan:
        "Uang Makan Staf: Rp 30.000. Belanja Pasar : Minyak Sovia 2lt, Kopi kapal api, Beras Mentari, Tepung terigu segitiga biru, Ladaku, Susu carnation, Saos 3 anak, Telur, Elpiji 3kg, Galon, Es batu, Tempe, Kangkung, Bawang prei, Timun, Ayam pejantan, Ayam potong, Bebek. Ops Riil : Beli panci besar air 100 liter (Ops Riil warung) Kasbon kasir: Mbak Fitri",
    },
    {
      tanggal: "2026-07-12",
      tunai: 799000,
      qrisMasuk: 1625000,
      transfer: 0,
      tabunganWajib: 495000,
      kasbon: 0,
      namaKaryawanKasbon: "-",
      belanjaPasar: 1408800,
      opsRiil: 0,
      qrisKeluar: 0,
      omset: 2424000,
      labaKotor: 985200,
      labaBersih: 490200,
      keterangan:
        "Uang Makan Staf: Rp 30.000. Belanja Pasar : Pak Geo (Ayam Pejantan & Bebek), Tepung Maizena, Penyedap Royco, Kecap Bango, Gula, Sirup Marjan Merah, Kopi Kapal Api, Galon, Es Batu, Kangkung, Terong, Timun, Sawi Hijau, Jeruk Manis, Jeruk Nipis, Kemangi, Tomat.",
    },
    {
      tanggal: "2026-07-13",
      tunai: 1845000,
      qrisMasuk: 159000,
      transfer: 0,
      tabunganWajib: 495000,
      kasbon: 0,
      namaKaryawanKasbon: "-",
      belanjaPasar: 0,
      opsRiil: 1382100,
      qrisKeluar: 0,
      omset: 2004000,
      labaKotor: 601900,
      labaBersih: 106900,
      keterangan:
        "Uang Makan Staf: Rp 20.000. Ops Riil : Beli Timbangan Bebek 1.350.000, galon 12.000, bensin 20.000. (Di nota nota belanja dilaporkan besoknya digabung tgl 14 kasir)",
    },
    {
      tanggal: "2026-07-14",
      tunai: 1186000,
      qrisMasuk: 299000,
      transfer: 0,
      tabunganWajib: 495000,
      kasbon: 0,
      namaKaryawanKasbon: "-",
      belanjaPasar: 869000,
      opsRiil: 91000,
      qrisKeluar: 0,
      omset: 1485000,
      labaKotor: 495000,
      labaBersih: 0,
      keterangan:
        "Uang Makan Staf: Rp 30.000. Belanja Gabungan (13/14) : Pak Geo, Terasi, Minyak Goreng Sovia, Tepung Terigu, Tepung Tapioka, Margarin, Garam, Kopi Kapal Api, Saos 3 Anak, Es Batu, Galon, Jeruk Manis, Ayam Pejantan, Tempe, Kangkung, Kol, Terong, Wortel. Ops Riil : Nota Wipol & Bensin.",
    },
    {
      tanggal: "2026-07-15",
      tunai: 1003000,
      qrisMasuk: 1071000,
      transfer: 0,
      tabunganWajib: 495000,
      kasbon: 0,
      namaKaryawanKasbon: "-",
      belanjaPasar: 1271300,
      opsRiil: 147000,
      qrisKeluar: 0,
      omset: 2074000,
      labaKotor: 635700,
      labaBersih: 140700,
      keterangan:
        "Uang Makan Staf: Rp 20.000. Belanja Pasar : Pak Geo, Minyak Goreng Sovia, Beras Mentari, Telur, Kecap Bango, Margarin, Kopi Kapal Api, Galon, Es Batu, Ayam Pejantan, Ayam Potong, Tempe, Kangkung, Kol, Sawi Hijau, Wortel, Bawang Merah/Putih, Cabai Merah/Kecil, Jeruk Manis. Ops Riil : Elpiji 3kg, Trashbag.",
    },
    {
      tanggal: "2026-07-16",
      tunai: 1173000,
      qrisMasuk: 235000,
      transfer: 0,
      tabunganWajib: 495000,
      kasbon: 0,
      namaKaryawanKasbon: "-",
      belanjaPasar: 490000,
      opsRiil: 189000,
      qrisKeluar: 0,
      omset: 1408000,
      labaKotor: 709000,
      labaBersih: 214000,
      keterangan:
        "Uang Makan Staf: Rp 20.000. Belanja Pasar : Pak Geo, Minyak Sovia, Terigu Segitiga, Kopi Kapal Api, Saos 3 Anak, Galon, Es Batu, Tempe, Kangkung, Kol, Jeruk Manis. Ops Riil : Elpiji 3kg, Lampu Warung, Bensin.",
    },
    {
      tanggal: "2026-07-17",
      tunai: 1120000,
      qrisMasuk: 640000,
      transfer: 0,
      tabunganWajib: 495000,
      kasbon: 0,
      namaKaryawanKasbon: "-",
      belanjaPasar: 712000,
      opsRiil: 55000,
      qrisKeluar: 0,
      omset: 1760000,
      labaKotor: 963000,
      labaBersih: 468000,
      keterangan:
        "Uang Makan Staf: Rp 30.000. Belanja Pasar : Pak Geo, Minyak Sovia, Beras Mentari, Telur, Terigu, Garam, Galon, Es Batu, Ayam Pejantan, Tempe, Kangkung, Terong, Sawi, Cabai, Bawang, Jeruk Manis. Ops Riil : Galon, Bensin.",
    },
    {
      tanggal: "2026-07-18",
      tunai: 809000,
      qrisMasuk: 497000,
      transfer: 0,
      tabunganWajib: 495000,
      kasbon: 1100000,
      namaKaryawanKasbon:
        "ESA (Rp 100.000), Andin (Rp 500.000), Dika (Rp 500.000)",
      belanjaPasar: 544900,
      opsRiil: 0,
      qrisKeluar: 0,
      omset: 1306000,
      labaKotor: 731100,
      labaBersih: -863900,
      keterangan:
        "Uang Makan Staf: Rp 30.000. Belanja: Minyak Fortune, Beras Mentari, Telur, Elpiji, Galon, Cireng, Mayonnaise, Es batu, Beras gurami, Bawang merah/putih, Bawang bombay, Kerupuk nasgor, Kangkung, Tempe. Kasbon: Mas Esa,Andin,Dika",
    },
    {
      tanggal: "2026-07-19",
      tunai: 801000,
      qrisMasuk: 561000,
      transfer: 0,
      tabunganWajib: 495000,
      kasbon: 0,
      namaKaryawanKasbon: "-",
      belanjaPasar: 503600,
      opsRiil: 240500,
      qrisKeluar: 0,
      omset: 1362000,
      labaKotor: 587900,
      labaBersih: 92900,
      keterangan:
        "Uang Makan Staf: Rp 30.000. Belanja Pasar : Pak Geo, Minyak Sovia, Tepung Terigu, Margarin, Saos, Galon, Es Batu, Tempe, Kangkung, Terong, Kol, Jeruk Manis. Ops Riil : Nota Kebersihan & Bensin.",
    },
    {
      tanggal: "2026-07-20",
      tunai: 702000,
      qrisMasuk: 438000,
      transfer: 0,
      tabunganWajib: 495000,
      kasbon: 0,
      namaKaryawanKasbon: "-",
      belanjaPasar: 388000,
      opsRiil: 50000,
      qrisKeluar: 0,
      omset: 1140000,
      labaKotor: 672000,
      labaBersih: 177000,
      keterangan:
        "Uang Makan Staf: Rp 30.000. Belanja Pasar : Minyak Sovia, Beras Mentari, Galon, Es Batu, Tempe, Kangkung, Terong, Sawi, Jeruk Manis. Ops Riil : Elpiji 3kg & Bensin.",
    },
    {
      tanggal: "2026-07-21",
      tunai: 950000,
      qrisMasuk: 310000,
      transfer: 0,
      tabunganWajib: 495000,
      kasbon: 0,
      namaKaryawanKasbon: "-",
      belanjaPasar: 410000,
      opsRiil: 25000,
      qrisKeluar: 0,
      omset: 1260000,
      labaKotor: 795000,
      labaBersih: 300000,
      keterangan:
        "Uang Makan Staf: Rp 30.000. Belanja Pasar : Pak Geo, Minyak, Terigu, Galon, Es Batu, Tempe, Kangkung, Terong, Jeruk. Ops Riil : Bensin.",
    },
  ];

  // Simpan data Excel Juli 2026 ke memori lokal
  localStorage.setItem("laporanHarian", JSON.stringify(dataExcelJuli));

  // ==============================================
  // FUNGSI NOTIFIKASI & KONFIRMASI
  // ==============================================
  function tampilkanNotifikasi(jenis, pesan, durasi = 3400) {
    const wadah = document.getElementById("wadah-notifikasi");
    if (!wadah) return;

    const ikonSvg = {
      berhasil: `<svg viewBox="0 0 24 24"><path d="M5 12l5 5L20 7"/></svg>`,
      error: `<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>`,
      warning: `<svg viewBox="0 0 24 24"><path d="M12 9v4M12 17h.01"/><path d="M10.3 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>`,
      info: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>`,
    };

    const el = document.createElement("div");
    el.className = `notifikasi notif-${jenis}`;
    el.innerHTML = `
      <span class="ikon-notif">${ikonSvg[jenis]}</span>
      <span class="pesan-notif">${pesan}</span>
      <button type="button" class="tutup-notif" aria-label="Tutup">×</button>
    `;

    wadah.prepend(el);
    const timer = setTimeout(() => {
      el.classList.add("notif-hilang");
      setTimeout(() => el.remove(), 350);
    }, durasi);
    el.querySelector(".tutup-notif").addEventListener("click", () => {
      clearTimeout(timer);
      el.classList.add("notif-hilang");
      setTimeout(() => el.remove(), 350);
    });
  }

  function tampilkanKonfirmasi(
    pesan,
    fungsiJikaYa,
    teksTombolYa = "Ya, Lanjutkan",
  ) {
    let wadah =
      document.getElementById("wadah-konfirmasi") ||
      Object.assign(document.createElement("div"), { id: "wadah-konfirmasi" });
    document.body.appendChild(wadah);
    wadah.innerHTML = `
      <div class="kotak-konfirmasi">
        <div class="isi-konfirmasi">
          <span class="pesan-konfirmasi">${pesan}</span>
          <div class="tombol-konfirmasi">
            <button type="button" class="btn-batal">Batal</button>
            <button type="button" class="btn-ya">${teksTombolYa}</button>
          </div>
        </div>
      </div>
    `;
    wadah.querySelector(".btn-batal").onclick = () => wadah.remove();
    wadah.querySelector(".btn-ya").onclick = () => {
      wadah.remove();
      fungsiJikaYa();
    };
  }

  // ==============================================
  // TOMBOL PILIH ROLE & LOGIN
  // ==============================================
  document.addEventListener("click", (e) => {
    const tombolRole = e.target.closest(".tombol-role");
    if (tombolRole) {
      document
        .querySelectorAll(".tombol-role")
        .forEach((t) => t.classList.remove("aktif"));
      tombolRole.classList.add("aktif");
      roleYangDipilih = tombolRole.dataset.role;
    }
  });

  const tombolMasuk = document.getElementById("tombol-masuk");
  if (tombolMasuk) {
    tombolMasuk.addEventListener("click", () => {
      const pw = document.getElementById("password").value.trim();
      if (!roleYangDipilih)
        return tampilkanNotifikasi(
          "warning",
          "Silakan pilih dulu: Manajer atau Owner",
        );
      if (!pw)
        return tampilkanNotifikasi(
          "warning",
          "Masukkan password terlebih dahulu",
        );

      if (pw === PASSWORD[roleYangDipilih]) {
        tampilkanNotifikasi(
          "berhasil",
          "Berhasil masuk sebagai " + roleYangDipilih.toUpperCase(),
        );
        localStorage.setItem("roleAktif", roleYangDipilih);
        setTimeout(() => {
          document.getElementById("halaman-login").style.display = "none";
          document.getElementById("halaman-utama").style.display = "block";
          document.body.classList.add("logged-in");

          const labelRole = document.getElementById("label-role");
          const sapaan = document.getElementById("sapaan-user");
          const pesan = document.getElementById("pesan-user");

          if (labelRole) {
            labelRole.innerHTML =
              roleYangDipilih === "manajer"
                ? "👨‍💼 Esa (Manajer)"
                : "👑 Bu Dewi (Owner)";
            labelRole.className = `chip-role chip-${roleYangDipilih}`;
          }
          if (sapaan)
            sapaan.textContent =
              roleYangDipilih === "manajer"
                ? "Selamat datang, Esa😊"
                : "Selamat datang, Bu Dewi😊";
          if (pesan)
            pesan.textContent =
              roleYangDipilih === "manajer"
                ? "Akses penuh: input transaksi, atur tabungan, ubah data, lihat laporan."
                : "Semoga hari-harinya selalu menyenangkan & Sambel Tempong Mbok'e makin berkah🙌.";

          if (roleYangDipilih === "owner") {
            document
              .querySelectorAll("#menu-utama .khusus-manajer")
              .forEach((m) => (m.style.display = "none"));
          } else {
            document
              .querySelectorAll("#menu-utama .khusus-manajer")
              .forEach((m) => (m.style.display = "inline-block"));
          }

          muatDashboardUtama();
        }, 650);
      } else {
        tampilkanNotifikasi("error", "Password salah! Coba lagi");
        document.getElementById("password").value = "";
      }
    });
  }

  document.getElementById("password")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") tombolMasuk.click();
  });

  // LOGOUT
  document.addEventListener("click", (e) => {
    if (e.target.closest("#tombol-keluar")) {
      tampilkanKonfirmasi(
        "Yakin ingin keluar?",
        () => {
          tampilkanNotifikasi("info", "Sedang keluar...");
          localStorage.removeItem("roleAktif");
          setTimeout(() => window.location.reload(), 500);
        },
        "Ya, Keluar",
      );
    }
  });

  // ==============================================
  // NAVIGASI MENU
  // ==============================================
  document.addEventListener("click", (e) => {
    const tombol = e.target.closest(".tombol-menu");
    if (!tombol) return;

    const roleAktif = localStorage.getItem("roleAktif");
    if (roleAktif === "owner" && tombol.classList.contains("khusus-manajer")) {
      tampilkanNotifikasi("error", "⚠️ Anda tidak memiliki akses ke menu ini.");
      return;
    }

    document
      .querySelectorAll("#menu-utama .tombol-menu")
      .forEach((m) => m.classList.remove("aktif"));
    tombol.classList.add("aktif");

    const menu = tombol.dataset.menu;
    const sapaan = document.getElementById("sapaan-user");
    const pesan = document.getElementById("pesan-user");
    const elRingkasan = document.getElementById("ringkasan-keuangan");
    const elWadahTabel = document.getElementById("wadah-tabel-transaksi");
    document.getElementById("wadah-form-transaksi")?.remove();

    if (elRingkasan) elRingkasan.style.display = "none";
    if (elWadahTabel) elWadahTabel.style.display = "none";

    switch (menu) {
      case "dashboard":
        const roleSaatIni = localStorage.getItem("roleAktif");
        if (sapaan) {
          sapaan.textContent =
            roleSaatIni === "owner"
              ? "Selamat datang, Bu Dewi😊"
              : "Selamat datang, Esa😊";
        }
        if (pesan) {
          pesan.textContent =
            roleSaatIni === "owner"
              ? "Semoga hari-harinya selalu menyenangkan & Sambel Tempong Mbok'e makin berkah🙌."
              : "Ringkasan arus kas & laporan harian lengkap.";
        }
        if (elRingkasan) elRingkasan.style.display = "grid";
        if (elWadahTabel) elWadahTabel.style.display = "block";

        muatDashboardUtama();
        break;

      case "transaksi":
        if (sapaan) sapaan.textContent = "👌Semangat Dan Teliti 💪";
        if (pesan)
          pesan.textContent =
            "Jangan lupa catat semua transaksi harian agar laporan keuangan akurat.";

        const wadahFormTransaksi = Object.assign(
          document.createElement("div"),
          { id: "wadah-form-transaksi" },
        );
        pesan.parentNode.appendChild(wadahFormTransaksi);
        if (typeof renderFormTransaksi === "function")
          renderFormTransaksi(wadahFormTransaksi);
        break;

      case "tabungan":
        if (sapaan) sapaan.textContent = "🏦 Pengelolaan Tabungan";
        if (pesan) pesan.textContent = "Sisihkan uang ke pos wajib.";

        const wadahFormTabungan = Object.assign(document.createElement("div"), {
          id: "wadah-form-transaksi",
        });
        pesan.parentNode.appendChild(wadahFormTabungan);
        if (typeof renderTabungan === "function")
          renderTabungan(wadahFormTabungan);
        break;

      case "laporan":
        if (sapaan) sapaan.textContent = "📊 Laporan Bulanan";
        if (pesan)
          pesan.textContent = "Rekap data harian jadi laporan siap cetak.";

        const wadahFormLaporan = Object.assign(document.createElement("div"), {
          id: "wadah-form-transaksi",
        });
        pesan.parentNode.appendChild(wadahFormLaporan);
        if (typeof renderLaporan === "function")
          renderLaporan(wadahFormLaporan);
        break;
    }
  });

  // CEK SESI SAAT HALAMAN DIBUKA
  const roleTersimpan = localStorage.getItem("roleAktif");
  if (roleTersimpan) {
    roleYangDipilih = roleTersimpan;
    document.getElementById("halaman-login").style.display = "none";
    document.getElementById("halaman-utama").style.display = "block";

    const labelRole = document.getElementById("label-role");
    const sapaan = document.getElementById("sapaan-user");
    const pesan = document.getElementById("pesan-user");

    if (labelRole) {
      labelRole.innerHTML =
        roleTersimpan === "manajer" ? "👨‍💼 Esa (Manajer)" : "👑 Bu Dewi (Owner)";
      labelRole.className = `chip-role chip-${roleTersimpan}`;
    }
    if (sapaan) {
      sapaan.textContent =
        roleTersimpan === "owner"
          ? "Selamat datang, Bu Dewi😊"
          : "Selamat datang, Esa😊";
    }
    if (pesan) {
      pesan.textContent =
        roleTersimpan === "owner"
          ? "Semoga hari-harinya selalu menyenangkan & Sambel Tempong Mbok'e makin berkah🙌."
          : "Ringkasan arus kas & laporan harian lengkap.";
    }

    if (roleTersimpan === "owner") {
      document
        .querySelectorAll("#menu-utama .khusus-manajer")
        .forEach((m) => (m.style.display = "none"));
    }

    muatDashboardUtama();
  }
});

// ==============================================
// SERVICE WORKER
// ==============================================
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./sw.js")
      .then((reg) => console.log("Service Worker terdaftar!", reg))
      .catch((err) => console.log("Service Worker gagal:", err));
  });
}
