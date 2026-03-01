Realiza un análisis de este proyecto que quiere ser un producto de chatbot para agendar citas y responder faqs con base da preguntas y
  respuestas, la idea es que pueda escalar y se pueda hacer mucho más robusto, ha tenido varias iteraciones pero no ha salido algo 100%
  funcional, hemos intentado hacer un flow-bot con @boki-bot/ pero nos complicamos manejando estados y las variables, teniamos el @boki-api hecho
  en nestjs inicialmente porque se pensaba usar una librería de chatbot con whatsapp llamada builderbot pero no funcionó pero entonces los API
  para la generación y gestión de citas si se hizo, puedes consultar @boki-api/BD/BokiBot.drawio conlos datos y pues al final decidimos hacerlo
  con n8n, digamos que se tienen segmentados unos flujos, en algunas cosas si hace uso de las API en otras le apunta directo a la base de datos y
  tiene un tema de control de tokens. Realmente queremos aterrizar todo esto con un producto que se pueda vender, tengo la inquietud y la duda
  de cómo poderlo hacer escalable solo a punta de n8n, en el sentido de que se puedan habilitar demos de forma rápida, solicitando al usuario la
  información en un Excel o Word para faqs o con un escrito o chat o mensajes de voz para la configuración de las agendas. La idea es tambien
  integral con calendar e ir agregando más valor pero lo importante es vender algo. Quiero que analices todo el código, identifiques las buenas
  prácticas y lo que no se ha hecho, luego quiero que a nivel general crees un AGENTS.md y su respectivo CLAUDE.md que es un symlink de AGENTS y
  hagas una iteración de tu análisis revisando que tipos de roles se necesitan para poder hechar a andar y vender un chatbot sin que requiera
  mucho de mi tiempo de implementación y demás. Tambien me gustaría tener un chatbot en la página de boki y en la página de solercia, además
  verificar y mejorar el front que es boki-front. Entonces en este trabajo largo quiero que luego hagas un esquema de subagentes que nos puedan
  ayudar con base "o implementación total de" https://github.com/Gentleman-Programming/agent-teams-lite, quiero que implementes a nivel de
  proyecto todos los skills que veas nos sirven teniendo en cuenta nuestro stack que se puedan copiar de
  https://github.com/Gentleman-Programming/Gentleman-Skills, pero ojito que quiero que estén en ./skills y tengan su par en .claude/skills pero
  como syslinks, al estilo de /Users/camilocalderont/Proyectos/IDARTES/pandora_proxy. Te pido que ajustes y me des una nueva version de los
  sitios web con el chatbot, usa esta apikey de gemini para ese propósito: AIzaSyBHE6h1HAKciAEyvhTazu1Mnx_K0rre4tI. Por otro lado  quiero que revises la carpeta n8n-flujos y valides que encontraste bien y que se puede mejorar.

# TAREAS
0. De todo análisis deja un archivo markdown en una carpeta ./claude-analisis con el nombre como referencia y la fecha como prefijo.
1. busca en google trends y otros sitios que tan buena sería la idea pues quiero validarla y en caso de que nos podamos enfocar en algún nicho que no esté bien atentido, le podríamos dar ese foco, esto debe ser un subagente que teng esa responsabilidad y pueda ejecutarse varias veces y entregar reportes a demanda por otros subagentes y trabajar en paralelo.
2. Instala el SDD en este proyecto, quiero que incluyas un rol de CEO que tome decisiones y permita iterar sobre cada hallazgo encontrado por los demás agentes, esto debe ser un subagente para que corran en paralelo, instalar más de acuerdo a lo que te mencioné aquí
3. Itera sobre todas las carpetas que son proyectos, identifica puntos fuertes y débiles. Deja una recomendación de ajustes posibles pero no ejecutes nada, esto tambien debe ser un agente de tipo arquitecto - lider técnico que tenga las capacidades para validar cada proyecto y corre en paralelo, esto incluye los flujos n8n-flujos, el n8n-custom es una instalación de n8n no requiere revisión.
4. Cuando todos los análisis terminen, el CEO va a iniciar un plan con fases para cumplir lo que se quiere, llegar lo más pronto posible para un lanzamiento, tambien aca debe haber alguien de marketing "que se puede complementar o ser el mismo del paso 1" que planee cómo poder mostrar y publicar el proyecto y cual va a ser la estrategia, de momento pienso tanto en B2B como en B2C. PEro Ojo el objetivo es tirar a grandes clientes o a de nicho común que nos evite hacer tantos cambios y mantener de forma fácil un sistema, o si es B2C debe ser un palo que lo usen muchas personas.
5. Se debe ejecutar el plan en fases definidas, iniciando con la primera, al finalizar la primera debe haber una validación por alguien de calidad, que se hagan pruebas con playwright si es necesario a nivel de software, debe ser muy prolijo. Tambien se deben dejar los bloqueantes de la fase en un archivo debloqueantes que tenga el resumen de lo hecho en la fase y posteriormente lo que tengo que destrabar yo como humano, no sé se me ocurren dinero para campañas, tokens de  aplicaciones entre otras cosas.
6. Ingresar a una reunión de retrospectiva entre los agentes para validar la primera fase, allí hacer un commit con los ajustes realizados, obviamente que se requiere un análisis de mercado y opiniones expertas para arrancar pero todo lo quiero documentado, puede haber una carpeta docs en donde eso esté detallado.
7. Quiero que se pruebe realmente todo en cada fase, si se implementa algo en docker, que el subagente experto en infra pueda validar que todo esté bien, montar los subproductos o proyectos en un solo docker-compose y salir por subdominios separados, si se requiere simular o apuntarlea un subdominio se puede crear los certificados y ponerlos en el /private/etc/hosts para que apunte al docker y probar.

8. se debe tener al menos 2 ciclos en algunos de los elementos y por lo menos 1 ciclo por cada componente. Quiero documentar con C4 en draw.io el proyecto en cada fase.
