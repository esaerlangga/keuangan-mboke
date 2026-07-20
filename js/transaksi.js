// ==================================================
// FITUR INPUT TRANSAKSI + DASHBOARD + TABUNGAN — FINAL
// SUDAH DIPERBAIKI: BERSIH DARI DUPLIKASI KODE
// ==================================================
const URL_API =
  "https://script.google.com/macros/s/AKfycbwgdScsIBTMQ5Aw3hsCgeDSWOwV-b1ySVB46h8uHQjeCkMdcCya_pwoPwEtvja3y1BJpQ/exec";

function simpanTransaksiKeServer(dataTransaksi) {
  // Menampilkan indikator loading atau proses simpan jika diperlukan

  fetch(URL_API, {
    method: "POST",
    mode: "no-cors", // Wajib menggunakan no-cors agar lolos dari blokir browser
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dataTransaksi),
  })
    .then(() => {
      alert(
        "Data transaksi berhasil disimpan ke server online (Google Sheets)!",
      );
      // Bersihkan form atau muat ulang tabel laporan
    })
    .catch((err) => {
      console.error("Gagal menyimpan:", err);
      alert("Terjadi kesalahan saat menyambungkan ke server.");
    });
}
const KATEGORI = {
  masuk: [
    { id: "tunai", label: "💰 Tunai" },
    { id: "qris_masuk", label: "📱 QRIS" },
    { id: "transfer", label: "🏦 Transfer Bank" },
  ],
  keluar: [
    { id: "belanja_pasar", label: "🥬 Belanja Pasar" },
    { id: "bayar_suplayer", label: "📦 Bayar Suplayer" },
    { id: "qris_keluar", label: "💳 Pengeluaran QRIS" },
    { id: "ops_riil", label: "⚠️ OPS RIIL (Biaya Tak Terduga)" },
    { id: "makan_karyawan", label: "🍱 Uang Makan Karyawan" },
    { id: "kasbon", label: "💸 Kasbon Karyawan" },
  ],
};
const STORAGE_KEY = "data_transaksi_sambel_tempong";

function ambilSemuaTransaksi() {
  const d = localStorage.getItem(STORAGE_KEY);
  return d ? JSON.parse(d) : [];
}
function simpanSemuaTransaksi(arr) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
}
function formatRupiah(n) {
  if (isNaN(n)) n = 0;
  return "Rp " + new Intl.NumberFormat("id-ID").format(parseInt(n));
}
function labelKategori(jenis, id) {
  const c = KATEGORI[jenis] || [];
  const k = c.find((x) => x.id === id);
  return k ? k.label : id;
}

