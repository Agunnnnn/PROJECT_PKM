from flask import Flask, request, jsonify
from sklearn.metrics.pairwise import cosine_similarity
import joblib

app = Flask(__name__)

JURUSAN_ALIASES = {
    "RPL": "Rekayasa Perangkat Lunak",
    "AKL": "Akuntansi",
    "AK": "Akuntansi",
    "OTKP": "Otomatisasi Tata Kelola Perkantoran",
    "BDP": "Bisnis Daring dan Pemasaran",
}


def load_models():
    try:
        raw_data = joblib.load('model_relevansi.pkl')
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


def prediksi_relevansi(model_dict, nama_jurusan, teks):
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
            return "Tidak Diketahui", 0.0

    idx = nama_jurusan_list.index(target_jurusan)
    vektor_teks = vectorizer.transform([teks])
    sim = cosine_similarity(vektor_teks, vektor_jurusan)[0][idx]
    skor = round(float(sim), 3)

    if skor < batas_bawah:
        label = "Tidak Sesuai"
    elif skor < batas_atas:
        label = "Cukup Sesuai"
    else:
        label = "Sangat Sesuai"

    return label, skor


@app.route("/predict", methods=["POST"])
def predict():
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
    if tipe not in models or not models[tipe] or not models[tipe].get('vectorizer'):
        return jsonify({"relevansi": None, "skor": 0.0, "tersedia": False}), 200

    if not jurusan or not teks:
        return jsonify({"error": "jurusan dan teks/bidangKerja wajib diisi"}), 400

    label, skor = prediksi_relevansi(models[tipe], jurusan, teks)
    return jsonify({"relevansi": label, "skor": skor, "tersedia": True})


if __name__ == "__main__":
    app.run(port=5001, debug=True)