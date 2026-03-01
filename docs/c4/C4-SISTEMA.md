# Diagrama C4 - BokiBot Sistema
## Fecha: 2026-03-01

---

## Nivel 1: Contexto del Sistema

```
┌──────────────────────────────────────────────────────────────────┐
│                        USUARIOS                                  │
│                                                                  │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────────┐    │
│  │ Cliente      │  │ Admin        │  │ Visitante Web        │    │
│  │ (WhatsApp)   │  │ (boki-front) │  │ (solercia-web)       │    │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘    │
│         │                 │                     │                 │
└─────────┼─────────────────┼─────────────────────┼────────────────┘
          │                 │                     │
          ▼                 ▼                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                    BOKIBOT PLATFORM                              │
│                                                                 │
│  WhatsApp Chatbot + Agendamiento + FAQs + Admin Panel + Web    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
          │                 │                     │
          ▼                 ▼                     ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Meta/WhatsApp│  │ OpenAI       │  │ Let's Encrypt│
│ Cloud API    │  │ API          │  │ (SSL)        │
└──────────────┘  └──────────────┘  └──────────────┘
```

---

## Nivel 2: Contenedores

```
┌──────────────────────────────────────────────────────────────────────┐
│                          TRAEFIK (Reverse Proxy)                     │
│  HTTPS termination | Rate Limiting | Security Headers | Routing      │
│  Ports: 80 (redirect) → 443 (TLS)                                  │
└───────┬──────────────┬──────────────┬──────────────┬────────────────┘
        │              │              │              │
        ▼              ▼              ▼              ▼
┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────────┐
│ solercia  │  │ n8n       │  │ boki-api  │  │ boki-front    │
│ -web      │  │ (flows)   │  │           │  │ (futuro)      │
│           │  │           │  │           │  │               │
│ Angular   │  │ Workflows │  │ NestJS    │  │ Angular 20    │
│ 20.1      │  │ + LLM     │  │ 11        │  │ + Material    │
│           │  │           │  │           │  │               │
│ nginx     │  │ Node.js   │  │ Node 22   │  │ nginx         │
│ :80       │  │ :5678     │  │ :3000     │  │ :80           │
└───────────┘  └─────┬─────┘  └─────┬─────┘  └───────────────┘
                     │              │
                     ▼              ▼
              ┌────────────────────────────┐
              │     PostgreSQL 14.5        │
              │     :5432 (interno)        │
              │                            │
              │  DB: n8n (workflows)       │
              │  DB: boki (negocio)        │
              └────────────────────────────┘
                            │
              ┌────────────────────────────┐
              │     MongoDB 7              │
              │     :27017 (interno)       │
              │                            │
              │  DB: boki_mongo            │
              │  (conversaciones)          │
              └────────────────────────────┘
```

---

## Nivel 3: Componentes (boki-api)

