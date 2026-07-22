// ==================================================
// FITUR TRANSAKSI, TABUNGAN & LAPORAN - SINKRON EXCEL
// ==================================================
const URL_API =
  "https://script.google.com/macros/s/AKfycbwgdScsIBTMQ5Aw3hsCgeDSWOwV-b1ySVB46h8uHQjeCkMdcCya_pwoPwEtvja3y1BJpQ/exec";

function simpanTransaksiKeServer(dataTransaksi) {
  fetch(URL_API, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dataTransaksi),
  }).catch((err) => console.error("Gagal menyimpan:", err));
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
    { id: "talangan_owner", label: "👑 Belanja Ditalangi Bu Dewi" },
    { id: "bayar_owner", label: "💸 Bayar ke Bu Dewi" },
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

// ==================================================
// 📝 FORM INPUT TRANSAKSI (MURNI MANUAL)
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
              <span class="teks-radio">🟢 UANG MASUK</span>
            </label>
            <label class="radio-card radio-keluar">
              <input type="radio" name="jenis" value="keluar">
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
          <textarea id="ket" name="keterangan" rows="2" placeholder="Contoh: Beli daging sapi 4kg"></textarea>
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

    simpanTransaksiKeServer(baru);

    if (typeof tampilkanNotifikasi === "function") {
      tampilkanNotifikasi("berhasil", "✅ Transaksi berhasil disimpan!");
    }
    form.reset();
    inpTgl.value = new Date().toISOString().split("T")[0];
    isiKategori();
    aturKeterangan();

    if (typeof muatDashboardUtama === "function") {
      muatDashboardUtama();
    }
  });
}

// ==================================================
// 📊 DASHBOARD REKAP
// ==================================================
function renderDashboardKeuangan() {
  if (typeof muatDashboardUtama === "function") {
    muatDashboardUtama();
  }
}

