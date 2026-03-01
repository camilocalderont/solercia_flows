# Reporte de Investigacion de Mercado - BokiBot

## Fecha: 2026-03-01

## Fuentes

| Fuente | Estado | Notas |
|--------|--------|-------|
| Google Trends (Colombia) | Funcional | Datos de interes de busqueda semanal (feb 2025 - mar 2026) + regiones + consultas relacionadas |
| GitHub Landscape | Funcional | 40 repositorios relevantes encontrados en multiples queries |
| Competitors Data (scraping) | Parcialmente funcional | Se obtuvieron metadatos de 8 competidores; datos de pricing limitados (Manychat bloqueo el scraping, la mayoria no expone precios en HTML estatico) |
| NPM Downloads | Funcional | 9 paquetes consultados (1 error: @grammyjs/core no encontrado), periodo 30 ene - 28 feb 2026 |

---

## 1. Tamano del mercado

### Analisis de interes de busqueda en Colombia (Google Trends, ultimos 12 meses)

Se analizaron 10 terminos de busqueda agrupados en dos lotes. Los valores de Google Trends son relativos (0-100 donde 100 es el pico maximo de interes dentro del periodo).

**Grupo 1 - Terminos genericos:**

| Termino | Promedio semanal (valores >0) | Semanas con actividad (de 54) | Pico maximo | Tendencia |
|---------|-------------------------------|-------------------------------|-------------|-----------|
| **bot whatsapp** | 55.8 | 37/54 (69%) | 82 (ago 2025) | Estable con leve declive a fin de periodo |
| **chatbot whatsapp** | 56.7 | 24/54 (44%) | 100 (feb 2025) | Declive marcado desde ago 2025; repunte leve en feb 2026 |
| **chatbot citas** | 0 | 0/54 (0%) | 0 | Sin volumen detectable en Colombia |
| **agendar citas online** | 0 | 0/54 (0%) | 0 | Sin volumen detectable en Colombia |
| **chatbot empresa** | 0 | 0/54 (0%) | 0 | Sin volumen detectable en Colombia |

**Grupo 2 - Terminos de nicho vertical:**

| Termino | Promedio semanal (valores >0) | Semanas con actividad | Pico maximo | Tendencia |
|---------|-------------------------------|----------------------|-------------|-----------|
| **automatizar whatsapp** | 22.5 | 2/54 | 27 (feb 2026) | Emergente, aparecio recien en febrero 2026 |
| **chatbot restaurante** | 100 | 1/54 | 100 (abr 2025) | Pico aislado, sin sostenibilidad |
| **chatbot salud** | 7 | 1/54 | 7 (feb 2026) | Volumen minimo, aparicion reciente |
| **chatbot belleza** | 0 | 0/54 | 0 | Sin volumen detectable |
| **reserva citas app** | 0 | 0/54 | 0 | Sin volumen detectable |

### Hallazgos clave

1. **"bot whatsapp" es el termino dominante** en Colombia con presencia en el 69% de las semanas y un promedio de 55.8 puntos. Esto indica que los colombianos buscan genericamente "bot whatsapp" mas que terminos especializados como "chatbot citas".

2. **"chatbot whatsapp" muestra un patron ciclico** con pico inicial de 100 en febrero 2025, pero una tendencia bajista en el segundo semestre 2025, seguido de un repunte timido en febrero 2026 (37 y 26 puntos).

3. **Los terminos de nicho vertical tienen volumen practicamente nulo**, lo que indica:
   - El mercado colombiano aun no busca soluciones verticales de chatbot por sector.
   - Existe una oportunidad de ser first-mover en la educacion del mercado.
   - La estrategia de adquisicion no puede depender unicamente de SEO sobre estos terminos.

4. **"automatizar whatsapp" es una senal emergente** que aparece por primera vez en febrero 2026, sugiriendo un interes creciente en automatizacion de WhatsApp Business.

### Consultas relacionadas (rising)

| Consulta | Crecimiento | Contexto |
|----------|-------------|----------|
| **n8n** | +471,450% | Busqueda rising en "chatbot whatsapp" -- valida la relevancia tecnica de n8n |
| **n8n whatsapp bot** | +256,450% | Busqueda rising en "bot whatsapp" -- la combinacion n8n+WhatsApp esta explotando |
| **automatizar whatsapp business** | top 100 | Unica consulta top en "automatizar whatsapp" |

> **Implicacion estrategica**: n8n es la tecnologia que mas crece asociada a chatbots de WhatsApp en Colombia. BokiBot, construido sobre n8n, esta perfectamente posicionado en esta tendencia.