```
┌─────────────────────────────────────────────────────────────────────┐
│                          BOKI-API (NestJS 11)                       │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    SHARED LAYER                              │    │
│  │  ApiTokenGuard | JwtAuthGuard | ResponseInterceptor          │    │
│  │  DateFormatInterceptor | BaseCrudService | BaseCrudController │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                     │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐      │
│  │ Users      │ │ Company    │ │ Appointment│ │ Professional│      │
│  │ Module     │ │ Module     │ │ Module     │ │ Module     │      │
│  │            │ │            │ │            │ │            │      │
│  │ Auth       │ │ CRUD +     │ │ Scheduling │ │ Availability│      │
│  │ JWT/Login  │ │ Prompts    │ │ + States   │ │ + Hours    │      │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘      │
│                                                                     │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐      │
│  │ Service    │ │ Category   │ │ FAQs       │ │ Client     │      │
│  │ Module     │ │ Module     │ │ Module     │ │ Module     │      │
│  │            │ │            │ │            │ │            │      │
│  │ + Stages   │ │ Service    │ │ + Tags     │ │ Registration│      │
│  │ + Pricing  │ │ Categories │ │ Knowledge  │ │ + Phone    │      │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘      │
│                                                                     │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐      │
│  │ Chat       │ │ LLM        │ │ Plan       │ │ Semantic   │      │
│  │ Module     │ │ Module     │ │ Module     │ │ Search     │      │
│  │            │ │            │ │            │ │ Module     │      │
│  │ Session    │ │ Flow Defs  │ │ CompanyPlan│ │ pgvector   │      │
│  │ + History  │ │ + Steps    │ │ + Tokens   │ │ Embeddings │      │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘      │
│                                                                     │
│  ┌──────────────────────────────────────────┐                      │
│  │ Conversation Module (MongoDB)             │                      │
│  │ Contact | ConversationState | MessageHist │                      │
│  └──────────────────────────────────────────┘                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Nivel 3: Componentes (n8n Flujos)

```
┌─────────────────────────────────────────────────────────────────────┐
│                       N8N WORKFLOW ENGINE                            │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    MAINFLOW (Entry Point)                    │    │
│  │  WhatsApp Trigger → Session Mgmt → Client Lookup → Router   │    │
│  └──────────┬──────────────┬──────────────┬────────────────────┘    │
│             │              │              │                         │
│             ▼              ▼              ▼                         │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐               │
│  │ Register     │ │ Appointment  │ │ FlowFaqs     │               │
│  │ Client       │ │ Flow         │ │              │               │
│  │              │ │              │ │ Intent +     │               │
│  │ 2-step:      │ │ OpenAI +     │ │ Category +   │               │
│  │ cedula+name  │ │ LangChain    │ │ AI Response  │               │
│  └──────────────┘ └──────────────┘ └──────┬───────┘               │
│                                           │                        │
│                                           ▼                        │
│                                  ┌──────────────┐                  │
│                                  │ Control      │                  │
│                                  │ Tokens       │                  │
│                                  │              │                  │
│                                  │ Track usage  │                  │
│                                  └──────────────┘                  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Flujo de Datos Principal

```
1. Usuario envia mensaje por WhatsApp
   │
2. Meta Cloud API → n8n Webhook (InboundMessage)
   │
3. n8n: Session Management (crear/recuperar sesion)
   │
4. n8n: Client Lookup (existe en DB?)
   │
5. Decision de flujo:
   ├── Cliente nuevo → RegisterClient Flow
   ├── Cliente existente + intent cita → AppointmentFlow
   └── Cliente existente + intent FAQ → FlowFaqs
   │
6. Sub-flujo procesa:
   ├── OpenAI genera respuesta (appointment/FAQ)
   ├── boki-api ejecuta logica de negocio (crear cita, buscar FAQs)
   └── Token tracking (Control-Tokens)
   │
7. n8n: Enviar respuesta por WhatsApp (OutboundMessage)
   │
8. Meta Cloud API → Usuario recibe respuesta
```

---

## Deployment

```
┌──────────────────────────────────────────────────────────────┐
│                    VPS / Cloud Server                         │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐    │
│  │              Docker Engine                            │    │
│  │                                                      │    │
│  │  ┌─────────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌───────┐  │    │
│  │  │ Traefik │ │ n8n  │ │ API  │ │ Web  │ │ Front │  │    │
│  │  │  :443   │ │:5678 │ │:3000 │ │ :80  │ │ :80   │  │    │
│  │  └────┬────┘ └──────┘ └──────┘ └──────┘ └───────┘  │    │
│  │       │                                              │    │
│  │  ┌────┴────────────────────────────────────────┐     │    │
│  │  │          red_solercia_com_co                 │     │    │
│  │  │  (Docker bridge network)                     │     │    │
│  │  └──────────────────────────────────────────────┘     │    │
│  │       │              │                                │    │
│  │  ┌────┴────┐   ┌────┴────┐                           │    │
│  │  │PostgreSQL│   │MongoDB  │                           │    │
│  │  │  :5432  │   │ :27017  │                           │    │
│  │  └─────────┘   └─────────┘                           │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                              │
│  Volumes: n8n_data, postgres-data, mongo_data, certs, logs   │
│                                                              │
│  SSL: Let's Encrypt (auto-renewal)                           │
│  Domains: www.solercia.com.co, flows.*, api.*                │
└──────────────────────────────────────────────────────────────┘

Servicios Externos:
  - Meta Cloud API (WhatsApp)
  - OpenAI API (LLM)
  - Let's Encrypt (SSL)
  - GitHub (code repos)
```