// ==================================================
// 📊 LAPORAN BULANAN (BERDASARKAN DATA MANUAL)
// ==================================================
function renderLaporan(target, bulanDipilih = null) {
  if (!target) return;

  const dataLaporan = JSON.parse(localStorage.getItem("laporanHarian") || "[]");

  const daftarBulan = [
    ...new Set(dataLaporan.map((item) => (item.tanggal || "").slice(0, 7))),
  ].filter(Boolean);

  if (!bulanDipilih) {
    bulanDipilih =
      daftarBulan.length > 0
        ? daftarBulan[daftarBulan.length - 1]
        : new Date().toISOString().slice(0, 7);
  }

  const dataBulanIni = dataLaporan.filter((item) =>
    (item.tanggal || "").startsWith(bulanDipilih),
  );

  const [tahun, bulanNum] = bulanDipilih.split("-");
  const namaBulanMap = {
    "01": "Januari",
    "02": "Februari",
    "03": "Maret",
    "04": "April",
    "05": "Mei",
    "06": "Juni",
    "07": "Juli",
    "08": "Agustus",
    "09": "September",
    10: "Oktober",
    11: "November",
    12: "Desember",
  };
  const teksBulanTahun = `${namaBulanMap[bulanNum] || "Bulan"} ${tahun}`;

  let totalPendapatan = 0;
  let totalPengeluaran = 0;
  let totalLabaBersih = 0;

  dataBulanIni.forEach((item) => {
    totalPendapatan += Number(item.omset || 0);
    const pengeluaranHariIni =
      Number(item.belanjaPasar || 0) +
      Number(item.opsRiil || 0) +
      Number(item.qrisKeluar || 0) +
      Number(item.tabunganWajib || 0) +
      Number(item.kasbon || 0) +
      Number(item.ditalangiOwner || 0);
    totalPengeluaran += pengeluaranHariIni;
    totalLabaBersih += Number(item.labaBersih || 0);
  });

  const gajiPokokManajer = 750000;
  const bagiHasilManajer =
    totalLabaBersih > 0 ? Math.round(totalLabaBersih * 0.25) : 0;
  const totalHakManajer = gajiPokokManajer + bagiHasilManajer;
  const hakPemilik = Math.max(0, totalLabaBersih - bagiHasilManajer);

  target.innerHTML = `
    <section class="kartu-form" style="margin-top:20px; border-radius:16px;">
      
      <div style="background:#f1f5f9; padding:8px 12px; border-radius:12px; margin-bottom:24px; display:flex; align-items:center; gap:8px; overflow-x:auto;">
        <span style="font-size:13px; font-weight:700; color:#64748b; padding-right:6px; white-space:nowrap;">📅 Periode:</span>
        <div style="display:flex; gap:8px;">
          ${
            daftarBulan.length === 0
              ? '<span style="font-size:13px; color:#64748b;">Belum ada data periode.</span>'
              : daftarBulan
                  .map((b) => {
                    const [t, m] = b.split("-");
                    const isAktif = b === bulanDipilih;
                    return `
                <button 
                  type="button" 
                  class="btn-pilih-bulan" 
                  data-bulan="${b}"
                  style="
                    padding: 8px 16px;
                    border-radius: 20px;
                    border: none;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    white-space: nowrap;
                    transition: all 0.2s ease;
                    ${
                      isAktif
                        ? "background: #1e40af; color: #ffffff; box-shadow: 0 4px 10px rgba(30,64,175,0.25);"
                        : "background: #ffffff; color: #475569; border: 1px solid #cbd5e1;"
                    }
                  "
                >
                  ${namaBulanMap[m] || m} ${t}
                </button>
              `;
                  })
                  .join("")
          }
        </div>
      </div>

      <div class="judul-form">
        <h3>📊 Laporan Bulanan Resmi — ${teksBulanTahun}</h3>
        <p>Perhitungan otomatis arus kas, hak Manajer, dan sisa hak Pemilik.</p>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;margin:20px 0;">
        <div class="kartu-ringkasan kartu-masuk">
          <div class="label-ringkasan">🟢 Total Pendapatan</div>
          <div class="nilai-ringkasan">${formatRupiah(totalPendapatan)}</div>
        </div>
        <div class="kartu-ringkasan kartu-keluar">
          <div class="label-ringkasan">🔴 Total Pengeluaran</div>
          <div class="nilai-ringkasan">${formatRupiah(totalPengeluaran)}</div>
        </div>
        <div class="kartu-ringkasan ${totalLabaBersih >= 0 ? "kartu-saldo-plus" : "kartu-saldo-minus"}">
          <div class="label-ringkasan">💰 Laba Bersih Bulan Ini</div>
          <div class="nilai-ringkasan">${formatRupiah(totalLabaBersih)}</div>
        </div>
      </div>

      <div style="background:#fff8e6;border:1px solid #ffd699;border-radius:12px;padding:16px;margin:20px 0;">
        <h4 style="margin:0 0 12px 0;color:#92400e;">💼 PERHITUNGAN HAK MANAJER (ESA)</h4>
        <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px dashed #ffd699;">
          <span>Gaji Pokok Tetap</span><span>Rp 750.000</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px dashed #ffd699;">
          <span>25% Bagi Hasil dari Laba Bersih</span><span>${formatRupiah(bagiHasilManajer)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:10px 0 0 0;font-weight:700;font-size:1.05rem;color:#92400e;">
          <span>TOTAL HAK MANAJER</span><span>${formatRupiah(totalHakManajer)}</span>
        </div>
      </div>

      <div style="background:#eff6ff;border:1px solid rgba(30,58,138,.2);border-radius:12px;padding:16px;">
        <h4 style="margin:0 0 12px 0;color:#1e3a8a;">👑 SISA HAK PEMILIK (BU DEWI)</h4>
        <div style="font-size:1.1rem;font-weight:700;text-align:center;color:#1e3a8a;">
          ${formatRupiah(hakPemilik)}
        </div>
        <p style="margin:8px 0 0 0;font-size:0.9rem;opacity:0.8;">Laba bersih dikurangi 25% bagi hasil Manajer.</p>
      </div>
    </section>
  `;

  target.querySelectorAll(".btn-pilih-bulan").forEach((btn) => {
    btn.addEventListener("click", () => {
      renderLaporan(target, btn.dataset.bulan);
    });
  });
}

