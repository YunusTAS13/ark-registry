# ark — Evrensel Linux Paket Yöneticisi

> Bir paket. Her Linux. Ücretsiz, sunucusuz, açık.

**ark**, her Linux dağıtımında aynı şekilde çalışan evrensel bir paket yöneticisidir. Bir kez üretilmiş `.ark` paketi **Debian, Arch, Fedora, openSUSE, Alpine** ve diğer her dağıtımda — hangi paket yöneticisini kullandıklarından bağımsız olarak — kurulur.

Bu belge hem **ark'ın ne olduğunu, neden var olduğunu** (vizyon) hem de **uçtan uca nasıl kullanılacağını** (paket üretme, yayınlama, kurma) anlatan tam bir rehberdir.

---

## İçindekiler

1. [Vizyon: Neden ark?](#1-vizyon-neden-ark)
2. [Nasıl çalışır?](#2-nasıl-çalışır)
3. [Kurulum](#3-kurulum)
4. [Hızlı Başlangıç](#4-hızlı-başlangıç)
5. [Komut Referansı](#5-komut-referansı)
6. [Paket Formatı: .ark](#6-paket-formatı-ark)
7. [Paket Üretme Rehberi](#7-paket-üretme-rehberi)
8. [Yayınlama Rehberi](#8-yayınlama-rehberi)
9. [Kurulum Düzeni: Nereye Ne Konur?](#9-kurulum-düzeni-nereye-ne-konur)
10. [Güvenlik](#10-güvenlik)
11. [Masaüstü Entegrasyonu](#11-masaüstü-entegrasyonu)
12. [Registry Altyapısı](#12-registry-altyapısı)
13. [Özel Registry ve Geliştirici Ortamı](#13-özel-registry-ve-geliştirici-ortamı)
14. [Mevcut Paketler](#14-mevcut-paketler)
15. [Yol Haritası](#15-yol-haritası)
16. [SSS](#16-sss)

---

## 1. Vizyon: Neden ark?

### Problem

Linux dünyasında her dağıtımın kendi paket yöneticisi var:

| Dağıtım ailesi | Yönetici | Paket | Kurulabilir olduğu sistem |
|---|---|---|---|
| Arch | pacman | `.pkg.tar.zst` | Sadece Arch tabanlı |
| Debian/Ubuntu | apt/dpkg | `.deb` | Sadece Debian tabanlı |
| Fedora/RHEL | dnf/rpm | `.rpm` | Sadece RPM tabanlı |
| Çoğu | snap | `.snap` | snapd yüklü sistemler |

Bir yazılım geliştiricisi, uygulamasını herkesin kullanabilmesi için **4 farklı paket üretmek** ve **4 ayrı altyapıyı** (APR, COPR, OBS, snapcraft...) öğrenmek zorunda. Bir dağıtımın deposundaki paket başka dağıtıma taşınmaz. Kullanıcı ise `apt install`, `pacman -S`, `dnf install` derken farklı komutların esiri.

### Çözüm

**ark**, paketi dağıtımdan **soyutlar**:

- Paket formatı basit ve herkese açık: `.ark` = `tar.gz` + `manifest.json`.
- Kurulum sadece **standart POSIX dizinlerine** (`/opt`, `/usr/local/bin`, `/usr/share/applications`) yazar — hangi dağıtım olduğu umursanmaz.
- İkili dosyalar indirilirken **SHA-256 ile doğrulanır**; kurulu dosyalar `ark verify` ile istediğin an denetlenir.
- Kullanıcı için komut her yerde aynı: `sudo ark install <paket>`.

### İkinci problem: paket sunmak için para ödemek

Çoğu paket deposu sunucu + bant genişliği + bakım ister. **ark'ın registry'si tamamen GitHub üzerindedir ve kullanıcıya bir kuruşa mal olmaz:**

- Paket ikilileri → **GitHub Releases** (ücretsiz, hızlı, CDN'li)
- Paket veritabanı (`index.json`) → **repo dosyası**
- İnsanların gezip indirdiği mağaza → **GitHub Pages**

Sunucusuz, bakımsız, ücretsiz. Vizyon budur: **herhangi biri, bir komutla, kendi paketini tüm Linux dünyasına yayınlayabilir.**

---

## 2. Nasıl çalışır?

```
        ÜRET                        YAYINLA                     KUR
┌─────────────┐   ark build    ┌──────────────┐  ark publish  ┌──────────────┐
│ uygulama/   │ ─────────────► │ paket.ark    │ ─────────────► │ GitHub       │
│  usr/       │                └──────────────┘               │  Releases    │
│  opt/       │   (tar.gz +                                   │  index.json  │
│  manifest   │    manifest.json)                             │  metadata/   │
└─────────────┘                                               └──────┬───────┘
                                                                     │
                                        sudo ark install <paket>     │
┌──────────────────────────────┐                                     ▼
│ /opt/ark/<paket>-<sürüm>/    │ ◄───────────────────────────────────┘
│ /usr/local/bin/<komut>       │      (indir + SHA-256 doğrula + aç)
│ /usr/share/applications/*.desktop
│ /usr/share/icons/hicolor/...
│ /var/lib/ark/db.json
└──────────────────────────────┘
```

1. **Üret:** Root-dosya-sistemi düzeninde bir klasör + `manifest.json`. `ark build` bunu tek bir `.ark` dosyasına sıkıştırır.
2. **Yayınla:** `ark publish` dosyayı GitHub'a yükler; her paket kendi **release**'ine, özeti `index.json`'a yazılır.
3. **Kur:** `ark install <isim>` registry'den paketi bulur, indirir, SHA-256 doğrular, sistem köküne açar ve bağlantıları kurar.

---

## 3. Kurulum

İndir, çalıştırılabilir yap, `/usr/local/bin`'e koy. Hepsi bu.

```bash
curl -L -o ark https://github.com/YunusTAS13/ark-registry/releases/download/ark-v0.1.0/ark
chmod +x ark
sudo mv ark /usr/local/bin/
```

Kontrol:

```bash
ark
```

Kullanım yardımını görürsün. artık hazırsın.

> **İpucu:** `ark` tek bir statik Go ikilisidir. Dışa bağımlılığı yoktur; GNU/Linux'un herhangi bir sürümünde koşar.

---

## 4. Hızlı Başlangıç

```bash
# Paketi kur
sudo ark install google-chrome      # registry'den adıyla bulup kurar
sudo ark install ./yerel-paket.ark  # ya da doğrudan bir dosyadan

# Paketi ara
ark search chrome                    # yerel kurulumda + registry'de ara

# Bilgi al
ark info discord

# Kuruluları listele ve doğrula
sudo ark list
sudo ark verify

# Kaldır
sudo ark remove google-chrome
```

Kurulumdan sonra uygulama masaüstü menüsünde görünür; Google Chrome'u uygulama arayıcısında aratıp açabilirsin.

---

## 5. Komut Referansı

### `ark install <paket.ark | paket-adı>`
Paketi kurar.
- Argüman `.ark` ile bitiyorsa o dosyadan kurar.
- Değilse registry'den o adı arar, indirir, **SHA-256 doğrular**, kurar.
- Bağımlılıklar (`dependencies`) önceden kurulmuş olmalıdır; aksi halde hata verir ve listeler.
- Zaten kuruluysa, farklı bir paket aynı isimde kullanılamaz.

### `ark remove <isim>`
Paketi kaldırır: sembolik bağlantıları, masaüstü dosyalarını, ikonları ve `/opt/ark` altındaki dizini siler. Başka bir kurulu paket buna bağımlıysa kaldırmayı engeller.

### `ark list`
Kurulu paketleri tablo hâlinde gösterir (isim, sürüm, mimari, açıklama).

### `ark search <kelime>`
Önce **yerel** kurulumda, sonra **registry'de** isim/açıklama eşleşmesi arar.

### `ark info <isim>`
Kuruluysa yerelden; kurulu değilse registry'den paket detayını gösterir: mimari, boyut, SHA-256, yayın tarihi, yazar, indirme URL'si.

### `ark verify [isim]`
Kurulu dosyaların bütünlüğünü doğrular:
- Her dosyanın **SHA-256** hash'i, kurulum anında kaydedilenle karşılaştırılır.
- Sembolik bağlantıların hedefinin var olduğu kontrol edilir.
- `/usr/local/bin` bağlantılarının, `.desktop` dosyalarının ve ikonların yerinde olup olmadığı denetlenir.
- İsim verilmezse tüm paketler taranır.

### `ark build <klasör> [çıktı]`
Root-dosya-sistemi düzenindeki bir klasörü `.ark` paketine çevirir. `manifest.json` varsa çıktı adını `isim-sürüm.ark` olarak kendisi belirler; manifest'te `executables` yoksa çalıştırılabilir dosyaları kendisi tespit eder.

### `ark publish <paket.ark> [sahip/repo]`
Paketi GitHub'a yayınlar. Detaylar [Yayınlama Rehberi](#8-yayınlama-rehberi)'nde.

### `ark registry [url]`
Varsayılan registry adresini gösterir; argüman verilirse `~/.config/ark/registry` dosyasına yazarak kalıcı olarak değiştirir.

---

## 6. Paket Formatı: .ark

Bir `.ark` dosyası şunlardan oluşur:

```
paket-1.0.0.ark
├── manifest.json        ← paket kimlik kartı (ilk girdi)
├── usr/bin/...          ← kullanıcı alanı dosyaları
├── usr/share/...        ← .desktop dosyaları, ikonlar, veriler
└── opt/paket/...        ← uygulama dosyaları (ör. /opt/google/chrome)
```

### manifest.json

Paket hakkındaki tüm bilgi tek bir JSON'dadır:

```json
{
  "name": "uygulama",
  "version": "1.0.0",
  "description": "Kısa açıklama",
  "arch": "amd64",
  "dependencies": ["kutuphane"],
  "executables": ["usr/local/bin/uygulama"]
}
```

| Alan | Zorunlu | Açıklama |
|---|---|---|
| `name` | evet | Küçük harf, rakam ve `+._-`. Paketin benzersiz adı. |
| `version` | evet | Herhangi bir sürüm dizisi. |
| `description` | hayır | Arama ve bilgide gösterilen açıklama. |
| `arch` | hayır | Hedef mimari (ör. `amd64`, `arm64`). |
| `dependencies` | hayır | Kurulmadan önce sistemde olması gereken paket adları. |
| `executables` | hayır | `/usr/local/bin` içine bağlanacak dosyaların **paket içindeki** yolları. Boşsa `ark build` çalıştırılabilirleri otomatik bulur. |

`executables` içindeki her yol, `/opt/ark/<isim>-<sürüm>/` altına göre olmalıdır (mutlak yol veya `..` içeremez).

### Paket dizin kuralı

Paket içi yollar, sistem köküne **olduğu gibi** yansır. Örnek: paketteki `usr/local/bin/uygulama` → sistemde `/opt/ark/uygulama-1.0.0/usr/local/bin/uygulama`. Bu yüzden paket üretirken dosyaları **gerçekte kurulacakları dizin hiyerarşisine** göre yerleştirirsin.

---

## 7. Paket Üretme Rehberi

### 7.1 Mevcut bir `.deb` / `.rpm` / `tar.gz`'den

Bir uygulamanın içeriği zaten bir kök dosya sistemi düzenindeyse (deb/rpm arşivleri, GitHub release tarball'ları) onu açıp `manifest.json` eklemek yeterli:

```bash
mkdir -p uygulama
# .deb'i kök düzeninde aç
dpkg-deb -x uygulama.deb uygulama/
# veya .tar.gz
tar -xzf uygulama.tar.gz --strip-components=1 -C uygulama/
```

### 7.2 manifest.json oluştur

```bash
cat > uygulama/manifest.json <<'EOF'
{
  "name": "uygulama",
  "version": "1.0.0",
  "description": "Süper uygulama",
  "arch": "amd64",
  "executables": ["usr/local/bin/uygulama"]
}
EOF
```

### 7.3 Paketle

```bash
ark build uygulama
# → uygulama-1.0.0.ark
```

### 7.4 Yerel olarak test et

Güvenli bir ortamda (`ARK_ROOT` ile gerçek sistemine dokunmadan) kur:

```bash
mkdir -p /tmp/deneme
ARK_ROOT=/tmp/deneme ark install uygulama-1.0.0.ark
ARK_ROOT=/tmp/deneme ark verify uygulama
```

Her şey tamamsa yayınlamaya hazırsın.

> **Masaüstü uygulaması mı?** Pakette `usr/share/applications/*.desktop` ve ikonlar varsa ark bunları otomatik kurar — [Masaüstü Entegrasyonu](#11-masaüstü-entegrasyonu) bölümüne bak. İkon, `.desktop` içindeki `Icon=` adıyla pakette birebir eşleşir; Google Chrome gibi `product_logo_128.png` tarzı isimler de otomatik tanınır.

---

## 8. Yayınlama Rehberi

Yayınlamak için bir **GitHub hesabı** ve bir **PAT (Personal Access Token)** gerekir.

### 8.1 Token oluştur

GitHub → Settings → Developer settings → **Fine-grained tokens** → Generate new token:

- **Repository access:** sadece `ark-registry` reposu (veya kendi repo'n)
- **Permissions:** `Contents: Read and write`

Token'ı bir kez al, sonra herkese açık alanlara koyma.

### 8.2 Yayınla

```bash
export ARK_GITHUB_TOKEN=github_pat_xxx
export ARK_AUTHOR="Adın Soyadın"        # isteğe bağlı, paket kaydına yazılır
ark publish uygulama-1.0.0.ark
```

Ne olur:

1. Paketin manifest'i okunur, sürüm etiketi `uygulama-1.0.0` olarak belirlenir.
2. Release yoksa oluşturulur; `.ark` dosyası release asset'i olarak yüklenir.
3. `metadata/uygulama-1.0.0.json` (manifest + boyut + SHA-256 + URL) repoya yazılır.
4. `index.json` güncellenir → paket registry'de görünür.

Bitti. Artık dünyadaki her ark kullanıcısı şunu yazıp kurabilir:

```bash
sudo ark install uygulama
```

### 8.3 Kendi reponda yayınla

Varsayılan registry `YunusTAS13/ark-registry`. İstersen kendi repo'nu hedefleyebilirsin (repo'da `index.json` yoksa `ark publish` kendisi oluşturur):

```bash
ark publish uygulama-1.0.0.ark sen/benim-registry
```

> **Not:** Kendi repo'na yayınladıktan sonra kullanıcılar o repo'nun adresini `ark registry <adres>` ile ayarlar — [Özel Registry](#13-özel-registry-ve-geliştirici-ortamı) bölümüne bak.

---

## 9. Kurulum Düzeni: Nereye Ne Konur?

`ark install` aşağıdaki standart dizinlere yazar (hepsi değişkenlerle özelleştirilebilir):

| Yol | İçerik |
|---|---|
| `/opt/ark/<isim>-<sürüm>/` | Paketin tüm dosyaları (yalıtılmış, sürümlü) |
| `/usr/local/bin/<komut>` | `executables` içindeki her dosya için sembolik bağlantı |
| `/usr/share/applications/*.desktop` | Patch'lenmiş masaüstü dosyaları |
| `/usr/share/icons/hicolor/<size>x<size>/apps/` | İkon bağlantıları |
| `/var/lib/ark/db.json` | Paket veritabanı (dosya listesi + SHA-256 hash'leri + bağlantılar) |

### Neden `/opt/ark`?

- Her paket sürümüyle birlikte **kendi dizininde** yaşar; paketler birbirinin dosyasını ezemez.
- Kaldırma = dizini silmek. Sistem dosyalarına bulaşılmaz.
- Aynı adın farklı sürümleri teorik olarak yan yana durabilir (şimdilik en yeni kurulur).

### Neden sembolik bağlantı?

Uygulama dosyaları `/opt/ark` altında kalır, komutlar `/usr/local/bin`'e bağlanır. Böylece `PATH`'te görünür, ama silme işlemi temiz kalır — paketi kaldırınca bağlantı çözülür ve gider.

---

## 10. Güvenlik

ark, birkaç katmanlı güvenlik önlemiyle gelir:

1. **SHA-256 doğrulama** — İndirilen her paketin hash'i registry kaydıyla karşılaştırılır; uyuşmazsa kurulum **iptal edilir**. İlk kurulumda da her dosyanın hash'i veritabanına yazılır.
2. **Yol sızma koruması** — Arşiv açılırken `..` veya mutlak yol içeren girdiler reddedilir; hiçbir dosya `/opt/ark/<paket>/` dışına çıkamaz.
3. **Sembolik bağlantı politikası** — Mutlak hedefli bağlantılar (ör. `google-chrome-stable → /opt/google/chrome/...`) sistemde o yol yoksa **paket içine göreceli** olarak yeniden yazılır; kırık bağlantı kurulmaz.
4. **Bağımlılık ve çakışma denetimi** — Eksik bağımlılıkta veya isim çakışmasında kurulum reddedilir; bağımlı paket varken kaldırma engellenir.
5. **Bütünlük takibi** — `ark verify` ile kurulu dosyaların zamanla bozulup bozulmadığı (hash), bağlantıların çözülüp çözülmediği her an denetlenebilir.

> Açıkçası: her paket yöneticisi gibi ark da **imzalı** sistemlerin yerini tutmaz. Yayıncı güvenilirliği için registry sahibinin tek onayı `index.json`'dur. Gelecekte GPG imzalama yol haritasında (bkz. [Yol Haritası](#15-yol-haritası)).

---

## 11. Masaüstü Entegrasyonu

Kurulum sırasında pakette `.desktop` dosyaları varsa ark şunları otomatik yapar:

1. Paket içindeki tüm `.desktop` dosyalarını bulur.
2. `Exec=` ve `TryExec=` satırlarındaki komutları, paketin `/usr/local/bin` bağlantısıyla eşleştirir ve **sistemde gerçekten var olan yola** çevirir:
   - `Exec=/usr/bin/google-chrome-stable %U` → `Exec=/usr/local/bin/google-chrome-stable %U`
   - `Exec=/usr/share/discord/Discord` → `Exec=/usr/local/bin/Discord`
3. Dosyayı `/usr/share/applications/` altına yazar — uygulama masaüstü menüsünde ve arayıcıda görünür.
4. `Icon=` adıyla eşleşen ikonu bulur ve `/usr/share/icons/hicolor/<size>x<size>/apps/` altına bağlar:
   - Birebir isim eşleşmesi (ör. `discord.png`).
   - Chrome tarzı `product_logo_128.png` → `google-chrome.png` (16–256 px tüm boyutlar).
5. Kaldırırken masaüstü dosyalarını ve ikonları temizler; `ark verify` varlıklarını denetler.

---

## 12. Registry Altyapısı

Bu repo tek başına tüm altyapıyı barındırır — sunucu yok, bakım yok, masraf yok:

```
ark-registry/
├── index.json                    ← PAKET VERİTABANI (isim → kayıt)
├── metadata/<isim>-<sürüm>.json  ← her paketin ayrıntılı kaydı
├── index.html / app.js / style.css  ← GitHub Pages mağazası
└── README.md                     ← bu belge
```

- **İkili dosyalar:** GitHub Releases'te. Her sürümün etiketi `<isim>-<sürüm>`, asset'i `<isim>-<sürüm>.ark`.
- **Veritabanı:** `index.json` her yayında `ark publish` tarafından otomatik güncellenir.
- **Mağaza:** GitHub Pages'te canlı site → <https://yunustas13.github.io/ark-registry/>

### index.json kayıt örneği

```json
{
  "google-chrome": {
    "name": "google-chrome",
    "version": "151.0.7922.137",
    "description": "Web Tarayıcı",
    "arch": "amd64",
    "publishedAt": "2026-08-17T...",
    "size": 212325533,
    "sha256": "9f1a...",
    "url": "https://github.com/YunusTAS13/ark-registry/releases/download/google-chrome-151.0.7922.137/google-chrome-151.0.7922.137.ark",
    "author": "YunusTAS13"
  }
}
```

---

## 13. Özel Registry ve Geliştirici Ortamı

### Registry'yi değiştir

```bash
ark registry https://raw.githubusercontent.com/sen/benim-registry/main   # kalıcı
ARK_REGISTRY=https://... ark search paket                                # tek seferlik
```

Öncelik sırası: `ARK_REGISTRY` ortam değişkeni → `~/.config/ark/registry` dosyası → varsayılan.

### Test kökü (geliştiriciler için)

`ARK_ROOT` ile kurulumu gerçek sistemin dışına yönlendirebilirsin — root bile gerekmez:

```bash
ARK_ROOT=/tmp/kok ark install ./paket.ark
ARK_ROOT=/tmp/kok ark list
ARK_ROOT=/tmp/kok ark verify
```

Bu, paketlerini zararsız bir sandbox'ta denemek için mükemmeldir. Kök değişkeni `/` dışındaysa `sudo` istenmez.

### Ortam değişkenleri özeti

| Değişken | Amaç |
|---|---|
| `ARK_ROOT` | Kurulum kökü (varsayılan `/`). Test için değiştir. |
| `ARK_REGISTRY` | Registry adresi (kalıcı değişiklik için `ark registry`). |
| `ARK_GITHUB_TOKEN` | `ark publish` için GitHub PAT (Contents: Read & Write). |
| `ARK_AUTHOR` | Yayınlanan paketin yazar kaydı. |

---

## 14. Mevcut Paketler

| Paket | Sürüm | Açıklama | Kurulum |
|---|---|---|---|
| google-chrome | 151.0.7922.137 | Google Chrome web tarayıcısı | `sudo ark install google-chrome` |
| code | 1.133.0 | VS Code editörü | `sudo ark install code` |
| discord | 0.0.84 | Discord sohbet uygulaması | `sudo ark install discord` |

Hepsini bir arada:

```bash
sudo ark install google-chrome
sudo ark install code
sudo ark install discord
```

Mağazadan gez: <https://yunustas13.github.io/ark-registry/>

---

## 15. Yol Haritası

ark'ın vizyonu büyüyor. Planlanan adımlar:

- [ ] **`ark import <dosya.deb|rpm>`** — mevcut paket formatlarını tek komutla `.ark`'a çeviren evrensel içe aktarıcı (üretimin en zahmetli adımını otomatikleştirir).
- [ ] **GPG imzalama** — paketlerin ve index'in kriptografik doğrulaması.
- [ ] **zstd + paralel çıkarma** — daha küçük paketler, daha hızlı kurulum.
- [ ] **Otomatik bağımlılık çözme** — `dependencies` alanındaki eksikleri registry'den kendisi kurar.
- [ ] **Sürüm yönetimi** — aynı paketin birden çok sürümü ve geçiş (`ark upgrade`).
- [ ] **A/arm64 çoklu mimari** — aynı paket adı altında mimariye göre doğru ikiliyi seçme.
- [ ] **Delta güncellemeleri** — sadece değişen kısmı indirerek küçük güncellemeler.

Bu listenin üzerine eklemek istediğin bir şey varsa — bu proje tamamen senin: çekme isteği aç, kendi yolunu çiz.

---

## 16. SSS

**Soru:** ark kök yetkisi ister mi?
**Cevap:** `/` köküne kurarken evet (`sudo ark install ...`). `ARK_ROOT` ile özel bir dizine kurarken hayır.

**Soru:** Paketler diğer paket yöneticileriyle çakışır mı?
**Cevap:** Hayır. ark dosyalarını `/opt/ark`, `/usr/local/bin` ve `/usr/share/applications` altında tutar; dağıtımın paket veritabanına dokunmaz. (İkisi de aynı komutu `/usr/local/bin`'e koymadığı sürece.)

**Soru:** Bir paket bozulursa ne olur?
**Cevap:** `sudo ark verify` hash uyuşmazlığını gösterir; `sudo ark remove paket` ile temizleyip yeniden kurabilirsin.

**Soru:** İnternete erişim gerektirir mi?
**Cevap:** Registry'den kurarken evet (indirme için). Zaten indirdiğin `.ark` dosyasını `ark install ./dosya.ark` ile çevrimdışı da kurabilirsin.

**Soru:** Kendi paketimi nasıl yayınlarım?
**Cevap:** [Paket Üretme Rehberi](#7-paket-üretme-rehberi) + [Yayınlama Rehberi](#8-yayınlama-rehberi). İki komut: `ark build` ve `ark publish`.

**Soru:** Registry'mi değiştirebilir miyim?
**Cevap:** Evet — `ark registry <adres>` veya `ARK_REGISTRY` ortam değişkeni.

---

*ark, tek kişilik bir vizyonun ürünü: Linux paketleme kaosuna basit, özgür ve herkesin erişebildiği bir alternatif. Paylaş, kullan, üret.*