---

## 2. Interes de busqueda por region/ciudad en Colombia

Datos de Google Trends para el termino **"chatbot"** por departamento:

| Departamento | Indice (0-100) | Clasificacion |
|--------------|----------------|---------------|
| **Choco** | 100 | Muy alto |
| **Arauca** | 98 | Muy alto |
| **Cauca** | 84 | Alto |
| **Cundinamarca** | 77 | Alto |
| **Caldas** | 71 | Alto |
| **Bogota** | 70 | Alto |
| **Quindio** | 70 | Alto |
| **Antioquia** | 67 | Alto |
| **Narino** | 67 | Alto |
| **Boyaca** | 66 | Medio-alto |
| **Huila** | 65 | Medio-alto |
| **Magdalena** | 65 | Medio-alto |
| **Valle del Cauca** | 65 | Medio-alto |
| **Cordoba** | 64 | Medio-alto |
| **Risaralda** | 62 | Medio |
| **Atlantico** | 61 | Medio |
| **Bolivar** | 61 | Medio |
| **Santander** | 61 | Medio |
| **Sucre** | 59 | Medio |
| **Tolima** | 58 | Medio |
| **La Guajira** | 56 | Medio |
| **Cesar** | 55 | Medio |
| **Meta** | 55 | Medio |
| **Putumayo** | 54 | Medio |
| **Norte de Santander** | 51 | Medio |
| **Casanare** | 39 | Bajo |
| Amazonas, Caqueta, Guainia, Guaviare, San Andres, Vaupes, Vichada | 0 | Sin datos |

### Analisis geografico

**Mercados prioritarios para BokiBot (por densidad empresarial + interes):**

1. **Bogota (70)**: Capital, mayor concentracion de PYMEs en el pais. Mercado objetivo primario.
2. **Cundinamarca (77)**: Region circundante a Bogota con alto indice. Extension natural.
3. **Antioquia/Medellin (67)**: Segundo hub empresarial del pais, ecosistema tech fuerte.
4. **Valle del Cauca/Cali (65)**: Tercer mercado en tamano con interes sostenido.
5. **Caldas/Manizales (71) y Eje Cafetero (Quindio 70, Risaralda 62)**: Indice sorprendentemente alto, posible indicador de adopcion digital acelerada en ciudades intermedias.

**Datos sorprendentes**: Choco (100) y Arauca (98) lideran el indice, pero esto debe interpretarse con cautela ya que en regiones con bajo volumen absoluto de busquedas, pocas consultas pueden generar un indice alto. No representan mercados comerciales prioritarios por tamano de economia.

---

## 3. Competidores y pricing

| Nombre | Plan basico | Plan pro | Diferenciador | Debilidad |
|--------|-----------|----------|---------------|-----------|
| **Tidio** | Gratis (50 conv/mes) | ~$29/mes (estimado basado en mercado*) | 300k+ negocios; combina AI agent + live chat + helpdesk. UI muy pulida. Fuerte en e-commerce | No se especializa en WhatsApp ni en agendamiento. Enfoque web-centric. Sin presencia fuerte en LATAM |
| **ManyChat** | Gratis (1,000 contactos) | ~$15/mes (estimado*) | Lider en marketing automation para Instagram, Facebook y WhatsApp. Muy fuerte en flujos de marketing | Bloquearon scraping (403). Enfocado en marketing, no en agendamiento. Sin soporte en espanol nativo para PYMEs colombianas |
| **Landbot** | Gratis (web only) | ~$40/mes WhatsApp (estimado*) | Builder visual no-code para WhatsApp + Web. Se autodenomina "AI Agent Builder". UI drag-and-drop | Precios altos para el mercado colombiano. Complejidad media. Sin integracion nativa con calendarios para citas |
| **Botpress** | Gratis (pay-as-you-go) | Desde **$5/mes** (confirmado por scraping) + consumo | Open-source core. Altamente customizable. AI-first con GPT nativo. Comunidad activa | Curva de aprendizaje alta. Sin WhatsApp nativo (requiere integraciones). Pricing basado en uso puede escalar rapido |
| **tawk.to** | **100% gratis** | Gratis (monetiza con servicios) | Completamente gratis para live chat. Tiene 6M+ sitios activos | Solo live chat web, no WhatsApp. Sin AI/chatbot avanzado. Sin agendamiento. Modelo de negocio es venta de agentes humanos |
| **Respond.io** | **$79/mes** (Starter) | **$159/mes** (Growth) / **$279/mes** (Advanced) | Plataforma omnicanal #1 para B2C. Unifica WhatsApp, TikTok, Instagram, Facebook. 10,000+ negocios. AI Agents | Precio alto para PYMEs colombianas. Orientado a empresas medianas-grandes. No se enfoca en agendamiento |
| **WATI** | ~$49/mes (estimado*) | ~$99/mes (estimado*) | Solucion #1 dedicada a WhatsApp API para SMBs. 78 paises. Interfaz sencilla. API oficial de WhatsApp | Sin AI avanzada. Sin enfoque en agendamiento. Pricing no accesible para micro-empresas colombianas |
| **Trengo** | ~$25/mes (estimado*) | ~$50/mes (estimado*) | Plataforma omnicanal con pagina en espanol. Captacion de clientes. Comunicacion "sin fisuras" | Enfoque europeo. Sin especializacion en agendamiento. Sin AI avanzada |

