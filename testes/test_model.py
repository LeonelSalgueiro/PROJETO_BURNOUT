import pickle
import pandas as pd
from sklearn.metrics import accuracy_score

def test_model_performance():
    # Caminho para subir uma pasta e entrar na 'api'
    # Isso garante que o PyTest ache o arquivo .pkl
    path_modelo = os.path.join(os.path.dirname(__file__), '../api/modelo_burnout.pkl')
    
    with open(path_modelo, 'rb') as f:
        model = pickle.load(f)
    
    # 2. Carrega o dataset para teste 
    # (Dica: Use a URL raw do seu GitHub para o professor conseguir rodar o teste também)
    url = "https://raw.githubusercontent.com/LeonelSalgueiro/PROJETO_BURNOUT/refs/heads/main/machine_learning/student_mental_health_burnout_1M.csv"
    dataset = pd.read_csv(url)
    
    # 3. Prepara uma amostra para o teste
    # Pega as entradas (X) e a saída real (y)
    X = dataset.drop(['risk_level', 'dropout_risk', 'burnout_score', 'mental_health_index'], axis=1)
    y = dataset['risk_level']
    
    # 4. Faz as predições
    predictions = model.predict(X)
    
    # 5. Calcula a acurácia
    accuracy = accuracy_score(y, predictions)
    
    # 6. O Teste: Define o limite (threshold) de 80%
    # Se a acurácia for menor que 0.80, o teste falha.
    assert accuracy >= 0.80, f"Acurácia insuficiente: {accuracy}"

print("Teste configurado com sucesso!")