/**
 * Lógica do questionário em etapas: validação do passo 1 (dados pessoais),
 * sliders, envio único ao backend /predict e exibição do resultado com dicas.
 */

// Referências aos elementos principais da página (cards, formulário, resultado).
const startCard = document.getElementById("startCard");
const startBtn = document.getElementById("startBtn");
const form = document.getElementById("burnoutForm");
const stepCards = Array.from(document.querySelectorAll(".step-card"));
const nextButtons = document.querySelectorAll(".next-btn");
const resultCard = document.getElementById("resultCard");
const resDiv = document.getElementById("resultado");
const tipsContainer = document.getElementById("tipsContainer");
const tipsList = document.getElementById("tipsList");
const rangeInputs = Array.from(document.querySelectorAll('input[type="range"]'));

/** Exibe apenas o card da etapa indicada e oculta as demais. */
function showStep(stepIndex) {
    stepCards.forEach((card, index) => {
        card.classList.toggle("hidden", index !== stepIndex);
    });
}

/**
 * Aplica regras de validação customizadas (mensagens em português) nos campos
 * idade, gênero e ano acadêmico do primeiro passo, usando setCustomValidity.
 */
function setPersonalAcademicCustomValidity() {
    const ageInput = document.getElementById("age");
    const genderInput = document.getElementById("gender");
    const yearInput = document.getElementById("academic_year");

    ageInput.setCustomValidity("");
    genderInput.setCustomValidity("");
    yearInput.setCustomValidity("");

    const age = Number(ageInput.value);
    if (ageInput.value.trim() !== "" && Number.isFinite(age) && age < 0) {
        ageInput.setCustomValidity("A idade não pode ser negativa. Corrija o valor.");
    }

    const g = Number(genderInput.value);
    if (genderInput.value.trim() === "" || !Number.isFinite(g) || (g !== 0 && g !== 1)) {
        genderInput.setCustomValidity("Informe apenas 0 (feminino) ou 1 (masculino). Corrija o valor.");
    }

    const y = Number(yearInput.value);
    if (
        yearInput.value.trim() === "" ||
        !Number.isFinite(y) ||
        !Number.isInteger(y) ||
        y < 1 ||
        y > 5
    ) {
        yearInput.setCustomValidity("Informe apenas um ano acadêmico inteiro entre 1 e 5. Corrija o valor.");
    }
}

/** Percorre os inputs e dispara o balão de validação no primeiro campo inválido. */
function reportFirstInvalid(inputs) {
    for (const input of inputs) {
        if (!input.checkValidity()) {
            input.reportValidity();
            return;
        }
    }
}

/**
 * Valida todos os inputs do card atual. No passo 1, aplica antes as regras
 * de idade/gênero/ano. Retorna true se o usuário pode avançar.
 */
function validateCurrentStep(buttonElement) {
    const currentCard = buttonElement.closest(".step-card");
    const inputs = Array.from(currentCard.querySelectorAll("input"));

    if (currentCard.dataset.step === "1") {
        setPersonalAcademicCustomValidity();
    }

    const isValid = inputs.every((input) => input.checkValidity());
    if (!isValid) {
        reportFirstInvalid(inputs);
    }
    return isValid;
}

/**
 * Devolve uma lista de dicas de saúde com base no texto do nível de risco
 * retornado pela API (alto, médio ou baixo/padrão).
 */
function getTipsByRiskLevel(riskLevel) {
    const level = String(riskLevel || "").toLowerCase();

    if (level.includes("alto") || level.includes("high")) {
        return [
            "Busque apoio profissional com psicologo ou psiquiatra o quanto antes.",
            "Reduza temporariamente a carga de estudos e defina prioridades realistas.",
            "Estabeleca pausas curtas durante o dia para respirar e recuperar energia.",
            "Converse com familiares ou amigos de confianca sobre como voce esta se sentindo."
        ];
    }

    if (level.includes("moderado") || level.includes("medio") || level.includes("medium")) {
        return [
            "Organize uma rotina semanal com horarios fixos de estudo, descanso e sono.",
            "Pratique atividade fisica leve com regularidade para reduzir tensao.",
            "Diminua excesso de tempo de tela antes de dormir para melhorar o descanso.",
            "Monitore sinais de piora e procure apoio profissional se os sintomas persistirem."
        ];
    }

    return [
        "Mantenha habitos saudaveis de sono, alimentacao e atividade fisica.",
        "Continue equilibrando estudo e lazer para prevenir sobrecarga.",
        "Reserve momentos de pausa e autocuidado ao longo da semana.",
        "Procure ajuda profissional se perceber aumento de estresse, ansiedade ou exaustao."
    ];
}

