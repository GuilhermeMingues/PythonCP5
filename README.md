# TechJobs

API para coleta, armazenamento e consulta de vagas de estágio na área de tecnologia.

O projeto utiliza Web Scraping para coletar vagas publicadas na Programathor, realiza o tratamento das informações, armazena os dados no MongoDB e disponibiliza as vagas através de uma API REST desenvolvida com FastAPI.

A aplicação também possui atualização automática das vagas e permite realizar buscas utilizando múltiplos filtros simultaneamente.

## Tecnologias

O projeto utiliza:

- Python
- FastAPI
- Uvicorn
- MongoDB
- PyMongo
- BeautifulSoup
- Requests
- python-dotenv

## Arquitetura

O fluxo principal da aplicação funciona da seguinte maneira:

```text
Programathor
      ↓
Web Crawler
      ↓
Tratamento dos dados
      ↓
MongoDB
      ↓
FastAPI
      ↓
Front-end
```

O crawler coleta as vagas disponíveis na Programathor e envia os dados tratados para o MongoDB.

A API consulta o banco de dados e disponibiliza as informações para o front-end.

## Estrutura do projeto

```text
PythonCP5/
│
├── api/
│   ├── main.py
│   └── routes.py
│
├── crawler/
│   ├── __init__.py
│   ├── crawler.py
│   ├── tratamento.py
│   └── scheduler.py
│
├── database/
│   ├── __init__.py
│   └── mongodb.py
│
├── .env
├── .gitignore
├── requirements.txt
└── README.md
```

## Funcionalidades

Atualmente o projeto possui:

- Coleta automática de vagas da Programathor
- Web Scraping com BeautifulSoup
- Tratamento dos dados coletados
- Armazenamento das vagas no MongoDB
- Atualização de vagas existentes
- Prevenção de duplicação através da URL da vaga
- Identificação das tecnologias relacionadas à vaga
- Identificação da modalidade de trabalho
- Identificação do nível da vaga
- Identificação do tipo de contrato
- API REST utilizando FastAPI
- Listagem de todas as vagas
- Busca por ID
- Busca utilizando múltiplos filtros
- Estatísticas das vagas armazenadas
- Tratamento de vagas inexistentes
- Atualização automática através de scheduler
- CORS configurado para integração com o front-end

## Informações coletadas

Cada vaga armazenada no MongoDB possui informações como:

```json
{
    "titulo": "Estágio Desenvolvedor Python",
    "empresa": "Empresa",
    "modalidade": "Híbrido",
    "localizacao": "São Paulo",
    "salario": "Até R$2.500",
    "nivel": "Júnior",
    "contrato": "Estágio",
    "tecnologias": [
        "Python",
        "JavaScript"
    ],
    "descricao": "...",
    "atividades": "...",
    "requisitos": "...",
    "url": "...",
    "fonte": "Programathor",
    "coletado_em": "..."
}
```

## Tecnologias identificadas

O crawler atualmente identifica tecnologias como:

- Python
- Java
- JavaScript
- TypeScript
- HTML
- CSS
- PHP
- ReactJS
- Node.js
- MySQL
- PostgreSQL
- SQL
- Git
- Laravel
- Flutter
- Dart

As tecnologias são armazenadas em uma lista dentro de cada vaga, permitindo realizar filtros específicos.

## Instalação

### 1. Clone o repositório

```bash
git clone URL_DO_REPOSITORIO
```

Entre na pasta:

```bash
cd PythonCP5
```

### 2. Crie um ambiente virtual

```bash
python -m venv .venv
```

### 3. Ative o ambiente virtual

PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

Caso o PowerShell bloqueie a execução do script:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned
```

Depois:

```powershell
.\.venv\Scripts\Activate.ps1
```

Git Bash:

```bash
source .venv/Scripts/activate
```

### 4. Instale as dependências

```bash
pip install -r requirements.txt
```

## Configuração do MongoDB

O projeto utiliza MongoDB para armazenar as vagas.

Crie um arquivo `.env` na raiz do projeto:

```env
MONGO_URI=mongodb://localhost:27017
```

O projeto utiliza:

```text
Database: techjobs
Collection: vagas
```

O arquivo `.env` não deve ser enviado para o GitHub.

Adicione ao `.gitignore`:

```gitignore
.venv/
.env
__pycache__/
*.pyc
```

## Executando o crawler

Para realizar uma coleta manual:

```bash
python -m crawler.crawler
```

O crawler acessará a página de vagas de estágio da Programathor, coletará as vagas disponíveis, tratará os dados e salvará as informações no MongoDB.

As vagas existentes são identificadas pela URL.

Caso uma vaga já exista, seus dados são atualizados. Caso seja uma nova vaga, um novo documento é criado.

## Atualização automática

O projeto possui um scheduler que executa o crawler automaticamente em intervalos de 30 minutos.

Execute:

```bash
python -m crawler.scheduler
```

Exemplo de execução:

```text
Atualizando vagas...
Quantidade de vagas encontradas: 15

Vaga salva: ...
Vaga salva: ...
Vaga salva: ...