// ==================================================
// 📝 RENDER FORM INPUT TRANSAKSI
// ==================================================
function renderFormTransaksi(target) {
  if (!target) return;
  target.innerHTML = `
        <section class="kartu-form">
            <div class="judul-form">
                <h3>➕ Input Transaksi Baru</h3>
                <p>Catat setiap arus uang masuk & keluar secara rinci.</p>
            </div>
            <form id="form-transaksi" autocomplete="off" class="form-grid">
                <div class="field full">
                    <label>Jenis Transaksi *</label>
                    <div class="pilih-jenis">
                        <label class="radio-card radio-masuk">
                            <input type="radio" name="jenis" value="masuk" checked>
                            <span class="tanda-radio"></span>
                            <span class="teks-radio">🟢 UANG MASUK</span>
                        </label>
                        <label class="radio-card radio-keluar">
                            <input type="radio" name="jenis" value="keluar">
                            <span class="tanda-radio"></span>
                            <span class="teks-radio">🔴 UANG KELUAR</span>
                        </label>
                    </div>
                </div>
                <div class="field">
                    <label for="tgl">Tanggal *</label>
                    <input type="date" id="tgl" name="tanggal" required>
                </div>
                <div class="field">
                    <label for="kategori">Kategori *</label>
                    <select id="kategori" name="kategori" required></select>
                </div>
                <div class="field full">
                    <label for="jumlah">Jumlah (Rp) *</label>
                    <input type="number" id="jumlah" name="jumlah" min="1" step="1" placeholder="Contoh: 1250000" required>
                </div>
                <div class="field full field-keterangan">
                    <label for="ket">Keterangan <span class="wajib-keluar">*</span></label>
                    <textarea id="ket" name="keterangan" rows="2" placeholder="Contoh: Beli daging sapi 4kg untuk stok 2 hari"></textarea>
                </div>
                <div class="field full tombol-area">
                    <button type="submit" class="tombol-simpan">💾 Simpan Transaksi</button>
                </div>
            </form>
        </section>
    `;

  const form = document.getElementById("form-transaksi");
  const radioJenis = form.querySelectorAll('input[name="jenis"]');
  const selectKat = document.getElementById("kategori");
  const inpTgl = document.getElementById("tgl");
  const inpJum = document.getElementById("jumlah");
  const inpKet = document.getElementById("ket");
  const fieldKet = form.querySelector(".field-keterangan");
  const labelWajib = form.querySelector(".wajib-keluar");

  inpTgl.value = new Date().toISOString().split("T")[0];

  function isiKategori() {
    const j = form.querySelector('input[name="jenis"]:checked').value;
    selectKat.innerHTML = KATEGORI[j]
      .map((k) => `<option value="${k.id}">${k.label}</option>`)
      .join("");
  }
  function aturKeterangan() {
    const j = form.querySelector('input[name="jenis"]:checked').value;
    if (j === "masuk") {
      fieldKet.style.display = "none";
      inpKet.removeAttribute("required");
      if (labelWajib) labelWajib.style.display = "none";
    } else {
      fieldKet.style.display = "";
      inpKet.setAttribute("required", "required");
      if (labelWajib) labelWajib.style.display = "";
    }
  }
  isiKategori();
  aturKeterangan();

  radioJenis.forEach((r) =>
    r.addEventListener("change", () => {
      isiKategori();
      aturKeterangan();
    }),
  );

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const baru = {
      id: Date.now(),
      tanggal: inpTgl.value,
      jenis: form.querySelector('input[name="jenis"]:checked').value,
      kategori: selectKat.value,
      jumlah: parseInt(inpJum.value),
      keterangan: inpKet.value.trim(),
    };
    const semua = ambilSemuaTransaksi();
    semua.unshift(baru);
    simpanSemuaTransaksi(semua);

    // Kirim data ke Google Sheets secara online
    simpanTransaksiKeServer({
      tanggal: baru.tanggal,
      tunai:
        baru.jenis === "masuk" && baru.kategori === "tunai" ? baru.jumlah : 0,
      qrisMasuk:
        baru.jenis === "masuk" && baru.kategori === "qris_masuk"
          ? baru.jumlah
          : 0,
      transfer:
        baru.jenis === "masuk" && baru.kategori === "transfer"
          ? baru.jumlah
          : 0,
      tabunganWajib: 0,
      kasbon: baru.kategori === "kasbon" ? baru.jumlah : 0,
      namaKasbon: baru.kategori === "kasbon" ? baru.keterangan : "-",
      belanjaPasar: baru.kategori === "belanja_pasar" ? baru.jumlah : 0,
      opsiRiil: baru.kategori === "ops_riil" ? baru.jumlah : 0,
      qrisKeluar: baru.kategori === "qris_keluar" ? baru.jumlah : 0,
      omset: baru.jenis === "masuk" ? baru.jumlah : 0,
      labaKotor: 0,
      labaBersih: 0,
      keterangan: baru.keterangan,
    });

    if (typeof tampilkanNotifikasi === "function") {
      tampilkanNotifikasi("berhasil", "✅ Transaksi berhasil disimpan!");
    }
    form.reset();
    inpTgl.value = new Date().toISOString().split("T")[0];
    isiKategori();
    aturKeterangan();

    const aktif = document.querySelector(".tombol-menu.aktif");
    if (
      aktif &&
      aktif.dataset.menu === "dashboard" &&
      typeof renderDashboardKeuangan === "function"
    ) {
      renderDashboardKeuangan();
    }
  });
}