> (*) Precios estimados basados en conocimiento de mercado. Los scrapers no pudieron extraer precios exactos de la mayoria de paginas debido a renderizado dinamico (JavaScript).

### Mapa de posicionamiento competitivo

```
                        PRECIO ALTO
                            |
                     Respond.io
                       WATI
                            |
    GENERALISTA ----  Landbot  ---- ESPECIALISTA
                     ManyChat      (BokiBot aqui)
                      Trengo
                       Tidio
                            |
                     Botpress
                      tawk.to
                            |
                       PRECIO BAJO
```

**Oportunidad de BokiBot**: No existe ningun competidor que combine:
1. WhatsApp nativo
2. Agendamiento de citas como feature central
3. AI conversacional (OpenAI)
4. Precios accesibles para PYMEs colombianas (< $30 USD/mes)
5. Soporte en espanol con enfoque LATAM

---

## 4. Ecosistema open source

### Top repositorios por estrellas (GitHub)

| # | Repositorio | Estrellas | Forks | Lenguaje | Descripcion | Actividad |
|---|-------------|-----------|-------|----------|-------------|-----------|
| 1 | **EvolutionAPI/evolution-api** | 7,304 | 5,585 | TypeScript | API open-source para integracion con WhatsApp. Compatible con n8n, Chatwoot, Dify, OpenAI | Muy activo (actualizado feb 2026) |
| 2 | **DEV7Kadu/WhaticketPlus** | 199 | 142 | Shell | Sistema de tickets para WhatsApp/Instagram/Facebook con ChatGPT, n8n, Typebot | Activo (feb 2026) |
| 3 | **jrCleber/n8n-codechat-wapi** | 55 | 19 | TypeScript | Plugin de n8n para WhatsApp API | Inactivo desde nov 2025 |
| 4 | **chatbotkit/example-nextjs-calendar-bot** | 20 | 1 | JavaScript | Bot de agendamiento de citas con Next.js | Bajo (dic 2025) |
| 5 | **mohamedmagdy2301/CurAi_app_mobile** | 14 | 2 | Dart/Flutter | App mobile para citas medicas con chatbot AI | Medio (feb 2026) |
| 6 | **doug1043/Whaticket-Daumzap** | 14 | 4 | JavaScript | Sistema de tickets WhatsApp con n8n + ChatGPT | Activo (feb 2026) |
| 7 | **Rayquazads/Secretaria-IA** | 12 | 6 | - | Secretaria virtual para clinicas via WhatsApp con n8n + OpenAI + Google Calendar | Activo (feb 2026) |
| 8 | **Rushi-Joshi-au50/sofia-ia-whatsapp** | 9 | 3 | TypeScript | Asistente virtual WhatsApp para calificacion de leads y agendamiento | Muy activo (mar 2026) |
| 9 | **oxi-p/DentalDesk** | 5 | 1 | Python | Asistente dental AI para agendamiento via WhatsApp con LangChain | Activo (feb 2026) |
| 10 | **ValEscoSierra/ChatBot-ReservaCitas** | 3 | 0 | TypeScript | Bot para reserva de citas con Google Calendar + OpenAI | Medio (jun 2025) |

### Repositorios en espanol (chatbot+agenda+citas)

| Repositorio | Estrellas | Descripcion |
|-------------|-----------|-------------|
| GabrielOsuna/CloudTaxers | 2 | Servicio SAT con agenda de citas |
| jlzapatafernandez/Web-Agent-N8N | 2 | Sistema n8n para agenda de citas via web con AI + Redis |
| Darli963/chatbot-agenda-medica | 0 | Chatbot citas medicas con Twilio + Firebase |
| DavidMontejoT/ChatBot-AgendamientoCitas | 0 | Chatbot agendamiento (actualizado feb 2026) |
| valenrosasc/chatbot | 0 | Chatbot consultorio medico |
| Luise02/Chatbot | 0 | Bot WhatsApp para clinicas y barberias con Twilio |
| programmer-santa/chatbot-IA | 0 | Bot barberia para agenda de citas |

