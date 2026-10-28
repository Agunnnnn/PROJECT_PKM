import json
import os
import re

from flask import Flask, request, jsonify
from sklearn.metrics.pairwise import cosine_similarity
import joblib

app = Flask(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

JURUSAN_ALIASES = {
    "RPL": "Rekayasa Perangkat Lunak",
    "AKL": "Akuntansi",
    "AK": "Akuntansi",
    "OTKP": "Otomatisasi Tata Kelola Perkantoran",
    "BDP": "Bisnis Daring dan Pemasaran",
    "PH": "Perhotelan",
}

LABEL_VALID = {"Tidak Sesuai", "Cukup Sesuai", "Sangat Sesuai"}


def load_models():
    try:
        raw_data = joblib.load(os.path.join(BASE_DIR, 'model_relevansi.pkl'))
    except Exception as e:
        app.logger.error(f"Gagal memuat model: {e}")
        return {}

    # Format baru: dictionary bertingkat {'bekerja': {...}, 'kuliah': {...}}
    if isinstance(raw_data, dict) and ('bekerja' in raw_data or 'kuliah' in raw_data):
        models = {}
        for tipe in ['bekerja', 'kuliah']:
            if tipe in raw_data and isinstance(raw_data[tipe], dict):
                sub = raw_data[tipe]
                models[tipe] = {
                    'vectorizer': sub.get('vectorizer'),
                    'vektor_jurusan': sub.get('vektor_jurusan'),
                    'nama_jurusan_list': sub.get('nama_jurusan_list', []),
                    'batas_bawah': float(sub.get('batas_bawah', 0.05)),
                    'batas_atas': float(sub.get('batas_atas', 0.15)),
                }
        return models

    # Format lama: flat dict (hanya tipe 'bekerja')
    if isinstance(raw_data, dict):
        return {
            'bekerja': {
                'vectorizer': raw_data.get('vectorizer'),
                'vektor_jurusan': raw_data.get('vektor_jurusan'),
                'nama_jurusan_list': raw_data.get('nama_jurusan_list', []),
                'batas_bawah': float(raw_data.get('batas_bawah', 0.05)),
                'batas_atas': float(raw_data.get('batas_atas', 0.15)),
            }
        }

    return {}


models = load_models()


# ---------------------------------------------------------------------------
# Tabel pengecualian: keputusan guru/dosen yang mengalahkan hasil TF-IDF.
# Edit file pengecualian.json (tanpa ubah kode), lalu restart Flask.
# ---------------------------------------------------------------------------
def normalisasi_teks(teks):
    t = str(teks).lower().strip()
    t = re.sub(r'^(s1|d3|d4|jurusan|program studi)\s+', '', t)  # "S1 Sastra Inggris" -> "sastra inggris"
    t = re.sub(r'[^a-z0-9\s]', ' ', t)
    return ' '.join(t.split())


def nama_jurusan_baku(nama):
    nama = str(nama).strip()
    return JURUSAN_ALIASES.get(nama.upper(), JURUSAN_ALIASES.get(nama, nama))


def load_pengecualian():
    path = os.path.join(BASE_DIR, 'pengecualian.json')
    tabel = {}
    if not os.path.exists(path):
        return tabel
    try:
        with open(path, encoding='utf-8') as f:
            daftar = json.load(f)
    except Exception as e:
        app.logger.error(f"Gagal membaca pengecualian.json: {e}")
        return tabel

    for no, item in enumerate(daftar, start=1):
        label = item.get('label')
        if label not in LABEL_VALID:
            app.logger.warning(f"pengecualian #{no} dilewati, label tidak valid: {label!r}")
            continue
        kunci = (
            str(item.get('tipe', '')).strip().lower(),
            nama_jurusan_baku(item.get('jurusan', '')),
            normalisasi_teks(item.get('teks', '')),
        )
        tabel[kunci] = label
    app.logger.info(f"{len(tabel)} pengecualian dimuat")
    return tabel


pengecualian = load_pengecualian()


def model_tersedia(tipe):
    return tipe in models and models[tipe] and models[tipe].get('vectorizer')


def prediksi_relevansi(model_dict, nama_jurusan, teks, tipe="bekerja"):
    """Kembalikan (label, skor, sumber). sumber = 'model' atau 'pengecualian'."""
    vectorizer = model_dict['vectorizer']
    vektor_jurusan = model_dict['vektor_jurusan']
    nama_jurusan_list = model_dict['nama_jurusan_list']
    batas_bawah = model_dict['batas_bawah']
    batas_atas = model_dict['batas_atas']

    # Normalisasi nama jurusan jika berupa alias/singkatan
    target_jurusan = nama_jurusan
    if target_jurusan not in nama_jurusan_list:
        alias = JURUSAN_ALIASES.get(target_jurusan)
        if alias and alias in nama_jurusan_list:
            target_jurusan = alias
        else:
            return "Tidak Diketahui", 0.0, "model"

    idx = nama_jurusan_list.index(target_jurusan)
    vektor_teks = vectorizer.transform([teks])
    sim = cosine_similarity(vektor_teks, vektor_jurusan)[0][idx]
    skor = round(float(sim), 3)

    # 1) Pengecualian (keputusan manual) didahulukan
    label_manual = pengecualian.get((tipe, target_jurusan, normalisasi_teks(teks)))
    if label_manual:
        return label_manual, skor, "pengecualian"

    # 2) Selain itu, pakai TF-IDF + ambang
    if skor < batas_bawah:
        label = "Tidak Sesuai"
    elif skor < batas_atas:
        label = "Cukup Sesuai"
    else:
        label = "Sangat Sesuai"

    return label, skor, "model"


ALLOWED_ORIGINS = {
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5000",
    "http://127.0.0.1:5000",
}
env_cors = os.environ.get("CLIENT_URL") or os.environ.get("FRONTEND_URL")
if env_cors:
    for o in env_cors.split(","):
        if o.strip():
            ALLOWED_ORIGINS.add(o.strip())


@app.after_request
def add_cors_headers(response):
    origin = request.headers.get("Origin")
    if origin and origin in ALLOWED_ORIGINS:
        response.headers['Access-Control-Allow-Origin'] = origin
        response.headers['Vary'] = 'Origin'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    return response


@app.route("/health", methods=["GET", "OPTIONS"])
def health():
    if request.method == "OPTIONS":
        return "", 204
    return jsonify({
        "status": "ok",
        "models": list(models.keys()),
        "jurusan": {tipe: m.get('nama_jurusan_list', []) for tipe, m in models.items()},
        "pengecualian": len(pengecualian),
    })


@app.route("/predict", methods=["POST", "OPTIONS"])
def predict():
    if request.method == "OPTIONS":
        return "", 204

    data = request.get_json(silent=True) or {}
    jurusan = str(data.get("jurusan", "")).strip()
    tipe = str(data.get("tipe", "")).strip().lower()
    teks = str(data.get("teks", "")).strip()

    # Kompatibilitas format lama { jurusan, bidangKerja }
    if not tipe and "bidangKerja" in data:
        tipe = "bekerja"
    if not teks and "bidangKerja" in data:
        teks = str(data.get("bidangKerja", "")).strip()

    if not tipe:
        tipe = "bekerja"

    # Jika model untuk tipe ini belum tersedia, balas 200 { relevansi: null, tersedia: false }
    if not model_tersedia(tipe):
        return jsonify({"relevansi": None, "skor": 0.0, "tersedia": False}), 200

    if not jurusan or not teks:
        return jsonify({"error": "jurusan dan teks/bidangKerja wajib diisi"}), 400

    label, skor, sumber = prediksi_relevansi(models[tipe], jurusan, teks, tipe)
    return jsonify({"relevansi": label, "skor": skor, "tersedia": True, "sumber": sumber})


@app.route("/predict-batch", methods=["POST", "OPTIONS"])
def predict_batch():
    """
    Body: {"items": [{"jurusan": "RPL", "tipe": "bekerja", "teks": "web developer"}, ...]}
    Balasan: {"hasil": [{"relevansi": ..., "skor": ..., "tersedia": ...}, ...]} (urutan sama)
    """
    if request.method == "OPTIONS":
        return "", 204

    data = request.get_json(silent=True) or {}
    items = data.get("items", [])
    hasil = []

    for item in items:
        jurusan = str(item.get("jurusan", "")).strip()
        tipe = str(item.get("tipe", "bekerja")).strip().lower() or "bekerja"
        teks = str(item.get("teks", "")).strip()

        if not model_tersedia(tipe) or not jurusan or not teks:
            hasil.append({"relevansi": None, "skor": 0.0, "tersedia": False})
        else:
            label, skor, sumber = prediksi_relevansi(models[tipe], jurusan, teks, tipe)
            hasil.append({"relevansi": label, "skor": skor, "tersedia": True, "sumber": sumber})

    return jsonify({"hasil": hasil})


if __name__ == "__main__":
    is_debug = os.environ.get("FLASK_DEBUG", "0").lower() in ("1", "true")
    app.run(port=5001, debug=is_debug)