// ==================================================
// 📊 RENDER DASHBOARD: 3 KARTU + 2 TABEL (REKAP & RIWAYAT)
// ==================================================
function renderDashboardKeuangan() {
  const elR = document.getElementById("ringkasan-keuangan");
  const elT = document.getElementById("wadah-tabel-transaksi");
  if (!elR || !elT) return;

  let data = ambilSemuaTransaksi();

  // Variabel untuk 3 Kartu Teratas
  let totalOmsetKeseluruhan = 0;
  let totalLabaKotorKeseluruhan = 0;
  let totalLabaBersihKeseluruhan = 0;

  // ==================================================
  // 1. KELOMPOKKAN DATA UNTUK TABEL REKAP HARIAN LENGKAP
  // ==================================================
  let rekapHarian = {};
  data.forEach((t) => {
    if (!rekapHarian[t.tanggal]) {
      rekapHarian[t.tanggal] = {
        tanggal: t.tanggal,
        tunai: 0,
        qrisMasuk: 0,
        transfer: 0,
        tabunganWajib: 0,
        kasbon: 0,
        namaKaryawanKasbon: "-",
        belanjaPasar: 0,
        opsRiil: 0,
        qrisKeluar: 0,
        keterangan: [],
      };
    }
    let r = rekapHarian[t.tanggal];

    if (t.kategori === "tunai") r.tunai += t.jumlah;
    else if (t.kategori === "qris_masuk") r.qrisMasuk += t.jumlah;
    else if (t.kategori === "transfer") r.transfer += t.jumlah;
    else if (t.kategori === "belanja_pasar" || t.kategori === "bayar_suplayer")
      r.belanjaPasar += t.jumlah;
    else if (t.kategori === "ops_riil" || t.kategori === "makan_karyawan")
      r.opsRiil += t.jumlah;
    else if (t.kategori === "qris_keluar") r.qrisKeluar += t.jumlah;
    else if (t.kategori === "tabungan_masuk") r.tabunganWajib += t.jumlah;
    else if (t.kategori === "kasbon") {
      r.kasbon += t.jumlah;
      r.namaKaryawanKasbon = t.keterangan ? t.keterangan : "Karyawan";
    }

    if (t.keterangan && t.keterangan.trim() !== "" && t.kategori !== "kasbon") {
      r.keterangan.push(t.keterangan);
    }
  });

  let rekapArray = Object.values(rekapHarian).sort(
    (a, b) => new Date(b.tanggal) - new Date(a.tanggal),
  );
  let barisRekap = "";

  if (rekapArray.length === 0) {
    barisRekap = `<tr><td colspan="15" class="tabel-kosong">Belum ada data laporan harian yang dicatat</td></tr>`;
  } else {
    rekapArray.forEach((lap) => {
      let omset = lap.tunai + lap.qrisMasuk + lap.transfer;
      let labaKotor = omset - lap.belanjaPasar;
      let labaBersih =
        labaKotor -
        lap.opsRiil -
        lap.qrisKeluar -
        lap.tabunganWajib -
        lap.kasbon;

      totalOmsetKeseluruhan += omset;
      totalLabaKotorKeseluruhan += labaKotor;
      totalLabaBersihKeseluruhan += labaBersih;

      let gabunganKeterangan =
        lap.keterangan.length > 0 ? lap.keterangan.join(" | ") : "-";

      barisRekap += `
        <tr>
          <td>${lap.tanggal}</td>
          <td class="nilai-positif">${formatRupiah(lap.tunai)}</td>
          <td class="nilai-positif">${formatRupiah(lap.qrisMasuk)}</td>
          <td class="nilai-positif">${formatRupiah(lap.transfer)}</td>
          <td class="nilai-negatif">${formatRupiah(lap.tabunganWajib)}</td>
          <td class="nilai-negatif">${formatRupiah(lap.kasbon)}</td>
          <td>${lap.namaKaryawanKasbon}</td>
          <td class="nilai-negatif">${formatRupiah(lap.belanjaPasar)}</td>
          <td class="nilai-negatif">${formatRupiah(lap.opsRiil)}</td>
          <td class="nilai-negatif">${formatRupiah(lap.qrisKeluar)}</td>
          <td class="nilai-positif">${formatRupiah(omset)}</td>
          <td class="nilai-positif">${formatRupiah(labaKotor)}</td>
          <td class="${labaBersih >= 0 ? "nilai-positif" : "nilai-negatif"}">${formatRupiah(labaBersih)}</td>
          <td>${gabunganKeterangan}</td>
          <td>-</td>
        </tr>
      `;
    });
  }

  // ==================================================
  // 2. SIAPKAN DATA UNTUK TABEL RIWAYAT TRANSAKSI SATUAN
  // ==================================================
  let barisRiwayat = "";
  if (data.length === 0) {
    barisRiwayat = `<tr><td colspan="7" class="tabel-kosong">Belum ada riwayat transaksi yang dicatat</td></tr>`;
  } else {
    // Urutkan riwayat dari ID/Waktu terbaru ke terlama
    let dataUrut = [...data].sort((a, b) => b.id - a.id);

    dataUrut.forEach((t, i) => {
      const tanda = t.jenis === "masuk" ? "+" : "−";
      const warna = t.jenis === "masuk" ? "teks-hijau" : "teks-merah";
      const jenisTeks = t.jenis === "masuk" ? "🟢 MASUK" : "🔴 KELUAR";

      barisRiwayat += `
        <tr class="${t.jenis === "masuk" ? "baris-masuk" : "baris-keluar"}">
          <td>${i + 1}</td>
          <td>${t.tanggal}</td>
          <td>${jenisTeks}</td>
          <td>${labelKategori(t.jenis, t.kategori)}</td>
          <td class="rata-kanan">${formatRupiah(t.jumlah)}</td>
          <td class="rata-kanan ${warna}">${tanda} ${formatRupiah(t.jumlah)}</td>
          <td>${t.keterangan || "—"}</td>
        </tr>
      `;
    });
  }

  // ==================================================
  // 3. CETAK KE HALAMAN (HTML)
  // ==================================================

  // Cetak 3 Kartu Ringkasan
  elR.innerHTML = `
    <div class="grid-ringkasan-lengkap">
      <div class="kartu-ringkasan kartu-omset">
        <div class="label-ringkasan">💰 Total Omset Keseluruhan</div>
        <div class="nilai-ringkasan">${formatRupiah(totalOmsetKeseluruhan)}</div>
      </div>
      <div class="kartu-ringkasan kartu-labakotor">
        <div class="label-ringkasan">📈 Total Laba Kotor</div>
        <div class="nilai-ringkasan">${formatRupiah(totalLabaKotorKeseluruhan)}</div>
      </div>
      <div class="kartu-ringkasan kartu-lababersih">
        <div class="label-ringkasan">💵 Total Laba Bersih</div>
        <div class="nilai-ringkasan">${formatRupiah(totalLabaBersihKeseluruhan)}</div>
      </div>
    </div>
  `;

  // Cetak Kedua Tabel Bersamaan
  elT.innerHTML = `
    <!-- TABEL 1: LAPORAN HARIAN LENGKAP -->
    <h3>📊 Laporan Keuangan Harian Lengkap</h3>
    <div class="tabel-responsif">
      <table class="tabel-transaksi-lengkap">
        <thead>
          <tr>
            <th>Tanggal</th>
            <th>Tunai</th>
            <th>QRIS Masuk</th>
            <th>Transfer</th>
            <th>Tabungan Wajib</th>
            <th>Kasbon</th>
            <th>Penerima Kasbon</th>
            <th>Belanja Pasar</th>
            <th>Opsi Riil</th>
            <th>QRIS Keluar</th>
            <th>Omset</th>
            <th>Laba Kotor</th>
            <th>Laba Bersih</th>
            <th>Keterangan</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody id="isi-tabel-laporan">${barisRekap}</tbody>
      </table>
    </div>
    
    <!-- PEMBATAS ANTAR TABEL -->
    <div style="margin-top: 45px; margin-bottom: 16px; border-top: 2px dashed #cbd5e1; padding-top: 30px;">
      <h3>📜 Detail Riwayat Seluruh Transaksi</h3>
    </div>
    
    <!-- TABEL 2: RIWAYAT SATUAN -->
    <div class="tabel-responsif">
      <table class="tabel-transaksi">
        <thead>
          <tr>
            <th>No</th>
            <th>Tanggal</th>
            <th>Jenis</th>
            <th>Kategori</th>
            <th class="rata-kanan">Nominal</th>
            <th class="rata-kanan">Arus Kas</th>
            <th>Keterangan</th>
          </tr>
        </thead>
        <tbody>${barisRiwayat}</tbody>
      </table>
    </div>
    
    <div class="catatan-tabel" style="margin-top: 16px;">
      Total: ${data.length} transaksi dicatat. Terakhir diperbarui: ${new Date().toLocaleString("id-ID")}
    </div>
  `;
}
// ==================================================
// 📊 LAPORAN BULANAN RESMI
// ==================================================
function renderLaporan(target) {
  if (!target) return;
  const semuaTrans = ambilSemuaTransaksi();
  const bulanIni = new Date().toISOString().slice(0, 7);

  const transBulanIni = semuaTrans.filter((t) =>
    t.tanggal.startsWith(bulanIni),
  );

  let totalMasuk = 0,
    totalKeluar = 0;
  transBulanIni.forEach((t) => {
    if (t.jenis === "masuk") totalMasuk += t.jumlah;
    else totalKeluar += t.jumlah;
  });
  const labaBersih = totalMasuk - totalKeluar;

  const gajiPokokManajer = 750000;
  const bagiHasilManajer = Math.max(0, 0.25 * labaBersih);
  const totalGajiManajer = gajiPokokManajer + bagiHasilManajer;
  const hakPemilik = Math.max(0, labaBersih - bagiHasilManajer);

  target.innerHTML = `
    <section class="kartu-form" style="margin-top:20px;">
      <div class="judul-form">
        <h3>📊 Laporan Bulanan Resmi — ${bulanIni.replace("-", " / ")}</h3>
        <p>Perhitungan otomatis arus kas, hak Manajer, dan sisa hak Pemilik.</p>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;margin:20px 0;">
        <div class="kartu-ringkasan kartu-masuk">
          <div class="label-ringkasan">🟢 Total Pendapatan</div>
          <div class="nilai-ringkasan">${formatRupiah(totalMasuk)}</div>
        </div>
        <div class="kartu-ringkasan kartu-keluar">
          <div class="label-ringkasan">🔴 Total Pengeluaran</div>
          <div class="nilai-ringkasan">${formatRupiah(totalKeluar)}</div>
        </div>
        <div class="kartu-ringkasan ${labaBersih >= 0 ? "kartu-saldo-plus" : "kartu-saldo-minus"}">
          <div class="label-ringkasan">💰 Laba Bersih Bulan Ini</div>
          <div class="nilai-ringkasan">${formatRupiah(labaBersih)}</div>
        </div>
      </div>
      <div style="background:#fff8e6;border:1px solid #ffd699;border-radius:10px;padding:16px;margin:20px 0;">
        <h4 style="margin:0 0 12px 0;color:#92400e;">💼 PERHITUNGAN HAK MANAJER</h4>
        <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px dashed #ffd699;">
          <span>Gaji Pokok Tetap</span><span>Rp 750.000</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px dashed #ffd699;">
          <span>25% Bagi Hasil dari Laba Bersih</span><span>${formatRupiah(bagiHasilManajer)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:10px 0 0 0;font-weight:700;font-size:1.05rem;color:#92400e;">
          <span>TOTAL HAK MANAJER</span><span>${formatRupiah(totalGajiManajer)}</span>
        </div>
      </div>
      <div style="background:#eff6ff;border:1px solid rgba(30,58,138,.2);border-radius:10px;padding:16px;">
        <h4 style="margin:0 0 12px 0;color:#1e3a8a;">👑 SISA HAK PEMILIK</h4>
        <div style="font-size:1.1rem;font-weight:700;text-align:center;color:#1e3a8a;">
          ${formatRupiah(hakPemilik)}
        </div>
        <p style="margin:8px 0 0 0;font-size:0.9rem;opacity:0.8;">Laba bersih dikurangi 25% bagi hasil Manajer.</p>
      </div>
      <div class="catatan-tabel" style="margin-top:20px;">
        Catatan: Gaji pokok Manajer diambil dari pos tabungan khusus. Bagi hasil hanya dihitung jika Laba Bersih positif.
      </div>
    </section>
  `;
}