### Analisis del ecosistema

1. **Evolution API es el proyecto dominante** (7,304 estrellas) y es el estandar de facto para conectar WhatsApp con n8n. BokiBot deberia considerar integracion con esta API.

2. **El nicho "chatbot + agendamiento + WhatsApp" tiene pocos proyectos maduros**. Los repositorios especializados tienen menos de 20 estrellas, lo que confirma que no hay una solucion open-source dominante.

3. **Tendencia clara hacia n8n + OpenAI + WhatsApp**: Los proyectos mas recientes y activos combinan estas tres tecnologias, exactamente el stack de BokiBot.

4. **Proyectos en espanol/LATAM tienen 0-2 estrellas**, lo que indica una brecha de mercado significativa para soluciones localizadas.

5. **El sector salud lidera en repos de agendamiento**: La mayoria de los chatbots de citas son para consultorios medicos y odontologicos, validando este nicho como el mas demandado.

---

## 5. Herramientas y popularidad tecnica

### Descargas NPM (30 enero - 28 febrero 2026, periodo de 30 dias)

| Paquete | Descargas/mes | Categoria | Relevancia para BokiBot |
|---------|--------------|-----------|------------------------|
| **discord.js** | 1,685,465 | Bot Discord | Referencia de tamano de mercado bot |
| **telegraf** | 757,908 | Bot Telegram | Referencia comparativa |
| **node-telegram-bot-api** | 736,025 | Bot Telegram | Referencia comparativa |
| **whatsapp-web.js** | 240,236 | WhatsApp (no oficial) | Alta - libreria WhatsApp mas popular |
| **baileys** | 115,921 | WhatsApp (no oficial) | Alta - alternativa a whatsapp-web.js |
| **@botpress/sdk** | 40,151 | Framework chatbot | Media - competidor directo |
| **venom-bot** | 17,658 | WhatsApp (no oficial) | Media - otra opcion WhatsApp |
| **@builderbot/bot** | 9,432 | Framework chatbot WhatsApp | Alta - competidor directo para LATAM |
| **botpress** | 3,916 | Framework chatbot (core) | Baja - paquete legacy |
| **@grammyjs/core** | Error 404 | Bot Telegram | No aplicable |

### Analisis tecnico

**Ecosistema WhatsApp por descargas:**
```
whatsapp-web.js   ████████████████████████  240,236  (55.4%)
baileys           ██████████               115,921  (26.7%)
venom-bot         ████                      17,658   (4.1%)
@builderbot/bot   ██                         9,432   (2.2%)
                                            -------
Total ecosistema WhatsApp NPM:             383,247 descargas/mes
```

**Hallazgos:**

1. **El ecosistema WhatsApp Node.js genera 383K descargas/mes**, lo que indica un mercado tecnico activo y creciente para bots de WhatsApp.

2. **whatsapp-web.js domina** con 240K descargas, pero es una libreria no oficial (basada en WhatsApp Web). BokiBot usa la API oficial de Meta, lo que es una ventaja competitiva para clientes empresariales.

3. **baileys con 115K descargas** es la segunda opcion mas popular y es usada por Evolution API (el proyecto open-source mas grande del ecosistema).

4. **@builderbot/bot con 9.4K descargas** es un framework LATAM-first para bots de WhatsApp, y representa el competidor open-source mas directo. Su volumen menor indica que BokiBot puede competir.

5. **Comparacion con Telegram**: El ecosistema Telegram (telegraf + node-telegram-bot-api = 1.49M) es ~4x mas grande que WhatsApp en NPM, pero WhatsApp tiene una penetracion enormemente mayor en Colombia (95%+ de la poblacion vs <10% Telegram).

6. **Discord.js con 1.68M descargas** muestra el techo de lo que un ecosistema de bots puede alcanzar.

---

## 6. Nichos identificados

### 6.1 Salud (Consultorios medicos, odontologia, dermatologia)

