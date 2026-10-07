def limpar_texto(texto):
    if not texto:
        return ""

    return " ".join(texto.split())


def tratar_modalidade(texto):
    texto = limpar_texto(texto).lower()

    if "remoto" in texto or "home office" in texto:
        return "Remoto"

    if "híbrido" in texto or "hibrido" in texto:
        return "Híbrido"

    if "presencial" in texto:
        return "Presencial"

    return "Não informado"


def tratar_vaga(vaga):
    
    vaga["titulo"] = limpar_texto(vaga.get("titulo"))
    vaga["empresa"] = limpar_texto(vaga.get("empresa"))
    vaga["descricao"] = limpar_texto(vaga.get("descricao"))
    vaga["atividades"] = limpar_texto(vaga.get("atividades"))
    vaga["requisitos"] = limpar_texto(vaga.get("requisitos"))
    vaga["localizacao"] = limpar_texto(vaga.get("localizacao"))
    vaga["salario"] = limpar_texto(vaga.get("salario"))
    vaga["nivel"] = limpar_texto(vaga.get("nivel"))

    vaga["modalidade"] = tratar_modalidade(
        vaga.get("modalidade", "")
    )

    return vaga