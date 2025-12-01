# Test Builder - Drag & Drop Page Builder

Basit ve kullanışlı bir drag & drop sayfa oluşturucu. Kullanıcılar elementleri sürükleyip canvas üzerine bırakarak sayfa tasarımı yapabilir.

## Özellikler

- **Drag & Drop**: Elementleri sürükle bırak ile yerleştirme
- **Grid Sistem**: 20px grid ile düzenli hizalama
- **Çakışma Kontrolü**: Elementler üst üste gelmiyor
- **Element Düzenleme**: Seçme, taşıma, boyutlandırma
- **Z-Index Kontrolü**: Elementleri öne/arkaya taşıma
- **JSON Export**: Tasarımı JSON formatında kaydetme

## Kullanılan Teknolojiler

- HTML5
- CSS3
- Vanilla JavaScript

## Kurulum

Projeyi klonlayın:

```bash
git clone https://github.com/selkisamet/test-case-drag-drop-builder.git
cd test-case
```

Tarayıcıda çalıştırabilirsiniz.

```bash
# index.html'i tarayıcıda açabilirsiniz.
```

## Kullanım

1. Sol taraftaki elementlerden birini seçin
2. Canvas'a sürükleyip bırakın
3. Elementi seçmek için üzerine tıklayın
4. Seçili elementi:
   - Sürükleyerek taşıyabilirsiniz
   - Sağ alt köşeden boyutlandırabilirsiniz
   - Üstteki butonlarla öne/arkaya taşıyabilirsiniz
   - Delete tuşu ile silebilirsiniz
5. "Export JSON" ile tasarımı kaydedin

## Element Tipleri

| Element | Boyut | Açıklama |
|---------|-------|----------|
| Header | 100% x 80px | Sayfa başlığı |
| Slider | 100% x 400px | Görsel slider |
| Card | 300px x 200px | İçerik kartı |
| Text Content | 300px x 120px | Metin alanı |
| Footer | 100% x 60px | Sayfa alt bilgisi |

## JSON Export Örneği

```json
{
  "project": {
    "name": "Test Builder Layout",
    "version": "1.0"
  },
  "canvas": {
    "width": 1200,
    "height": 800,
    "grid": {
      "enabled": true,
      "size": 20,
      "snap": true
    }
  },
  "elements": [
    {
      "id": "elem_header_001",
      "type": "header",
      "position": {
        "x": 0,
        "y": 0,
        "width": "100%",
        "height": 80
      }
    }
  ]
}
```

## Proje Yapısı

```
test-case/
├── index.html          # Ana HTML dosyası
├── css/
│   └── style.css       # Stil dosyası
├── js/
│   └── script.js       # JavaScript kodu
└── README.md          # Bu dosya
```