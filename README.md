# ark Registry

`.ark` paketlerinin ücretsiz, sunucusuz kayıt defteri. Altyapı tamamen GitHub üzerinde: dosyalar **Releases**'te, veritabanı `index.json`, site **Pages**'te.

## Kurulum

```bash
curl -L -o ark https://github.com/YunusTAS13/ark-registry/releases/download/ark-v0.1.0/ark
chmod +x ark
sudo mv ark /usr/local/bin/
```

## Kullanım

```bash
sudo ark install google-chrome    # registry'den adla kurar
ark search kod                     # yerel + registry'de ara
ark info discord                   # registry bilgisi
sudo ark list                      # kurulu paketler
sudo ark verify                    # bütünlük kontrolü
```

## Paket üretme ve yayınlama

```bash
mkdir uygulama/usr/local/bin
cp programin uygulama/usr/local/bin/
# manifest.json oluştur (veya otomatik)
cat > uygulama/manifest.json <<'EOF'
{
  "name": "uygulama",
  "version": "1.0.0",
  "description": "Açıklama",
  "arch": "amd64",
  "executables": ["usr/local/bin/programin"]
}
EOF

ark build uygulama              # uygulama-1.0.0.ark üretir

# Yayınla (GitHub hesabı + PAT gerekir)
export ARK_GITHUB_TOKEN=ghp_xxx
export ARK_AUTHOR=adın
ark publish uygulama-1.0.0.ark
```

Dosyalar `/opt/ark/<paket>-<sürüm>/` altına kurulur, komutlar `/usr/local/bin/` içine sembolik bağlanır.

## Repo yapısı

- `index.json` — tüm paketlerin dizini (publish ile güncellenir)
- `metadata/<isim>-<sürüm>.json` — her paketin manifest + sha256 + url kaydı
- `index.html`, `app.js`, `style.css` — Pages sitesi