/** Preenche a lista de dicas no card de resultado e exibe o bloco de dicas. */
function renderTips(riskLevel) {
    const tips = getTipsByRiskLevel(riskLevel);
    tipsList.innerHTML = "";

    tips.forEach((tip) => {
        const li = document.createElement("li");
        li.textContent = tip;
        tipsList.appendChild(li);
    });

    tipsContainer.classList.remove("hidden");
}

/**
 * Sincroniza cada slider (range) com o span que mostra o valor numérico ao lado
 * do rótulo, atualizando em tempo real ao mover a barra.
 */
function initializeRangeValues() {
    rangeInputs.forEach((input) => {
        const valueEl = document.querySelector(`.range-value[data-for="${input.id}"]`);
        if (!valueEl) {
            return;
        }

        const updateValue = () => {
            valueEl.textContent = Number(input.value).toFixed(1).replace(".0", "");
        };

        updateValue();
        input.addEventListener("input", updateValue);
    });
}

initializeRangeValues();

// Limpa mensagens de validação customizada ao digitar de novo nos campos do passo 1.
document.getElementById("age").addEventListener("input", () => {
    document.getElementById("age").setCustomValidity("");
});
document.getElementById("gender").addEventListener("input", () => {
    document.getElementById("gender").setCustomValidity("");
});
document.getElementById("academic_year").addEventListener("input", () => {
    document.getElementById("academic_year").setCustomValidity("");
});

// Começar teste: esconde o card inicial, mostra o formulário e a primeira etapa.
startBtn.addEventListener("click", () => {
    startCard.classList.add("hidden");
    form.classList.remove("hidden");
    showStep(0);
});

// Próximo: valida o card atual e, se ok, avança para a próxima etapa (data-step).
nextButtons.forEach((button) => {
    button.addEventListener("click", () => {
        if (!validateCurrentStep(button)) {
            return;
        }

        const currentCard = button.closest(".step-card");
        const currentStep = Number(currentCard.dataset.step);
        showStep(currentStep);
    });
});

// Envio final: revalida passo 1 e último passo; monta o JSON e chama a API Flask.
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    setPersonalAcademicCustomValidity();
    const step1Inputs = Array.from(stepCards[0].querySelectorAll("input"));
    if (!step1Inputs.every((input) => input.checkValidity())) {
        reportFirstInvalid(step1Inputs);
        showStep(0);
        return;
    }

    const lastStepCard = stepCards[stepCards.length - 1];
    const lastStepInputs = Array.from(lastStepCard.querySelectorAll("input"));
    const lastStepValid = lastStepInputs.every((input) => input.checkValidity());

    if (!lastStepValid) {
        lastStepInputs.forEach((input) => input.reportValidity());
        return;
    }

    const data = {
        age: parseFloat(document.getElementById("age").value),
        gender: parseFloat(document.getElementById("gender").value),
        academic_year: parseFloat(document.getElementById("academic_year").value),
        study_hours_per_day: parseFloat(document.getElementById("study_hours_per_day").value),
        exam_pressure: parseFloat(document.getElementById("exam_pressure").value),
        academic_performance: parseFloat(document.getElementById("academic_performance").value) * 10,
        stress_level: parseFloat(document.getElementById("stress_level").value),
        anxiety_score: parseFloat(document.getElementById("anxiety_score").value),
        depression_score: parseFloat(document.getElementById("depression_score").value),
        sleep_hours: parseFloat(document.getElementById("sleep_hours").value),
        physical_activity: parseFloat(document.getElementById("physical_activity").value),
        social_support: parseFloat(document.getElementById("social_support").value),
        screen_time: parseFloat(document.getElementById("screen_time").value),
        internet_usage: parseFloat(document.getElementById("internet_usage").value),
        financial_stress: parseFloat(document.getElementById("financial_stress").value),
        family_expectation: parseFloat(document.getElementById("family_expectation").value)
    };

    form.classList.add("hidden");
    resultCard.classList.remove("hidden");
    resDiv.innerText = "Calculando...";
    tipsContainer.classList.add("hidden");

    try {
        const response = await fetch("http://127.0.0.1:5000/predict", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        if (result.risk_level) {
            resDiv.innerText = "Resultado da Predição: " + result.risk_level;
            renderTips(result.risk_level);
        } else {
            resDiv.innerText = "Erro: " + (result.error || "Não foi possível calcular.");
        }
    } catch (error) {
        resDiv.innerText = "Erro de conexão com o servidor.";
        console.error(error);
    }
});
