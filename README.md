# TechJobs

## Integrantes
- Murillo Padula — RM571620
- Guilherme Mingues — RM568670
- Renato Munhoz — RM573579
- Gabriel Vianna - RM571475

Sistema acadêmico para **coleta, armazenamento, consulta e visualização de vagas de estágio na área de tecnologia**.

O projeto utiliza Web Scraping para coletar vagas publicadas na Programathor, realiza o tratamento das informações, armazena os dados no MongoDB, disponibiliza as vagas por meio de uma API REST desenvolvida com FastAPI e apresenta os dados em um dashboard web.

## Tecnologias

### Backend
- Python
- FastAPI
- Uvicorn
- MongoDB
- PyMongo
- BeautifulSoup
- Requests
- python-dotenv
- pip-system-certs

### Front-end
- HTML5
- CSS3
- JavaScript
- Fetch API
- Chart.js

## Arquitetura

O fluxo principal da aplicação é:

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
Fetch API
      ↓
Dashboard
```

O crawler coleta as vagas disponíveis na Programathor e envia os dados tratados para o MongoDB.

A API consulta o banco de dados e disponibiliza as informações para o front-end.

O dashboard **não acessa diretamente o MongoDB** e **não realiza scraping**. Todos os dados exibidos na interface são obtidos exclusivamente por meio da FastAPI.

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
├── dashboard/
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   └── logo-techjobs.png
│
├── .env
├── .gitignore
├── requirements.txt
└── README.md
```

## Funcionalidades

O projeto possui:

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
- Dashboard responsivo
- Cards de indicadores
- Gráfico de vagas por modalidade
- Gráfico de vagas por localização
- Pesquisa utilizando a API
- Filtros por tecnologia, modalidade, nível e contrato
- Tabela com as vagas coletadas
- Modal com detalhes da vaga
- Link para a vaga original
- Estados de loading, erro e ausência de resultados

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

As tecnologias são armazenadas em uma lista dentro de cada vaga, permitindo filtros específicos.

# Instalação

## 1. Clone o repositório

```bash
git clone URL_DO_REPOSITORIO
```

Entre na pasta:

```bash
cd PythonCP5
```

## 2. Crie um ambiente virtual

```bash
python -m venv .venv
```

## 3. Ative o ambiente virtual

### PowerShell

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

### Git Bash

```bash
source .venv/Scripts/activate
```

## 4. Instale as dependências

```bash
pip install -r requirements.txt
```

O projeto também utiliza `pip-system-certs`, incluído no `requirements.txt`, para melhorar a compatibilidade com certificados SSL do Windows durante as requisições HTTPS do crawler.

# Configuração do MongoDB

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

## Verificando o MongoDB no Windows

```powershell
Get-Service MongoDB
```

Se estiver parado:

```powershell
Start-Service MongoDB
```

# Executando o crawler

Para realizar uma coleta manual:

```bash
python -m crawler.crawler
```

O crawler acessa a página de vagas de estágio da Programathor, coleta as vagas disponíveis, trata os dados e salva as informações no MongoDB.

As vagas existentes são identificadas pela URL. Caso uma vaga já exista, seus dados são atualizados. Caso seja uma vaga nova, um novo documento é criado.

# Atualização automática

O projeto possui um scheduler que executa o crawler automaticamente em intervalos de 30 minutos.

Execute:

```bash
python -m crawler.scheduler
```

O scheduler precisa permanecer em execução para que as atualizações automáticas continuem acontecendo.

# Executando a API

Na raiz do projeto:

```bash
uvicorn api.main:app --reload
```

A API ficará disponível em:

```text
http://127.0.0.1:8000
```

A documentação Swagger fica disponível em:

```text
http://127.0.0.1:8000/docs
```

# Endpoints

## Listar todas as vagas

```http
GET /vagas
```

Exemplo:

```text
http://127.0.0.1:8000/vagas
```

## Buscar vagas

```http
GET /vagas/buscar
```

Filtros disponíveis:

