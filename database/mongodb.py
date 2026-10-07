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
    vaga_existente = vagas_collection.find_one({
        "url": vaga["url"]
    })

    if vaga_existente:
        print("Vaga já cadastrada:", vaga["titulo"])
        return

    vagas_collection.insert_one(vaga)

    print("Vaga salva:", vaga["titulo"])


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

def buscar_vagas(termo):
    filtro = {
        "$or": [
            {"titulo": {"$regex": termo, "$options": "i"}},
            {"empresa": {"$regex": termo, "$options": "i"}},
            {"localizacao": {"$regex": termo, "$options": "i"}},
            {"modalidade": {"$regex": termo, "$options": "i"}},
            {"descricao": {"$regex": termo, "$options": "i"}},
            {"atividades": {"$regex": termo, "$options": "i"}},
            {"requisitos": {"$regex": termo, "$options": "i"}}
        ]
    }

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