Atualização concluída.
Próxima atualização em 30 minutos.
```

Enquanto o processo estiver sendo executado, o crawler verificará periodicamente as vagas disponíveis.

O scheduler precisa permanecer em execução para que as atualizações automáticas continuem acontecendo.

## Executando a API

Na raiz do projeto, execute:

```bash
uvicorn api.main:app --reload
```

A API ficará disponível em:

```text
http://127.0.0.1:8000
```

## Documentação da API

O FastAPI disponibiliza documentação interativa automaticamente através do Swagger.

Acesse:

```text
http://127.0.0.1:8000/docs
```

## Endpoints

### Listar todas as vagas

```http
GET /vagas
```

Exemplo:

```text
http://127.0.0.1:8000/vagas
```

Resposta:

```json
{
    "total": 15,
    "vagas": []
}
```

### Buscar vagas

```http
GET /vagas/buscar
```

A busca permite combinar diferentes filtros.

Filtros disponíveis:

| Parâmetro | Descrição | Exemplo |
|---|---|---|
| `termo` | Pesquisa textual | `python` |
| `tecnologias` | Tecnologias desejadas | `python,javascript` |
| `modalidade` | Modalidade da vaga | `remoto` |
| `nivel` | Nível da vaga | `junior` |
| `contrato` | Tipo de contrato | `estagio` |

### Buscar por tecnologia

```text
http://127.0.0.1:8000/vagas/buscar?tecnologias=python
```

### Buscar por modalidade

```text
http://127.0.0.1:8000/vagas/buscar?modalidade=remoto
```

### Buscar várias tecnologias

```text
http://127.0.0.1:8000/vagas/buscar?tecnologias=python,javascript
```

Nesse caso, a vaga precisa possuir Python e JavaScript.

### Combinar filtros

Exemplo:

```text
http://127.0.0.1:8000/vagas/buscar?tecnologias=python&modalidade=hibrido&nivel=junior&contrato=estagio
```

Essa consulta procura vagas que sejam simultaneamente:

```text
Python
+
Híbrido
+
Júnior
+
Estágio
```

Os filtros podem ser combinados de acordo com o perfil de vaga desejado.

## Buscar vaga por ID

```http
GET /vagas/{id}
```

Exemplo:

```text
http://127.0.0.1:8000/vagas/ID_DA_VAGA
```

Caso a vaga não exista ou o ID seja inválido, a API retorna:

```json
{
    "detail": "Vaga não encontrada"
}
```

com status HTTP:

```text
404 Not Found
```

## Estatísticas

```http
GET /estatisticas
```

Esse endpoint disponibiliza informações gerais sobre as vagas armazenadas.

Exemplo:

```json
{
    "total_vagas": 15,
    "total_empresas": 14,
    "modalidades": {
        "remoto": 8,
        "hibrido": 5,
        "presencial": 2
    }
}
```

Os valores dependem das vagas armazenadas no momento da consulta.

## Filtros

### Modalidade

As modalidades utilizadas são:

```text
Remoto
Híbrido
Presencial
```

A API também trata valores enviados sem acento.

Exemplo:

```text
modalidade=hibrido
```

é convertido para:

```text
Híbrido
```

### Nível

Exemplo:

```text
nivel=junior
```

é tratado como:

```text
Júnior
```

### Contrato

Atualmente o crawler está configurado para coletar vagas de estágio.

É possível utilizar:

```text
contrato=estagio
```

que corresponde a:

```text
Estágio
```

## CORS

A API possui configuração de CORS para permitir a comunicação com o front-end durante o desenvolvimento.

Dessa forma, um front-end executando, por exemplo, em:

```text
http://localhost:3000
```

ou:

```text
http://localhost:5173
```

pode consumir a API executada em:

```text
http://127.0.0.1:8000
```

## Executando o projeto

Para utilizar o projeto completo durante o desenvolvimento, podem ser utilizados dois terminais.

### Terminal 1 - API

```bash
uvicorn api.main:app --reload
```

### Terminal 2 - Atualização automática

```bash
python -m crawler.scheduler
```

Dessa forma:

```text
Programathor
      ↓
Crawler
      ↓
MongoDB
      ↓
FastAPI
      ↓
Front-end
```

O scheduler verifica periodicamente novas vagas, o MongoDB mantém os dados armazenados e a API disponibiliza essas informações para o front-end.

## Requirements

As dependências do projeto estão disponíveis no arquivo:

```text
requirements.txt
```

Para instalar:

```bash
pip install -r requirements.txt
```

## Status do projeto

### Backend

- [x] Web Crawler
- [x] Tratamento dos dados
- [x] MongoDB
- [x] API REST
- [x] Busca por múltiplos filtros
- [x] Busca por ID
- [x] Estatísticas
- [x] Identificação de tecnologias
- [x] Atualização sem duplicação
- [x] Scheduler
- [x] CORS

### Front-end

- [ ] Interface
- [ ] Integração com API
- [ ] Filtros visuais
- [ ] Cards das vagas
- [ ] Página/detalhes da vaga
- [ ] Dashboard de estatísticas

## Próximas etapas

O próximo passo do projeto é desenvolver o front-end e integrá-lo à API.

A interface deverá permitir que o usuário selecione características da vaga desejada, como tecnologias, modalidade e nível.

A API retornará somente as vagas compatíveis com os filtros selecionados.

Também estão previstas:

- Exibição das vagas em cards
- Visualização detalhada das vagas
- Dashboard de estatísticas
- Deploy do backend
- Deploy do front-end
- Execução contínua do crawler em ambiente de produção

## Observação

O projeto foi desenvolvido para fins acadêmicos como parte da CP5, com foco na aplicação prática de conceitos de Python, Web Scraping, APIs REST e bancos de dados NoSQL.