// ==================================================
// 🏦 FITUR PENGELOLAAN TABUNGAN
// ==================================================
const STORAGE_TABUNGAN = "data_tabungan_sambel_tempong";
const POS_TABUNGAN_DEFAULT = [
  { id: "gaji_karyawan", nama: "👷 Gaji Karyawan", saldo: 0, warna: "#1e3a8a" },
  { id: "sewa_gedung", nama: "🏠 Sewa Gedung", saldo: 0, warna: "#0f766e" },
  { id: "listrik", nama: "💡 Listrik", saldo: 0, warna: "#b45309" },
  { id: "wifi", nama: "📶 WiFi", saldo: 0, warna: "#7c3aed" },
  { id: "pajak", nama: "📑 Pajak", saldo: 0, warna: "#991b1b" },
  { id: "dana_darurat", nama: "🛟 Dana Darurat", saldo: 0, warna: "#0369a1" },
  {
    id: "gaji_manajer",
    nama: "💼 Gaji Pokok Manajer",
    saldo: 0,
    warna: "#be185d",
  },
];

function ambilTabungan() {
  const d = localStorage.getItem(STORAGE_TABUNGAN);
  if (!d) {
    localStorage.setItem(
      STORAGE_TABUNGAN,
      JSON.stringify(POS_TABUNGAN_DEFAULT),
    );
    return JSON.parse(JSON.stringify(POS_TABUNGAN_DEFAULT));
  }
  return JSON.parse(d);
}
function simpanTabungan(arr) {
  localStorage.setItem(STORAGE_TABUNGAN, JSON.stringify(arr));
}

