// ==============================================
// MODUL TRANSAKSI (SISTEM KEUANGAN MBOK'E)
// ==============================================

/**
 * Fungsi untuk merender Form Input Transaksi Harian
 * @param {HTMLElement} container - Wadah tempat form ditayangkan
 */
window.renderFormTransaksi = function (container) {
  if (!container) return;

  const hariIni = new Date().toISOString().split("T")[0];

  const dataKategori = {
    masuk: [
      {
        id: "tunai",
        label: "Tunai / Cash",
        icon: "💵",
        deskripsi: "Penjualan Cash Harian",
      },
      {
        id: "qris_masuk",
        label: "QRIS Masuk",
        icon: "📱",
        deskripsi: "Pembayaran QRIS Pelanggan",
      },
      {
        id: "transfer",
        label: "Transfer Bank",
        icon: "🏦",
        deskripsi: "Pemasukan via Bank Transfer",
      },
    ],
    keluar: [
      {
        id: "belanja_pasar",
        label: "Belanja Pasar",
        icon: "🛒",
        deskripsi: "Bahan baku, ayam, bumbu, sayur",
      },
      {
        id: "ops_riil",
        label: "Operasional Riil",
        icon: "⚙️",
        deskripsi: "Biaya rutin operasional",
      },
      {
        id: "makan_karyawan",
        label: "Uang Makan Karyawan",
        icon: "🍱",
        deskripsi: "Jatah makan staf / karyawan",
      },
      {
        id: "qris_keluar",
        label: "QRIS Keluar",
        icon: "💸",
        deskripsi: "Pengeluaran non-tunai / QRIS",
      },
      {
        id: "kasbon",
        label: "Kasbon Karyawan",
        icon: "🤝",
        deskripsi: "Pinjaman uang karyawan",
      },
    ],
    budewi: [
      {
        id: "talangan_owner",
        label: "Ditalangi Bu Dewi (Owner)",
        icon: "👑",
        deskripsi: "Tambah Utang (Restoran ditalangi Bu Dewi)",
      },
      {
        id: "bayar_owner",
        label: "Bayar Hutang ke Bu Dewi",
        icon: "💰",
        deskripsi: "Kurang Utang (Restoran bayar ke Bu Dewi)",
      },
    ],
  };

  let jenisAktif = "masuk";
  let kategoriAktif = "tunai";

  // Determine user role ("manajer" or "owner")
  const roleAktif = localStorage.getItem('roleAktif') || '';

  // Build the tabs markup based on role
  let tabsHtml = `
    <button type="button" class="btn-jenis-tab aktif" data-jenis="masuk">
      <span class="ikon-jenis">🟢</span>
      <span class="label-jenis">Pemasukan</span>
    </button>
    <button type="button" class="btn-jenis-tab" data-jenis="keluar">
      <span class="ikon-jenis">🔴</span>
      <span class="label-jenis">Pengeluaran</span>
    </button>`;
  if (roleAktif === 'manajer') {
    tabsHtml += `
    <button type="button" class="btn-jenis-tab btn-budewi" data-jenis="budewi">
      <span class="ikon-jenis">👑</span>
      <span class="label-jenis">Transaksi Bu Dewi</span>
    </button>`;
  }

  container.innerHTML = `
    <div class="kartu-form-modern">
      <div class="header-form">
        <h3>📝 Input Transaksi Harian</h3>
        <p>Pilih jenis & kategori transaksi dengan menekan tombol pilihan visual di bawah.</p>
      </div>

      <form id="form-input-transaksi">
        <!-- 1. TANGGAL TRANSAKSI (FLATPICKR MODERN) -->
        <div class="grup-input">
          <label class="label-input">📅 Tanggal Transaksi</label>
          <input type="text" id="input-tanggal" class="input-modern" placeholder="Pilih tanggal..." value="${hariIni}" required>
        </div>

        <!-- 2. PILIHAN JENIS TRANSAKSI -->
        <div class="grup-input">
          <label class="label-input">🏷️ Jenis Transaksi</label>
          <div class="grid-pilih-jenis" style="${roleAktif === 'manajer' ? '' : 'grid-template-columns: 1fr 1fr;'}">
            ${tabsHtml}
          </div>
        </div>

        <!-- 3. PILIHAN KATEGORI TRANSAKSI (GRID KARTU DINAMIS) -->
        <div class="grup-input">
          <label class="label-input" id="label-kategori-dinamis">🟢 Kategori Pemasukan</label>
          <div id="wadah-kategori-dinamis" class="grid-pilih-kategori"></div>
        </div>

        <!-- 4. NOMINAL TRANSAKSI -->
        <div class="grup-input">
          <label class="label-input">💰 Nominal (Rp)</label>
          <input type="number" id="input-jumlah" class="input-modern" placeholder="Contoh: 150000" min="1" required>
        </div>

        <!-- 5. KETERANGAN / CATATAN (DITAMPILKAN HANYA UNTUK PENGELUARAN) -->
        <div class="grup-input" id="grup-keterangan" style="display: none;">
          <label class="label-input">📝 Keterangan / Catatan</label>
          <input type="text" id="input-keterangan" class="input-modern" placeholder="Contoh: Beli Ayam 5kg / Kasbon Budi">
        </div>

        <!-- TOMBOL SIMPAN -->
        <button type="submit" id="btn-simpan-transaksi" class="btn-simpan-modern">
          💾 Simpan Transaksi
        </button>
      </form>
    </div>
  `;

  const wadahKategori = container.querySelector("#wadah-kategori-dinamis");
  const labelKategori = container.querySelector("#label-kategori-dinamis");
  const grupKeterangan = container.querySelector("#grup-keterangan");

  function updateTampilanKategori() {
    const daftar = dataKategori[jenisAktif] || [];

    if (!daftar.some((k) => k.id === kategoriAktif)) {
      kategoriAktif = daftar[0]?.id || "";
    }

    if (jenisAktif === "masuk") {
      labelKategori.innerHTML = "🟢 Kategori Pemasukan";
      if (grupKeterangan) grupKeterangan.style.display = "none";
    } else {
      labelKategori.innerHTML = "🔴 Kategori Pengeluaran";
      if (grupKeterangan) grupKeterangan.style.display = "block";
    }

    wadahKategori.innerHTML = daftar
      .map((item) => {
        const isSelected = item.id === kategoriAktif;
        return `
          <div class="kartu-kategori-option ${isSelected ? "aktif" : ""}" data-id="${item.id}">
            <div class="header-option">
              <span class="ikon-option">${item.icon}</span>
              <span class="judul-option">${item.label}</span>
              <span class="radio-indicator"></span>
            </div>
            <p class="desk-option">${item.deskripsi}</p>
          </div>
        `;
      })
      .join("");

    wadahKategori
      .querySelectorAll(".kartu-kategori-option")
      .forEach((card) => {
        card.onclick = () => {
          kategoriAktif = card.dataset.id;
          updateTampilanKategori();
        };
      });
  }

  container.querySelectorAll(".btn-jenis-tab").forEach((btn) => {
    btn.onclick = () => {
      container
        .querySelectorAll(".btn-jenis-tab")
        .forEach((b) => b.classList.remove("aktif"));
      btn.classList.add("aktif");
      jenisAktif = btn.dataset.jenis;
      updateTampilanKategori();
    };
  });

  // Inisialisasi Flatpickr Datepicker Modern
  const elTanggal = container.querySelector("#input-tanggal");
  let fpTanggal = null;
  if (elTanggal && typeof flatpickr === "function") {
    fpTanggal = flatpickr(elTanggal, {
      locale: flatpickr.l10ns && flatpickr.l10ns.id ? "id" : "default",
      dateFormat: "Y-m-d",
      altInput: true,
      altFormat: "j F Y",
      defaultDate: hariIni,
      disableMobile: true,
    });
  }

  updateTampilanKategori();

  const form = container.querySelector("#form-input-transaksi");
  if (form) {
    form.addEventListener("submit", async function (e) {
      e.preventDefault();

      const btnSimpan = container.querySelector("#btn-simpan-transaksi");
      btnSimpan.disabled = true;
      btnSimpan.innerText = "⏳ Menyimpan...";

      const elKet = container.querySelector("#input-keterangan");
      const teksKet = elKet ? elKet.value.trim() : "";

      const dataBaru = {
        tanggal: container.querySelector("#input-tanggal").value,
        jenis: jenisAktif,
        kategori: kategoriAktif,
        jumlah: Number(container.querySelector("#input-jumlah").value),
        keterangan: jenisAktif === "masuk" ? "-" : teksKet || "-",
        dibuatOleh: localStorage.getItem("roleAktif") || "sistem",
      };

      try {
        if (typeof window.simpanTransaksiKeFirebase === "function") {
          await window.simpanTransaksiKeFirebase(dataBaru);

          if (typeof window.tampilkanNotifikasi === "function") {
            window.tampilkanNotifikasi(
              "berhasil",
              "Transaksi berhasil disimpan ke Firebase!",
            );
          }

          form.reset();
          if (fpTanggal) {
            fpTanggal.setDate(hariIni);
          } else {
            container.querySelector("#input-tanggal").value = hariIni;
          }
          jenisAktif = "masuk";
          kategoriAktif = "tunai";
          container.querySelectorAll(".btn-jenis-tab").forEach((b) => {
            b.classList.toggle("aktif", b.dataset.jenis === "masuk");
          });
          updateTampilanKategori();
        } else {
          throw new Error("Fungsi penyimpan Firebase tidak ditemukan.");
        }
      } catch (err) {
        if (typeof window.tampilkanNotifikasi === "function") {
          window.tampilkanNotifikasi(
            "error",
            "Gagal menyimpan: " + err.message,
          );
        } else {
          alert("Gagal menyimpan: " + err.message);
        }
      } finally {
        btnSimpan.disabled = false;
        btnSimpan.innerText = "💾 Simpan Transaksi";
      }
    });
  }
};

