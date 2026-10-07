from fastapi import FastAPI
from api.routes import router
from bson import ObjectId

app = FastAPI(
    title="TechJobs API",
    description="API para consulta de vagas de estágio em tecnologia coletadas da Programathor",
    version="1.0.0"
)

app.include_router(router)


@app.get("/")

def inicio():
    return {
        "mensagem": "TechJobs API funcionando!"
    }

def buscar_vaga_por_id(id):
    if not ObjectId.is_valid(id):
        return None

    vaga = vagas_collection.find_one({
        "_id": ObjectId(id)
    })

    if vaga:
        vaga["_id"] = str(vaga["_id"])

    return vaga