function ubahSaldoTabungan(idPos, tipe, nominal, keterangan) {
  if (!nominal || nominal <= 0) {
    if (typeof tampilkanNotifikasi === "function")
      tampilkanNotifikasi("warning", "⚠️ Nominal harus lebih dari 0.");
    return false;
  }
  nominal = parseInt(nominal);
  const tab = ambilTabungan();
  const pos = tab.find((p) => p.id === idPos);
  if (!pos) return false;

  if (tipe === "kurang" && pos.saldo < nominal) {
    if (typeof tampilkanNotifikasi === "function")
      tampilkanNotifikasi("error", "❌ Saldo pos ini tidak mencukupi.");
    return false;
  }

  if (tipe === "tambah") pos.saldo += nominal;
  else pos.saldo -= nominal;
  simpanTabungan(tab);

  const semuaTrans = ambilSemuaTransaksi();
  const tanda = tipe === "tambah" ? "➕ Sisihkan ke " : "➖ Ambil dari ";
  semuaTrans.unshift({
    id: Date.now(),
    tanggal: new Date().toISOString().split("T")[0],
    jenis: tipe === "tambah" ? "keluar" : "masuk",
    kategori: tipe === "tambah" ? "tabungan_masuk" : "tabungan_keluar",
    jumlah: nominal,
    keterangan: tanda + pos.nama + " — " + (keterangan || "Tanpa keterangan"),
  });
  simpanSemuaTransaksi(semuaTrans);

  if (typeof tampilkanNotifikasi === "function") {
    tampilkanNotifikasi(
      "berhasil",
      `✅ ${pos.nama}: ${tipe === "tambah" ? "bertambah" : "berkurang"} ${formatRupiah(nominal)}`,
    );
  }
  return true;
}

