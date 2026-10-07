from fastapi import APIRouter
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
def pesquisar_vagas(termo: str):
    vagas = buscar_vagas(termo)

    return {
        "termo": termo,
        "total": len(vagas),
        "vagas": vagas
    }


@router.get("/estatisticas")
def get_estatisticas():
    return obter_estatisticas()


@router.get("/vagas/{id}")
def get_vaga_por_id(id: str):
    vaga = buscar_vaga_por_id(id)

    if not vaga:
        return {
            "erro": "Vaga não encontrada"
        }

    return vaga