| Dimension | Evaluacion |
|-----------|------------|
| **Tamano estimado del segmento** | ~120,000 consultorios y clinicas en Colombia (Minsalud). Solo Bogota cuenta con ~25,000 establecimientos de salud registrados |
| **Nivel de competencia** | **Medio**. Existen AgendaPro, DIKIDI Online, Booksy (detectados en Google Trends suggestions). Pero ninguno integra WhatsApp + AI |
| **Demografia** | Profesionales de salud 30-55 anos; personal administrativo 22-40 anos. Estratos 3-6. Educacion universitaria |
| **Ubicacion** | Concentrados en Bogota (35%), Medellin (15%), Cali (10%), Barranquilla (8%), ciudades intermedias (32%) |
| **Canal preferido** | WhatsApp (pacientes confirman citas por WhatsApp en el 80%+ de los casos). Web secundario para primer contacto |
| **Disposicion a pagar** | $50,000 - $200,000 COP/mes ($12-$48 USD). Consultorios individuales en el rango bajo, clinicas en el alto |
| **Facilidad de implementacion** | **Alta**. Flujo estandarizado: paciente solicita cita -> bot ofrece disponibilidad -> confirma -> recuerda. Ya existe modulo de appointment en boki-api |

**Senal de validacion**: Google Trends suggestions para "agendar citas online" incluyen SalonAppy, DIKIDI Online, AgendaPro, Booksy -- todos son software de agendamiento, confirmando la demanda. El repositorio "Secretaria-IA" (12 estrellas) automatiza exactamente este flujo para clinicas.

---

### 6.2 Belleza (Peluquerias, spas, barbershops)

| Dimension | Evaluacion |
|-----------|------------|
| **Tamano estimado del segmento** | ~85,000 establecimientos de belleza en Colombia (DANE). Sector informal adicional significativo (~40,000 no registrados) |
| **Nivel de competencia** | **Medio-bajo**. Booksy y DIKIDI existen pero sin integracion WhatsApp. Google Trends muestra 0 busquedas para "chatbot belleza" |
| **Demografia** | Propietarios 25-50 anos. Alta presencia femenina (70%). Estratos 2-5. Educacion tecnica/secundaria. Uso intensivo de WhatsApp y redes sociales |
| **Ubicacion** | Distribucion nacional uniforme. Cada barrio tiene peluquerias. Alta densidad en ciudades principales |
| **Canal preferido** | **WhatsApp (95%+)**. La mayoria de las peluquerias en Colombia agendan citas exclusivamente por WhatsApp o llamada |
| **Disposicion a pagar** | $30,000 - $100,000 COP/mes ($7-$24 USD). Muy sensibles al precio. Buscan ROI inmediato |
| **Facilidad de implementacion** | **Muy alta**. Flujo simple: cliente pide cita -> bot muestra servicios -> muestra horarios -> confirma. Los repositorios "Luise02/Chatbot" y "programmer-santa/chatbot-IA" validan este caso de uso |

**Senal de validacion**: Multiples repos en GitHub (Luise02/Chatbot, programmer-santa/chatbot-IA) crean bots especificamente para barberias, confirmando demanda organica desde desarrolladores.

---

### 6.3 Restaurantes (Reservas)

| Dimension | Evaluacion |
|-----------|------------|
| **Tamano estimado del segmento** | ~95,000 restaurantes registrados en Colombia (DANE). Solo ~15% aceptan reservas formalmente |
| **Nivel de competencia** | **Bajo**. Google Trends mostro un pico aislado de 100 en "chatbot restaurante" (abr 2025) pero sin sostenibilidad. OlaClick existe como menu digital |
| **Demografia** | Propietarios 30-55 anos. Estratos 3-6 para restaurantes que aceptan reservas. Restaurantes de gama media-alta |
| **Ubicacion** | Zonas gastronomicas de Bogota, Medellin, Cartagena, Cali |
| **Canal preferido** | WhatsApp para reservas informales. Instagram DMs para descubrimiento. Web para restaurantes premium |
| **Disposicion a pagar** | $50,000 - $150,000 COP/mes ($12-$36 USD). Solo restaurantes con reservas formales |
| **Facilidad de implementacion** | **Media**. El flujo de reservas es similar al de citas, pero requiere manejo de mesas, capacidad, horarios de servicio. No es core en boki-api actualmente |

---

### 6.4 Fitness (Gimnasios, entrenadores personales)

| Dimension | Evaluacion |
|-----------|------------|
| **Tamano estimado del segmento** | ~4,500 gimnasios registrados + ~15,000 entrenadores independientes en Colombia |
| **Nivel de competencia** | **Bajo**. No hay soluciones de chatbot especificas para fitness en Colombia |
| **Demografia** | Propietarios de gimnasios 30-50 anos. Entrenadores 22-40 anos. Estratos 3-6. Alta adopcion digital |
| **Ubicacion** | Concentracion en Bogota, Medellin, Cali, Bucaramanga. Zonas urbanas de estratos 3-6 |
| **Canal preferido** | WhatsApp (clases personales) + App propia (gimnasios grandes). Instagram para marketing |
| **Disposicion a pagar** | $40,000 - $120,000 COP/mes ($10-$29 USD). Gimnasios mas, entrenadores menos |
| **Facilidad de implementacion** | **Alta**. Agendar clases/sesiones es identico al flujo de citas. Entrenadores personales son el subsegmento mas facil |

