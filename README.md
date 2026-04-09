# PROJETO_BURNOUT - MVP PUC-RIO

Esta aplicação é um projeto de conclusão de trimestre da PUC-Rio. A aplicação é uma proposta de **avaliação de risco de burnout** em estudantes universitários. O modelo recolhe dados de um dataset e compara com os preenchidos pelo usuário em um questionário em etapas no navegador. O backend retorna uma classificação de risco (**Baixo**, **Médio** ou **Alto**) com base no modelo de machine learning.

## Estrutura do repositório

| Pasta / arquivo | Descrição |
|-----------------|-----------|
| `api/` | API Flask (`app.py`) e treino/documentação do modelo (`burnout_dataset.ipynb`). |
| `frontend/` | Interface estática (`index.html`, `style/`, `script/`, `assets/`). |
| `machine_learning/` | Dataset CSV usado no projeto (ex.: `student_mental_health_burnout_1M.csv`). |
| `testes/` | Testes relacionados ao modelo (ex.: `test_model.py`). |

## Requisitos

- **Python 3.10+** (recomendado) para a API.
- Navegador moderno para o frontend.
- Arquivo **`modelo_burnout.pkl`** dentro da pasta `api/` (modelo serializado usado pelo `app.py`). Se o arquivo não existir, a API não inicia até que o modelo seja gerado e salvo com esse nome.

## Dependências

Todas as dependências estão listadas no arquivo `requirements.txt`. Inclui:

- **Flask** — framework web para a API
- **flask-cors** — habilitação de CORS para comunicação frontend-backend
- **numpy** — operações numéricas
- **pandas** — manipulação de dados
- **scikit-learn** — modelo de machine learning
- **pytest** — testes automatizados

## Como executar

### 0. Setup Inicial

1. **Clone ou extraia o projeto**

2. **Navegue até a raiz do projeto:**
   ```bash
   cd PROJETO_BURNOUT
   ```

3. **Crie um ambiente virtual (recomendado):**

   *Windows:*
   ```bash
   python -m venv venv
   venv\Scripts\activate
   ```

   *macOS/Linux:*
   ```bash
   python -m venv venv
   source venv/bin/activate
   ```

4. **Instale as dependências:**
   ```bash
   pip install -r requirements.txt
   ```

### 1. Backend (Flask)

Na raiz do projeto, entre na pasta `api` e execute (o caminho do modelo é relativo a essa pasta):

```bash
cd api
python app.py
```

Por padrão o servidor sobe em **http://127.0.0.1:5000** com a rota:

- **`POST /predict`** — recebe JSON com os campos do formulário e devolve `{"risk_level": "Baixo Risco" | "Risco Médio" | "Alto Risco"}`.

O frontend está configurado para chamar `http://127.0.0.1:5000/predict` (CORS habilitado no `app.py`).

### 2. Frontend

**Abra em outra aba do terminal** (mantenha o backend rodando).

Sirva a pasta frontend com um servidor HTTP simples (evita restrições de alguns navegadores com `fetch` em arquivos locais):

```bash
cd frontend
python -m http.server 8080
```

Acesse **http://127.0.0.1:8080** no navegador.

## Contrato da API (`POST /predict`)

O corpo deve ser **JSON** com **16 valores numéricos**. A ordem dos valores no array enviado ao modelo segue a ordem das chaves no objeto Python (`list(data.values())` em `app.py`), portanto **mantenha a mesma ordem de campos** que o frontend envia.

Campos esperados (nomes):

- `age`, `gender`, `academic_year`
- `study_hours_per_day`, `exam_pressure`, `academic_performance`
- `stress_level`, `anxiety_score`, `depression_score`
- `sleep_hours`, `physical_activity`, `social_support`
- `screen_time`, `internet_usage`, `financial_stress`, `family_expectation`

**Observação:** no frontend, o desempenho acadêmico é coletado em escala **0–10** e convertido para **0–100** antes do envio (`academic_performance * 10`), alinhado ao treino do modelo.

## Testes

Há um teste de desempenho do modelo em `testes/test_model.py`. Ajuste caminhos e dependências conforme seu ambiente (por exemplo, import de `os` se necessário). Consulte o próprio arquivo para o fluxo esperado.

## Observações

- Este projeto é um **MVP educativo**; o resultado **não substitui** avaliação clínica ou psicológica profissional.
- O notebook `api/burnout_dataset.ipynb` documenta o pipeline de dados e treino.

## Licença

Defina a licença no repositório conforme a política da sua instituição ou equipe.
