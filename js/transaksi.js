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
// FUNGSI UTAMA HITUNG DASHBOARD & RENDER SEMUA TABEL
// ==============================================
function muatDashboardUtama() {
  // 1. Ambil data riwayat transaksi satuan
  const dataRiwayat = JSON.parse(
    localStorage.getItem("data_transaksi_sambel_tempong") || "[]",
  );

  // 2. LOGIKA OTOMATIS: Rekap/gabungkan transaksi satuan berdasarkan TANGGAL
  const rekapPerTanggal = {};

  dataRiwayat.forEach((t) => {
    const tgl = t.tanggal;
    if (!tgl) return;

    if (!rekapPerTanggal[tgl]) {
      rekapPerTanggal[tgl] = {
        tanggal: tgl,
        tunai: 0,
        qrisMasuk: 0,
        transfer: 0,
        tabunganWajib: 495000, // Standar Alokasi Tabungan Harian
        kasbon: 0,
        namaKasbon: [],
        belanjaPasar: 0,
        opsRiil: 0,
        qrisKeluar: 0,
        ditalangiOwner: 0,
        bayarOwner: 0,
        keterangan: [],
      };
    }

    const item = rekapPerTanggal[tgl];
    const nominal = Number(t.jumlah || 0);

    // Kelompokkan nominal ke kolom yang tepat sesuai Kategori Input
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
      case "makan_karyawan":
        item.opsRiil += nominal;
        break;
      case "qris_keluar":
        item.qrisKeluar += nominal;
        break;
      case "kasbon":
        item.kasbon += nominal;
        if (t.keterangan) item.namaKasbon.push(t.keterangan);
        break;
      case "talangan_owner":
        item.ditalangiOwner += nominal;
        break;
      case "bayar_owner":
        item.bayarOwner += nominal;
        break;
    }

    if (t.keterangan && t.kategori !== "kasbon") {
      item.keterangan.push(t.keterangan);
    }
  });

  // 3. Hitung Rumus Omset, Laba Kotor, & Laba Bersih per Tanggal
  const dataLaporan = Object.values(rekapPerTanggal).map((row) => {
    const omset = row.tunai + row.qrisMasuk + row.transfer;
    const totalPengeluaranOps =
      row.belanjaPasar + row.opsRiil + row.qrisKeluar + row.ditalangiOwner;

    const labaKotor = omset - totalPengeluaranOps;
    const labaBersih = labaKotor - row.tabunganWajib - row.kasbon;

    return {
      ...row,
      omset: omset,
      labaKotor: labaKotor,
      labaBersih: labaBersih,
      namaKaryawanKasbon: row.namaKasbon.join(", ") || "-",
      keterangan: row.keterangan.join(" | ") || "-",
    };
  });

  // Simpan hasil gabungan ke localStorage 'laporanHarian'
  localStorage.setItem("laporanHarian", JSON.stringify(dataLaporan));

  // 4. Hitung Akumulasi Total Kartu Atas & Bu Dewi
  let totalOmset = 0;
  let totalLabaKotor = 0;
  let totalLabaBersih = 0;
  let totalDitalangiBuDewi = 0;
  let totalSudahDibayarBuDewi = 0;

  dataLaporan.forEach((item) => {
    totalOmset += item.omset;
    totalLabaKotor += item.labaKotor;
    totalLabaBersih += item.labaBersih;
    totalDitalangiBuDewi += item.ditalangiOwner;
    totalSudahDibayarBuDewi += item.bayarOwner;
  });

  let sisaKekuranganBuDewi = totalDitalangiBuDewi - totalSudahDibayarBuDewi;

  // Update Nilai ke Kartu Dashboard Atas
  const elOmset = document.getElementById("nilai-omset");
  const elLabaKotor = document.getElementById("nilai-labakotor");
  const elLabaBersih = document.getElementById("nilai-lababersih");

  if (elOmset) elOmset.innerText = `Rp ${totalOmset.toLocaleString("id-ID")}`;
  if (elLabaKotor)
    elLabaKotor.innerText = `Rp ${totalLabaKotor.toLocaleString("id-ID")}`;
  if (elLabaBersih)
    elLabaBersih.innerText = `Rp ${totalLabaBersih.toLocaleString("id-ID")}`;

  // 5. Render Semua Tabel ke Layar
  setTimeout(() => {
    const tbodyLaporan = document.getElementById("isi-tabel-laporan");
    const elWaktu = document.getElementById("waktu-perbarui");

    // A. TABEL LAPORAN HARIAN LENGKAP
    if (tbodyLaporan) {
      if (dataLaporan.length === 0) {
        tbodyLaporan.innerHTML = `<tr><td colspan="15" class="tabel-kosong">Belum ada data laporan harian. Silakan input transaksi baru.</td></tr>`;
      } else {
        tbodyLaporan.innerHTML = dataLaporan
          .map(
            (row) => `
              <tr>
                <td>${row.tanggal}</td>
                <td>Rp ${row.tunai.toLocaleString("id-ID")}</td>
                <td>Rp ${row.qrisMasuk.toLocaleString("id-ID")}</td>
                <td>Rp ${row.transfer.toLocaleString("id-ID")}</td>
                <td>Rp ${row.tabunganWajib.toLocaleString("id-ID")}</td>
                <td>Rp ${row.kasbon.toLocaleString("id-ID")}</td>
                <td>${row.namaKaryawanKasbon}</td>
                <td>Rp ${row.belanjaPasar.toLocaleString("id-ID")}</td>
                <td>Rp ${row.opsRiil.toLocaleString("id-ID")}</td>
                <td>Rp ${row.qrisKeluar.toLocaleString("id-ID")}</td>
                <td><strong>Rp ${row.omset.toLocaleString("id-ID")}</strong></td>
                <td><strong>Rp ${row.labaKotor.toLocaleString("id-ID")}</strong></td>
                <td><strong>Rp ${row.labaBersih.toLocaleString("id-ID")}</strong></td>
                <td style="max-width: 250px; font-size: 12px;">${row.keterangan}</td>
                <td><span style="color:#22c55e; font-weight:bold; font-size:12px;">✓ Sukses</span></td>
              </tr>
            `,
          )
          .join("");
      }
    }

    // B. RENDERING 2 TABEL KHUSUS BU DEWI
    const wadahTabelUtama = document.getElementById("wadah-tabel-transaksi");
    if (wadahTabelUtama) {
      let elBuDewi = document.getElementById("wadah-tanggungan-budewi");
      if (!elBuDewi) {
        elBuDewi = document.createElement("div");
        elBuDewi.id = "wadah-tanggungan-budewi";
        elBuDewi.style.marginTop = "30px";
        elBuDewi.style.padding = "20px";
        elBuDewi.style.background = "#fff8e6";
        elBuDewi.style.border = "1px solid #ffd699";
        elBuDewi.style.borderRadius = "14px";
        wadahTabelUtama.appendChild(elBuDewi);
      }

      elBuDewi.innerHTML = `
        <h3 style="color: #92400e; margin-bottom: 15px;">👑 Rekapitulasi Pembayaran & Kekurangan ke Bu Dewi</h3>
        
        <!-- TABEL KEKURANGAN PEMBAYARAN KE BU DEWI -->
        <div class="tabel-responsif" style="margin-bottom: 20px;">
          <table class="tabel-transaksi">
            <thead>
              <tr style="background: #fef3c7;">
                <th>Status Kategori</th>
                <th class="rata-kanan">Total Belanja Ditalangi Bu Dewi</th>
                <th class="rata-kanan">Total Sudah Dibayarkan</th>
                <th class="rata-kanan" style="color: #b45309;">SISA KEKURANGAN PEMBAYARAN</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Tanggungan Restoran</strong></td>
                <td class="rata-kanan">Rp ${totalDitalangiBuDewi.toLocaleString("id-ID")}</td>
                <td class="rata-kanan" style="color: #16a34a;">Rp ${totalSudahDibayarBuDewi.toLocaleString("id-ID")}</td>
                <td class="rata-kanan" style="font-weight: bold; color: #dc2626; font-size: 16px;">Rp ${Math.max(0, sisaKekuranganBuDewi).toLocaleString("id-ID")}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- TABEL RIWAYAT PEMBAYARAN KE BU DEWI -->
        <h4 style="color: #92400e; margin: 15px 0 10px 0;">📜 Riwayat Pembayaran ke Bu Dewi</h4>
        <div class="tabel-responsif">
          <table class="tabel-transaksi">
            <thead>
              <tr>
                <th>No</th>
                <th>Tanggal Pembayaran</th>
                <th class="rata-kanan">Jumlah Dibayarkan</th>
                <th>Keterangan</th>
              </tr>
            </thead>
            <tbody id="isi-tabel-bayar-budewi"></tbody>
          </table>
        </div>
      `;

      const tbodyBayarBuDewi = document.getElementById(
        "isi-tabel-bayar-budewi",
      );
      if (tbodyBayarBuDewi) {
        const dataBayar = dataRiwayat.filter(
          (t) => t.kategori === "bayar_owner",
        );
        if (dataBayar.length === 0) {
          tbodyBayarBuDewi.innerHTML = `<tr><td colspan="4" class="tabel-kosong">Belum ada riwayat pembayaran ke Bu Dewi.</td></tr>`;
        } else {
          tbodyBayarBuDewi.innerHTML = dataBayar
            .map(
              (t, i) => `
              <tr>
                <td>${i + 1}</td>
                <td>${t.tanggal}</td>
                <td class="rata-kanan" style="font-weight:bold; color:#16a34a;">Rp ${(t.jumlah || 0).toLocaleString("id-ID")}</td>
                <td>${t.keterangan || "Pembayaran ke Bu Dewi"}</td>
              </tr>
            `,
            )
            .join("");
        }
      }
    }

    // C. TABEL DETAIL TRANSAKSI SATUAN (DI BAGIAN BAWAH)
    if (
      wadahTabelUtama &&
      !document.getElementById("wadah-tabel-riwayat-satuan")
    ) {
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
      wadahTabelUtama.appendChild(elemenRiwayat);
    }

    const tbodyRiwayat = document.getElementById("isi-tabel-riwayat");
    if (tbodyRiwayat) {
      if (dataRiwayat.length === 0) {
        tbodyRiwayat.innerHTML = `<tr><td colspan="7" class="tabel-kosong">Belum ada transaksi satuan baru yang diinput manual.</td></tr>`;
      } else {
        tbodyRiwayat.innerHTML = dataRiwayat
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

  if (!localStorage.getItem("laporanHarian")) {
    localStorage.setItem("laporanHarian", JSON.stringify([]));
  }

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
              "Akses penuh: input transaksi, atur tabungan, ubah data, lihat laporan.";

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

  document.addEventListener("click", (e) => {
    const tombol = e.target.closest(".tombol-menu");
    if (!tombol) return;

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
          pesan.textContent = "Ringkasan arus kas & laporan harian lengkap.";
        }
        if (elRingkasan) elRingkasan.style.display = "grid";
        if (elWadahTabel) elWadahTabel.style.display = "block";

        muatDashboardUtama();
        break;

      case "transaksi":
        if (sapaan) sapaan.textContent = "👌 Semangat Dan Teliti 💪";
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
      pesan.textContent = "Ringkasan arus kas & laporan harian lengkap.";
    }

    muatDashboardUtama();
  }
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./sw.js")
      .then((reg) => console.log("Service Worker terdaftar!", reg))
      .catch((err) => console.log("Service Worker gagal:", err));
  });
}
