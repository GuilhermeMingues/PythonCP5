from fastapi import APIRouter, HTTPException
from typing import Optional

from database.mongodb import (
    listar_vagas,
    buscar_vaga_por_id,
    buscar_vagas,
    obter_estatisticas
)

router = APIRouter()


@router.get("/vagas")
def get_vagas():
    vagas = listar_vagas()

    return {
        "total": len(vagas),
        "vagas": vagas
    }


@router.get("/vagas/buscar")
def pesquisar_vagas(
    termo: Optional[str] = None,
    tecnologias: Optional[str] = None,
    modalidade: Optional[str] = None,
    nivel: Optional[str] = None,
    contrato: Optional[str] = None
):
    lista_tecnologias = None

    if tecnologias:
        lista_tecnologias = [
            tecnologia.strip()
            for tecnologia in tecnologias.split(",")
            if tecnologia.strip()
        ]

    vagas = buscar_vagas(
        termo=termo,
        tecnologias=lista_tecnologias,
        modalidade=modalidade,
        nivel=nivel,
        contrato=contrato
    )

    return {
        "total": len(vagas),
        "filtros": {
            "termo": termo,
            "tecnologias": lista_tecnologias,
            "modalidade": modalidade,
            "nivel": nivel,
            "contrato": contrato
        },
        "vagas": vagas
    }


@router.get("/estatisticas")
def get_estatisticas():
    return obter_estatisticas()


@router.get("/vagas/{id}")
def get_vaga_por_id(id: str):
    vaga = buscar_vaga_por_id(id)

    if not vaga:
        raise HTTPException(
            status_code=404,
            detail="Vaga não encontrada"
        )

    return vaga