const API_URL = "http://127.0.0.1:8000";

const TECHNOLOGIES = [
    "Python",
    "Java",
    "JavaScript",
    "TypeScript",
    "HTML",
    "CSS",
    "PHP",
    "ReactJS",
    "Node.js",
    "MySQL",
    "PostgreSQL",
    "SQL",
    "Git",
    "Laravel",
    "Flutter",
    "Dart"
];

let modalidadeChart = null;
let localizacaoChart = null;
let todasAsVagas = [];

const elements = {
    totalVagas: document.getElementById("totalVagas"),
    totalEmpresas: document.getElementById("totalEmpresas"),
    totalRemoto: document.getElementById("totalRemoto"),
    totalHibrido: document.getElementById("totalHibrido"),
    totalPresencial: document.getElementById("totalPresencial"),

    jobsTableBody: document.getElementById("jobsTableBody"),
    loadingState: document.getElementById("loadingState"),
    emptyState: document.getElementById("emptyState"),
    resultsCount: document.getElementById("resultsCount"),

    searchInput: document.getElementById("searchInput"),
    searchButton: document.getElementById("searchButton"),

    filterToggle: document.getElementById("filterToggle"),
    filterCount: document.getElementById("filterCount"),
    advancedFilters: document.getElementById("advancedFilters"),
    technologyFilters: document.getElementById("technologyFilters"),
    clearFiltersButton: document.getElementById("clearFiltersButton"),
    applyFiltersButton: document.getElementById("applyFiltersButton"),
    activeFilters: document.getElementById("activeFilters"),

    refreshButton: document.getElementById("refreshButton"),

    apiStatusDot: document.getElementById("apiStatusDot"),
    apiStatusText: document.getElementById("apiStatusText"),

    errorAlert: document.getElementById("errorAlert"),
    errorMessage: document.getElementById("errorMessage"),

    jobModal: document.getElementById("jobModal"),
    modalClose: document.getElementById("modalClose"),
    modalContent: document.getElementById("modalContent"),
    modalLoading: document.getElementById("modalLoading")
};

document.addEventListener("DOMContentLoaded", inicializarDashboard);

async function inicializarDashboard() {
    renderizarFiltrosTecnologia();
    configurarEventos();
    await atualizarDashboard();
}

function configurarEventos() {
    elements.searchButton.addEventListener("click", buscarVagas);
    elements.applyFiltersButton.addEventListener("click", buscarVagas);
    elements.clearFiltersButton.addEventListener("click", limparFiltros);
    elements.refreshButton.addEventListener("click", atualizarDashboard);

    elements.searchInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            buscarVagas();
        }
    });

    elements.searchInput.addEventListener("input", () => {
        if (
            !elements.searchInput.value.trim() &&
            contarFiltrosSelecionados() === 0
        ) {
            carregarVagas();
        }
    });

    elements.filterToggle.addEventListener("click", () => {
        const isHidden =
            elements.advancedFilters.classList.toggle("hidden");

        elements.filterToggle.classList.toggle("open", !isHidden);

        elements.filterToggle.setAttribute(
            "aria-expanded",
            String(!isHidden)
        );
    });

    document.addEventListener("change", (event) => {
        if (
            event.target.matches(
                '.advanced-filters input[type="checkbox"]'
            )
        ) {
            atualizarContadorFiltros();
        }
    });

    elements.modalClose.addEventListener("click", fecharModal);

    elements.jobModal.addEventListener("click", (event) => {
        if (event.target === elements.jobModal) {
            fecharModal();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (
            event.key === "Escape" &&
            !elements.jobModal.classList.contains("hidden")
        ) {
            fecharModal();
        }
    });
}

async function atualizarDashboard() {
    elements.refreshButton.classList.add("loading");
    ocultarErro();

    try {
        await Promise.all([
            carregarEstatisticas(),
            carregarVagas()
        ]);

        atualizarStatusApi(true);

    } catch (error) {
        atualizarStatusApi(false);
        mostrarErro(error);

    } finally {
        elements.refreshButton.classList.remove("loading");
    }
}