// ==================================================
// 🏦 RINCIAN POS TABUNGAN WAJIB
// ==================================================
window.renderTabungan = function (container) {
  if (!container) return;

  const dataRiwayat = window.dataRiwayatGlobal || [];
  const tanggalUnik = [
    ...new Set(dataRiwayat.map((t) => t.tanggal).filter(Boolean)),
  ];
  const jumlahHari = tanggalUnik.length;

  const alokasiHarian = 495000;
  const totalTabungan = alokasiHarian * jumlahHari;

  const posGaji = 325000 * jumlahHari;
  const posSewa = 80000 * jumlahHari;
  const posListrik = 35000 * jumlahHari;
  const posTHR = 25000 * jumlahHari;
  const posPerawatan = 10000 * jumlahHari;
  const posWifi = 5000 * jumlahHari;
  const posJumatBerkah = 10000 * jumlahHari;
  const posSystemKasir = 5000 * jumlahHari;

  const formatRupiah = (num) =>
    "Rp " + (Number(num) || 0).toLocaleString("id-ID");

  container.innerHTML = `
    <section class="kartu-form" style="margin-top:20px;">
      <div class="judul-form">
        <h3 style="display: flex; align-items: center; gap: 8px; font-size: 18px; color: #1e293b;">
          🏦 Rincian Pengelolaan Pos Tabungan Wajib
        </h3>
        <p style="color: #64748b; font-size: 14px; margin-top: 4px;">
          Otomatis terakumulasi dari Alokasi Harian Rp 495.000 × <strong>${jumlahHari} Hari Kerja</strong>.
        </p>
        <div style="margin-top:16px; padding:16px 20px; background:#eff6ff; border:1px solid rgba(30,58,138,0.15); border-radius:12px; font-weight:700; color:#1e3a8a; font-size:18px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
          <span>💰 TOTAL TABUNGAN TERKUMPUL</span>
          <span style="font-size:22px; color:#2563eb;">${formatRupiah(totalTabungan)}</span>
        </div>
      </div>

      <div class="grid-tabungan" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap:16px; margin-top:24px;">
        <div style="background:#ffffff; border:1px solid #e2e8f0; padding:16px; border-radius:12px; border-left:5px solid #1e3a8a; box-shadow:0 2px 8px rgba(0,0,0,0.03);">
          <div style="font-size:13px; color:#64748b; font-weight:600;">👷 Gaji Karyawan (Rp 325.000/hr)</div>
          <div style="font-size:20px; font-weight:800; color:#0f172a; margin-top:6px;">${formatRupiah(posGaji)}</div>
        </div>
        <div style="background:#ffffff; border:1px solid #e2e8f0; padding:16px; border-radius:12px; border-left:5px solid #0f766e; box-shadow:0 2px 8px rgba(0,0,0,0.03);">
          <div style="font-size:13px; color:#64748b; font-weight:600;">🏠 Sewa Gedung & Pajak (Rp 80.000/hr)</div>
          <div style="font-size:20px; font-weight:800; color:#0f172a; margin-top:6px;">${formatRupiah(posSewa)}</div>
        </div>
        <div style="background:#ffffff; border:1px solid #e2e8f0; padding:16px; border-radius:12px; border-left:5px solid #b45309; box-shadow:0 2px 8px rgba(0,0,0,0.03);">
          <div style="font-size:13px; color:#64748b; font-weight:600;">💡 Listrik (Rp 35.000/hr)</div>
          <div style="font-size:20px; font-weight:800; color:#0f172a; margin-top:6px;">${formatRupiah(posListrik)}</div>
        </div>
        <div style="background:#ffffff; border:1px solid #e2e8f0; padding:16px; border-radius:12px; border-left:5px solid #7c3aed; box-shadow:0 2px 8px rgba(0,0,0,0.03);">
          <div style="font-size:13px; color:#64748b; font-weight:600;">🎁 THR Karyawan (Rp 25.000/hr)</div>
          <div style="font-size:20px; font-weight:800; color:#0f172a; margin-top:6px;">${formatRupiah(posTHR)}</div>
        </div>
        <div style="background:#ffffff; border:1px solid #e2e8f0; padding:16px; border-radius:12px; border-left:5px solid #0284c7; box-shadow:0 2px 8px rgba(0,0,0,0.03);">
          <div style="font-size:13px; color:#64748b; font-weight:600;">🛠️ Perawatan & Perbaikan (Rp 10.000/hr)</div>
          <div style="font-size:20px; font-weight:800; color:#0f172a; margin-top:6px;">${formatRupiah(posPerawatan)}</div>
        </div>
        <div style="background:#ffffff; border:1px solid #e2e8f0; padding:16px; border-radius:12px; border-left:5px solid #16a34a; box-shadow:0 2px 8px rgba(0,0,0,0.03);">
          <div style="font-size:13px; color:#64748b; font-weight:600;">📶 Internet / WiFi (Rp 5.000/hr)</div>
          <div style="font-size:20px; font-weight:800; color:#0f172a; margin-top:6px;">${formatRupiah(posWifi)}</div>
        </div>
        <div style="background:#ffffff; border:1px solid #e2e8f0; padding:16px; border-radius:12px; border-left:5px solid #ea580c; box-shadow:0 2px 8px rgba(0,0,0,0.03);">
          <div style="font-size:13px; color:#64748b; font-weight:600;">🕌 Jum'at Berkah / Sosial (Rp 10.000/hr)</div>
          <div style="font-size:20px; font-weight:800; color:#0f172a; margin-top:6px;">${formatRupiah(posJumatBerkah)}</div>
        </div>
        <div style="background:#ffffff; border:1px solid #e2e8f0; padding:16px; border-radius:12px; border-left:5px solid #db2777; box-shadow:0 2px 8px rgba(0,0,0,0.03);">
          <div style="font-size:13px; color:#64748b; font-weight:600;">💻 Maintenance Kasir (Rp 5.000/hr)</div>
          <div style="font-size:20px; font-weight:800; color:#0f172a; margin-top:6px;">${formatRupiah(posSystemKasir)}</div>
        </div>
      </div>
    </section>
  `;
};

