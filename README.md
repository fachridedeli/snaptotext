# Snap to text

Snap foto dan copy paste.

## Tujuan aplikasi

aplikasi ini dibuat karena saya capek ketik serialnumber, mac address, ip, key, dll.

sebagai IT support saya sangat malas. karena orang malas pasti berfikir agar bisa bermalas-malasan.

## Install menggunakan docker

### Buat image menggunakan Dokerfile

```bash
sudo docker build -t snaptotext
```

membuat image dengan tag name "snaptotext" menggunakan node:20-alpine, npm dan library serve untuk dijalankan pada port 80 di container

### running app menggunakan docker-compose.yml

```bash
sudo docker compose up -d
```

aplikasi berjalan pada port 80 di container, dan di forward ke port 9003 pada host.

> [!NOTE]
> Enjoyy foto dan copy paste