async function fetchJson(endpoint) {
    const response = await fetch(`${API_URL}${endpoint}`);

    if (!response.ok) {
        throw new Error(
            `A API respondeu com status ${response.status}.`
        );
    }

    return response.json();
}

async function carregarEstatisticas() {
    try {
        const dados = await fetchJson("/estatisticas");
        const modalidades = dados.modalidades || {};

        elements.totalVagas.textContent =
            formatarNumero(dados.total_vagas);

        elements.totalEmpresas.textContent =
            formatarNumero(dados.total_empresas);

        elements.totalRemoto.textContent =
            formatarNumero(modalidades.remoto);

        elements.totalHibrido.textContent =
            formatarNumero(modalidades.hibrido);

        elements.totalPresencial.textContent =
            formatarNumero(modalidades.presencial);

        renderizarGraficoModalidades(modalidades);

        atualizarStatusApi(true);

    } catch (error) {
        atualizarStatusApi(false);
        mostrarErro(error);
        throw error;
    }
}

async function carregarVagas() {
    mostrarLoading(true);
    ocultarErro();

    try {
        const dados = await fetchJson("/vagas");

        todasAsVagas =
            Array.isArray(dados.vagas)
                ? dados.vagas
                : [];

        renderizarVagas(todasAsVagas);
        renderizarGraficoLocalizacoes(todasAsVagas);
        renderizarFiltrosAtivos();

        atualizarStatusApi(true);

        return todasAsVagas;

    } catch (error) {
        renderizarVagas([]);
        atualizarStatusApi(false);
        mostrarErro(error);

        throw error;

    } finally {
        mostrarLoading(false);
    }
}

async function buscarVagas() {
    const termo = elements.searchInput.value.trim();
    const filtros = obterFiltrosSelecionados();

    if (
        !termo &&
        filtros.tecnologias.length === 0 &&
        filtros.modalidades.length === 0 &&
        filtros.niveis.length === 0 &&
        filtros.contratos.length === 0
    ) {
        await carregarVagas();
        return;
    }

    mostrarLoading(true);
    ocultarErro();

    try {
        const modalidades =
            filtros.modalidades.length
                ? filtros.modalidades
                : [null];

        const niveis =
            filtros.niveis.length
                ? filtros.niveis
                : [null];

        const contratos =
            filtros.contratos.length
                ? filtros.contratos
                : [null];

        const consultas = [];

        for (const modalidade of modalidades) {
            for (const nivel of niveis) {
                for (const contrato of contratos) {
                    const params = new URLSearchParams();

                    if (termo) {
                        params.set("termo", termo);
                    }

                    if (filtros.tecnologias.length) {
                        params.set(
                            "tecnologias",
                            filtros.tecnologias.join(",")
                        );
                    }

                    if (modalidade) {
                        params.set(
                            "modalidade",
                            modalidade
                        );
                    }

                    if (nivel) {
                        params.set(
                            "nivel",
                            nivel
                        );
                    }

                    if (contrato) {
                        params.set(
                            "contrato",
                            contrato
                        );
                    }

                    consultas.push(
                        fetchJson(
                            `/vagas/buscar?${params.toString()}`
                        )
                    );
                }
            }
        }

        const respostas =
            await Promise.all(consultas);

        const vagasUnicas =
            new Map();

        respostas.forEach((resposta) => {
            const vagas = resposta.vagas || [];

            vagas.forEach((vaga) => {
                vagasUnicas.set(
                    vaga._id,
                    vaga
                );
            });
        });

        const resultado =
            Array.from(
                vagasUnicas.values()
            );

        renderizarVagas(resultado);
        renderizarFiltrosAtivos();

        atualizarStatusApi(true);

    } catch (error) {
        renderizarVagas([]);
        atualizarStatusApi(false);
        mostrarErro(error);

    } finally {
        mostrarLoading(false);
    }
}