| Parâmetro | Descrição | Exemplo |
|---|---|---|
| `termo` | Pesquisa textual | `python` |
| `tecnologias` | Tecnologias desejadas | `python,javascript` |
| `modalidade` | Modalidade da vaga | `remoto` |
| `nivel` | Nível da vaga | `junior` |
| `contrato` | Tipo de contrato | `estagio` |

Exemplos:

```text
http://127.0.0.1:8000/vagas/buscar?tecnologias=python
```

```text
http://127.0.0.1:8000/vagas/buscar?modalidade=remoto
```

```text
http://127.0.0.1:8000/vagas/buscar?tecnologias=python,javascript
```

```text
http://127.0.0.1:8000/vagas/buscar?tecnologias=python&modalidade=hibrido&nivel=junior&contrato=estagio
```

## Buscar vaga por ID

```http
GET /vagas/{id}
```

Caso a vaga não exista ou o ID seja inválido, a API retorna `404 Not Found`.

## Estatísticas

```http
GET /estatisticas
```

Exemplo de resposta:

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

# Dashboard

O dashboard foi desenvolvido com HTML, CSS e JavaScript puro.

O JavaScript utiliza a **Fetch API** para consumir os endpoints da FastAPI e atualizar a interface dinamicamente.

### `/estatisticas`

Utilizado para carregar:

- Total de vagas
- Total de empresas
- Vagas remotas
- Vagas híbridas
- Vagas presenciais
- Gráfico de vagas por modalidade

### `/vagas`

Utilizado para:

- Listagem das vagas
- Gráfico de vagas por localização
- Contagem dos registros

### `/vagas/buscar`

Utilizado pela pesquisa e pelos filtros do dashboard.

### `/vagas/{id}`

Utilizado para carregar os detalhes completos de uma vaga ao clicar em **Ver detalhes**.

## Executando o dashboard

Abra o arquivo:

```text
dashboard/index.html
```

utilizando a extensão **Live Server** do VS Code.

Normalmente o dashboard ficará disponível em:

```text
http://127.0.0.1:5500/dashboard/index.html
```

# CORS

Como o dashboard e a API utilizam portas diferentes durante o desenvolvimento, a FastAPI possui configuração de CORS.

O front-end pode ser executado em:

```text
http://127.0.0.1:5500
```

ou:

```text
http://localhost:5500
```

e consumir a API em:

```text
http://127.0.0.1:8000
```

# Executando o projeto completo

Durante a demonstração, mantenha os serviços necessários em execução.

## Terminal 1 - API

```bash
uvicorn api.main:app --reload
```

## Terminal 2 - Crawler

Coleta manual:

```bash
python -m crawler.crawler
```

ou atualização automática:

```bash
python -m crawler.scheduler
```

## Front-end

Abra `dashboard/index.html` utilizando o Live Server.

Fluxo completo:

```text
Programathor
      ↓
Crawler
      ↓
MongoDB
      ↓
FastAPI
      ↓
Dashboard
```

# Requirements

As dependências Python estão no arquivo:

```text
requirements.txt
```

Para instalar:

```bash
pip install -r requirements.txt
```

HTML, CSS, JavaScript e Chart.js não são instalados através do `requirements.txt`.

# Status do projeto

## Backend

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

## Front-end

- [x] Interface responsiva
- [x] Integração com a API
- [x] Filtros visuais
- [x] Pesquisa pela API
- [x] Cards de indicadores
- [x] Gráfico de modalidades
- [x] Gráfico de localização
- [x] Tabela de vagas
- [x] Modal de detalhes
- [x] Link para a vaga original
- [x] Loading
- [x] Tratamento de erros
- [x] Mensagem para ausência de resultados

# Possíveis próximas etapas

O sistema principal está funcional.

Como melhorias futuras, podem ser consideradas:

- Deploy do backend
- Deploy do front-end
- Execução contínua do crawler em ambiente de produção
- Paginação das vagas
- Novos indicadores e gráficos
- Ampliação das fontes de coleta

# Observação

O projeto foi desenvolvido para fins acadêmicos como parte da CP5, com foco na aplicação prática de conceitos de Python, Web Scraping, APIs REST, bancos de dados NoSQL e desenvolvimento web.
