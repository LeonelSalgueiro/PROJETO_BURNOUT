from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import numpy as np


app = Flask(__name__)
CORS(app) # libera o acesso para o Front-end

# 1. Carga do modelo (Item 4 do roteiro)
with open('modelo_burnout.pkl', 'rb') as f:
    model = pickle.load(f)

@app.route('/predict', methods=['POST'])
def predict():
    # Recebe os dados do Front-end
    data = request.get_json()
    
    # Organiza os dados na ordem que o modelo espera
    # Ex: [age, gender, academic_year, ..., family_expectation]
    input_data = np.array([list(data.values())])
    
    # Faz a predição
    prediction = model.predict(input_data)

    mapa_risco = {0: "Baixo Risco", 1: "Risco Médio", 2: "Alto Risco"}
    resultado_final = mapa_risco.get(int(prediction[0]), "Indefinido")
    
    return jsonify({'risk_level': resultado_final})


if __name__ == '__main__':
    app.run(debug=True)