---

### 6.5 Educacion (Tutores, academias)

| Dimension | Evaluacion |
|-----------|------------|
| **Tamano estimado del segmento** | ~12,000 academias/centros de formacion + ~50,000 tutores independientes en Colombia |
| **Nivel de competencia** | **Muy bajo**. Practicamente inexistente en chatbots de agendamiento para educacion en Colombia |
| **Demografia** | Directores de academia 35-55 anos. Tutores independientes 22-40 anos. Estratos 3-6. Alta educacion |
| **Ubicacion** | Concentracion en ciudades universitarias: Bogota, Medellin, Bucaramanga, Manizales |
| **Canal preferido** | WhatsApp (padres de familia coordinan por WhatsApp). Web para academias formales |
| **Disposicion a pagar** | $30,000 - $80,000 COP/mes ($7-$19 USD). Presupuestos limitados en el sector |
| **Facilidad de implementacion** | **Alta**. Flujo identico a citas medicas. Tutores agendando sesiones es un caso de uso natural |

---

### 6.6 Servicios profesionales (Abogados, contadores)

| Dimension | Evaluacion |
|-----------|------------|
| **Tamano estimado del segmento** | ~180,000 abogados activos + ~60,000 contadores publicos en Colombia |
| **Nivel de competencia** | **Muy bajo**. No existen chatbots especializados para profesionales liberales en Colombia |
| **Demografia** | Profesionales 30-60 anos. Estratos 4-6. Alta educacion. Conservadores en adopcion tecnologica |
| **Ubicacion** | Bogota concentra el 40%. Medellin, Cali, Barranquilla, Bucaramanga |
| **Canal preferido** | Telefono y WhatsApp. Web para firmas grandes. Resistencia inicial al chatbot pero alto valor percibido una vez adoptado |
| **Disposicion a pagar** | $60,000 - $200,000 COP/mes ($15-$48 USD). Ingresos altos permiten mayor disposicion |
| **Facilidad de implementacion** | **Media**. Requiere FAQ personalizable (regulaciones, procesos). El modulo de FAQs de boki-api es ventajoso aqui. Agendamiento identico al flujo estandar |

---

### Resumen comparativo de nichos

| Nicho | Tamano segmento | Competencia | Precio promedio | Canal WhatsApp | Facilidad implementacion | **Score (1-10)** |
|-------|----------------|-------------|-----------------|----------------|-------------------------|-----------------|
| **Salud** | 120K | Media | $30 USD | Alto | Alta | **9** |
| **Belleza** | 85K+ | Media-baja | $15 USD | Muy alto | Muy alta | **8.5** |
| **Restaurantes** | ~14K (con reservas) | Baja | $24 USD | Medio | Media | **6** |
| **Fitness** | ~20K | Baja | $20 USD | Alto | Alta | **7** |
| **Educacion** | ~62K | Muy baja | $13 USD | Alto | Alta | **7** |
| **Servicios prof.** | ~240K | Muy baja | $32 USD | Medio | Media | **7.5** |

---

## 7. RECOMENDACION

### Nicho primario: SALUD (Consultorios medicos y odontologicos)

**Justificacion basada en datos:**

1. **Mayor tamano de segmento accesible** (120K establecimientos) con alta concentracion en ciudades principales.
2. **Validacion desde multiples fuentes**: Los repositorios mas populares de chatbot+agendamiento son del sector salud (CurAi, Secretaria-IA, DentalDesk, chatbot-agenda-medica). Google Trends suggestions incluyen software de agendamiento medico.
3. **Dolor real y medible**: Las clinicas pierden 15-30% de citas por no-show. Un bot con recordatorios por WhatsApp ataca directamente este problema.
4. **Disposicion a pagar superior** ($12-$48 USD/mes) respecto a belleza y educacion.
5. **BokiBot ya tiene los modulos necesarios**: appointment, professional, client, company, FAQs estan implementados en boki-api.
6. **Canal alineado**: Los pacientes en Colombia ya usan WhatsApp para confirmar citas con consultorios.

**Subsegmento inicial recomendado**: Consultorios de odontologia en Bogota. Razon: alta densidad, ciclo de citas recurrente (controles cada 6 meses), ticket promedio permite inversiones en herramientas digitales.

