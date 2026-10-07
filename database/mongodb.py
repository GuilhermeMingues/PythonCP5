from pymongo import MongoClient
from dotenv import load_dotenv
from bson import ObjectId
import os

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")

client = MongoClient(MONGO_URI)

db = client["techjobs"]
vagas_collection = db["vagas"]


def salvar_vaga(vaga):
    vagas_collection.update_one(
        {"url": vaga["url"]},
        {"$set": vaga},
        upsert=True
    )

def listar_vagas():
    vagas = []

    for vaga in vagas_collection.find():
        vaga["_id"] = str(vaga["_id"])
        vagas.append(vaga)

    return vagas


def buscar_vaga_por_id(id):
    if not ObjectId.is_valid(id):
        return None

    vaga = vagas_collection.find_one({
        "_id": ObjectId(id)
    })

    if vaga:
        vaga["_id"] = str(vaga["_id"])

    return vaga

def buscar_vagas(
    termo=None,
    tecnologias=None,
    modalidade=None,
    nivel=None,
    contrato=None
):
    filtros = []

    if termo:
        filtros.append({
            "$or": [
                {"titulo": {"$regex": termo, "$options": "i"}},
                {"empresa": {"$regex": termo, "$options": "i"}},
                {"localizacao": {"$regex": termo, "$options": "i"}},
                {"descricao": {"$regex": termo, "$options": "i"}},
                {"atividades": {"$regex": termo, "$options": "i"}},
                {"requisitos": {"$regex": termo, "$options": "i"}}
            ]
        })

    if tecnologias:
        for tecnologia in tecnologias:
            filtros.append({
                "tecnologias": {
                    "$regex": f"^{tecnologia}$",
                    "$options": "i"
                }
            })

    if modalidade:
        modalidades = {
            "remoto": "Remoto",
            "hibrido": "Híbrido",
            "híbrido": "Híbrido",
            "presencial": "Presencial"
        }

        modalidade_normalizada = modalidades.get(
            modalidade.lower(),
            modalidade
        )

        filtros.append({
            "modalidade": modalidade_normalizada
        })

    if nivel:
        niveis = {
            "junior": "Júnior",
            "júnior": "Júnior",
            "pleno": "Pleno",
            "senior": "Sênior",
            "sênior": "Sênior"
        }

        nivel_normalizado = niveis.get(
            nivel.lower(),
            nivel
        )

        filtros.append({
            "nivel": nivel_normalizado
        })

    if contrato:
        contratos = {
            "estagio": "Estágio",
            "estágio": "Estágio"
        }

        contrato_normalizado = contratos.get(
            contrato.lower(),
            contrato
        )

        filtros.append({
            "contrato": contrato_normalizado
        })

    filtro = {
        "$and": filtros
    } if filtros else {}

    vagas = []

    for vaga in vagas_collection.find(filtro):
        vaga["_id"] = str(vaga["_id"])
        vagas.append(vaga)

    return vagas

def obter_estatisticas():
    total_vagas = vagas_collection.count_documents({})

    total_remoto = vagas_collection.count_documents({
        "modalidade": "Remoto"
    })

    total_hibrido = vagas_collection.count_documents({
        "modalidade": "Híbrido"
    })

    total_presencial = vagas_collection.count_documents({
        "modalidade": "Presencial"
    })

    empresas = vagas_collection.distinct("empresa")
    total_empresas = len(empresas)

    return {
        "total_vagas": total_vagas,
        "total_empresas": total_empresas,
        "modalidades": {
            "remoto": total_remoto,
            "hibrido": total_hibrido,
            "presencial": total_presencial
        }
    }