function obterFiltrosSelecionados() {
    const checkedValues = (name) =>
        Array.from(
            document.querySelectorAll(
                `input[name="${name}"]:checked`
            )
        ).map((input) => input.value);

    return {
        tecnologias:
            checkedValues("tecnologia"),

        modalidades:
            checkedValues("modalidade"),

        niveis:
            checkedValues("nivel"),

        contratos:
            checkedValues("contrato")
    };
}

function contarFiltrosSelecionados() {
    return document.querySelectorAll(
        '.advanced-filters input[type="checkbox"]:checked'
    ).length;
}

function atualizarContadorFiltros() {
    const total =
        contarFiltrosSelecionados();

    elements.filterCount.textContent =
        total;

    elements.filterCount.classList.toggle(
        "hidden",
        total === 0
    );
}

function renderizarFiltrosTecnologia() {
    elements.technologyFilters.innerHTML =
        TECHNOLOGIES.map(
            (tecnologia) => `
                <label class="check-chip">

                    <input
                        type="checkbox"
                        name="tecnologia"
                        value="${escapeHtml(tecnologia)}"
                    >

                    <span>
                        ${escapeHtml(tecnologia)}
                    </span>

                </label>
            `
        ).join("");
}

function renderizarFiltrosAtivos() {
    const filtros =
        obterFiltrosSelecionados();

    const termo =
        elements.searchInput.value.trim();

    const labels = [];

    if (termo) {
        labels.push(
            `Busca: ${termo}`
        );
    }

    labels.push(
        ...filtros.tecnologias
    );

    labels.push(
        ...filtros.modalidades.map(
            formatarValorFiltro
        )
    );

    labels.push(
        ...filtros.niveis.map(
            formatarValorFiltro
        )
    );

    labels.push(
        ...filtros.contratos.map(
            formatarValorFiltro
        )
    );

    elements.activeFilters.innerHTML =
        labels.map(
            (label) => `
                <span class="active-filter">
                    ${escapeHtml(label)}
                </span>
            `
        ).join("");

    elements.activeFilters.classList.toggle(
        "hidden",
        labels.length === 0
    );
}

async function limparFiltros() {
    document.querySelectorAll(
        '.advanced-filters input[type="checkbox"]'
    ).forEach((input) => {
        input.checked = false;
    });

    elements.searchInput.value = "";

    atualizarContadorFiltros();
    renderizarFiltrosAtivos();

    await carregarVagas();
}

function renderizarVagas(vagas) {
    const lista =
        Array.isArray(vagas)
            ? vagas
            : [];

    elements.resultsCount.textContent =
        lista.length;

    elements.jobsTableBody.innerHTML =
        "";

    elements.emptyState.classList.toggle(
        "hidden",
        lista.length > 0
    );

    if (!lista.length) {
        return;
    }

    elements.jobsTableBody.innerHTML =
        lista.map(
            (vaga) => `
                <tr>

                    <td>

                        <span class="job-title">
                            ${escapeHtml(
                valorOuPadrao(
                    vaga.titulo
                )
            )}
                        </span>

                        <span class="job-company">
                            ${escapeHtml(
                valorOuPadrao(
                    vaga.empresa
                )
            )}
                        </span>

                    </td>


                    <td>
                        ${escapeHtml(
                valorOuPadrao(
                    vaga.localizacao
                )
            )}
                    </td>


                    <td>

                        <span
                            class="tag ${classeModalidade(
                vaga.modalidade
            )}"
                        >
                            ${escapeHtml(
                valorOuPadrao(
                    vaga.modalidade
                )
            )}
                        </span>

                    </td>


                    <td>
                        ${escapeHtml(
                valorOuPadrao(
                    vaga.salario
                )
            )}
                    </td>


                    <td>
                        ${escapeHtml(
                valorOuPadrao(
                    vaga.nivel
                )
            )}
                    </td>


                    <td class="action-column">

                        <button
                            class="details-button"
                            type="button"
                            data-id="${escapeHtml(
                vaga._id
            )}"
                        >
                            Ver detalhes
                        </button>

                    </td>

                </tr>
            `
        ).join("");

    elements.jobsTableBody
        .querySelectorAll(
            ".details-button"
        )
        .forEach((button) => {
            button.addEventListener(
                "click",
                () =>
                    abrirDetalhes(
                        button.dataset.id
                    )
            );
        });
}