// ==================================================
// 🏦 RINCIAN POS TABUNGAN
// ==================================================
function renderTabungan(target) {
  if (!target) return;

  const dataLaporan = JSON.parse(localStorage.getItem("laporanHarian") || "[]");
  const jumlahHari = dataLaporan.length;

  const totalTabungan = 495000 * jumlahHari;

  const posGaji = 325000 * jumlahHari;
  const posSewa = 80000 * jumlahHari;
  const posListrik = 35000 * jumlahHari;
  const posTHR = 25000 * jumlahHari;
  const posPerawatan = 10000 * jumlahHari;
  const posWifi = 5000 * jumlahHari;
  const posJumatBerkah = 10000 * jumlahHari;
  const posSystemKasir = 5000 * jumlahHari;

  target.innerHTML = `
    <section class="kartu-form" style="margin-top:20px;">
      <div class="judul-form">
        <h3>🏦 Rincian Pengelolaan Pos Tabungan Wajib</h3>
        <p>Otomatis terakumulasi dari Alokasi Harian Rp 495.000 x ${jumlahHari} Hari Kerja.</p>
        <div style="margin-top:10px;padding:12px 16px;background:#eff6ff;border:1px solid rgba(30,58,138,.15);border-radius:10px;font-weight:700;color:#1e3a8a;font-size:18px;">
          💰 TOTAL TABUNGAN TERKUMPUL: ${formatRupiah(totalTabungan)}
        </div>
      </div>
      <div class="grid-tabungan" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap:14px; margin-top:16px;">
        <div style="background:#fff; border:1px solid #e2e8f0; padding:14px; border-radius:10px; border-left:4px solid #1e3a8a;">
          <div style="font-size:12px; color:#64748b;">👷 Gaji Karyawan (Rp 325k/hr)</div>
          <div style="font-size:18px; font-weight:bold; color:#0f172a; margin-top:4px;">${formatRupiah(posGaji)}</div>
        </div>
        <div style="background:#fff; border:1px solid #e2e8f0; padding:14px; border-radius:10px; border-left:4px solid #0f766e;">
          <div style="font-size:12px; color:#64748b;">🏠 Sewa Gedung & Pajak (Rp 80k/hr)</div>
          <div style="font-size:18px; font-weight:bold; color:#0f172a; margin-top:4px;">${formatRupiah(posSewa)}</div>
        </div>
        <div style="background:#fff; border:1px solid #e2e8f0; padding:14px; border-radius:10px; border-left:4px solid #b45309;">
          <div style="font-size:12px; color:#64748b;">💡 Listrik (Rp 35k/hr)</div>
          <div style="font-size:18px; font-weight:bold; color:#0f172a; margin-top:4px;">${formatRupiah(posListrik)}</div>
        </div>
        <div style="background:#fff; border:1px solid #e2e8f0; padding:14px; border-radius:10px; border-left:4px solid #7c3aed;">
          <div style="font-size:12px; color:#64748b;">🎁 THR Karyawan (Rp 25k/hr)</div>
          <div style="font-size:18px; font-weight:bold; color:#0f172a; margin-top:4px;">${formatRupiah(posTHR)}</div>
        </div>
        <div style="background:#fff; border:1px solid #e2e8f0; padding:14px; border-radius:10px; border-left:4px solid #0284c7;">
          <div style="font-size:12px; color:#64748b;">🛠️ Perawatan & Perbaikan (Rp 10k/hr)</div>
          <div style="font-size:18px; font-weight:bold; color:#0f172a; margin-top:4px;">${formatRupiah(posPerawatan)}</div>
        </div>
        <div style="background:#fff; border:1px solid #e2e8f0; padding:14px; border-radius:10px; border-left:4px solid #16a34a;">
          <div style="font-size:12px; color:#64748b;">📶 Internet / WiFi (Rp 5k/hr)</div>
          <div style="font-size:18px; font-weight:bold; color:#0f172a; margin-top:4px;">${formatRupiah(posWifi)}</div>
        </div>
        <div style="background:#fff; border:1px solid #e2e8f0; padding:14px; border-radius:10px; border-left:4px solid #ea580c;">
          <div style="font-size:12px; color:#64748b;">🕌 Jum'at Berkah / Sosial (Rp 10k/hr)</div>
          <div style="font-size:18px; font-weight:bold; color:#0f172a; margin-top:4px;">${formatRupiah(posJumatBerkah)}</div>
        </div>
        <div style="background:#fff; border:1px solid #e2e8f0; padding:14px; border-radius:10px; border-left:4px solid #db2777;">
          <div style="font-size:12px; color:#64748b;">💻 Maintenance Kasir (Rp 5k/hr)</div>
          <div style="font-size:18px; font-weight:bold; color:#0f172a; margin-top:4px;">${formatRupiah(posSystemKasir)}</div>
        </div>
      </div>
    </section>
  `;
}

// ==================================================
// 🗑️ HAPUS TRANSAKSI
// ==================================================
window.hapusTransaksi = function (idTransaksi) {
  let konfirmasi = confirm("Apakah Anda yakin ingin menghapus transaksi ini?");
  if (konfirmasi) {
    let semuaData = ambilSemuaTransaksi();
    let dataBaru = semuaData.filter(
      (transaksi) => transaksi.id !== idTransaksi,
    );
    simpanSemuaTransaksi(dataBaru);

    if (typeof tampilkanNotifikasi === "function") {
      tampilkanNotifikasi("berhasil", "✅ Data transaksi berhasil dihapus!");
    }
    renderDashboardKeuangan();
  }
};
