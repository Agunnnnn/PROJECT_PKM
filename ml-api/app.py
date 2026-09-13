from flask import Flask, request, jsonify
from sklearn.metrics.pairwise import cosine_similarity
import joblib

app = Flask(__name__)

# Load model yang sudah dilatih & disimpan dari notebook
model_data = joblib.load('model_relevansi.pkl')
vectorizer = model_data['vectorizer']
vektor_jurusan = model_data['vektor_jurusan']
nama_jurusan_list = model_data['nama_jurusan_list']


def prediksi_relevansi(nama_jurusan, bidang_kerja):
    if nama_jurusan not in nama_jurusan_list:
        return "Tidak Diketahui", 0.0

    idx = nama_jurusan_list.index(nama_jurusan)
    vektor_kerja = vectorizer.transform([bidang_kerja])
    sim = cosine_similarity(vektor_kerja, vektor_jurusan)[0][idx]

    if sim == 0:
        label = "Tidak Sesuai"
    elif sim < 0.20:
        label = "Cukup Sesuai"
    else:
        label = "Sangat Sesuai"

    return label, round(float(sim), 3)


@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()
    jurusan = data.get("jurusan", "")
    bidang_kerja = data.get("bidangKerja", "")

    if not jurusan or not bidang_kerja:
        return jsonify({"error": "jurusan dan bidangKerja wajib diisi"}), 400

    label, skor = prediksi_relevansi(jurusan, bidang_kerja)
    return jsonify({"relevansi": label, "skor": skor})


if __name__ == "__main__":
    app.run(port=5001, debug=True)