function renderTabungan(target) {
  if (!target) return;
  const data = ambilTabungan();
  let totalSaldo = data.reduce((sum, p) => sum + p.saldo, 0);

  target.innerHTML = `
        <section class="kartu-form" style="margin-top:20px;">
            <div class="judul-form">
                <h3>🏦 Pengelolaan Tabungan</h3>
                <p>Sisihkan uang dari kas harian ke pos-pos wajib. Setiap perubahan otomatis tercatat di riwayat transaksi.</p>
                <div style="margin-top:10px;padding:12px 16px;background:#eff6ff;border:1px solid rgba(30,58,138,.15);border-radius:10px;font-weight:700;color:#1e3a8a;">
                    💰 TOTAL TABUNGAN TERKUMPUL: ${formatRupiah(totalSaldo)}
                </div>
            </div>
            <div class="grid-tabungan" id="grid-tabungan">
                ${data
                  .map(
                    (p) => `
                    <div class="kartu-tabungan" data-id="${p.id}">
                        <div class="kepala-tabungan" style="border-left:4px solid ${p.warna};">
                            <div class="nama-tabungan">${p.nama}</div>
                            <div class="saldo-tabungan">${formatRupiah(p.saldo)}</div>
                        </div>
                        <div class="badan-tabungan">
                            <button type="button" class="btn-tambah" data-id="${p.id}" data-aksi="tambah">➕ Tambah</button>
                            <button type="button" class="btn-kurang" data-id="${p.id}" data-aksi="kurang">➖ Kurangi</button>
                        </div>
                    </div>
                `,
                  )
                  .join("")}
            </div>
        </section>
    `;

  // Ini adalah fungsi Async/Await yang benar dan sudah diletakkan DI DALAM fungsi renderTabungan
  target.querySelectorAll(".btn-tambah, .btn-kurang").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const idPos = btn.dataset.id;
      const aksi = btn.dataset.aksi;
      const pos = data.find((p) => p.id === idPos);
      const label = aksi === "tambah" ? "SISIHKAN KE" : "AMBIL DARI";

      const nominal = await prompt(
        `${label} ${pos.nama.toUpperCase()}\n\nMasukkan nominal (angka saja, tanpa titik / Rp):\nContoh: 750000`,
      );
      if (nominal === null) return;

      const bersih = parseInt(nominal.trim().replace(/[^0-9]/g, ""));
      if (!bersih || bersih <= 0) {
        if (typeof tampilkanNotifikasi === "function")
          tampilkanNotifikasi("warning", "⚠️ Nominal tidak valid.");
        return;
      }

      const ket = await prompt(
        'Keterangan (boleh dikosongkan):\nContoh: "Sisihkan dari pendapatan Senin" / "Bayar tagihan PLN bulan ini"',
        "",
      );
      if (ket === null) return;

      if (ubahSaldoTabungan(idPos, aksi, bersih, ket)) {
        renderTabungan(target);
      }
    });
  });
}