async function abrirDetalhes(id) {
    elements.jobModal.classList.remove(
        "hidden"
    );

    document.body.style.overflow =
        "hidden";

    elements.modalContent.innerHTML =
        "";

    elements.modalLoading.classList.remove(
        "hidden"
    );

    try {
        const vaga =
            await fetchJson(
                `/vagas/${encodeURIComponent(id)}`
            );

        elements.modalContent.innerHTML =
            criarConteudoModal(vaga);

        atualizarStatusApi(true);

    } catch (error) {
        elements.modalContent.innerHTML = `
            <div class="detail-section">

                <h3>
                    Erro
                </h3>

                <p>
                    Não foi possível carregar
                    os detalhes desta vaga pela API.
                </p>

            </div>
        `;

        atualizarStatusApi(false);

    } finally {
        elements.modalLoading.classList.add(
            "hidden"
        );
    }
}

function fecharModal() {
    elements.jobModal.classList.add(
        "hidden"
    );

    document.body.style.overflow =
        "";
}

function criarConteudoModal(vaga) {
    const tecnologias =
        Array.isArray(vaga.tecnologias)
            ? vaga.tecnologias
            : [];

    const linkOriginal =
        urlSegura(vaga.url);

    return `
        <span class="modal-kicker">
            Detalhes da oportunidade
        </span>

        <h2
            class="modal-title"
            id="modalTitle"
        >
            ${escapeHtml(
        valorOuPadrao(
            vaga.titulo
        )
    )}
        </h2>

        <p class="modal-company">
            ${escapeHtml(
        valorOuPadrao(
            vaga.empresa
        )
    )}
        </p>


        <div class="modal-meta">

            <span class="meta-pill">
                ${escapeHtml(
        valorOuPadrao(
            vaga.modalidade
        )
    )}
            </span>

            <span class="meta-pill">
                ${escapeHtml(
        valorOuPadrao(
            vaga.localizacao
        )
    )}
            </span>

            <span class="meta-pill">
                ${escapeHtml(
        valorOuPadrao(
            vaga.salario
        )
    )}
            </span>

            <span class="meta-pill">
                ${escapeHtml(
        valorOuPadrao(
            vaga.nivel
        )
    )}
            </span>

            ${vaga.contrato
            ? `
                    <span class="meta-pill">
                        ${escapeHtml(
                vaga.contrato
            )}
                    </span>
                    `
            : ""
        }

        </div>


        ${tecnologias.length
            ? `
                <section class="detail-section">

                    <h3>
                        Tecnologias
                    </h3>

                    <div class="tech-list">

                        ${tecnologias.map(
                (tech) => `
                                <span class="tech-pill">
                                    ${escapeHtml(
                    tech
                )}
                                </span>
                            `
            ).join("")}

                    </div>

                </section>
                `
            : ""
        }


        ${secaoDetalhe(
            "Descrição",
            vaga.descricao
        )}

        ${secaoDetalhe(
            "Atividades",
            vaga.atividades
        )}

        ${secaoDetalhe(
            "Requisitos",
            vaga.requisitos
        )}

        ${secaoDetalhe(
            "Fonte",
            vaga.fonte
        )}


        <div class="modal-footer">

            <span class="collection-date">

                Coletado em:
                ${escapeHtml(
            formatarData(
                vaga.coletado_em
            )
        )}

            </span>


            ${linkOriginal
            ? `
                    <a
                        class="original-link"
                        href="${escapeHtml(
                linkOriginal
            )}"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Ver vaga original
                    </a>
                    `
            : ""
        }

        </div>
    `;
}

