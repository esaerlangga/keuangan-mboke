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
// KONFIGURASI & VARIABEL GLOBAL
// ==============================================
document.addEventListener("DOMContentLoaded", function () {
  const PASSWORD = { manajer: "Esa91", owner: "owner123" };
  let roleYangDipilih = null;

  // ==============================================
  // FUNGSI BANTU
  // ==============================================
  function formatRupiah(angka) {
    const nomor = Number(angka) || 0;
    return "Rp " + nomor.toLocaleString("id-ID", { minimumFractionDigits: 0 });
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

  // ==============================================
  // FUNGSI DASHBOARD
  // ==============================================
  {
    const daftarLaporan = JSON.parse(
      localStorage.getItem("laporanHarian") || "[]",
    );
    let totalOmset = 0,
      totalLabaKotor = 0,
      totalLabaBersih = 0;
    daftarLaporan.forEach((lap) => {
      totalOmset += lap.omset || 0;
      totalLabaKotor += lap.labaKotor || 0;
      totalLabaBersih += lap.labaBersih || 0;
    });

    const elOmset = document.getElementById("nilai-omset");
    const elLK = document.getElementById("nilai-labakotor");
    const elLB = document.getElementById("nilai-lababersih");
    if (elOmset) elOmset.textContent = formatRupiah(totalOmset);
    if (elLK) elLK.textContent = formatRupiah(totalLabaKotor);
    if (elLB) elLB.textContent = formatRupiah(totalLabaBersih);

    const tbody = document.getElementById("isi-tabel-laporan");
    const elWaktu = document.getElementById("waktu-perbarui");
    if (!tbody) return;
    tbody.innerHTML =
      daftarLaporan.length === 0
        ? `<tr><td colspan="15" class="tabel-kosong">Belum ada data laporan harian yang dicatat</td></tr>`
        : daftarLaporan
            .map(
              (lap, i) => `
        <tr>
          <td>${lap.tanggal || "-"}</td>
          <td class="nilai-positif">${formatRupiah(lap.tunai || 0)}</td>
          <td class="nilai-positif">${formatRupiah(lap.qrisMasuk || 0)}</td>
          <td class="nilai-positif">${formatRupiah(lap.transfer || 0)}</td>
          <td class="nilai-negatif">${formatRupiah(lap.tabunganWajib || 0)}</td>
          <td class="nilai-negatif">${formatRupiah(lap.kasbon || 0)}</td>
          <td>${lap.namaKaryawanKasbon || "-"}</td>
          <td class="nilai-negatif">${formatRupiah(lap.belanjaPasar || 0)}</td>
          <td class="nilai-negatif">${formatRupiah(lap.opsRiil || 0)}</td>
          <td class="nilai-negatif">${formatRupiah(lap.qrisKeluar || 0)}</td>
          <td class="nilai-positif">${formatRupiah(lap.omset || 0)}</td>
          <td class="nilai-positif">${formatRupiah(lap.labaKotor || 0)}</td>
          <td class="${(lap.labaBersih || 0) >= 0 ? "nilai-positif" : "nilai-negatif"}">${formatRupiah(lap.labaBersih || 0)}</td>
          <td>${lap.keterangan || "-"}</td>
          <td>
            <button class="btn-ubah" data-index="${i}">Ubah</button>
            <button class="btn-hapus" data-index="${i}">Hapus</button>
          </td>
        </tr>
      `,
            )
            .join("");
    if (elWaktu) elWaktu.textContent = new Date().toLocaleString("id-ID");
  }

  // ==============================================
  // TOMBOL PILIH ROLE
  // ==============================================
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("tombol-role")) {
      document
        .querySelectorAll(".tombol-role")
        .forEach((t) => t.classList.remove("aktif"));
      e.target.classList.add("aktif");
      roleYangDipilih = e.target.dataset.role;
    }
  });

  // ==============================================
  // TOMBOL LOGIN
  // ==============================================
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
        setTimeout(() => {
          document.getElementById("halaman-login").style.display = "none";
          document.getElementById("halaman-utama").style.display = "block";
          document.body.classList.add("logged-in");

          const labelRole = document.getElementById("label-role");
          if (labelRole) {
            // Mengganti teks di header menjadi Icon dan Nama
            if (roleYangDipilih === "manajer") {
              labelRole.innerHTML = "👨‍💼 Esa (Manajer)";
            } else {
              labelRole.innerHTML = "👑 Bu Dewi (Owner)";
            }
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
                : "Lihat seluruh laporan keuangan dan rincian transaksi.";

          if (roleYangDipilih === "owner")
            document
              .querySelectorAll("#menu-utama .khusus-manajer")
              .forEach((m) => (m.style.display = "none"));
          renderDashboardKeuangan();
        }, 650);
      } else {
        tampilkanNotifikasi("error", "Password salah! Coba lagi");
        document.getElementById("password").value = "";
      }
    });
  }

  // Tekan Enter untuk login
  document.getElementById("password")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") tombolMasuk.click();
  });

  // ==============================================
  // LOGOUT
  // ==============================================
  document.addEventListener("click", (e) => {
    if (e.target.closest("#tombol-keluar")) {
      tampilkanKonfirmasi(
        "Yakin ingin keluar?",
        () => {
          tampilkanNotifikasi("info", "Sedang keluar...");
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
        if (sapaan) sapaan.textContent = "🏠 Dashboard Utama";
        if (pesan)
          pesan.textContent = "Ringkasan arus kas & laporan harian lengkap.";
        if (elRingkasan) elRingkasan.style.display = "block";
        if (elWadahTabel) elWadahTabel.style.display = "block";
        renderDashboardKeuangan();
        break;
      case "transaksi":
        if (sapaan) sapaan.textContent = "➕ Input Laporan Harian";
        if (pesan)
          pesan.textContent =
            "Catat pemasukan, pengeluaran, dan kasbon harian.";

        const wadahFormTransaksi = Object.assign(
          document.createElement("div"),
          { id: "wadah-form-transaksi" },
        );
        pesan.parentNode.appendChild(wadahFormTransaksi);
        renderFormTransaksi(wadahFormTransaksi); // Memanggil fungsi di transaksi.js
        break;
      case "tabungan":
        if (sapaan) sapaan.textContent = "🏦 Pengelolaan Tabungan";
        if (pesan) pesan.textContent = "Sisihkan uang ke pos wajib.";

        const wadahFormTabungan = Object.assign(document.createElement("div"), {
          id: "wadah-form-transaksi",
        });
        pesan.parentNode.appendChild(wadahFormTabungan);
        renderTabungan(wadahFormTabungan); // Memanggil fungsi di transaksi.js
        break;
      case "laporan":
        if (sapaan) sapaan.textContent = "📊 Laporan Bulanan";
        if (pesan)
          pesan.textContent = "Rekap data harian jadi laporan siap cetak.";

        const wadahFormLaporan = Object.assign(document.createElement("div"), {
          id: "wadah-form-transaksi",
        });
        pesan.parentNode.appendChild(wadahFormLaporan);
        renderLaporan(wadahFormLaporan); // Memanggil fungsi di transaksi.js
        break;
    }
  });

  // ==============================================
  // DATA CONTOH AWAL
  // ==============================================
  if (JSON.parse(localStorage.getItem("laporanHarian") || "[]").length === 0) {
    localStorage.setItem(
      "laporanHarian",
      JSON.stringify([
        {
          tanggal: "2026-07-19",
          tunai: 120000,
          qrisMasuk: 85000,
          transfer: 50000,
          tabunganWajib: 25000,
          kasbon: 50000,
          namaKaryawanKasbon: "Budi Santoso",
          belanjaPasar: 45000,
          opsRiil: 10000,
          qrisKeluar: 5000,
          omset: 255000,
          labaKotor: 210000,
          labaBersih: 75000,
          keterangan: "Lancar, stok aman",
        },
      ]),
    );
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