// ==================================================
// 📊 REKAP LAPORAN BULANAN
// ==================================================
window.renderLaporan = function (container, bulanPilihan) {
  if (!container) return;

  const dataRiwayat = window.dataRiwayatGlobal || [];

  if (!bulanPilihan) {
    const skr = new Date();
    const thn = skr.getFullYear();
    const bln = String(skr.getMonth() + 1).padStart(2, "0");
    bulanPilihan = `${thn}-${bln}`;
  }

  const dataBulanIni = dataRiwayat.filter(
    (t) => t.tanggal && t.tanggal.startsWith(bulanPilihan),
  );

  const rekapPerTanggal = {};
  dataBulanIni.forEach((t) => {
    const tgl = t.tanggal;
    if (!rekapPerTanggal[tgl]) {
      rekapPerTanggal[tgl] = {
        tanggal: tgl,
        tunai: 0,
        qrisMasuk: 0,
        transfer: 0,
        tabunganWajib: 495000,
        kasbon: 0,
        belanjaPasar: 0,
        opsRiil: 0,
        qrisKeluar: 0,
        ditalangiOwner: 0,
        keterangan: [],
      };
    }

    const item = rekapPerTanggal[tgl];
    const nominal = Number(String(t.jumlah).replace(/[^0-9]/g, "")) || 0;

    switch (t.kategori) {
      case "tunai":
        item.tunai += nominal;
        break;
      case "qris_masuk":
        item.qrisMasuk += nominal;
        break;
      case "transfer":
        item.transfer += nominal;
        break;
      case "belanja_pasar":
        item.belanjaPasar += nominal;
        break;
      case "ops_riil":
        item.opsRiil += nominal;
        break;
      case "makan_karyawan":
        item.opsRiil += nominal;
        break;
      case "qris_keluar":
        item.qrisKeluar += nominal;
        break;
      case "kasbon":
        item.kasbon += nominal;
        break;
      case "talangan_owner":
        item.ditalangiOwner += nominal;
        break;
    }
  });

  const dataLaporanBulan = Object.values(rekapPerTanggal).map((row) => {
    const omset = row.tunai + row.qrisMasuk + row.transfer;
    const totalPengeluaranOps =
      row.belanjaPasar + row.opsRiil + row.qrisKeluar + row.ditalangiOwner;
    const labaKotor = omset - totalPengeluaranOps;
    const labaBersih = labaKotor - row.tabunganWajib - row.kasbon;
    return { ...row, omset, labaKotor, labaBersih };
  });

  let totalOmset = 0;
  let totalLabaKotor = 0;
  let totalLabaBersih = 0;

  dataLaporanBulan.forEach((item) => {
    totalOmset += item.omset;
    totalLabaKotor += item.labaKotor;
    totalLabaBersih += item.labaBersih;
  });

  const gajiPokokManajer = 750000;
  const bagiHasilManajer = Math.max(0, totalLabaBersih * 0.25);
  const totalHakManajer = gajiPokokManajer + bagiHasilManajer;
  const hakPemilik = totalLabaBersih - bagiHasilManajer;

  const formatRupiah = (num) =>
    "Rp " + (Number(num) || 0).toLocaleString("id-ID");

  const namaBulanIndo = (yyyyMm) => {
    const [y, m] = yyyyMm.split("-");
    const namaBln = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];
    return `${namaBln[parseInt(m, 10) - 1] || m} ${y}`;
  };

  container.innerHTML = `
    <section class="kartu-form" style="margin-top:20px;">
      <div class="judul-form" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:20px;">
        <div>
          <h3 style="font-size:18px; color:#1e293b; margin:0;">📊 Rekap Laporan Bulanan</h3>
          <p style="color:#64748b; font-size:13.5px; margin:4px 0 0 0;">
            Periode: <strong>${namaBulanIndo(bulanPilihan)}</strong>
          </p>
        </div>
        <div style="display:flex; align-items:center; gap:10px;">
          <input type="month" id="filter-bulan-laporan" value="${bulanPilihan}" style="padding:8px 12px; border:1px solid #cbd5e1; border-radius:8px; font-size:14px; outline:none; background:#fff;">
          <button type="button" id="btn-cetak-laporan" style="background:#0f766e; color:#fff; border:none; padding:9px 16px; border-radius:8px; font-weight:600; cursor:pointer; font-size:13.5px; display:flex; align-items:center; gap:6px;">
            🖨️ Cetak Laporan
          </button>
        </div>
      </div>

      <!-- RINGKASAN REKAP BULANAN -->
      <div class="grid-ringkasan-lengkap" style="margin-top:0; margin-bottom:24px;">
        <div class="kartu-ringkasan kartu-omset">
          <div class="label-ringkasan">💰 Total Omset</div>
          <div class="nilai-ringkasan">${formatRupiah(totalOmset)}</div>
        </div>
        <div class="kartu-ringkasan kartu-labakotor">
          <div class="label-ringkasan">📈 Total Laba Kotor</div>
          <div class="nilai-ringkasan">${formatRupiah(totalLabaKotor)}</div>
        </div>
        <div class="kartu-ringkasan kartu-lababersih">
          <div class="label-ringkasan">💵 Total Laba Bersih</div>
          <div class="nilai-ringkasan">${formatRupiah(totalLabaBersih)}</div>
        </div>
      </div>

      <!-- PERHITUNGAN HAK MANAJER & OWNER -->
      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:16px; margin-bottom:24px;">
        <div style="background:#fff8e6; border:1px solid #ffd699; border-radius:14px; padding:20px;">
          <h4 style="margin:0 0 14px 0; color:#92400e; font-size:16px;">💼 PERHITUNGAN HAK MANAJER (ESA)</h4>
          <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px dashed #ffd699; font-size:14px;">
            <span>Gaji Pokok Tetap</span>
            <span style="font-weight:600;">Rp 750.000</span>
          </div>
          <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px dashed #ffd699; font-size:14px;">
            <span>25% Bagi Hasil dari Laba Bersih</span>
            <span style="font-weight:600;">${formatRupiah(bagiHasilManajer)}</span>
          </div>
          <div style="display:flex; justify-content:space-between; padding:12px 0 0 0; font-weight:800; font-size:16px; color:#92400e;">
            <span>TOTAL HAK MANAJER</span>
            <span>${formatRupiah(totalHakManajer)}</span>
          </div>
        </div>

        <div style="background:#eff6ff; border:1px solid rgba(30,58,138,0.2); border-radius:14px; padding:20px;">
          <h4 style="margin:0 0 14px 0; color:#1e3a8a; font-size:16px;">👑 SISA HAK PEMILIK (BU DEWI)</h4>
          <div style="font-size:24px; font-weight:800; color:#1e3a8a; margin:16px 0 8px 0;">
            ${formatRupiah(hakPemilik)}
          </div>
          <p style="margin:0; font-size:13px; color:#475569;">
            Laba bersih dikurangi 25% bagi hasil Manajer.
          </p>
        </div>
      </div>

      <!-- TABEL REKAP HARIAN BULAN INI -->
      <h4 style="color:#1e293b; margin-bottom:12px; font-size:16px;">📜 Detail Rekap Per Hari Bulan Ini</h4>
      <div class="tabel-responsif">
        <table class="tabel-transaksi-lengkap">
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Omset</th>
              <th>Pengeluaran Ops</th>
              <th>Tabungan Wajib</th>
              <th>Kasbon</th>
              <th>Laba Kotor</th>
              <th>Laba Bersih</th>
            </tr>
          </thead>
          <tbody>
            ${
              dataLaporanBulan.length === 0
                ? `<tr><td colspan="7" class="tabel-kosong" style="text-align:center; padding:20px; color:#94a3b8;">Belum ada data transaksi untuk bulan ini.</td></tr>`
                : dataLaporanBulan
                    .map(
                      (r) => `
              <tr>
                <td style="text-align:left; font-weight:600;">${r.tanggal}</td>
                <td>${formatRupiah(r.omset)}</td>
                <td>${formatRupiah(r.belanjaPasar + r.opsRiil + r.qrisKeluar + r.ditalangiOwner)}</td>
                <td>${formatRupiah(r.tabunganWajib)}</td>
                <td>${formatRupiah(r.kasbon)}</td>
                <td style="font-weight:700; color:#d97706;">${formatRupiah(r.labaKotor)}</td>
                <td style="font-weight:700; color:#2563eb;">${formatRupiah(r.labaBersih)}</td>
              </tr>
            `,
                    )
                    .join("")
            }
          </tbody>
        </table>
      </div>
    </section>
  `;

  const elFilterBulan = container.querySelector("#filter-bulan-laporan");
  if (elFilterBulan) {
    elFilterBulan.addEventListener("change", (e) => {
      window.renderLaporan(container, e.target.value);
    });
  }

  const btnCetak = container.querySelector("#btn-cetak-laporan");
  if (btnCetak) {
    btnCetak.addEventListener("click", () => {
      window.print();
    });
  }
};