function secaoDetalhe(
    titulo,
    texto
) {
    return `
        <section class="detail-section">

            <h3>
                ${titulo}
            </h3>

            <p>
                ${escapeHtml(
        valorOuPadrao(texto)
    )}
            </p>

        </section>
    `;
}

function renderizarGraficoModalidades(
    modalidades = {}
) {
    const canvas =
        document.getElementById(
            "modalidadeChart"
        );

    if (modalidadeChart) {
        modalidadeChart.destroy();
    }

    modalidadeChart =
        new Chart(
            canvas,
            {
                type: "doughnut",

                data: {
                    labels: [
                        "Remoto",
                        "Híbrido",
                        "Presencial"
                    ],

                    datasets: [
                        {
                            data: [
                                modalidades.remoto || 0,
                                modalidades.hibrido || 0,
                                modalidades.presencial || 0
                            ],

                            backgroundColor: [
                                "#6758e8",
                                "#f0a541",
                                "#3cb176"
                            ],

                            borderWidth: 0,
                            hoverOffset: 5
                        }
                    ]
                },

                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: "72%",

                    plugins: {
                        legend: {
                            position: "bottom",

                            labels: {
                                usePointStyle: true,
                                pointStyle: "circle",
                                padding: 18,
                                color: "#707385",

                                font: {
                                    size: 11,
                                    weight: "600"
                                }
                            }
                        },

                        tooltip: {
                            displayColors: false
                        }
                    }
                }
            }
        );
}

function limparLocalizacao(localizacao) {
    if (
        !localizacao ||
        !localizacao.trim()
    ) {
        return "Não informado";
    }

    let local =
        localizacao.trim();

    const match = local.match(
        /^(.+?)\s*\((Remoto|Híbrido|Hibrido|Presencial)\)/i
    );

    if (match) {
        let cidade =
            match[1].trim();

        let modalidade =
            match[2].toLowerCase();

        if (
            modalidade === "hibrido" ||
            modalidade === "híbrido"
        ) {
            modalidade = "Híbrido";
        }

        else if (
            modalidade === "presencial"
        ) {
            modalidade = "Presencial";
        }

        else if (
            modalidade === "remoto"
        ) {
            modalidade = "Remoto";
        }

        return `${cidade} (${modalidade})`;
    }

    return local;
}

function renderizarGraficoLocalizacoes(
    vagas
) {
    const contagem = {};

    vagas.forEach((vaga) => {
        const local =
            limparLocalizacao(
                vaga.localizacao
            );

        contagem[local] =
            (contagem[local] || 0) + 1;
    });

    const ranking =
        Object.entries(contagem)
            .sort(
                (a, b) =>
                    b[1] - a[1]
            )
            .slice(0, 7);

    const labels =
        ranking.map(
            ([local]) =>
                local
        );

    const valores =
        ranking.map(
            ([, total]) =>
                total
        );

    const canvas =
        document.getElementById(
            "localizacaoChart"
        );

    if (localizacaoChart) {
        localizacaoChart.destroy();
    }

    localizacaoChart =
        new Chart(
            canvas,
            {
                type: "bar",

                data: {
                    labels,

                    datasets: [
                        {
                            label: "Vagas",

                            data: valores,

                            backgroundColor:
                                "#6758e8",

                            hoverBackgroundColor:
                                "#5647d4",

                            borderRadius: 8,

                            borderSkipped: false,

                            maxBarThickness: 30
                        }
                    ]
                },

                options: {
                    indexAxis: "y",

                    responsive: true,

                    maintainAspectRatio: false,

                    animation: {
                        duration: 600
                    },

                    layout: {
                        padding: {
                            top: 5,
                            right: 15,
                            bottom: 5,
                            left: 5
                        }
                    },

                    scales: {
                        x: {
                            beginAtZero: true,

                            ticks: {
                                precision: 0,
                                stepSize: 1,
                                color: "#8d90a0",

                                font: {
                                    size: 10
                                }
                            },

                            grid: {
                                color: "#eef0f5"
                            },

                            border: {
                                display: false
                            },

                            title: {
                                display: true,

                                text:
                                    "Quantidade de vagas",

                                color:
                                    "#989bad",

                                font: {
                                    size: 10,
                                    weight: "600"
                                },

                                padding: {
                                    top: 8
                                }
                            }
                        },


                        y: {
                            grid: {
                                display: false
                            },

                            border: {
                                display: false
                            },

                            ticks: {
                                color: "#5f6273",

                                font: {
                                    size: 10,
                                    weight: "600"
                                },

                                padding: 8
                            }
                        }
                    },

                    plugins: {
                        legend: {
                            display: false
                        },

                        tooltip: {
                            displayColors: false,

                            padding: 12,

                            callbacks: {
                                label:
                                    function (context) {

                                        const quantidade =
                                            context.raw;

                                        return quantidade === 1
                                            ? "1 vaga"
                                            : `${quantidade} vagas`;
                                    }
                            }
                        }
                    }
                }
            }
        );
}