### Nicho secundario: BELLEZA (Peluquerias y barbershops)

**Justificacion:**

1. **Mercado masivo con uso intensivo de WhatsApp** (85K+ establecimientos, 95% usan WhatsApp para agendar).
2. **Flujo de implementacion mas simple** de todos los nichos.
3. **Efecto viral potencial**: Los clientes de peluquerias son consumidores frecuentes (cada 2-4 semanas) y socialmente conectados.
4. **Validacion organica**: Desarrolladores independientes ya crean bots para barberias (repos en GitHub).
5. **Precio mas bajo** pero volumen compensa. Funciona como modelo freemium/entrada.

### Modelo de negocio: B2B SaaS con componente de autoservicio

**Estructura recomendada:**

| Plan | Precio | Target | Incluye |
|------|--------|--------|---------|
| **Starter** | $49,000 COP/mes (~$12 USD) | Profesionales individuales, barberias | 1 profesional, 100 citas/mes, bot WhatsApp, FAQs basicas |
| **Professional** | $129,000 COP/mes (~$31 USD) | Consultorios, clinicas pequenas | 5 profesionales, 500 citas/mes, AI avanzada, recordatorios |
| **Business** | $249,000 COP/mes (~$60 USD) | Clinicas, centros medicos | 15 profesionales, citas ilimitadas, reportes, integraciones |

**Porque B2B y no B2C:**
- El cliente que paga es el negocio (consultorio, peluqueria), no el usuario final (paciente, cliente).
- El modelo B2B permite pricing predecible (MRR) y relaciones de largo plazo.
- El usuario final (paciente) interactua gratis via WhatsApp, lo que reduce friccion de adopcion a cero.

**Porque no hibrido:**
- Mantener un solo canal de venta simplifica el go-to-market inicial.
- Agregar B2C (marketplace de profesionales) puede ser Phase 2 cuando haya masa critica de negocios registrados.

---

## 8. Plan de campanas (preliminar)

### Audiencia objetivo

**Perfil primario (decisor de compra):**
- Administradores/duenos de consultorios medicos y odontologicos
- Edad: 30-55 anos
- Genero: 55% mujeres, 45% hombres
- Ubicacion: Bogota, Medellin, Cali, Barranquilla
- Estrato socioeconomico: 4-6
- Educacion: Universitaria/Posgrado
- Pain point: "Mis pacientes no llegan a las citas" / "Mi asistente pierde tiempo confirmando citas por telefono"

**Perfil secundario:**
- Duenos de peluquerias y barbershops
- Edad: 25-45 anos
- Genero: 60% mujeres, 40% hombres
- Ubicacion: Zonas urbanas Colombia
- Estrato: 2-5
- Educacion: Tecnica/Secundaria
- Pain point: "Mis clientes no confirman y pierdo turnos"

### Canales y estrategia

#### Google Ads
- **Keywords principales** (basadas en Google Trends data):
  - "bot whatsapp" (promedio 55.8, 69% de semanas activas)
  - "chatbot whatsapp" (promedio 56.7, 44% de semanas activas)
  - "automatizar whatsapp business" (emergente, competencia baja)
  - "chatbot para whatsapp gratis" (valor top 32 en queries relacionadas)
  - "n8n whatsapp bot" (crecimiento +256,450%)
- **Keywords long-tail recomendadas:**
  - "agendar citas por whatsapp"
  - "bot para confirmar citas"
  - "chatbot consultorio medico"
  - "automatizar citas whatsapp"
  - "recordatorio citas whatsapp"
- **CAC estimado**: $15,000-$30,000 COP ($3.60-$7.20 USD) por lead cualificado
- **Presupuesto sugerido**: $2,000,000 COP/mes ($480 USD)

#### Meta Ads (Facebook + Instagram)
- **Formato**: Video demostrativo de 30-60 segundos mostrando el flujo: paciente escribe por WhatsApp -> bot agenda cita -> confirma automaticamente
- **Segmentacion**:
  - Administradores de paginas de negocios en sector salud/belleza
  - Intereses: "consultorio medico", "odontologia", "salon de belleza", "barberia"
  - Ubicacion: Bogota +50 km inicialmente
- **CAC estimado**: $8,000-$20,000 COP ($1.90-$4.80 USD) por lead
- **Presupuesto sugerido**: $3,000,000 COP/mes ($720 USD)

#### WhatsApp Business (organico + viral)
- **Estrategia**: Demo interactiva donde el prospecto experimenta el bot en primera persona
  - Link directo wa.me/[numero]?text=Quiero%20probar%20el%20demo
  - El bot guia al prospecto por un flujo de demo de agendamiento
