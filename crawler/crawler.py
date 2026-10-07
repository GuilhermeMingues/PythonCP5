import requests
from bs4 import BeautifulSoup
from datetime import datetime
from database.mongodb import salvar_vaga

URL = "https://programathor.com.br/jobs?contract_type=Est%C3%A1gio"
BASE_URL = "https://programathor.com.br"


# Função para coletar os links das vagas
def coletar_links_vagas():
    response = requests.get(URL)

    soup = BeautifulSoup(response.text, "html.parser")

    links_vagas = []

    links = soup.find_all("a", href=True)

    for link in links:
        href = link.get("href")

        if href.startswith("/jobs/") and "/page/" not in href:
            link_completo = BASE_URL + href

            if link_completo not in links_vagas:
                links_vagas.append(link_completo)

    return links_vagas


# Função para acessar e coletar os dados de uma vaga
def acessar_vaga(url):
    response = requests.get(url)

    soup = BeautifulSoup(response.text, "html.parser")

    links_pagina = soup.find_all("a")

    for link in links_pagina:
        texto = link.get_text(" ", strip=True)

        if texto in [
            "Python", "JavaScript", "HTML", "CSS", "PHP",
            "MySQL", "Java", "ReactJS", "Node.js",
            "TypeScript", "SQL", "Git", "Laravel",
            "Flutter", "Dart", "PostgreSQL"
        ]:
            print(
                "TECNOLOGIA:",
                texto,
                "| CLASSE:",
                link.get("class")
            )

    # Título e empresa
    titulo = soup.find("h1").get_text(" ", strip=True)
    empresa = soup.find("h2").get_text(" ", strip=True)

    # Informações da vaga
    modalidade = ""
    localizacao = ""
    salario = ""
    nivel = ""

    paragrafos = soup.find_all("p")

    for paragrafo in paragrafos:
        texto = paragrafo.get_text(" ", strip=True)

        if "Home Office" in texto:
            modalidade = "Remoto"

        elif "Híbrido" in texto:
            modalidade = "Híbrido"

        elif "Presencial" in texto:
            modalidade = "Presencial"

        if texto.startswith("Localização:"):
            localizacao = texto.replace("Localização:", "").strip()

        elif texto.startswith("Salário:"):
            salario = texto.replace("Salário:", "").strip()

        elif texto in ["Júnior", "Pleno", "Sênior"]:
            nivel = texto

    # Descrição, atividades e requisitos
    descricao = ""
    atividades = ""
    requisitos = ""

    secoes = soup.find_all("h3")

    for secao in secoes:
        nome_secao = secao.get_text(" ", strip=True)

        proximo_elemento = secao.find_next_sibling()

        if not proximo_elemento:
            continue

        texto = proximo_elemento.get_text(" ", strip=True)

        if nome_secao == "Descrição da empresa":
            descricao = texto

        elif nome_secao == "Atividades e Responsabilidades":
            atividades = texto

        elif nome_secao == "Requisitos":
            requisitos = texto

    # Documento que futuramente será salvo no MongoDB
    vaga = {
        "titulo": titulo,
        "empresa": empresa,
        "modalidade": modalidade,
        "localizacao": localizacao,
        "salario": salario,
        "nivel": nivel,
        "descricao": descricao,
        "atividades": atividades,
        "requisitos": requisitos,
        "url": url,
        "fonte": "Programathor",
        "coletado_em": datetime.now().isoformat()
    }

    return vaga


if __name__ == "__main__":
    links = coletar_links_vagas()

    print("Quantidade de vagas encontradas:", len(links))

    for link in links:
        try:
            vaga = acessar_vaga(link)

            salvar_vaga(vaga)

        except Exception as erro:
            print("Erro ao coletar vaga:", link)
            print("Erro:", erro)