function mostrarLoading(
    ativo
) {
    elements.loadingState.classList.toggle(
        "hidden",
        !ativo
    );

    if (ativo) {
        elements.emptyState.classList.add(
            "hidden"
        );

        elements.jobsTableBody.innerHTML =
            "";
    }
}

function mostrarErro(
    error
) {
    const mensagem =
        error && error.message
            ? error.message
            : "Erro inesperado ao consultar a API.";

    elements.errorMessage.textContent =
        `${mensagem} Verifique se o FastAPI está ativo em ${API_URL}.`;

    elements.errorAlert.classList.remove(
        "hidden"
    );
}

function ocultarErro() {
    elements.errorAlert.classList.add(
        "hidden"
    );
}

function atualizarStatusApi(
    online
) {
    elements.apiStatusDot.classList.toggle(
        "online",
        online
    );

    elements.apiStatusDot.classList.toggle(
        "offline",
        !online
    );

    elements.apiStatusText.textContent =
        online
            ? "API conectada"
            : "API indisponível";
}

function classeModalidade(
    modalidade
) {
    const valor =
        (modalidade || "")
            .toLowerCase();

    if (
        valor.includes("remoto")
    ) {
        return "remote";
    }

    if (
        valor.includes("híbrido") ||
        valor.includes("hibrido")
    ) {
        return "hybrid";
    }

    if (
        valor.includes("presencial")
    ) {
        return "onsite";
    }

    return "default";
}

function formatarNumero(
    valor
) {
    return Number(
        valor || 0
    ).toLocaleString(
        "pt-BR"
    );
}

function valorOuPadrao(
    valor
) {
    return (
        valor === null ||
        valor === undefined ||
        String(valor).trim() === ""
    )
        ? "Não informado"
        : String(valor);
}

function formatarValorFiltro(
    valor
) {
    const mapa = {
        remoto: "Remoto",
        hibrido: "Híbrido",
        presencial: "Presencial",
        junior: "Júnior",
        pleno: "Pleno",
        senior: "Sênior",
        estagio: "Estágio"
    };

    return mapa[valor] || valor;
}

function formatarData(
    data
) {
    if (!data) {
        return "Não informado";
    }

    const date =
        new Date(data);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return data;
    }

    return new Intl.DateTimeFormat(
        "pt-BR",
        {
            dateStyle: "short",
            timeStyle: "short"
        }
    ).format(date);
}

function urlSegura(
    url
) {
    if (!url) {
        return "";
    }

    try {
        const parsed =
            new URL(url);

        return [
            "http:",
            "https:"
        ].includes(
            parsed.protocol
        )
            ? parsed.href
            : "";

    } catch {
        return "";
    }
}

function escapeHtml(
    value
) {
    return String(
        value ?? ""
    )
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );
}