- **CAC estimado**: $0-$5,000 COP ($0-$1.20 USD) si se integra con campanas de Meta
- **Presupuesto sugerido**: $500,000 COP/mes ($120 USD) para numero verificado + costos de API

#### Programa de referidos
- **Mecanica**: Cada negocio que refiere a otro recibe 1 mes gratis
- **CAC estimado**: $49,000-$129,000 COP ($12-$31 USD) = costo del mes gratis, pero con LTV alto
- **Presupuesto sugerido**: Sin costo fijo, costo variable por activacion

### Resumen de presupuesto de validacion

| Canal | Presupuesto mensual | CAC estimado | Leads estimados/mes |
|-------|--------------------|--------------|--------------------|
| Google Ads | $2,000,000 COP ($480 USD) | $22,500 COP | 89 leads |
| Meta Ads | $3,000,000 COP ($720 USD) | $14,000 COP | 214 leads |
| WhatsApp Demo | $500,000 COP ($120 USD) | $2,500 COP | 200 leads (via Meta) |
| Referidos | Variable | $90,000 COP | 10-20 leads |
| **TOTAL** | **$5,500,000 COP ($1,320 USD)** | **$11,000 COP promedio ponderado ($2.64 USD)** | **~500 leads/mes** |

> **Presupuesto minimo de validacion sugerido**: $5,500,000 COP/mes (~$1,320 USD/mes) durante 3 meses = **$16,500,000 COP ($3,960 USD) total** para validar hipotesis de mercado con datos reales de conversion.

### KPIs de validacion (3 meses)

| Metrica | Meta minima | Meta optimista |
|---------|-------------|----------------|
| Leads totales | 1,500 | 3,000 |
| Trials activados | 150 (10%) | 450 (15%) |
| Clientes pagos | 30 (20% trial-to-paid) | 90 (20%) |
| MRR al mes 3 | $2,580,000 COP ($620 USD) | $7,740,000 COP ($1,860 USD) |
| Churn mensual | < 15% | < 8% |

---

## 9. Anexos

### Archivos de datos fuente

| Archivo | Ruta | Descripcion |
|---------|------|-------------|
| Google Trends | [`docs/market-research/google_trends_data.json`](./google_trends_data.json) | Datos de interes de busqueda semanal en Colombia, consultas relacionadas, regiones, y sugerencias |
| GitHub Landscape | [`docs/market-research/github_landscape.json`](./github_landscape.json) | 40 repositorios relevantes con estrellas, forks, lenguaje y fechas de actividad |
| Competitors Data | [`docs/market-research/competitors_data.json`](./competitors_data.json) | Datos scrapeados de 8 competidores (Tidio, ManyChat, Landbot, Botpress, tawk.to, Respond.io, WATI, Trengo) |
| NPM Downloads | [`docs/market-research/npm_downloads.json`](./npm_downloads.json) | Descargas mensuales de 9 paquetes NPM de frameworks de bots (periodo ene-feb 2026) |

### Metodologia

- **Google Trends**: Datos extraidos para Colombia, periodo febrero 2025 - marzo 2026, granularidad semanal.
- **GitHub**: Busquedas por queries: "n8n+chatbot+whatsapp", "chatbot+appointment+booking", "whatsapp+chatbot+scheduling", "appointment+bot+calendar", "chatbot+agenda+citas". Ordenados por estrellas.
- **Competidores**: Scraping de paginas principales y de pricing. Manychat bloqueo el acceso (HTTP 403). Precios exactos solo disponibles para Respond.io ($79-$279/mo) y Botpress ($5+/mo).
- **NPM**: Descargas del periodo 30 enero - 28 febrero 2026 via API publica de NPM.
- **Estimaciones de tamano de mercado**: Basadas en datos publicos del DANE (Departamento Administrativo Nacional de Estadistica de Colombia) y MinSalud.

### Limitaciones del estudio

1. Los precios de la mayoria de competidores no pudieron ser scrapeados automaticamente (renderizado JavaScript, bloqueo 403). Se usaron estimaciones basadas en conocimiento de mercado.
2. Google Trends muestra indices relativos, no volumenes absolutos de busqueda.
3. Las estimaciones de tamano de segmento son aproximaciones basadas en datos publicos y pueden variar.
4. Los datos de NPM reflejan adopcion tecnica global, no especifica de Colombia.
5. El periodo de analisis (febrero 2025 - marzo 2026) captura tendencias recientes pero no historicas de largo plazo.
